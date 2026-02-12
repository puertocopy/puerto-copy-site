import type { NextApiRequest, NextApiResponse } from 'next';
import { buildInvoiceEmailHtml } from '../../utils/invoice-email-template';
import { buildFromAddress, sendMailQueued } from '../../utils/smtp';

const SANDBOX_BASE_URL = 'https://apisandbox.facturama.mx';
const PROD_BASE_URL = 'https://api.facturama.mx';
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
  const from = buildFromAddress();
  const text = [
    `RFC emisor: ${issuerRfc}`,
    `Razón social emisor: ${issuerName}`,
    `UUID del CFDI: ${uuid}`,
    `Total: ${total}`,
    'Se adjunta su factura en formato PDF y XML'
  ].join('\n');
  const html = buildInvoiceEmailHtml({
    ticket,
    uuid,
    total,
    issuedAt: new Date().toISOString(),
    context: 'original'
  });
  const info = await sendMailQueued({
    from,
    to,
    subject,
    text,
    html,
    attachments: [
      {
        filename: `Factura_${ticket}.pdf`,
        content: pdfBase64,
        encoding: 'base64'
      },
      {
        filename: `Factura_${ticket}.xml`,
        content: xmlBase64,
        encoding: 'base64'
      }
    ]
  });
  console.log('invoiceEmailSendResult', {
    messageId: info?.messageId,
    response: info?.response
  });
};

const normalizeTicket = (value: any) => String(value || '').replace(/\D+/g, '');

const gasPost = async (body: any) => {
  const gasUrl = process.env.GAS_WEBAPP_URL;
  const gasToken = process.env.GAS_API_TOKEN;
  if (!gasUrl || !gasToken) {
    throw new Error('Missing env GAS_WEBAPP_URL/GAS_API_TOKEN');
  }
  const res = await fetch(`${gasUrl}?token=${encodeURIComponent(gasToken)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body || {})
  });
  const text = await res.text().catch(() => '');
  const trimmed = text.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    throw new Error('GAS returned HTML');
  }
  const data = JSON.parse(text || '{}');
  return { status: res.status, data };
};

// Timeout anterior: ninguno explícito. Nuevo timeout: 300,000 ms.
const fetchWithTimeout = async (url: string, options: any, timeoutMs = 300000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('>>> HIT /api/facturar', {
    method: req.method,
    time: new Date().toISOString(),
    hasBody: !!req.body
  });
  res.setHeader('X-Facturar-Hit', '1');
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const body = req.body || {};
  const productosFinal =
    body.productos ||
    body.items ||
    body.products ||
    body.conceptos ||
    [];

  const {
    ticket,
    rfc,
    razonSocial,
    regimenFiscal,
    usoCfdi,
    codigoPostal,
    email,
    payments,
    storeId: rawStoreId,
    fechaTicket,
    total: totalFromBody
  } = body;

  if (!productosFinal || productosFinal.length === 0) {
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
  const storeId = String(rawStoreId || 'PV').trim() || 'PV';
  const ticketKey = `${storeId}:${ticketValue}`;
  const ticketDigits = normalizeTicket(ticketValue);
  if (!ticketDigits) {
    return res.status(400).json({ message: 'Ticket inválido' });
  }
  if (!normalizedRfc) {
    return res.status(400).json({ message: 'RFC inválido' });
  }

  // Nota: La verificación de duplicados ahora es controlada por el lock de GAS (reserve/finalize/fail).

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
    items = productosFinal.map((item, index) => {
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

  const totalAmount = items.reduce((sum, item) => sum + Number(item.Total || 0), 0);
  const totalForReserve = Number.isFinite(Number(totalFromBody))
    ? Number(totalFromBody)
    : totalAmount;

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
    console.log('FACTURAR payload keys:', Object.keys(payload));
    const reservePayload = {
      action: 'reserve',
      ticket: ticketValue,
      storeId,
      fechaTicket: fechaTicket || new Date().toISOString(),
      total: Number.isFinite(totalForReserve) ? totalForReserve : 0,
      rfc: normalizedRfc,
      email: normalizedEmail,
      payload
    };

    let reserveData: any = null;
    try {
      const reserveResult = await gasPost(reservePayload);
      reserveData = reserveResult.data || {};
      console.log('GAS reserve result:', reserveData);
      if (reserveData?.ok === true && reserveData?.status === 'TIMBRADO' && reserveData?.facturamaId) {
        return res.status(200).json({
          ok: true,
          alreadyInvoiced: true,
          facturamaId: reserveData.facturamaId,
          cfdiId: reserveData.facturamaId
        });
      }
    } catch (reserveErr) {
      console.error('gasReserveError', { ticketKey, error: String(reserveErr?.message || reserveErr) });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('facturamaCreatePayload', payload);
    }
    let createRes;
    let createData: any = {};
    try {
      createRes = await fetchWithTimeout(
        `${baseUrl}/3/cfdis`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader.header,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        },
        300000
      );
      createData = await createRes.json().catch(() => ({}));
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.error('facturamaTimeout', { ticketKey });
        try {
          await gasPost({
            action: 'fail',
            ticket: ticketValue,
            storeId,
            rfc: normalizedRfc,
            errorMsg: 'Facturama timeout'.slice(0, 500)
          });
        } catch (failErr) {
          console.error('gasFailError', { ticketKey, error: String(failErr?.message || failErr) });
        }
        return res.status(504).json({
          ok: false,
          code: 'TIMEOUT',
          message: 'La operación tardó demasiado, reintenta.'
        });
      }
      throw err;
    }

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
      try {
        await gasPost({
          action: 'fail',
          ticket: ticketValue,
          storeId,
          rfc: normalizedRfc,
          errorMsg: `Facturama error ${createRes.status}`.slice(0, 500)
        });
      } catch (failErr) {
        console.error('gasFailError', { ticketKey, error: String(failErr?.message || failErr) });
      }
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
    console.log('FACTURAMA response id:', cfdiId);

    try {
      await gasPost({
        action: 'finalize',
        ticket: ticketValue,
        storeId,
        rfc: normalizedRfc,
        email: normalizedEmail,
        facturamaId: cfdiId
      });
    } catch (finalizeErr) {
      console.error('gasFinalizeError', { ticketKey, error: String(finalizeErr?.message || finalizeErr) });
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
      const subject = `Factura – Puerto Copy | Ticket ${ticketValue}`;
      try {
        await sendInvoiceEmail({
          to: receiver.Email,
          subject,
          pdfBase64: pdfResult.body,
          xmlBase64: xmlResult.body,
          issuerRfc: String(process.env.FACTURAMA_ISSUER_RFC || ''),
          issuerName: String(process.env.FACTURAMA_ISSUER_NAME || ''),
          uuid: String(uuid || cfdiId),
          total: totalAmount.toFixed(2),
          ticket: ticketValue
        });
        emailSent = true;
      } catch (emailErr: any) {
        emailSent = false;
        console.error('invoiceEmailError', {
          cfdiId,
          error: String(emailErr?.message || emailErr)
        });
      }
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
      status: emailSent === true ? 'emailed:true' : 'emailed:false'
    });
  } catch (error: any) {
    try {
      await gasPost({
        action: 'fail',
        ticket: ticketValue,
        storeId,
        rfc: normalizedRfc,
        errorMsg: String(error?.message || error).slice(0, 500)
      });
    } catch (failErr) {
      console.error('gasFailError', { ticketKey, error: String(failErr?.message || failErr) });
    }
    return res.status(500).json({ message: 'Error interno del servidor', error: String(error?.message || error) });
  }
}
