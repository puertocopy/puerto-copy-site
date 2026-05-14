import type { NextApiRequest, NextApiResponse } from 'next';

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

async function fetchWithRetry(url: string, authHeader: string, type: string) {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
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
          // Facturama a veces devuelve un JSON { "Content": "base64..." } 
          // y otras veces el base64 directo.
          try {
            const parsed = JSON.parse(text);
            if (parsed.Content) {
              return { ok: true, body: parsed.Content, status };
            }
          } catch (e) {
            // No es JSON, asumimos que es el base64 directo
          }
          return { ok: true, body: text, status };
        }
      }
      
      console.log(`>>> Intento ${attempt} fallido para ${type}: ${status} en ${url}`);
    } catch (err) {
      console.error(`>>> Error en intento ${attempt} para ${type}:`, err.message);
    }
    
    if (attempt < 6) await sleep(1500);
  }
  return { ok: false, body: '', status: 404 };
}

async function fetchCfdiFile(baseUrl: string, type: string, cfdiId: string, authHeader: string) {
  // 1. Intentar issuedLite (Prioridad absoluta según requerimiento del usuario)
  // URL: api.facturama.mx/cfdi/pdf/issuedLite/{id}
  console.log(`>>> Intentando recuperación via issuedLite para ${type}: ${cfdiId}`);
  const liteRes = await fetchWithRetry(`${baseUrl}/cfdi/${type}/issuedLite/${cfdiId}`, authHeader, type);
  if (liteRes.ok) return liteRes;

  // 2. Fallback: issued (Estándar) si el anterior falla
  console.log(`>>> Fallback a issued estándar para ${type}: ${cfdiId}`);
  return await fetchWithRetry(`${baseUrl}/cfdi/${type}/issued/${cfdiId}`, authHeader, type);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Deshabilitar caché para asegurar recuperación fresca de Facturama
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const cfdiId = String(req.query.id || req.query.cfdiId || '').trim();
  const type = String(req.query.type || 'json').toLowerCase();

  if (!cfdiId) return res.status(400).json({ message: 'Falta cfdiId' });

  const authHeader = getAuthHeader();
  if (!authHeader) return res.status(500).json({ message: 'Faltan credenciales' });

  const baseUrl = getBaseUrl();

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
