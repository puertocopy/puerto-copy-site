import type { NextApiRequest, NextApiResponse } from 'next';
import { getTicket } from '../../../lib/gasTickets';
import pool from '../../../lib/db';
import { generateCfdiPdf, generateCfdiHtml } from '../../../lib/cfdiPdfGenerator';

const PROD_BASE_URL = 'https://api.facturama.mx';

function getFacturamaBaseUrl() {
  let url = process.env.FACTURAMA_API_BASE_URL || PROD_BASE_URL;
  if (url.includes('/api-lite') || url.includes('/3/') || url.includes('/cfdi/')) {
    try {
      const parsed = new URL(url);
      url = `${parsed.protocol}//${parsed.host}`;
    } catch (_) {
      url = PROD_BASE_URL;
    }
  }
  if (url.endsWith('/')) url = url.slice(0, -1);
  return url;
}

function getFacturamaAuth() {
  const user = process.env.FACTURAMA_USER;
  const pass = process.env.FACTURAMA_PASSWORD;
  if (!user || !pass) return null;
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  // Deshabilitar caché para respuestas frescas
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { ticketKey } = req.query;
  const rawKey = String(ticketKey || '').trim();
  const format = String(req.query.format || req.query.type || 'pdf').toLowerCase();

  if (!rawKey) {
    return res.status(400).json({ ok: false, error: 'Parámetro ticketKey requerido' });
  }

  try {
    // 1. Consultar ticket en MySQL
    let ticket = await getTicket(rawKey);
    if (!ticket && !rawKey.includes(':')) {
      ticket = await getTicket(`PV:${rawKey}`);
    }

    if (!ticket) {
      return res.status(404).json({ ok: false, error: 'Ticket o factura no encontrada' });
    }

    if (ticket.status !== 'TIMBRADO') {
      return res.status(400).json({
        ok: false,
        error: `El ticket no se encuentra timbrado (Estado actual: ${ticket.status})`,
        status: ticket.status
      });
    }

    let xmlContent = ticket.xml_content;

    // 2. Respaldo para tickets previos a la migración que no tengan xml_content guardado
    if (!xmlContent && ticket.facturama_id) {
      console.log(`>>> xml_content ausente en BD para ${ticket.ticket_key}, consultando Facturama como respaldo...`);
      const auth = getFacturamaAuth();
      if (auth) {
        const baseUrl = getFacturamaBaseUrl();
        const urls = [
          `${baseUrl}/cfdi/xml/issuedLite/${ticket.facturama_id}`,
          `${baseUrl}/cfdi/xml/issued/${ticket.facturama_id}`
        ];
        for (const u of urls) {
          try {
            const r = await fetch(u, { headers: { Authorization: auth } });
            if (r.ok) {
              const text = await r.text();
              try {
                const j = JSON.parse(text);
                if (j.Content) xmlContent = Buffer.from(j.Content, 'base64').toString('utf8');
              } catch (_) {
                if (!text.trim().startsWith('<')) {
                  xmlContent = Buffer.from(text.trim(), 'base64').toString('utf8');
                } else {
                  xmlContent = text;
                }
              }
              if (xmlContent) {
                // Guardar en la BD para que en futuras consultas sea instantáneo
                await pool.query('UPDATE tickets_facturados SET xml_content = ? WHERE id = ?', [xmlContent, ticket.id]);
                break;
              }
            }
          } catch (_) {}
        }
      }
    }

    if (!xmlContent) {
      return res.status(404).json({ ok: false, error: 'No se encontró el XML timbrado del CFDI' });
    }

    const filename = `factura_${ticket.uuid || ticket.ticket || ticket.facturama_id || 'cfdi'}`;

    // 3. Entrega en formato XML
    if (format === 'xml') {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xml"`);
      return res.status(200).send(xmlContent);
    }

    // 4. Entrega en formato HTML
    if (format === 'html') {
      const html = await generateCfdiHtml(xmlContent);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    // 5. Entrega en formato JSON con base64
    if (format === 'json') {
      const pdfBuffer = await generateCfdiPdf(xmlContent);
      return res.status(200).json({
        ok: true,
        ticketKey: ticket.ticket_key,
        ticket: ticket.ticket,
        uuid: ticket.uuid,
        facturamaId: ticket.facturama_id,
        xml: Buffer.from(xmlContent, 'utf8').toString('base64'),
        pdf: pdfBuffer.toString('base64')
      });
    }

    // 6. Entrega en formato PDF (Por defecto)
    const pdfBuffer = await generateCfdiPdf(xmlContent);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    return res.status(200).send(pdfBuffer);

  } catch (error: any) {
    console.error('>>> Error en endpoint /api/cfdi/[ticketKey]:', error?.message || error);
    return res.status(500).json({ ok: false, error: error?.message || 'Error al procesar la entrega de factura' });
  }
}
