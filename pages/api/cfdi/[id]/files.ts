import type { NextApiRequest, NextApiResponse } from 'next';

const SANDBOX_BASE_URL = 'https://apisandbox.facturama.mx';
const PROD_BASE_URL = 'https://api.facturama.mx';
const SANDBOX_DEMO_USER = 'pruebas';
const SANDBOX_DEMO_PASSWORD = 'pruebas2011';

function getBaseUrl() {
  if (process.env.FACTURAMA_API_BASE_URL) {
    return process.env.FACTURAMA_API_BASE_URL;
  }
  return process.env.FACTURAMA_SANDBOX === 'true' ? SANDBOX_BASE_URL : PROD_BASE_URL;
}

function getAuthHeader() {
  const isSandbox = process.env.FACTURAMA_SANDBOX === 'true';
  const user = process.env.FACTURAMA_USER;
  const pass = process.env.FACTURAMA_PASSWORD;
  const canUseDemo =
    isSandbox && (!user || !pass) && process.env.NODE_ENV !== 'production';

  const authUser = canUseDemo ? SANDBOX_DEMO_USER : user;
  const authPass = canUseDemo ? SANDBOX_DEMO_PASSWORD : pass;

  if (!authUser || !authPass) {
    return null;
  }

  const base64 = Buffer.from(`${authUser}:${authPass}`).toString('base64');
  return `Basic ${base64}`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, authHeader: string) {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url, {
      headers: { Authorization: authHeader }
    });
    const body = await response.text().catch(() => '');
    const hasBody = body && body.trim().length > 0;
    if (response.ok && hasBody) {
      return { ok: true, body, status: response.status };
    }
    if (response.status !== 404 && response.ok) {
      return { ok: false, body, status: response.status };
    }
    if (attempt < 6) {
      await sleep(1000);
    }
  }
  return { ok: false, body: '', status: 404 };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const cfdiId = String(req.query.id || '').trim();
  if (!cfdiId) {
    return res.status(400).json({ message: 'Falta cfdiId' });
  }

  const authHeader = getAuthHeader();
  if (!authHeader) {
    return res.status(500).json({ message: 'Faltan credenciales de Facturama (usuario y password)' });
  }

  const baseUrl = getBaseUrl();
  const [pdfResult, xmlResult] = await Promise.all([
    fetchWithRetry(`${baseUrl}/cfdi/pdf/issued/${cfdiId}`, authHeader),
    fetchWithRetry(`${baseUrl}/cfdi/xml/issued/${cfdiId}`, authHeader)
  ]);

  const responsePayload: any = {
    cfdiId,
    pdf: pdfResult.ok ? pdfResult.body : null,
    xml: xmlResult.ok ? xmlResult.body : null
  };

  if (process.env.NODE_ENV !== 'production') {
    responsePayload.pdfStatus = pdfResult.status;
    responsePayload.xmlStatus = xmlResult.status;
    responsePayload.pdfLen = pdfResult.body ? pdfResult.body.length : 0;
    responsePayload.xmlLen = xmlResult.body ? xmlResult.body.length : 0;
  }

  return res.status(200).json(responsePayload);
}
