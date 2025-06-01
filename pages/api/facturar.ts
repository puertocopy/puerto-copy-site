export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const {
    ticket,
    productos,
    rfc,
    razonSocial,
    regimenFiscal,
    usoCfdi,
    codigoPostal,
    email
  } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ message: 'No se proporcionaron productos' });
  }

  // Construir el objeto de factura
  const esSandbox = process.env.FACTURACION_SANDBOX === 'true';

const emisor = esSandbox
  ? {
      Rfc: 'CACX7605101P8',
      Nombre: 'XOCHILT CASAS CHAVEZ',
      RegimenFiscal: '621'
    }
  : {
      Rfc: process.env.EMISOR_RFC,
      Nombre: process.env.EMISOR_NAME,
      RegimenFiscal: process.env.EMISOR_REGIMEN
    };

  const facturaPayload = {
    Receptor: {
      Rfc: rfc,
      Nombre: razonSocial,
      DomicilioFiscalReceptor: codigoPostal,
      RegimenFiscalReceptor: regimenFiscal,
      UsoCFDI: usoCfdi
    },
    Emisor: emisor,

    Conceptos: productos.map((item) => ({
      ClaveProdServ: '81112100', // Genérico impresión
      Cantidad: item.cantidad,
      ClaveUnidad: 'E48', // Servicio
      Descripcion: item.nombre,
      ValorUnitario: item.precio_unitario,
      Importe: item.cantidad * item.precio_unitario,
      ObjetoImp: '02', // sujeto a impuesto
      Impuestos: {
        Traslados: [
          {
            Base: item.cantidad * item.precio_unitario,
            Impuesto: '002', // IVA
            TipoFactor: 'Tasa',
            TasaOCuota: 0.16,
            Importe: (item.cantidad * item.precio_unitario * 0.16)
          }
        ]
      }
    })),
    MetodoPago: 'PUE',
    FormaPago: '01',
    TipoDeComprobante: 'I',
    Exportacion: '01',
    LugarExpedicion: codigoPostal
  };

  try {
    const response = await fetch(`${process.env.FACTURA_COM_API_BASE_URL}/v4/cfdi40/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.FACTURA_COM_API_KEY,
        Authorization: `Bearer ${process.env.FACTURA_COM_API_SECRET}`
      },
      body: JSON.stringify(facturaPayload)
    });
    

    const rawText = await response.text();
console.log('FACTURA SANDBOX RESPUESTA:', rawText);
const data = JSON.parse(rawText);


    if (!response.ok) {
      return res.status(response.status).json({ message: data.message || 'Error al generar factura', detalles: data });
    }

    // Enviar la factura por correo al cliente
    // Aquí puedes usar Nodemailer o Mailgun si deseas enviar el PDF/XML

    return res.status(200).json({
      message: 'Factura generada correctamente',
      links: data.Links,
      debug: data // 👈 Esto es clave
        
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
