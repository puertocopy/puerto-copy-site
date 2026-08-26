import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { obtenerAccessToken } from '../../../lib/mercadopago';

/**
 * API Route: Procesar Orden de Mercado Pago (Orders API v1/orders)
 * 
 * Recibe la información enviada desde el Card Payment Brick
 * y crea la orden de pago directamente en el endpoint POST /v1/orders de Mercado Pago.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido. Usa POST.' });
  }

  try {
    const { token, paymentMethodId, paymentTypeId, installments, payer, amount, externalReference } = req.body;

    if (!token || !paymentMethodId || !amount || !payer?.email) {
      return res.status(400).json({
        success: false,
        error: 'Faltan parámetros requeridos para crear la orden (token, método de pago, monto o email).'
      });
    }

    // Obtener Access Token (directo o vía OAuth)
    const accessToken = await obtenerAccessToken();

    // Formatear el monto en formato string de 2 decimales "00.00"
    const montoFormateado = Number(amount).toFixed(2);
    const refPedido = externalReference || `PC-${Date.now()}`;
    const idempotencyKey = uuidv4();

    // Construir la estructura exacta de Orders API /v1/orders
    const bodyOrder = {
      type: 'online',
      processing_mode: 'automatic',
      total_amount: montoFormateado,
      external_reference: refPedido,
      payer: {
        email: payer.email,
        identification: payer.identification ? {
          type: payer.identification.type || 'RFC',
          number: payer.identification.number || 'XAXX010101000'
        } : undefined
      },
      transactions: {
        payments: [
          {
            amount: montoFormateado,
            payment_method: {
              id: paymentMethodId,
              type: paymentTypeId || 'credit_card',
              token: token,
              installments: Number(installments) || 1
            }
          }
        ]
      }
    };

    console.log('📡 Enviando POST /v1/orders a Mercado Pago:', {
      refPedido,
      total: montoFormateado,
      paymentMethodId
    });

    const mpResponse = await fetch('https://api.mercadopago.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(bodyOrder)
    });

    const responseData = await mpResponse.json();

    if (!mpResponse.ok || responseData.status === 'rejected' || responseData.error) {
      console.error('❌ Error al procesar la orden en Mercado Pago:', responseData);
      return res.status(400).json({
        success: false,
        status: responseData.status || 'rejected',
        statusDetail: responseData.status_detail || responseData.message,
        error: responseData.message || responseData.error || 'La transacción fue rechazada. Verifica tus datos de tarjeta.'
      });
    }

    console.log('✅ Orden de Mercado Pago creada con éxito:', {
      orderId: responseData.id,
      status: responseData.status,
      statusDetail: responseData.status_detail
    });

    return res.status(200).json({
      success: true,
      orderId: responseData.id,
      status: responseData.status,
      statusDetail: responseData.status_detail,
      externalReference: responseData.external_reference,
      message: 'Orden de pago procesada exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error interno en /api/mercadopago/procesar-orden:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor al procesar la orden de pago.'
    });
  }
}
