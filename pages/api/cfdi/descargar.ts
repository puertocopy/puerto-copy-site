import type { NextApiRequest, NextApiResponse } from 'next';
import { getTicket } from '../../../lib/gasTickets';
import { generateCfdiPdf, parseCfdiXml } from '../../../lib/cfdiPdfGenerator';

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

async function fetchWithRetry(url: string, authHeader: string, type: string) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { 
        headers: { 
          Authorization: authHeader,
          'Accept': type === 'pdf' ? 'application/pdf, application/octet-stream' : 'application/xml, text/xml, application/json'
        } 
      });
      
      const status = response.status;
      if (status === 200) {
        const text = await response.text();
        if (text && text.trim().length > 10) {
          try {
            const parsed = JSON.parse(text);
            const content = parsed.Content || parsed.content || parsed.data || parsed.Data;
            if (content) return { ok: true, body: content, status };
          } catch (e) {}
          return { ok: true, body: text, status };
        }
      }
    } catch (err: any) {
      console.error(`>>> Error en intento ${attempt} para ${type}:`, err?.message);
    }
    if (attempt < 4) await sleep(1200);
  }
  return { ok: false, body: '', status: 404 };
}

async function fetchCfdiFile(baseUrl: string, type: string, cfdiId: string, authHeader: string) {
  const liteRes = await fetchWithRetry(`${baseUrl}/cfdi/${type}/issuedLite/${cfdiId}`, authHeader, type);
  if (liteRes.ok) return liteRes;
  return await fetchWithRetry(`${baseUrl}/cfdi/${type}/issued/${cfdiId}`, authHeader, type);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const cfdiId = String(req.query.id || req.query.cfdiId || '').trim();
  const type = String(req.query.type || 'json').toLowerCase();

  if (!cfdiId) return res.status(400).json({ message: 'Falta cfdiId' });

  // 1. PRIORIDAD: Consultar directamente en MySQL tickets_facturados
  try {
    const localTicket = await getTicket(cfdiId);
    if (localTicket && localTicket.xml_content) {
      const xmlString = localTicket.xml_content;

      if (type === 'details') {
        const parsed = parseCfdiXml(xmlString);
        return res.status(200).json({
          cfdiId,
          uuid: parsed.timbreFiscal.uuid,
          fecha: parsed.fecha,
          fechaTimbrado: parsed.timbreFiscal.fechaTimbrado,
          metodoPago: parsed.metodoPago,
          formaPago: parsed.formaPago,
          total: parsed.total,
          subtotal: parsed.subtotal,
          moneda: parsed.moneda,
          serie: parsed.serie,
          folio: parsed.folio,
          emisor: parsed.emisor,
          receptor: parsed.receptor,
          Items: parsed.conceptos.map(c => ({
            Quantity: c.cantidad,
            Description: c.descripcion,
            UnitPrice: c.valorUnitario,
            Subtotal: c.importe,
            Total: c.importe,
            ClaveProdServ: c.claveProdServ,
            ClaveUnidad: c.claveUnidad
          })),
          items: parsed.conceptos.map(c => ({
            quantity: c.cantidad,
            description: c.descripcion,
            unitPrice: c.valorUnitario,
            subtotal: c.importe,
            total: c.importe
          })),
          impuestos: parsed.impuestos,
          timbreFiscal: parsed.timbreFiscal
        });
      }

      if (type === 'xml') {
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=factura_${localTicket.uuid || cfdiId}.xml`);
        return res.send(xmlString);
      }

      if (type === 'pdf') {
        const pdfBuffer = await generateCfdiPdf(xmlString);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=factura_${localTicket.uuid || cfdiId}.pdf`);
        return res.send(pdfBuffer);
      }

      // type === 'json' (Utilizado por FacturaPageClient)
      const pdfBuffer = await generateCfdiPdf(xmlString);
      return res.status(200).json({
        cfdiId,
        pdf: pdfBuffer.toString('base64'),
        xml: Buffer.from(xmlString, 'utf8').toString('base64')
      });
    }
  } catch (dbErr: any) {
    console.warn('>>> Error al recuperar CFDI local desde MySQL, intentando Facturama:', dbErr?.message);
  }

  // 2. FALLBACK: Si no está en MySQL, consultar a Facturama
  const authHeader = getAuthHeader();
  if (!authHeader) return res.status(500).json({ message: 'Faltan credenciales' });

  const baseUrl = getBaseUrl();

  if (type === 'details') {
    try {
      const detailRes = await fetch(`${baseUrl}/cfdi/${cfdiId}`, { headers: { Authorization: authHeader } });
      if (detailRes.ok) {
        const data = await detailRes.json();
        return res.status(200).json(data);
      }
    } catch (_) {}
  }

  if (type === 'pdf' || type === 'xml') {
    const result = await fetchCfdiFile(baseUrl, type, cfdiId, authHeader);
    if (!result.ok) return res.status(404).send('Archivo no encontrado');

    const buffer = Buffer.from(result.body, 'base64');
    res.setHeader('Content-Type', type === 'pdf' ? 'application/pdf' : 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename=factura_${cfdiId}.${type}`);
    return res.send(buffer);
  }

  const [pdfResult, xmlResult] = await Promise.all([
    fetchCfdiFile(baseUrl, 'pdf', cfdiId, authHeader),
    fetchCfdiFile(baseUrl, 'xml', cfdiId, authHeader)
  ]);

  return res.status(200).json({
    cfdiId,
    pdf: pdfResult.ok ? pdfResult.body : null,
    xml: xmlResult.ok ? xmlResult.body : null
  });
}
