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
    'FACTURAMA_EXPEDITION_PLACE',
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

  const normalizedRfc = String(rfc || '').trim().toUpperCase();
  const normalizedRazon = String(razonSocial || '').trim().toUpperCase();
  const esPublicoGeneral =
    normalizedRfc === 'XAXX010101000' && normalizedRazon === 'PUBLICO EN GENERAL';

  const cfdiUse = String(usoCfdi || '').trim().toUpperCase();
  const fiscalRegime = String(regimenFiscal || '').trim();
  const cfdiUseOk = /^[A-Z0-9]{3}$/.test(cfdiUse);
  const fiscalRegimeOk = /^\d{3}$/.test(fiscalRegime);
  if (!cfdiUseOk || !fiscalRegimeOk) {
    return res.status(400).json({
      message: 'Formato inválido',
      invalidFields: { usoCfdi: cfdiUse, regimenFiscal: fiscalRegime }
    });
  }

  const round2 = (value: number) => Number(value.toFixed(2));

  const items = productos.map((item) => {
    const quantity = Number(item.cantidad) || 0;
    const unitWithIva = Number(item.precio_unitario ?? 0);
    const unitPrice = round2(unitWithIva / 1.16);
    const subtotal = round2(unitPrice * quantity);
    const taxTotal = round2(subtotal * 0.16);
    return {
      ProductCode: '81112100',
      UnitCode: 'E48',
      Description: String(item.nombre || 'Servicio'),
      Quantity: quantity,
      UnitPrice: unitPrice,
      Subtotal: subtotal,
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

  const receiver = esPublicoGeneral
    ? {
        Rfc: 'XAXX010101000',
        Name: 'PUBLICO EN GENERAL',
        CfdiUse: 'S01',
        FiscalRegime: '616',
        TaxZipCode: codigoPostal
      }
    : {
        Rfc: rfc,
        Name: razonSocial,
        CfdiUse: cfdiUse,
        FiscalRegime: fiscalRegime,
        TaxZipCode: codigoPostal,
        Email: email
      };

  const now = new Date();
  const globalInformation = esPublicoGeneral
    ? {
        Periodicity: '01',
        Months: String(now.getMonth() + 1).padStart(2, '0'),
        Year: now.getFullYear()
      }
    : undefined;

  const payload = {
    CfdiType: 'I',
    PaymentForm: '01',
    PaymentMethod: 'PUE',
    ExpeditionPlace: process.env.FACTURAMA_EXPEDITION_PLACE,
    Currency: 'MXN',
    Issuer: {
      Rfc: process.env.FACTURAMA_ISSUER_RFC,
      Name: process.env.FACTURAMA_ISSUER_NAME,
      FiscalRegime: process.env.FACTURAMA_ISSUER_REGIMEN
    },
    Receiver: receiver,
    Items: items,
    OrderNumber: ticket,
    Notes: `Registro de ticket ${ticket}. Emision manual.`,
    ...(globalInformation ? { GlobalInformation: globalInformation } : {})
  };

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('facturamaCreatePayload', payload);
    }
    const createRes = await fetch(`${baseUrl}/3/cfdis`, {
      method: 'POST',
      headers: {
        Authorization: authHeader.header,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const createData = await createRes.json().catch(() => ({}));
    if (process.env.NODE_ENV !== 'production') {
      console.log('facturamaCreateResponse', createData);
    }
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

    const cfdiId =
      createData.Id ||
      createData.id ||
      createData.CfdiId ||
      createData?.Complement?.Id ||
      createData?.Complement?.CfdiId ||
      createData?.Complement?.UUID;
    if (!cfdiId) {
      return res.status(502).json({ message: 'Respuesta inválida de Facturama', detalles: createData });
    }

    const [pdfRes, xmlRes] = await Promise.all([
      fetch(`${baseUrl}/cfdi/pdf/issued/${cfdiId}`, {
        headers: { Authorization: authHeader.header }
      }),
      fetch(`${baseUrl}/cfdi/xml/issued/${cfdiId}`, {
        headers: { Authorization: authHeader.header }
      })
    ]);

    if (!pdfRes.ok || !xmlRes.ok) {
      const [pdfError, xmlError] = await Promise.all([
        pdfRes.ok ? Promise.resolve('') : pdfRes.text().catch(() => ''),
        xmlRes.ok ? Promise.resolve('') : xmlRes.text().catch(() => '')
      ]);
      return res.status(502).json({
        message: 'Error al obtener PDF/XML',
        facturamaStatus: {
          pdf: pdfRes.status,
          xml: xmlRes.status
        },
        facturamaResponse: {
          pdf: pdfError ? pdfError.slice(0, 200) : '',
          xml: xmlError ? xmlError.slice(0, 200) : ''
        }
      });
    }

    const pdfText = await pdfRes.text();
    const xmlText = await xmlRes.text();

    return res.status(200).json({
      message: 'Factura generada correctamente',
      cfdiId,
      pdf: pdfText,
      xml: xmlText
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error interno del servidor', error: String(error?.message || error) });
  }
}
