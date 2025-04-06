import type { NextApiRequest, NextApiResponse } from 'next';

const btoa = (str: string) => Buffer.from(str).toString('base64');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      ticket,
      rfc,
      razonSocial,
      correo,
      cp,
      usoCfdi,
      regimenFiscal
    } = req.body;

    if (!ticket || !rfc || !razonSocial || !correo || !cp || !usoCfdi || !regimenFiscal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Autenticación
    const username = process.env.FACTURAMA_USER!;
    const password = process.env.FACTURAMA_PASS!;
    const auth = btoa(`${username}:${password}`);

    // Datos del CFDI
    const data = {
      CfdiType: "I",
      PaymentForm: "01",
      PaymentMethod: "PUE",
      ExpeditionPlace: cp,
      Folio: ticket,
      Issuer: {
        FiscalRegime: process.env.FACTURAMA_REGIMEN || "601", // usa tu régimen real
        Rfc: process.env.FACTURAMA_RFC || "EKU9003173C9",      // RFC de pruebas
        Name: process.env.FACTURAMA_NAME || "ESCUELA KEMPER URGATE"
      },
      Receiver: {
        Rfc: rfc,
        Name: razonSocial.toUpperCase(),
        CfdiUse: usoCfdi,
        FiscalRegime: regimenFiscal,
        TaxZipCode: cp
      },
      Items: [
        {
          ProductCode: "25173301",
          Description: `Venta mostrador - Ticket ${ticket}`,
          UnitCode: "E48",
          Quantity: 1,
          UnitPrice: 100,
          Subtotal: 100,
          Taxes: [{
            Total: 16,
            Name: "IVA",
            Base: 100,
            Rate: 0.16,
            IsRetention: false
          }],
          Total: 116,
          TaxObject: "02"
        }
      ]
    };

    const facturaRes = await fetch("https://apisandbox.facturama.mx/api-lite/3/cfdis", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const text = await facturaRes.text();

    if (!facturaRes.ok) {
      console.error("❌ Error Facturama status:", facturaRes.status);
      console.error("❌ Error Facturama:", text);
      return res.status(500).json({ error: `Error Facturama: ${text}` });
    }

    const factura = JSON.parse(text);
    return res.status(200).json({ success: true, factura });

  } catch (error: any) {
    console.error("Error general:", error);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
