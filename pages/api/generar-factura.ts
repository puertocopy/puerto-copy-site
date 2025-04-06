import type { NextApiRequest, NextApiResponse } from 'next';

const btoa = (str: string) => Buffer.from(str).toString('base64');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;

  console.log("📦 Cuerpo recibido en /api/generar-factura:", body);

  const {
    rfc,
    razonSocial,
    correo,
    cp,
    ticket,
    usoCfdi,
    regimenFiscal
  } = body;

  if (!rfc || !razonSocial || !correo || !cp || !ticket || !usoCfdi || !regimenFiscal) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Continúa con tu código normal...


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

    const facturaRes = await fetch("https://api.facturama.mx/api-lite/3/cfdis", {
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
          errorDetail = JSON.stringify(parsed, null, 2); // bonito para imprimir
        } catch {
          errorDetail = rawError; // no era JSON, solo texto
        }
      
        console.error("❌ Error Facturama:", errorDetail);
        return res.status(500).json({ error: `Error de Facturama: ${errorDetail}` });
      }
      
      

    const factura = await facturaRes.json();
    return res.status(200).json({ success: true, factura });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
