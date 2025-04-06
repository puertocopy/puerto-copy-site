import type { NextApiRequest, NextApiResponse } from 'next';

const btoa = (str: string) => Buffer.from(str).toString('base64');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    rfc,
    razonSocial,
    correo,
    cp,
    ticket,
    usoCfdi,
    regimenFiscal
  } = req.body;

  if (!rfc || !razonSocial || !correo || !cp || !ticket || !usoCfdi || !regimenFiscal) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const auth = btoa(`${process.env.FACTURAMA_USER}:${process.env.FACTURAMA_PASS}`);
  const apiUrl = process.env.FACTURAMA_API_URL || 'https://apisandbox.facturama.mx';

  const facturaData = {
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
        "ProductCode": "01010101",
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
    "PaymentForm": "01",
    "PaymentMethod": "PUE",
    "Currency": "MXN",
    "Type": "I"
  };

  try {
    const response = await fetch(`${apiUrl}/api-lite/3/cfdis`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(facturaData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error Facturama:', result);
      return res.status(500).json({ error: result.Message || 'Error al generar la factura' });
    }

    return res.status(200).json({ success: true, factura: result });
  } catch (error) {
    console.error('Error general:', error);
    return res.status(500).json({ error: 'Error inesperado al generar la factura' });
  }
}
