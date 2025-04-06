// pages/api/generar-factura.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = Buffer.from(`${process.env.FACTURAMA_USER}:${process.env.FACTURAMA_PASS}`).toString('base64');

  try {
    const testRes = await fetch('https://apisandbox.facturama.mx/api-lite/catalogs/forma-pago', {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!testRes.ok) {
      const errorText = await testRes.text();
      console.error('❌ Error Facturama:', errorText);
      return res.status(testRes.status).json({ error: 'Falló la conexión con Facturama', detalle: errorText });
    }

    return res.status(200).json({ success: true, message: '✅ Conexión con Facturama exitosa' });
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return res.status(500).json({ error: 'Error inesperado al conectar con Facturama' });
  }
}
