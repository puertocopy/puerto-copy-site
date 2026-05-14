import type { NextApiRequest, NextApiResponse } from 'next';
import { isAuthenticated } from '../../lib/auth';

const PROD_BASE_URL = 'https://api.facturama.mx';

function getBaseUrl() {
  let url = process.env.FACTURAMA_API_BASE_URL || PROD_BASE_URL;
  
  // Limpieza robusta: si el usuario puso la URL completa del endpoint o incluye paths, extraemos solo la base
  if (url.includes('/api-lite') || url.includes('/3/') || url.includes('/cfdi/')) {
    try {
      const parsed = new URL(url);
      url = `${parsed.protocol}//${parsed.host}`;
    } catch (e) {
      url = PROD_BASE_URL;
    }
  }
  
  // Eliminar barra diagonal final si existe
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  
  return url;
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
    body: JSON.stringify(body || {}),
    redirect: 'follow'
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
  // Verificación de seguridad: Se deshabilita para permitir facturación desde el portal público (Autoservicio)
  /*
  if (!isAuthenticated(req)) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  */

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
    folio: folioFromReq,
    serie: serieFromReq,
    rfc,
    razonSocial,
    regimenFiscal,
    usoCfdi,
    codigoPostal,
    email,
    payments,
    storeId: rawStoreId,
    fechaTicket,
    total: totalFromBody,
    metodoPago,
    globalInfo: globalInfoFromReq,
    usuario,
    uuidRelacionado,
    fechaPago
  } = body;

  const ticketValue = String(ticket || '').trim();
  const folio = folioFromReq || ticketValue.replace(/\D+/g, '') || String(Date.now()).slice(-6);
  const serie = serieFromReq || 'A';

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

  // LOG de diagnóstico de entorno
  console.log(`>>> FACTURAMA ENV: ${baseUrl.includes('sandbox') ? 'SANDBOX' : 'PRODUCCIÓN'} | URL: ${baseUrl}`);

  if (process.env.NODE_ENV !== 'production') {
    const maskedUser = authHeader.user ? `${authHeader.user.slice(0, 2)}***` : '??';
    console.log('facturamaBaseUrl', baseUrl);
    console.log('facturamaUser', maskedUser);
    console.log('authHeader', 'Basic ', authHeader.base64Length);
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const normalizedRfc = String(rfc || '').trim().toUpperCase();
  const normalizedRazon = String(razonSocial || '').trim().toUpperCase();
  const normalizedIssuerName = String(process.env.FACTURAMA_ISSUER_NAME || '').trim().toUpperCase();
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
        TaxZipCode: process.env.FACTURAMA_EXPEDITION_PLACE || String(codigoPostal || '').trim(),
        Email: normalizedEmail
      }
    : {
        Rfc: rfc,
        Name: normalizedRazon,
        CfdiUse: cfdiUse,
        FiscalRegime: fiscalRegime,
        TaxZipCode: String(codigoPostal || '').trim(),
        Email: normalizedEmail
      };

  const now = new Date();
  const globalInformation = esPublicoGeneral
    ? {
        Periodicity: globalInfoFromReq?.periodicity || '01',
        Months: globalInfoFromReq?.months || String(now.getMonth() + 1).padStart(2, '0'),
        Year: globalInfoFromReq?.year || now.getFullYear()
      }
    : undefined;

  const payload = {
    CfdiType: 'I',
    Serie: serie,
    Folio: folio,
    LogoUrl: 'https://puertocopy.com/img/LOGONUEVOblanco.png',
    PaymentForm: '01',
    PaymentMethod: metodoPago || 'PUE',
    ExpeditionPlace: process.env.FACTURAMA_EXPEDITION_PLACE,
    Exportation: '01',
    Currency: 'MXN',
    SendEmail: true,
    Issuer: {
      Rfc: process.env.FACTURAMA_ISSUER_RFC,
      Name: normalizedIssuerName,
      FiscalRegime: process.env.FACTURAMA_ISSUER_REGIMEN
    },
    Receiver: receiver,
    Items: items,
    OrderNumber: ticket,
    Observations: `Registro de ticket ${ticket}. Emision manual.`,
    ...(globalInformation ? { GlobalInformation: globalInformation } : {})
  };
  const paymentForm = (metodoPago === 'PPD') ? '99' : resolvePaymentForm(payments);
  payload.PaymentForm = paymentForm;
  // payload.PaymentMethod ya está asignado arriba
  if (process.env.NODE_ENV !== 'production') {
    console.log('paymentResolved', { payments, paymentForm });
  }

  try {
    console.log('FACTURAR payload keys:', Object.keys(payload));
    const toTrimmed = (value: any) => String(value ?? '').trim();
    const toDigits = (value: any) => String(value ?? '').replace(/\D+/g, '');
    const toComparableDate = (value: any) => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const toComparableTotal = (value: any) => {
      const num = Number(value);
      if (!Number.isFinite(num)) return NaN;
      return round2(num);
    };
    const extractArray = (raw: any): any[] => {
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.Data)) return raw.Data;
      if (Array.isArray(raw?.data)) return raw.data;
      if (Array.isArray(raw?.Items)) return raw.Items;
      if (Array.isArray(raw?.items)) return raw.items;
      return [];
    };
    const extractCfdiId = (item: any) =>
      toTrimmed(
        item?.Id ??
          item?.id ??
          item?.CfdiId ??
          item?.cfdiId ??
          item?.Complement?.Id ??
          item?.Complement?.CfdiId
      );
    const extractExternalId = (item: any) => toTrimmed(item?.ExternalId ?? item?.externalId);
    const extractOrderNumber = (item: any) => toTrimmed(item?.OrderNumber ?? item?.orderNumber);
    const extractTotal = (item: any) =>
      toComparableTotal(item?.Total ?? item?.total ?? item?.Amount ?? item?.amount);
    const extractDate = (item: any) =>
      toComparableDate(item?.Date ?? item?.date ?? item?.IssueDate ?? item?.CreatedAt ?? item?.createdAt);
    const readIssuedCfdis = async (params: URLSearchParams) => {
      // Intentamos primero en api-lite ya que es el flujo principal actual
      const apiLiteUrl = `${baseUrl}/api-lite/cfdis?${params.toString()}`;
      const response = await fetch(apiLiteUrl, {
        headers: { Authorization: authHeader.header, Accept: 'application/json' }
      });
      
      if (response.ok) {
        const text = await response.text().catch(() => '');
        let parsed: any = [];
        try {
          parsed = text ? JSON.parse(text) : [];
        } catch {
          parsed = [];
        }
        const items = extractArray(parsed);
        if (items.length > 0) return { ok: true, status: response.status, items };
      }

      // Fallback a cfdi estándar
      const listUrl = `${baseUrl}/cfdi?${params.toString()}`;
      const responseStd = await fetch(listUrl, {
        headers: { Authorization: authHeader.header, Accept: 'application/json' }
      });
      if (!responseStd.ok) {
        return { ok: false, status: responseStd.status, items: [] as any[] };
      }
      const textStd = await responseStd.text().catch(() => '');
      let parsedStd: any = [];
      try {
        parsedStd = textStd ? JSON.parse(textStd) : [];
      } catch {
        parsedStd = [];
      }
      return { ok: true, status: responseStd.status, items: extractArray(parsedStd) };
    };
    const findExistingCfdiAfterTimeout = async () => {
      const externalId = toTrimmed(body?.externalId ?? body?.ExternalId);
      const expectedOrder = toTrimmed(ticketValue);
      const expectedOrderDigits = toDigits(ticketValue);
      const expectedTotal = toComparableTotal(totalForReserve);
      const expectedDate = toComparableDate(fechaTicket || new Date().toISOString());
      let hadSuccessfulLookup = false;

      for (let attempt = 1; attempt <= 4; attempt += 1) {
        const collected: any[] = [];
        const seen = new Set<string>();
        const pushUnique = (item: any) => {
          const id = extractCfdiId(item);
          if (!id || seen.has(id)) return;
          seen.add(id);
          collected.push(item);
        };

        const queryAndCollect = async (params: URLSearchParams, reason: string) => {
          try {
            const result = await readIssuedCfdis(params);
            if (result.ok) {
              hadSuccessfulLookup = true;
              result.items.forEach(pushUnique);
            } else {
              console.error('facturamaLookupStatusError', {
                ticketKey,
                reason,
                status: result.status
              });
            }
          } catch (lookupErr: any) {
            console.error('facturamaLookupError', {
              ticketKey,
              reason,
              error: String(lookupErr?.message || lookupErr)
            });
          }
        };

        if (externalId) {
          const externalParams = new URLSearchParams({ type: 'issued', page: '0', keyword: externalId });
          await queryAndCollect(externalParams, 'externalId');
        }

        const orderParams = new URLSearchParams({ type: 'issued', page: '0', orderNumber: expectedOrder });
        await queryAndCollect(orderParams, 'orderNumber');

        const keywordTicketParams = new URLSearchParams({ type: 'issued', page: '0', keyword: expectedOrder });
        await queryAndCollect(keywordTicketParams, 'ticketKeyword');

        if (externalId) {
          const matchByExternal = collected.find((item) => extractExternalId(item) === externalId);
          const externalCfdiId = extractCfdiId(matchByExternal);
          if (externalCfdiId) {
            return { found: true, cfdiId: externalCfdiId, hadSuccessfulLookup };
          }
        }

        const matchByOrder = collected.find((item) => extractOrderNumber(item) === expectedOrder);
        const orderCfdiId = extractCfdiId(matchByOrder);
        if (orderCfdiId) {
          return { found: true, cfdiId: orderCfdiId, hadSuccessfulLookup };
        }

        const matchByCombo = collected.find((item) => {
          const order = extractOrderNumber(item);
          const orderDigits = toDigits(order);
          const total = extractTotal(item);
          const date = extractDate(item);
          const ticketMatches = !!expectedOrderDigits && orderDigits === expectedOrderDigits;
          const totalMatches =
            Number.isFinite(expectedTotal) && Number.isFinite(total) && Math.abs(total - expectedTotal) <= 0.01;
          const dateMatches = !!expectedDate && !!date && date === expectedDate;
          return ticketMatches && totalMatches && dateMatches;
        });
        const comboCfdiId = extractCfdiId(matchByCombo);
        if (comboCfdiId) {
          return { found: true, cfdiId: comboCfdiId, hadSuccessfulLookup };
        }

        if (attempt < 4) {
          await sleep(1500);
        }
      }

      return { found: false, cfdiId: '', hadSuccessfulLookup };
    };

    const reservePayload = {
      action: 'reserve',
      ticket: ticketValue,
      storeId,
      fechaTicket: fechaTicket || new Date().toISOString(),
      total: Number.isFinite(totalForReserve) ? totalForReserve : 0,
      rfc: normalizedRfc,
      razonSocial: normalizedRazon,
      email: normalizedEmail,
      codigoPostal: String(codigoPostal || '').trim(),
      usoCfdi: cfdiUse,
      regimenFiscal: fiscalRegime,
      usuario: usuario || '',
      metodoPago: metodoPago || 'PUE',
      uuidRelacion: uuidRelacionado || '',
      fechaPago: fechaPago || '',
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
      if (reserveData?.ok === true && reserveData?.status === 'PENDING') {
        try {
          const checkResult = await gasPost({
            action: 'check',
            ticket: ticketValue,
            storeId
          });
          const checkData = checkResult.data || {};
          if (checkData?.ok === true && checkData?.status === 'TIMBRADO' && checkData?.facturamaId) {
            return res.status(200).json({
              ok: true,
              alreadyInvoiced: true,
              facturamaId: checkData.facturamaId,
              cfdiId: checkData.facturamaId
            });
          }
        } catch (checkErr) {
          console.error('gasCheckError', { ticketKey, error: String(checkErr?.message || checkErr) });
        }
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
        `${baseUrl}/api-lite/3/cfdis`,
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
        const recovery = await findExistingCfdiAfterTimeout();
        if (recovery.found && recovery.cfdiId) {
          try {
            await gasPost({
              action: 'finalize',
              ticket: ticketValue,
              storeId,
              rfc: normalizedRfc,
              email: normalizedEmail,
              facturamaId: recovery.cfdiId,
              errorMsg: ''
            });
          } catch (finalizeErr) {
            console.error('gasFinalizeError', { ticketKey, error: String(finalizeErr?.message || finalizeErr) });
          }
          return res.status(200).json({
            ok: true,
            recoveredAfterTimeout: true,
            message: 'Factura emitida correctamente',
            facturamaId: recovery.cfdiId,
            cfdiId: recovery.cfdiId
          });
        }

        if (recovery.hadSuccessfulLookup) {
          try {
            await gasPost({
              action: 'fail',
              ticket: ticketValue,
              storeId,
              rfc: normalizedRfc,
              errorMsg: 'Facturama timeout sin CFDI encontrado'.slice(0, 500)
            });
          } catch (failErr) {
            console.error('gasFailError', { ticketKey, error: String(failErr?.message || failErr) });
          }
          return res.status(504).json({
            ok: false,
            code: 'TIMEOUT',
            message: 'La operación tardó demasiado y no se encontró CFDI; reintenta.'
          });
        }

        return res.status(504).json({
          ok: false,
          code: 'TIMEOUT_UNCERTAIN',
          message: 'La operación tardó demasiado y no fue posible confirmar el estado; intenta consultar antes de reintentar.'
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
        razonSocial: normalizedRazon,
        email: normalizedEmail,
        codigoPostal: String(codigoPostal || '').trim(),
        usoCfdi: cfdiUse,
        regimenFiscal: fiscalRegime,
        facturamaId: cfdiId,
        uuid: uuid || cfdiId,
        usuario: usuario || '',
        metodoPago: metodoPago || 'PUE',
        uuidRelacion: uuidRelacionado || '',
        fechaPago: fechaPago || '',
        errorMsg: ''
      });
    } catch (finalizeErr) {
      console.error('gasFinalizeError', { ticketKey, error: String(finalizeErr?.message || finalizeErr) });
    }

    return res.status(200).json({
      ok: true,
      message: 'Factura emitida correctamente',
      cfdiId,
      uuid
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
