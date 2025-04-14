import type { NextApiRequest, NextApiResponse } from 'next';

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
    return res.status(400).json({ error: '❌ Faltan campos requeridos' });
  }

  const facturaData = {
    Receptor: {
      Rfc: rfc,
      Nombre: razonSocial,
      DomicilioFiscalReceptor: cp,
      RegimenFiscalReceptor: regimenFiscal,
      UsoCFDI: usoCfdi,
    },
    Emisor: {
      Rfc: process.env.EMISOR_RFC!,
      Nombre: process.env.EMISOR_NAME!,
      RegimenFiscal: process.env.EMISOR_REGIMEN!
    },
    TipoDeComprobante: "I",
    Exportacion: "01",
    MetodoPago: "PUE",
    FormaPago: "01",
    Serie: "A",
    Folio: `${ticket}`,
    LugarExpedicion: cp,
    Conceptos: [
      {
        ClaveProdServ: "01010101",
        Cantidad: 1,
        ClaveUnidad: "E48",
        Unidad: "Servicio",
        Descripcion: `Venta en mostrador Ticket ${ticket}`,
        ValorUnitario: 100,
        Importe: 100,
        ObjetoImp: "02",
        Impuestos: {
          Traslados: [
            {
              Base: 100,
              Impuesto: "002",
              TipoFactor: "Tasa",
              TasaOCuota: 0.16,
              Importe: 16
            }
          ]
        }
      }
    ],
    Impuestos: {
      TotalImpuestosTrasladados: 16,
      Traslados: [
        {
          Impuesto: "002",
          TipoFactor: "Tasa",
          TasaOCuota: 0.16,
          Importe: 16
        }
      ]
    },
    SubTotal: 100,
    Total: 116
  };

  try {
    const response = await fetch("https://sandbox.factura.com/api/v4/cfdi40/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.FACTURA_COM_API_KEY || '',
        "api-secret": process.env.FACTURA_COM_API_SECRET || ''
      },
      body: JSON.stringify(facturaData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error Factura.com:", errorText);
      return res.status(response.status).json({ error: '❌ Error al conectar con Factura.com', detalle: errorText });
    }

    const result = await response.json();
    return res.status(200).json({ success: true, factura: result });

  } catch (error: any) {
    console.error("❌ Error general:", error);
    return res.status(500).json({ error: '❌ Error general', detalle: error.message });
  }
}
