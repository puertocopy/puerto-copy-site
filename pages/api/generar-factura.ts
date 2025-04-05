// pages/api/generar-factura.ts
import type { NextApiRequest, NextApiResponse } from 'next';
function btoa(str: string): string {
    return Buffer.from(str, 'binary').toString('base64');
  }
  

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
    regimenFiscal,
  } = req.body;

  if (!ticket) {
    return res.status(400).json({ error: 'Número de ticket requerido' });
  }

  // Paso 1: Buscar el ticket en Loyverse
  const loyverseUrl = `https://api.loyverse.com/v1.0/receipts?receipt_number=${ticket}`;

  const loyverseResponse = await fetch(loyverseUrl, {
    headers: {
      Authorization: `Bearer ${process.env.LOYVERSE_API_TOKEN}`,
    },
  });

  if (!loyverseResponse.ok) {
    const errorText = await loyverseResponse.text();
    console.error('Error con Loyverse:', errorText);
    return res.status(500).json({ error: 'No se pudo obtener el ticket de Loyverse' });
  }

  const loyverseData = await loyverseResponse.json();
  const receipts = loyverseData.receipts;

  const receipt = receipts.find(
    (r: any) => String(r.receipt_number).trim() === String(ticket).trim()
  );

  if (!receipt) {
    return res.status(404).json({ error: 'Ticket no encontrado' });
  }

  // Paso 2: Construir el cuerpo de la factura (simplificado para pruebas)
  const invoiceBody = {
    Serie: 'A',
    Folio: '100',
    Fecha: new Date().toISOString(),
    FormaPago: '01', // Efectivo
    CondicionesDePago: 'Contado',
    SubTotal: receipt.total_money - receipt.total_tax,
    Descuento: 0,
    Moneda: 'MXN',
    Total: receipt.total_money,
    TipoDeComprobante: 'I',
    MetodoPago: 'PUE',
    LugarExpedicion: cp,
    Receptor: {
      Rfc: rfc,
      Nombre: razonSocial,
      UsoCFDI: usoCfdi,
      RegimenFiscalReceptor: regimenFiscal,
      DomicilioFiscalReceptor: cp,
    },
    Conceptos: receipt.line_items.map((item: any) => ({
      ClaveProdServ: '84111506', // Producto genérico
      NoIdentificacion: item.sku,
      Cantidad: item.quantity,
      ClaveUnidad: 'ACT',
      Unidad: 'Servicio',
      Descripcion: item.item_name,
      ValorUnitario: item.price,
      Importe: item.total_money,
      Descuento: 0,
      Impuestos: {
        Traslados: [
          {
            Base: item.total_money,
            Impuesto: '002',
            TipoFactor: 'Tasa',
            TasaOCuota: 0.16,
            Importe: item.total_money * 0.16,
          },
        ],
      },
    })),
  };

  // Paso 3: Enviar a Facturama
  const facturamaUser = process.env.FACTURAMA_USER || '';
  const facturamaPass = process.env.FACTURAMA_PASSWORD || '';
  const facturamaAuth = btoa(`${facturamaUser}:${facturamaPass}`);

  const facturamaResponse = await fetch('https://apisandbox.facturama.mx/api-lite/2/cfdis', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${facturamaAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoiceBody),
  });

  const facturaResult = await facturamaResponse.json();

  if (!facturamaResponse.ok) {
    console.error('Error Facturama:', facturaResult);
    return res.status(500).json({ error: 'Error al generar la factura con Facturama', detail: facturaResult });
  }

  return res.status(200).json({ factura: facturaResult });
}
