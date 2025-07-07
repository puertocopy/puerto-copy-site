export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const {
    ticket,
    rfc,
    razonSocial,
    regimenFiscal,
    usoCfdi,
    codigoPostal,
    email,
    productos
  } = req.body;

  // Convertir productos en conceptos CFDI
  const conceptos = productos.map(p => ({
    ClaveProdServ: '01010101',
    Cantidad: p.cantidad,
    ClaveUnidad: 'H87',
    Descripcion: p.nombre,
    ValorUnitario: p.precio_unitario,
    Importe: (p.cantidad * p.precio_unitario).toFixed(2),
    ObjetoImp: '01'
  }));

  try {
    const facturaRes = await fetch('https://sandbox.factura.com/api/v4/cfdi40/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'F-API-KEY': process.env.FACTURA_COM_API_KEY,
        'F-SECRET-KEY': process.env.FACTURA_COM_API_SECRET,
      },
      body: JSON.stringify({
        Receptor: {
          Rfc: rfc,
          Nombre: razonSocial,
          UsoCFDI: usoCfdi,
          DomicilioFiscalReceptor: codigoPostal,
          RegimenFiscalReceptor: regimenFiscal,
        },
        Emisor: {
          Rfc: 'CACX7605101P8',
          RegimenFiscal: '621',
        },
        Conceptos: conceptos,
        TipoComprobante: 'I',
        Exportacion: '01',
        MetodoPago: 'PPD',
        FormaPago: '99',
        Serie: 'A',
        LugarExpedicion: codigoPostal,
      }),
    });

    const facturaData = await facturaRes.json();

    if (!facturaRes.ok) {
      console.error('Error de facturación:', facturaData);
      return res.status(500).json({ error: facturaData.message || 'Error al generar factura' });
    }

    return res.status(200).json({
      mensaje: 'Factura generada correctamente',
      pdf_url: facturaData.pdf_url,
      xml_url: facturaData.xml_url,
    });

  } catch (err) {
    console.error('Error general:', err);
    return res.status(500).json({ error: 'Error al conectar con el PAC' });
  }
}
