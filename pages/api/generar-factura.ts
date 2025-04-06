import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
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
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const apiKey = process.env.FACTURACOM_API_KEY;
  const apiSecret = process.env.FACTURACOM_API_SECRET;
  const baseUrl = process.env.FACTURACOM_BASE_URL || 'https://sandbox.factura.com.mx';

  try {
    const facturaRes = await fetch(`${baseUrl}/v4/cfdi40/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey!,
        'api-secret': apiSecret!
      },
      body: JSON.stringify({
        Receptor: {
          Rfc: rfc,
          Nombre: razonSocial,
          UsoCFDI: usoCfdi,
          DomicilioFiscalReceptor: cp,
          RegimenFiscalReceptor: regimenFiscal
        },
        Conceptos: [
          {
            ClaveProdServ: '01010101',
            Cantidad: 1,
            ClaveUnidad: 'E48',
            Unidad: 'Servicio',
            Descripcion: `Venta mostrador - Ticket ${ticket}`,
            ValorUnitario: 100,
            Importe: 100,
            ObjetoImp: '02',
            Impuestos: {
              Traslados: [
                {
                  Base: 100,
                  Impuesto: '002',
                  TipoFactor: 'Tasa',
                  TasaOCuota: 0.16,
                  Importe: 16
                }
              ]
            }
          }
        ],
        Serie: 'A',
        Folio: ticket,
        Fecha: new Date().toISOString(),
        FormaPago: '01',
        MetodoPago: 'PUE',
        Moneda: 'MXN',
        LugarExpedicion: cp,
        TipoDeComprobante: 'I',
        Exportacion: '01'
      })
    });

    const data = await facturaRes.json();

    if (!facturaRes.ok) {
      return res.status(facturaRes.status).json({ error: 'Error al generar factura', detalle: data });
    }

    return res.status(200).json({ success: true, factura: data });

  } catch (error: any) {
    return res.status(500).json({ error: 'Error inesperado', detalle: error.message });
  }
}
