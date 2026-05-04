import type { NextApiRequest, NextApiResponse } from 'next';

const SANDBOX_BASE_URL = 'https://apisandbox.facturama.mx';
const PROD_BASE_URL = 'https://api.facturama.mx';

function getBaseUrl() {
  let url = process.env.FACTURAMA_API_BASE_URL || (process.env.FACTURAMA_SANDBOX === 'true' ? SANDBOX_BASE_URL : PROD_BASE_URL);
  if (url.endsWith('/api-lite')) return 'https://api.facturama.mx';
  return url;
}

function getAuthHeader() {
  const user = process.env.FACTURAMA_USER;
  const pass = process.env.FACTURAMA_PASSWORD;
  if (!user || !pass) return null;
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, authHeader: string) {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url, { headers: { Authorization: authHeader } });
    const body = await response.text().catch(() => '');
    if (response.ok && body.trim().length > 0) {
      return { ok: true, body, status: response.status };
    }
    if (attempt < 6) await sleep(1000);
  }
  return { ok: false, body: '', status: 404 };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cfdiId = String(req.query.id || req.query.cfdiId || '').trim();
  const type = String(req.query.type || 'json').toLowerCase();

  if (!cfdiId) return res.status(400).json({ message: 'Falta cfdiId' });

  const authHeader = getAuthHeader();
  if (!authHeader) return res.status(500).json({ message: 'Faltan credenciales' });

  const baseUrl = getBaseUrl();

  if (type === 'pdf' || type === 'xml') {
    const result = await fetchWithRetry(`${baseUrl}/cfdi/${type}/issued/${cfdiId}`, authHeader);
    if (!result.ok) return res.status(404).send('Archivo no encontrado');

    const buffer = Buffer.from(result.body, 'base64');
    res.setHeader('Content-Type', type === 'pdf' ? 'application/pdf' : 'application/xml');
    res.setHeader('Content-Disposition', `${type === 'pdf' ? 'inline' : 'attachment'}; filename=factura_${cfdiId}.${type}`);
    return res.send(buffer);
  }

  const [pdfResult, xmlResult] = await Promise.all([
    fetchWithRetry(`${baseUrl}/cfdi/pdf/issued/${cfdiId}`, authHeader),
    fetchWithRetry(`${baseUrl}/cfdi/xml/issued/${cfdiId}`, authHeader)
  ]);

  return res.status(200).json({
    cfdiId,
    pdf: pdfResult.ok ? pdfResult.body : null,
    xml: xmlResult.ok ? xmlResult.body : null
  });
}
