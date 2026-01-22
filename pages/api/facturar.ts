import type { NextApiRequest, NextApiResponse } from 'next';

const SANDBOX_BASE_URL = 'https://apisandbox.facturama.mx';
const PROD_BASE_URL = 'https://api.facturama.mx';
const SANDBOX_DEMO_USER = 'pruebas';
const SANDBOX_DEMO_PASSWORD = 'pruebas2011';

function getBaseUrl() {
  if (process.env.FACTURAMA_API_BASE_URL) {
    return process.env.FACTURAMA_API_BASE_URL;
  }
  return process.env.FACTURAMA_SANDBOX === 'true' ? SANDBOX_BASE_URL : PROD_BASE_URL;
}

function getAuthHeader() {
  const isSandbox = process.env.FACTURAMA_SANDBOX === 'true';
  const user = process.env.FACTURAMA_USER;
  const pass = process.env.FACTURAMA_PASSWORD;
  const canUseDemo =
    isSandbox && (!user || !pass) && process.env.NODE_ENV !== 'production';

  const authUser = canUseDemo ? SANDBOX_DEMO_USER : user;
  const authPass = canUseDemo ? SANDBOX_DEMO_PASSWORD : pass;

  if (!authUser || !authPass) {
    return null;
  }

  const base64 = Buffer.from(`${authUser}:${authPass}`).toString('base64');
  return {
    header: `Basic ${base64}`,
    user: authUser,
    base64Length: base64.length
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  } = req.body || {};

  if (!productos || productos.length === 0) {
    return res.status(400).json({ message: 'No se proporcionaron productos' });
  }

  const requiredEnv = [
    'FACTURAMA_ISSUER_RFC',
    'FACTURAMA_ISSUER_NAME',
    'FACTURAMA_ISSUER_REGIMEN'
  ];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);
  if (missingEnv.length) {
    return res.status(500).json({ message: `Faltan variables de entorno: ${missingEnv.join(', ')}` });
  }

  const baseUrl = getBaseUrl();
  const authHeader = getAuthHeader();
  if (!authHeader) {
    return res.status(500).json({ message: 'Faltan credenciales de Facturama (usuario y password)' });
  }
  if (process.env.NODE_ENV !== 'production') {
    const maskedUser = authHeader.user ? `${authHeader.user.slice(0, 2)}***` : '??';
    console.log('facturamaBaseUrl', baseUrl);
    console.log('facturamaUser', maskedUser);
    console.log('authHeader', 'Basic ', authHeader.base64Length);
  }

  const items = productos.map((item) => {
    const quantity = Number(item.cantidad) || 0;
    const unitPrice = Number(Number(item.precio_unitario || 0).toFixed(2));
    const subtotal = Number((quantity * unitPrice).toFixed(2));
    const taxTotal = Number((subtotal * 0.16).toFixed(2));
    const total = Number((subtotal + taxTotal).toFixed(2));
    return {
      ProductCode: '81112100',
      UnitCode: 'E48',
      Description: String(item.nombre || 'Servicio'),
      Quantity: quantity,
      UnitPrice: unitPrice,
      Subtotal: subtotal,
      Total: total,
      TaxObject: '02',
      Taxes: [
        {
          Total: taxTotal,
          Name: 'IVA',
          Base: subtotal,
          Rate: 0.16,
          IsRetention: false
        }
      ]
    };
  });

  const payload = {
    CfdiType: 'I',
    PaymentForm: '01',
    PaymentMethod: 'PUE',
    ExpeditionPlace: codigoPostal,
    Currency: 'MXN',
    Issuer: {
      Rfc: process.env.FACTURAMA_ISSUER_RFC,
      Name: process.env.FACTURAMA_ISSUER_NAME,
      FiscalRegime: process.env.FACTURAMA_ISSUER_REGIMEN
    },
    Receiver: {
      Rfc: rfc,
      Name: razonSocial,
      CfdiUse: usoCfdi,
      FiscalRegime: regimenFiscal,
      TaxZipCode: codigoPostal,
      Email: email
    },
    Items: items,
    OrderNumber: ticket,
    Notes: `Registro de ticket ${ticket}. Emision manual.`
  };

  try {
    const createRes = await fetch(`${baseUrl}/3/cfdis`, {
      method: 'POST',
      headers: {
        Authorization: authHeader.header,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const createData = await createRes.json().catch(() => ({}));
    let wwwAuthenticate: string | null = null;
    if (createRes.status === 401) {
      wwwAuthenticate = createRes.headers.get('www-authenticate');
      if (process.env.NODE_ENV !== 'production' && wwwAuthenticate) {
        console.log('facturamaWwwAuthenticate', wwwAuthenticate);
      }
    }
    if (!createRes.ok) {
      return res.status(createRes.status).json({
        message: 'Error al generar CFDI',
        facturamaStatus: createRes.status,
        facturamaResponse: createData,
        facturamaBaseUrl: baseUrl,
        wwwAuthenticate: wwwAuthenticate || undefined
      });
    }

    const cfdiId = createData.Id;
    if (!cfdiId) {
      return res.status(502).json({ message: 'Respuesta inválida de Facturama', detalles: createData });
    }

    const [pdfRes, xmlRes] = await Promise.all([
      fetch(`${baseUrl}/3/cfdis/${cfdiId}/pdf`, {
        headers: { Authorization: authHeader.header }
      }),
      fetch(`${baseUrl}/3/cfdis/${cfdiId}/xml`, {
        headers: { Authorization: authHeader.header }
      })
    ]);

    if (!pdfRes.ok || !xmlRes.ok) {
      const [pdfError, xmlError] = await Promise.all([
        pdfRes.ok ? Promise.resolve(null) : pdfRes.text().catch(() => null),
        xmlRes.ok ? Promise.resolve(null) : xmlRes.text().catch(() => null)
      ]);
      return res.status(502).json({
        message: 'Error al obtener PDF/XML',
        facturamaStatus: {
          pdf: pdfRes.status,
          xml: xmlRes.status
        },
        facturamaResponse: {
          pdf: pdfError,
          xml: xmlError
        }
      });
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer()).toString('base64');
    const xmlText = await xmlRes.text();

    return res.status(200).json({
      message: 'Factura generada correctamente',
      cfdiId,
      pdf: pdfBuffer,
      xml: xmlText
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error interno del servidor', error: String(error?.message || error) });
  }
}
