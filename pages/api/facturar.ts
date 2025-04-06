// pages/api/facturar.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const {
    rfc,
    razonSocial,
    correo,
    codigoPostal,
    usoCfdi,
    regimenFiscal,
    ticket,
    concepto,
    precioUnitario,
  } = req.body;

  if (!rfc || !razonSocial || !correo || !codigoPostal || !usoCfdi || !regimenFiscal || !ticket || !concepto || !precioUnitario) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const auth = Buffer.from(`${process.env.FACTURAMA_USER}:${process.env.FACTURAMA_PASS}`).toString('base64');

  const facturaData = {
    "Receptor": {
      "Rfc": rfc,
      "Nombre": razonSocial,
      "UsoCfdi": usoCfdi,
      "RegimenFiscalReceptor": regimenFiscal,
      "DomicilioFiscalReceptor": codigoPostal
    },
    "TipoDocumento": "ingreso",
    "Conceptos": [
      {
        "ClaveProdServ": "01010101",
        "Cantidad": 1,
        "ClaveUnidad": "E48",
        "Unidad": "Servicio",
        "Descripcion": concepto,
        "ValorUnitario": precioUnitario,
        "Importe": precioUnitario,
        "ObjetoImp": "02",
        "Impuestos": {
          "Traslados": [
            {
              "Base": precioUnitario,
              "Impuesto": "002",
              "TipoFactor": "Tasa",
              "TasaOCuota": 0.16,
              "Importe": +(precioUnitario * 0.16).toFixed(2)
            }
          ]
        }
      }
    ],
    "FormaPago": "01", // Efectivo por ahora, se puede cambiar
    "MetodoPago": "PUE",
    "Moneda": "MXN",
    "LugarExpedicion": codigoPostal
  };

  try {
    const response = await fetch('https://apisandbox.facturama.mx/api/v1/cfdi33/create', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(facturaData)
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(400).json({ error: error.Message || 'Error al emitir factura' });
    }

    const factura = await response.json();
    return res.status(200).json({ success: true, factura });

  } catch (err) {
    console.error('Error al facturar:', err);
    return res.status(500).json({ error: 'Error interno al emitir factura' });
  }
}
//gg