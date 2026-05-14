import type { NextApiRequest, NextApiResponse } from 'next';
import { sendInvoiceEmail } from '../../../utils/send-invoice-email';

const PROD_BASE_URL = 'https://api.facturama.mx';

function getBaseUrl() {
  let url = process.env.FACTURAMA_API_BASE_URL || PROD_BASE_URL;
  
  // Limpieza robusta: si el usuario puso la URL completa del endpoint o incluye paths, extraemos solo la base
  if (url.includes('/api-lite') || url.includes('/3/') || url.includes('/cfdi/')) {
    try {
      const parsed = new URL(url);
      url = `${parsed.protocol}//${parsed.host}`;
    } catch (e) {
      url = PROD_BASE_URL;
    }
  }
  
  // Eliminar barra diagonal final si existe
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  
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
    const response = await fetch(url, { headers: { Authorization: authHeader } });
    if (response.ok) {
      const body = await response.text().catch(() => '');
      if (body.trim().length > 0) return body;
    }
    await sleep(1000);
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  const cfdiId = String(req.query.id || req.body.id || req.body.cfdiId || '').trim();
  const { email, ticket, total, rfc, uuid, fecha } = req.body;

  if (!cfdiId || !email) return res.status(400).json({ message: 'Faltan campos (id o email)' });

  const authHeader = getAuthHeader();
  if (!authHeader) return res.status(500).json({ message: 'Faltan credenciales de Facturama' });

  try {
    const baseUrl = getBaseUrl();
    const [pdfBase64, xmlBase64] = await Promise.all([
      fetchFromFacturama(`${baseUrl}/cfdi/pdf/issuedLite/${cfdiId}`, authHeader),
      fetchFromFacturama(`${baseUrl}/cfdi/xml/issuedLite/${cfdiId}`, authHeader)
    ]);

    if (!pdfBase64 || !xmlBase64) {
      throw new Error('No se pudieron recuperar los archivos PDF/XML de Facturama');
    }

    await sendInvoiceEmail({
      to: email,
      subject: `Factura Puerto Copy - Ticket ${ticket || 'S/N'}`,
      pdfBase64,
      xmlBase64,
      issuerRfc: process.env.FACTURAMA_ISSUER_RFC || 'PARI980727RWA',
      total: String(total || '0.00'),
      uuid: uuid || cfdiId,
      receiverRfc: rfc,
      date: fecha,
      ticket: ticket,
      context: 'resend'
    });

    return res.status(200).json({ ok: true, message: 'Correo enviado con éxito' });
  } catch (error: any) {
    console.error('>>> Error en reenvío:', error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
