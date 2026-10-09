import type { NextApiRequest, NextApiResponse } from 'next';
import { sendInvoiceEmail } from '../../../utils/send-invoice-email';
import { getTicket } from '../../../lib/gasTickets';
import { generateCfdiPdf } from '../../../lib/cfdiPdfGenerator';

const PROD_BASE_URL = 'https://api.facturama.mx';

function getBaseUrl() {
  let url = process.env.FACTURAMA_API_BASE_URL || PROD_BASE_URL;
  if (url.includes('/api-lite') || url.includes('/3/') || url.includes('/cfdi/')) {
    try {
      const parsed = new URL(url);
      url = `${parsed.protocol}//${parsed.host}`;
    } catch (e) {
      url = PROD_BASE_URL;
    }
  }
  if (url.endsWith('/')) url = url.slice(0, -1);
  return url;
}

function getAuthHeader() {
  const user = process.env.FACTURAMA_USER;
  const pass = process.env.FACTURAMA_PASSWORD;
  if (!user || !pass) return null;
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchFromFacturama(url: string, authHeader: string) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Authorization: authHeader } });
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          try {
            const parsed = JSON.parse(text);
            const content = parsed.Content || parsed.content || parsed.data || parsed.Data;
            if (content) return content;
          } catch (_) {
            return text;
          }
        }
      }
    } catch (err) {
      console.error('>>> Error fetching from Facturama:', err);
    }
    await sleep(1000);
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const cfdiId = String(req.query.id || req.body.id || req.body.cfdiId || '').trim();
  if (!cfdiId) return res.status(400).json({ ok: false, error: 'Falta identificador de factura (id)' });

  try {
    let pdfBase64: string | null = null;
    let xmlBase64: string | null = null;

    // 1. PRIORIDAD: Obtener XML de MySQL y generar PDF localmente
    const localTicket = await getTicket(cfdiId);

    const targetEmail = String(req.body.email || req.body.to || localTicket?.email || localTicket?.correo || '').trim();
    if (!targetEmail) {
      return res.status(400).json({ ok: false, error: 'Falta correo electrónico destinatario' });
    }

    const ticketVal = String(req.body.ticket || localTicket?.ticket || '').trim() || 'S/N';
    const resolvedRfc = String(req.body.rfc || req.body.receiverRfc || localTicket?.rfc || '').trim();
    let resolvedUuid = localTicket?.uuid || req.body.uuid || cfdiId;
    let resolvedTotal = req.body.total || localTicket?.total || '0.00';
    let resolvedFecha = req.body.fecha || req.body.date || (localTicket?.fecha_pago ? new Date(localTicket.fecha_pago).toISOString() : new Date().toISOString());

    if (localTicket && localTicket.xml_content) {
      console.log('>>> Generando PDF y XML para envío de correo desde MySQL...');
      xmlBase64 = Buffer.from(localTicket.xml_content, 'utf8').toString('base64');
      const pdfBuffer = await generateCfdiPdf(localTicket.xml_content);
      pdfBase64 = pdfBuffer.toString('base64');
      resolvedUuid = localTicket.uuid || resolvedUuid;
      resolvedTotal = localTicket.total || resolvedTotal;
    } else {
      // 2. FALLBACK: Descargar de Facturama si el registro no tenía XML local
      console.log('>>> Ticket no encontrado en MySQL con XML, usando Facturama como fallback para correo...');
      const authHeader = getAuthHeader();
      if (!authHeader) return res.status(500).json({ ok: false, error: 'Faltan credenciales de Facturama' });

      const baseUrl = getBaseUrl();
      const [fetchedPdf, fetchedXml] = await Promise.all([
        fetchFromFacturama(`${baseUrl}/cfdi/pdf/issuedLite/${cfdiId}`, authHeader),
        fetchFromFacturama(`${baseUrl}/cfdi/xml/issuedLite/${cfdiId}`, authHeader)
      ]);

      pdfBase64 = fetchedPdf;
      xmlBase64 = fetchedXml;
    }

    if (!pdfBase64 || !xmlBase64) {
      throw new Error('No se pudieron recuperar los archivos PDF/XML para el envío');
    }

    await sendInvoiceEmail({
      to: targetEmail,
      subject: `Factura Puerto Copy - Ticket ${ticketVal}`,
      pdfBase64,
      xmlBase64,
      issuerRfc: process.env.FACTURAMA_ISSUER_RFC || 'PARI980727RWA',
      total: String(resolvedTotal || '0.00'),
      uuid: resolvedUuid,
      receiverRfc: resolvedRfc,
      date: resolvedFecha,
      ticket: ticketVal,
      context: 'resend'
    });

    return res.status(200).json({ ok: true, emailSent: true, message: 'Correo enviado con éxito' });
  } catch (error: any) {
    console.error('>>> Error en reenvío de correo:', error?.message || error);
    return res.status(500).json({ ok: false, emailSent: false, error: error?.message || 'Error al enviar correo' });
  }
}
