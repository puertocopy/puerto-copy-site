import type { NextApiRequest, NextApiResponse } from 'next';

const btoa = (str: string) => Buffer.from(str).toString('base64');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
      FiscalRegime: process.env.EMISOR_REGIMEN || '601',
      Rfc: process.env.EMISOR_RFC || 'EKU9003173C9',
      Name: process.env.EMISOR_NAME || 'ESCUELA KEMPER URGATE'
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
    const auth = btoa(`${process.env.FACTURAMA_USER}:${process.env.FACTURAMA_PASS}`);
  
    const testResponse = await fetch('https://apisandbox.facturama.mx/api-lite/catalogs/forma-pago', {
      headers: {
        Authorization: `Basic ${auth}`,
      }
    });
  
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      return res.status(testResponse.status).json({ error: '❌ Error autenticación', detalle: errorText });
    }
  
    return res.status(200).json({ success: true, message: '✅ Credenciales válidas' });
  
  } catch (e: any) {
    return res.status(500).json({ error: '❌ Error general', detalle: e.message });
  }
  
}
