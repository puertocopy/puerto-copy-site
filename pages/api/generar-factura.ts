import type { NextApiRequest, NextApiResponse } from 'next';

const btoa = (str: string) => Buffer.from(str).toString('base64');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const {
    ticket,
    rfc,
    razonSocial,
    correo,
    cp,
    usoCfdi,
    regimenFiscal,
  } = req.body;

  if (!rfc || !razonSocial || !correo || !cp || !ticket || !usoCfdi || !regimenFiscal) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const auth = btoa(`${process.env.FACTURAMA_USER}:${process.env.FACTURAMA_PASS}`);

  const facturaData = {
    CfdiType: 'I',
    PaymentForm: '01',
    PaymentMethod: 'PUE',
    ExpeditionPlace: cp,
    Folio: `F-${ticket}`,
    Issuer: {
      FiscalRegime: process.env.EMISOR_REGIMEN,
      Rfc: process.env.EMISOR_RFC,
      Name: process.env.EMISOR_NAME
    },
    Receiver: {
      Rfc: rfc,
      Name: razonSocial,
      CfdiUse: usoCfdi,
      FiscalRegime: regimenFiscal,
      TaxZipCode: cp
    },
    Items: [{
      ProductCode: "01010101",
      Description: `Venta mostrador - Ticket ${ticket}`,
      UnitCode: "E48",
      Unit: "Servicio",
      Quantity: 1,
      UnitPrice: 100,
      Subtotal: 100,
      TaxObject: "02",
      Taxes: [{
        Total: 16,
        Name: "IVA",
        Base: 100,
        Rate: 0.16,
        IsRetention: false
      }],
      Total: 116
    }]
  };

  try {
    console.log('🟢 Enviando datos a Facturama:', JSON.stringify(facturaData, null, 2));

    const facturaRes = await fetch(`${process.env.FACTURAMA_API_URL}/api-lite/3/cfdis`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(facturaData)
    });

    const text = await facturaRes.text();

    if (!facturaRes.ok) {
      console.error('❌ Error Facturama status:', facturaRes.status);
      console.error('❌ Respuesta de Facturama:', text);
      return res.status(facturaRes.status).json({ error: 'Error al generar la factura', detalle: text });
    }

    const result = JSON.parse(text);
    console.log('✅ Factura generada:', result);
    return res.status(200).json({ success: true, factura: result });

  } catch (e: any) {
    console.error('❌ Error general:', e);
    return res.status(500).json({ error: 'Error general', detalle: e.message });
  }
}
