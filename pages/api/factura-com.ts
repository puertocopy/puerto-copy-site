// pages/api/factura-com.ts
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

  try {
    const authHeader = `Bearer ${process.env.FACTURA_API_KEY}`;

    const response = await fetch(`${process.env.FACTURA_API_BASE_URL}/v4/cfdi40/create`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receptor: {
          rfc: rfc,
          nombre: razonSocial,
          regimen_fiscal: regimenFiscal,
          uso_cfdi: usoCfdi,
          codigo_postal: cp,
          email: correo
        },
        conceptos: [
          {
            clave_prod_serv: "01010101",
            cantidad: 1,
            clave_unidad: "E48",
            unidad: "Servicio",
            descripcion: `Venta mostrador - Ticket ${ticket}`,
            valor_unitario: 100,
            importe: 100,
            objeto_impuesto: "02",
            impuestos: {
              traslados: [
                {
                  base: 100,
                  impuesto: "002",
                  tipo_factor: "Tasa",
                  tasa_o_cuota: 0.16,
                  importe: 16
                }
              ]
            }
          }
        ],
        metodo_pago: "PUE",
        forma_pago: "01",
        serie: "A",
        folio: `T-${ticket}`,
        tipo_comprobante: "I",
        lugar_expedicion: cp
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error al generar factura', detalle: result });
    }

    return res.status(200).json({ success: true, data: result });

  } catch (error: any) {
    console.error("❌ Error general:", error);
    return res.status(500).json({ error: '❌ Error al conectar con Factura.com', detalle: error.message });
  }
}
