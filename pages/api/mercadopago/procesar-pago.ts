import type { NextApiRequest, NextApiResponse } from 'next';
import { Payment } from 'mercadopago';
import { MercadoPagoConfig } from 'mercadopago';
import { obtenerAccessToken } from '../../../lib/mercadopago';


/**
 * API Route: Procesar Pago Directo (Checkout API)
 * 
 * Recibe el token de tarjeta generado de forma segura en el cliente (MercadoPago.js)
 * y ejecuta la transacción de cobro directamente en el servidor.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido. Usa POST.' });
  }

  try {
    const { token, paymentMethodId, issuerId, installments, payer, items, total, orderId } = req.body;

    if (!token || !paymentMethodId || !total || !payer?.email) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos obligatorios para procesar el pago (token, método de pago, email o importe).'
      });
    }

    // Obtener Access Token mediante helper (directo o por OAuth)
    const accessToken = await obtenerAccessToken();
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    const refPedido = orderId || `PC-${Date.now()}`;

    // Construir descripción concisa para el estado de cuenta
    const descripcion = items && items.length > 0 
      ? `Puerto Copy: ${items.map((i: any) => i.nombre).join(', ').substring(0, 50)}` 
      : 'Impresiones y Papelería - Puerto Copy';

    // Ejecutar el cobro con la API de Pagos / Órdenes
    const response = await payment.create({
      body: {
        transaction_amount: Number(total),
        token: token,
        description: descripcion,
        installments: Number(installments) || 1,
        payment_method_id: paymentMethodId,
        issuer_id: issuerId ? String(issuerId) as any : undefined,
        external_reference: refPedido,
        payer: {
          email: payer.email,
          first_name: payer.firstName || 'Cliente',
          last_name: payer.lastName || 'Puerto Copy',
          identification: payer.identification ? {
            type: payer.identification.type || 'RFC',
            number: payer.identification.number || 'XAXX010101000'
          } : undefined
        },
        statement_descriptor: 'PUERTO COPY'
      }
    });

    console.log('✅ Resultado de transacción Checkout API:', {
      id: response.id,
      status: response.status,
      status_detail: response.status_detail
    });

    // Si el pago es aprobado inmediatamente
    if (response.status === 'approved') {
      return res.status(200).json({
        success: true,
        status: response.status,
        statusDetail: response.status_detail,
        paymentId: response.id,
        externalReference: response.external_reference,
        message: 'Pago procesado y aprobado exitosamente'
      });
    }

    // Si el pago queda en proceso/pendiente (ej. revisión de seguridad)
    if (response.status === 'in_process' || response.status === 'pending') {
      return res.status(200).json({
        success: true,
        status: response.status,
        statusDetail: response.status_detail,
        paymentId: response.id,
        externalReference: response.external_reference,
        message: 'El pago está en proceso de verificación'
      });
    }

    // Si el pago fue rechazado
    return res.status(400).json({
      success: false,
      status: response.status,
      statusDetail: response.status_detail,
      error: `El pago fue rechazado (${response.status_detail}). Por favor intenta con otra tarjeta.`
    });

  } catch (error: any) {
    console.error('❌ Error en procesar-pago (Checkout API):', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno al procesar el pago con la tarjeta.'
    });
  }
}
