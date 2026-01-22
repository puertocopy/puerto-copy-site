import type { NextApiRequest, NextApiResponse } from 'next';

const SANDBOX_BASE_URL = 'https://apisandbox.facturama.mx';

function buildAuthHeader() {
  const user = process.env.FACTURAMA_USER || 'pruebas';
  const pass = process.env.FACTURAMA_PASSWORD || 'pruebas2011';
  const base64 = Buffer.from(`${user}:${pass}`).toString('base64');
  return `Basic ${base64}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const response = await fetch(`${SANDBOX_BASE_URL}/Client?page=1`, {
      headers: {
        Authorization: buildAuthHeader()
      }
    });

    const text = await response.text();
    return res.status(200).json({
      status: response.status,
      bodyPreview: text.slice(0, 200)
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error al hacer ping a Facturama', error: String(error?.message || error) });
  }
}
