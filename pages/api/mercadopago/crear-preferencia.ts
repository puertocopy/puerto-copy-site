import type { NextApiRequest, NextApiResponse } from 'next';
import { crearPreferencia } from '../../../lib/mercadopago';

/**
 * API Route: Crear Preferencia de Pago en Mercado Pago
 * 
 * Esta función recibe los productos del carrito de Puerto Copy,
 * autentica mediante Access Token o Client Credentials (OAuth /oauth/token),
 * y devuelve el enlace de cobro para Checkout Pro (Sandbox o Producción).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido. Usa POST.' });
  }

  try {
    const { items, orderId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El carrito está vacío. Agrega productos antes de pagar.'
      });
    }

    // Determinar la URL base del sitio
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;

    // Crear la preferencia usando el helper de Mercado Pago
    const resultado = await crearPreferencia(items, orderId, baseUrl);

    return res.status(200).json({
      success: true,
      ...resultado
    });

  } catch (error: any) {
    console.error('❌ Error al crear preferencia de Mercado Pago:', error);

    const isAuthError = error.message?.includes('credenciales') || error.message?.includes('autenticar');

    return res.status(isAuthError ? 400 : 500).json({
      success: false,
      needsCredentials: isAuthError,
      error: error.message || 'Error al comunicarse con Mercado Pago.'
    });
  }
}
