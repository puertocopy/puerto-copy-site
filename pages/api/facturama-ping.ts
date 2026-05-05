import type { NextApiRequest, NextApiResponse } from 'next';

const PROD_BASE_URL = 'https://api.facturama.mx';

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

  try {
    const response = await fetch(`${PROD_BASE_URL}/Client?page=1`, {
      headers: {
        Authorization: authHeader
      }
    });

    const text = await response.text();
    return res.status(200).json({
      status: response.status,
      environment: 'PRODUCTION',
      url: PROD_BASE_URL,
      bodyPreview: text.slice(0, 200)
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error al hacer ping a Facturama (Producción)', error: String(error?.message || error) });
  }
}
