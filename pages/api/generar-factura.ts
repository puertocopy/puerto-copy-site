import type { NextApiRequest, NextApiResponse } from 'next';

const btoa = (str: string) => Buffer.from(str).toString('base64');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    rfc, razonSocial, correo, cp, ticket, usoCfdi, regimenFiscal
  } = req.body;

  if (!rfc || !razonSocial || !correo || !cp || !ticket || !usoCfdi || !regimenFiscal) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const auth = btoa(`${process.env.FACTURAMA_USER}:${process.env.FACTURAMA_PASS}`);

    const bodyData = {
      "ExpeditionPlace": cp,
      "Receiver": {
        "Rfc": rfc,
        "Name": razonSocial,
        "CfdiUse": usoCfdi,
        "FiscalRegime": regimenFiscal,
        "TaxZipCode": cp
      },
      "Items": [
        {
          "Quantity": 1,
          "ProductCode": "01010101", // Genérico
          "UnitCode": "E48",
          "Unit": "Servicio",
          "Description": `Venta mostrador - Ticket ${ticket}`,
          "IdentificationNumber": ticket,
          "UnitPrice": 100,
          "Subtotal": 100,
          "Taxes": [
            {
              "Total": 16,
              "Name": "IVA",
              "Base": 100,
              "Rate": 0.16,
              "IsRetention": false
            }
          ],
          "Total": 116
        }
      ],
      "PaymentForm": "01",     // Efectivo
      "PaymentMethod": "PUE",  // Pago en una sola exhibición
      "Currency": "MXN",
      "Type": "I"              // Ingreso
    };

    const facturaRes = await fetch("https://apisandbox.facturama.mx/api-lite/3/cfdis", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    if (!facturaRes.ok) {
      const rawError = await facturaRes.text();
      let errorDetail = '';

      try {
        const parsed = JSON.parse(rawError);
        errorDetail = JSON.stringify(parsed, null, 2);
      } catch {
        errorDetail = rawError;
      }

      console.error("❌ Error Facturama:", errorDetail);
      return res.status(500).json({ error: `Error de Facturama: ${errorDetail}` });
    }

    const factura = await facturaRes.json();
    return res.status(200).json({ success: true, factura });

  } catch (error) {
    console.error("❌ Error inesperado:", error);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
