import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer, { Transporter } from 'nodemailer';

const SANDBOX_BASE_URL = 'https://apisandbox.facturama.mx';
const PROD_BASE_URL = 'https://api.facturama.mx';
const GAS_FACTURAS_URL =
  process.env.GAS_FACTURAS_URL ||
  'https://script.google.com/macros/s/AKfycbybBXxsXpJSF-sp-PeTsFd5LVzS86Lf4MVJ7J2r7AtwkuLpdG3he2KHU7jngfCz2L_k/exec';
const GAS_FACTURAS_POST_URL =
  process.env.GAS_FACTURAS_POST_URL ||
  'https://script.google.com/macros/s/AKfycbzf_-GMn9ZGNrNWZOFcDSHfX_Kc4DdXsXQjACOr4AVj8SjPGJSsOFasApCeZMQeOW9r/exec';
function getBaseUrl() {
  if (process.env.FACTURAMA_API_BASE_URL) {
    return process.env.FACTURAMA_API_BASE_URL;
  }
  return process.env.FACTURAMA_SANDBOX === 'true' ? SANDBOX_BASE_URL : PROD_BASE_URL;
}

function getAuthHeader() {
  const user = process.env.FACTURAMA_USER;
  const pass = process.env.FACTURAMA_PASSWORD;
  const authUser = user;
  const authPass = pass;

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

let verifiedTransporterPromise: Promise<Transporter> | null = null;
const getVerifiedTransporter = async () => {
  if (verifiedTransporterPromise) return verifiedTransporterPromise;
  verifiedTransporterPromise = (async () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || '').trim().toLowerCase() === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host) {
      throw new Error('SMTP no configurado');
    }
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined
    });
    await transporter.verify();
    return transporter;
  })();
  return verifiedTransporterPromise;
};

type SendInvoiceEmailInput = {
  to: string;
  subject: string;
  pdfBase64: string;
  xmlBase64: string;
  issuerRfc: string;
  issuerName: string;
  uuid: string;
  total: string;
  ticket: string;
};

const sendInvoiceEmail = async ({
  to,
  subject,
  pdfBase64,
  xmlBase64,
  issuerRfc,
  issuerName,
  uuid,
  total,
  ticket
}: SendInvoiceEmailInput) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error('SMTP no configurado');
  }
  const transporter = await getVerifiedTransporter();
  const text = [
    `RFC emisor: ${issuerRfc}`,
    `Razón social emisor: ${issuerName}`,
    `UUID del CFDI: ${uuid}`,
    `Total: ${total}`,
    'Se adjunta su factura en formato PDF y XML'
  ].join('\n');
  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Factura emitida - Puerto Copy</title>
</head>
<body style="margin:0; padding:0; background-color:#F3F7FC; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background-color:#ffffff; border-radius:28px; overflow:hidden; border:1px solid #E5EEF9;">
          <tr>
            <td style="background:linear-gradient(135deg,#003082,#0B63B2); padding:36px 20px; text-align:center; color:#ffffff;">
              <h1 style="margin:0; font-size:26px; font-weight:bold; letter-spacing:-0.5px;">
                PUERTO COPY
              </h1>
              <p style="margin:6px 0 0; font-size:12px; letter-spacing:2px; opacity:0.85;">
                FACTURACIÓN ELECTRÓNICA CFDI 4.0
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 34px; color:#1a1a1a;">
              <div style="
                display:inline-block;
                background:#E3F2FD;
                color:#0B63B2;
                padding:8px 16px;
                border-radius:100px;
                font-size:12px;
                font-weight:bold;
                text-transform:uppercase;
                margin-bottom:20px;">
                Factura emitida
              </div>
              <h2 style="margin:0 0 14px; font-size:22px; color:#003082;">
                Hola
              </h2>
              <p style="font-size:15px; color:#555; line-height:1.6; margin-bottom:26px;">
                Tu factura electrónica ha sido emitida correctamente.
                En este correo encontrarás los archivos fiscales correspondientes.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0"
                style="font-size:14px; margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 0;"><strong>Ticket:</strong></td>
                  <td style="padding:6px 0;">${ticket}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><strong>UUID:</strong></td>
                  <td style="padding:6px 0;">${uuid}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><strong>Total:</strong></td>
                  <td style="padding:6px 0;">$ ${total} MXN</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><strong>Fecha de emisión:</strong></td>
                  <td style="padding:6px 0;">${new Date().toLocaleString('es-MX')}</td>
                </tr>
              </table>
              <div style="
                background:#FDFDFD;
                border:1px solid #E5EEF9;
                border-radius:20px;
                padding:20px;
                margin-bottom:30px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px; border:1px solid #E5EEF9; border-radius:14px;">
                      📄 <strong>Factura PDF</strong><br>
                      <span style="font-size:12px; color:#777;">Representación impresa</span>
                    </td>
                  </tr>
                  <tr><td height="10"></td></tr>
                  <tr>
                    <td style="padding:10px; border:1px solid #E5EEF9; border-radius:14px;">
                      ⚙️ <strong>Factura XML</strong><br>
                      <span style="font-size:12px; color:#777;">Archivo fiscal SAT</span>
                    </td>
                  </tr>
                </table>
              </div>
              <p style="font-size:13px; color:#777; text-align:center; margin-top:8px;">
                Se adjunta su factura en formato PDF y XML.
              </p>
              <p style="font-size:13px; color:#777; text-align:center;">
                Si tienes alguna duda o necesitas corrección, responde este correo.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff; border-top:1px solid #F3F7FC; padding:28px; text-align:center;">
              <p style="margin:4px 0; font-size:13px; color:#003082;">
                <strong>Puerto Copy</strong>
              </p>
              <p style="margin:4px 0; font-size:12px; color:#94A3B8;">
                Villa Colonial 573 · Los Portales · Puerto Vallarta, Jal.
              </p>
              <p style="margin-top:14px; font-size:11px; color:#b0b7c3;">
                Este correo fue generado automáticamente con fines fiscales.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    attachments: [
      {
        filename: `Factura_${ticket}.pdf`,
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf'
      },
      {
        filename: `Factura_${ticket}.xml`,
        content: Buffer.from(xmlBase64, 'base64'),
        contentType: 'application/xml'
      }
    ]
  });
};

const normalizeTicket = (value: any) => String(value || '').replace(/\D+/g, '');

const extractTicketRecord = (payload: any, ticketValue: string) => {
  if (!payload) return null;
  if (Array.isArray(payload)) {
    return payload.find((row) => String(row?.ticket ?? row?.Ticket ?? '') === ticketValue) || null;
  }
  if (payload?.data) {
    const data = payload.data;
    if (Array.isArray(data)) {
      return data.find((row) => String(row?.ticket ?? row?.Ticket ?? '') === ticketValue) || null;
    }
    if (data?.ticket || data?.Ticket) return data;
  }
  if (payload?.ticket || payload?.Ticket) return payload;
  return null;
};

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
    email,
    payments
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

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const fetchWithRetry = async (url: string) => {
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      const response = await fetch(url, {
        headers: { Authorization: authHeader.header }
      });
      const body = await response.text().catch(() => '');
      const hasBody = body && body.trim().length > 0;
      if (response.ok && hasBody) {
        return { ok: true, body, status: response.status };
      }
      if (response.status !== 404 && response.ok) {
        return { ok: false, body, status: response.status };
      }
      if (attempt < 6) {
        await sleep(1000);
      }
    }
    return { ok: false, body: '', status: 404 };
  };

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

  const normalizedEmail = String(email || '').trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  if (!emailOk) {
    return res.status(400).json({
      message: 'Email inválido',
      invalidFields: { email: normalizedEmail }
    });
  }

  const ticketValue = String(ticket || '').trim();
  const ticketDigits = normalizeTicket(ticketValue);
  if (!ticketDigits) {
    return res.status(400).json({ message: 'Ticket inválido' });
  }

  let existingRecord: any = null;
  try {
    const checkUrl = `${GAS_FACTURAS_URL}?ticket=${encodeURIComponent(ticketDigits)}`;
    const checkRes = await fetch(checkUrl, { headers: { 'Cache-Control': 'no-cache' } });
    const checkData = await checkRes.json().catch(() => null);
    if (checkRes.ok && checkData) {
      existingRecord = extractTicketRecord(checkData, ticketDigits);
    }
  } catch (checkErr) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('facturaTicketCheckError', checkErr);
    }
  }

  if (existingRecord) {
    const existingCfdiId =
      existingRecord?.cfdiId ||
      existingRecord?.CfdiId ||
      existingRecord?.cfdi_id ||
      existingRecord?.id ||
      existingRecord?.Id;
    const existingUuid =
      existingRecord?.uuid ||
      existingRecord?.UUID ||
      existingRecord?.Uuid ||
      existingRecord?.cfdi_uuid ||
      existingCfdiId;

    if (existingCfdiId) {
      const [pdfResult, xmlResult] = await Promise.all([
        fetchWithRetry(`${baseUrl}/cfdi/pdf/issued/${existingCfdiId}`),
        fetchWithRetry(`${baseUrl}/cfdi/xml/issued/${existingCfdiId}`)
      ]);

      return res.status(200).json({
        alreadyInvoiced: true,
        cfdiId: existingCfdiId,
        uuid: existingUuid,
        pdf: pdfResult.ok ? pdfResult.body : null,
        xml: xmlResult.ok ? xmlResult.body : null
      });
    }
  }

  const round2 = (value: number) =>
    Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  const isPersonaMoral = (rfcValue: string) => {
    const cleaned = String(rfcValue || '').trim().toUpperCase();
    if (cleaned === 'XAXX010101000' || cleaned === 'XEXX010101000') {
      return false;
    }
    return cleaned.length === 12;
  };
  const parseMoney = (value: any) => {
    const cleaned = String(value ?? '').replace(/[^0-9.-]/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  };

  const resolvePaymentForm = (paymentsValue: any[]) => {
    if (!Array.isArray(paymentsValue) || paymentsValue.length === 0) return '99';
    if (paymentsValue.length > 1) return '99';
    const name = String(paymentsValue[0]?.name || '').toUpperCase().trim();
    if (name === 'EFECTIVO') return '01';
    if (name === 'T/DEBITO' || name === 'TARJETA DEBITO') return '28';
    if (name === 'T/CREDITO' || name === 'TARJETA CREDITO') return '04';
    if (name === 'TRANSFERENCIA' || name.includes('SPEI')) return '03';
    return '99';
  };

  let items;
  try {
    items = productos.map((item, index) => {
      const quantity = Number(item.quantity ?? item.cantidad ?? 0);
      const price = parseMoney(item.price ?? item.precio_unitario ?? 0);
      let gross = parseMoney(item.total_money ?? item.gross_total_money ?? 0);
      if (!Number.isFinite(gross) || gross <= 0) {
        gross = round2(price * quantity);
      }
      const ivaFromItem = item?.line_taxes?.[0]?.money_amount;
      const aplicaRetencionISR =
        isPersonaMoral(normalizedRfc) && process.env.FACTURAMA_ISSUER_REGIMEN === '626';
      let base;
      let iva;
      let isr = 0;
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw {
          code: 'CANTIDAD_INVALIDA',
          index,
          description: String(item.nombre || 'Servicio')
        };
      }
      if (!Number.isFinite(gross) || gross <= 0) {
        throw {
          code: 'TOTAL_INVALIDO',
          index,
          preview: {
            quantity,
            price,
            gross,
            nameFields: {
              nombre: item.nombre ?? null,
              description: item.description ?? null,
              name: item.name ?? null
            }
          }
        };
      }
      if (aplicaRetencionISR) {
        base = round2(gross / (1 + 0.16 - 0.0125));
        iva = round2(base * 0.16);
        isr = round2(base * 0.0125);
        const totalCalculado = round2(base + iva - isr);
        const grossRounded = round2(gross);
        if (totalCalculado !== grossRounded) {
          base = round2(base + round2(grossRounded - totalCalculado));
          iva = round2(base * 0.16);
          isr = round2(base * 0.0125);
        }
      } else {
        base = round2(gross / 1.16);
        iva = round2(base * 0.16);
        const totalCalculado = round2(base + iva);
        const grossRounded = round2(gross);
        if (totalCalculado !== grossRounded) {
          base = round2(base + round2(grossRounded - totalCalculado));
          iva = round2(base * 0.16);
        }
      }
      const unitBase = Number((base / (quantity || 1)).toFixed(6));
      const subtotal = round2(base);
      const total = round2(subtotal + iva - isr);
      const taxes = [
        {
          Total: iva,
          Name: 'IVA',
          Base: subtotal,
          Rate: 0.16,
          IsRetention: false
        }
      ];
      if (aplicaRetencionISR) {
        taxes.push({
          Total: isr,
          Name: 'ISR',
          Base: subtotal,
          Rate: 0.0125,
          IsRetention: true
        });
      }
      return {
        ProductCode: '82121500',
        UnitCode: 'E48',
        Description: String(item.nombre || 'Servicio'),
        Quantity: quantity,
        UnitPrice: unitBase,
        Subtotal: subtotal,
        Total: total,
        TaxObject: '02',
        Taxes: taxes
      };
    });
  } catch (error) {
    if (error?.code === 'CANTIDAD_INVALIDA') {
      return res.status(400).json({
        message: 'Cantidad inválida en productos',
        item: { index: error.index, description: error.description }
      });
    }
    if (error?.code === 'TOTAL_INVALIDO') {
      return res.status(400).json({
        message: 'Total inválido en productos',
        itemIndex: error.index,
        itemPreview: error.preview
      });
    }
    throw error;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('facturamaItemTaxes', JSON.stringify(items.map((item) => item.Taxes), null, 2));
  }

  const receiver = esPublicoGeneral
    ? {
        Rfc: 'XAXX010101000',
        Name: 'PUBLICO EN GENERAL',
        CfdiUse: 'S01',
        FiscalRegime: '616',
        TaxZipCode: String(codigoPostal || '').trim(),
        Email: normalizedEmail
      }
    : {
        Rfc: rfc,
        Name: razonSocial,
        CfdiUse: cfdiUse,
        FiscalRegime: fiscalRegime,
        TaxZipCode: String(codigoPostal || '').trim(),
        Email: normalizedEmail
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
    SendEmail: true,
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
  const paymentForm = resolvePaymentForm(payments);
  payload.PaymentForm = paymentForm;
  payload.PaymentMethod = 'PUE';
  if (process.env.NODE_ENV !== 'production') {
    console.log('paymentResolved', { payments, paymentForm });
  }

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
    const uuid =
      createData?.Complement?.UUID ||
      createData?.Complement?.Uuid ||
      createData?.UUID ||
      createData?.Uuid ||
      cfdiId;
    if (!cfdiId) {
      return res.status(502).json({ message: 'Respuesta inválida de Facturama', detalles: createData });
    }

    let emailSent: boolean | null = null;
    const [pdfResult, xmlResult] = await Promise.all([
      fetchWithRetry(`${baseUrl}/cfdi/pdf/issued/${cfdiId}`),
      fetchWithRetry(`${baseUrl}/cfdi/xml/issued/${cfdiId}`)
    ]);

    try {
      const registerPayload = {
        ticket: ticketDigits,
        cfdiId,
        uuid,
        email: receiver.Email,
        fecha: new Date().toISOString()
      };
      const registerRes = await fetch(GAS_FACTURAS_POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload)
      });
      if (!registerRes.ok && process.env.NODE_ENV !== 'production') {
        const registerText = await registerRes.text().catch(() => '');
        console.log('facturaRegistroError', { status: registerRes.status, body: registerText });
      }
    } catch (registerErr) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('facturaRegistroError', registerErr);
      }
    }

    if (pdfResult.ok && xmlResult.ok) {
      const totalAmount = items.reduce((sum, item) => sum + Number(item.Total || 0), 0);
      const subject = `Factura – Puerto Copy | Ticket ${ticketValue}`;
      void sendInvoiceEmail({
        to: receiver.Email,
        subject,
        pdfBase64: pdfResult.body,
        xmlBase64: xmlResult.body,
        issuerRfc: String(process.env.FACTURAMA_ISSUER_RFC || ''),
        issuerName: String(process.env.FACTURAMA_ISSUER_NAME || ''),
        uuid: String(uuid || cfdiId),
        total: totalAmount.toFixed(2),
        ticket: ticketValue
      })
        .then(() => {
          emailSent = true;
        })
        .catch((emailErr: any) => {
          emailSent = false;
          console.error('invoiceEmailError', {
            cfdiId,
            error: String(emailErr?.message || emailErr)
          });
        });
    } else {
      console.error('facturamaFilesNotReady', {
        cfdiId,
        pdfStatus: pdfResult.status,
        xmlStatus: xmlResult.status
      });
    }

    const message = emailSent
      ? 'Factura emitida correctamente'
      : 'Factura emitida. El envío por correo falló; puedes descargar PDF/XML aquí.';

    return res.status(200).json({
      message,
      cfdiId,
      uuid,
      emailSent,
      status: emailSent === true ? 'emailed:true' : emailSent === false ? 'emailed:false' : 'emailed:queued'
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error interno del servidor', error: String(error?.message || error) });
  }
}
