import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extraer datos del cuerpo
  const { rfc, razonSocial, correo, cp, ticket, usoCfdi, regimenFiscal } = req.body;

  // Validar datos
  if (!rfc || !razonSocial || !correo || !cp || !ticket || !usoCfdi || !regimenFiscal) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Ver credenciales desde las variables de entorno
    const user = process.env.FACTURAMA_USER || '';
    const pass = process.env.FACTURAMA_PASS || '';
    const auth = Buffer.from(`${user}:${pass}`).toString('base64');

    // Construir el objeto de factura (ejemplo con importe fijo)
    const bodyData = {
      ExpeditionPlace: cp,
      Receiver: {
        Rfc: rfc,
        Name: razonSocial,
        CfdiUse: usoCfdi,
        FiscalRegime: regimenFiscal,
        TaxZipCode: cp
      },
      Items: [
        {
          Quantity: 1,
          ProductCode: '01010101',
          UnitCode: 'E48',
          Unit: 'Servicio',
          Description: `Venta mostrador - Ticket ${ticket}`,
          IdentificationNumber: ticket,
          UnitPrice: 100,
          Subtotal: 100,
          Taxes: [
            {
              Total: 16,
              Name: 'IVA',
              Base: 100,
              Rate: 0.16,
              IsRetention: false
            }
          ],
          Total: 116
        }
      ],
      PaymentForm: '01', // Efectivo
      PaymentMethod: 'PUE', // Pago en una sola exhibición
      Currency: 'MXN',
      Type: 'I'
    };

    // Hacer la solicitud a Facturama (sandbox)
    const facturaRes = await fetch('https://apisandbox.facturama.mx/api-lite/3/cfdis', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    });

    // Mostrar estatus y texto de error si falla
    if (!facturaRes.ok) {
      const errorText = await facturaRes.text();
      console.error('❌ Error Facturama status:', facturaRes.status);
      console.error('❌ Error Facturama:', errorText);
      return res.status(500).json({ error: `Error Facturama: ${facturaRes.status}` });
    }

    // Factura generada con éxito
    const factura = await facturaRes.json();
    console.log('✅ Factura generada:', factura);
    return res.status(200).json({ success: true, factura });

  } catch (err) {
    console.error('❌ Error general:', err);
    return res.status(500).json({ error: 'Error interno al generar la factura' });
  }
}
