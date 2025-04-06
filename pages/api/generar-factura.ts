// pages/api/generar-factura.ts
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

  // Validación de campos
  if (!ticket || !rfc || !razonSocial || !correo || !cp || !usoCfdi || !regimenFiscal) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const apiKey = process.env.FACTURA_API_KEY;
  const apiSecret = process.env.FACTURA_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: '❌ API KEY o SECRET no configurados' });
  }

  const payload = {
    Receptor: {
      Rfc: rfc,
      Nombre: razonSocial,
      UsoCFDI: usoCfdi,
      CodigoPostal: cp,
      RegimenFiscalReceptor: regimenFiscal
    },
    Conceptos: [
      {
        ClaveProdServ: "01010101",
        Cantidad: 1,
        ClaveUnidad: "E48",
        Unidad: "Servicio",
        Descripcion: `Venta mostrador - Ticket ${ticket}`,
        ValorUnitario: 100,
        Importe: 100,
        Descuento: 0
      }
    ],
    TipoComprobante: "I",
    FormaPago: "01",
    MetodoPago: "PUE",
    LugarExpedicion: cp,
    RegimenFiscal: process.env.EMISOR_REGIMEN,
    Emisor: {
      Nombre: process.env.EMISOR_NAME,
      Rfc: process.env.EMISOR_RFC,
      RegimenFiscal: process.env.EMISOR_REGIMEN
    }
  };

  try {
    const response = await fetch('https://sandbox.factura.com.mx/api/v4/cfdi33/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'F-Api-Key': apiKey,
        'F-Secret-Key': apiSecret
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    if (!response.ok) {
      console.error('❌ Error Factura.com:', text);
      return res.status(response.status).json({
        error: '❌ Error al generar la factura',
        detalle: text
      });
    }

    console.log('✅ Factura generada:', text);
    return res.status(200).json({
      success: true,
      message: '✅ Factura generada correctamente',
      data: text
    });
  } catch (error: any) {
    console.error('❌ Error general:', error);
    return res.status(500).json({
      error: '❌ Error general',
      detalle: error.message
    });
  }
}
