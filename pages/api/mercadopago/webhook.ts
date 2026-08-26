import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Route: Webhook de Mercado Pago
 * 
 * Mercado Pago envía notificaciones automáticas a esta ruta cada vez que
 * un pago es aprobado, rechazado o se actualiza su estado.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  try {
    const query = req.query;
    const body = req.body;

    console.log('📬 Notificación Webhook recibida de Mercado Pago:', {
      query,
      body,
      timestamp: new Date().toISOString()
    });

    // Responder inmediatamente 200 OK a Mercado Pago para confirmar recepción
    return res.status(200).json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('❌ Error al recibir Webhook de Mercado Pago:', error);
    return res.status(500).json({ error: error.message });
  }
}
