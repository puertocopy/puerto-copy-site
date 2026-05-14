import type { NextApiRequest, NextApiResponse } from 'next';

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

function buildAuthHeader() {
  const user = process.env.FACTURAMA_USER;
  const pass = process.env.FACTURAMA_PASSWORD;
  if (!user || !pass) return null;
  const base64 = Buffer.from(`${user}:${pass}`).toString('base64');
  return `Basic ${base64}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const authHeader = buildAuthHeader();
  if (!authHeader) {
    return res.status(500).json({ message: 'Faltan credenciales de Facturama (FACTURAMA_USER/PASSWORD)' });
  }

  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/Client?page=1`, {
      headers: {
        Authorization: authHeader
      }
    });

    const text = await response.text();
    return res.status(200).json({
      status: response.status,
      environment: baseUrl.includes('sandbox') ? 'SANDBOX' : 'PRODUCTION',
      url: baseUrl,
      rawEnvValue: process.env.FACTURAMA_API_BASE_URL || 'not set',
      bodyPreview: text.slice(0, 500)
    });
  } catch (error: any) {
    return res.status(500).json({ 
      message: `Error al hacer ping a Facturama (${baseUrl})`, 
      error: String(error?.message || error),
      url: baseUrl
    });
  }
}
