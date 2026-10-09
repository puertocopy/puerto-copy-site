import type { NextApiRequest, NextApiResponse } from 'next';
import { isAuthenticated } from '../../lib/auth';
import {
  reserveTicket,
  finalizeTicket,
  failTicket,
  checkTicket
} from '../../lib/gasTickets';
import { generateCfdiPdf, parseCfdiXml } from '../../lib/cfdiPdfGenerator';
import { sendInvoiceEmail } from '../../utils/send-invoice-email';

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

// Función opcional para mantener sincronizado Google Sheets en segundo plano sin bloquear el flujo principal
const syncToGasBackground = async (body: any) => {
  const gasUrl = process.env.GAS_WEBAPP_URL;
  const gasToken = process.env.GAS_API_TOKEN;
  if (!gasUrl || !gasToken) return;
  fetch(`${gasUrl}?token=${encodeURIComponent(gasToken)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body || {}),
  }).catch((err) => {
    console.warn('Sync background a GAS omitido o con advertencia:', err?.message || err);
  });
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchXmlFromFacturama(baseUrl: string, cfdiId: string, authHeader: string): Promise<string | null> {
  const urls = [
    `${baseUrl}/cfdi/xml/issuedLite/${cfdiId}`,
    `${baseUrl}/cfdi/xml/issued/${cfdiId}`,
    `${baseUrl}/api-lite/cfdis/${cfdiId}?format=xml`
  ];

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: authHeader,
            Accept: 'application/xml, text/xml, application/json'
          }
        });

        if (response.ok) {
          const text = await response.text();
          if (text && text.trim().length > 10) {
            // Facturama devuelve a veces JSON con { "Content": "base64..." }
            try {
              const parsed = JSON.parse(text);
              const content = parsed.Content || parsed.content || parsed.data || parsed.Data;
              if (content) {
                return Buffer.from(content, 'base64').toString('utf8');
              }
            } catch (_) {}

            // Si es base64 directo
            if (!text.trim().startsWith('<') && /^[A-Za-z0-9+/=]+$/.test(text.trim())) {
              return Buffer.from(text.trim(), 'base64').toString('utf8');
            }

            // Si es XML en texto plano
            if (text.includes('<') && (text.includes('Comprobante') || text.includes('xml'))) {
              return text;
            }
          }
        }
      } catch (err: any) {
        console.warn(`Intento ${attempt} para descargar XML falló en ${url}:`, err?.message || err);
      }
    }
    if (attempt < 4) await sleep(1200);
  }
  return null;
}


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

  // Determina la clave de la forma de pago (SAT) a partir del nombre o texto del pago
  const resolvePaymentForm = (paymentsValue: any[]) => {
    if (!Array.isArray(paymentsValue) || paymentsValue.length === 0) return '99';
    if (paymentsValue.length > 1) return '99';
    const name = String(paymentsValue[0]?.name || '').toUpperCase().trim();
    
    // Si el texto ya comienza con un código de forma de pago conocido de 2 dígitos (ej. "01", "03", etc.)
    const match = name.match(/^(01|02|03|04|28|99)\b/);
    if (match) return match[1];

    // Mapeos secundarios por si viene texto plano sin código
    if (name === 'EFECTIVO') return '01';
    if (name === 'T/DEBITO' || name === 'TARJETA DEBITO' || name.includes('DEBITO')) return '28';
    if (name === 'T/CREDITO' || name === 'TARJETA CREDITO' || name.includes('CREDITO')) return '04';
    if (name === 'TRANSFERENCIA' || name.includes('SPEI') || name.includes('TRANSFERENCIA')) return '03';
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
    const extractUuid = (item: any) =>
      toTrimmed(
        item?.Uuid ??
          item?.uuid ??
          item?.UUID ??
          item?.Complemento?.TimbreFiscalDigital?.UUID ??
          item?.Complemento?.TimbreFiscalDigital?.Uuid ??
          item?.Complement?.TimbreFiscalDigital?.UUID ??
          item?.Complement?.TimbreFiscalDigital?.Uuid ??
          item?.Complement?.UUID ??
          item?.Complement?.Uuid ??
          extractCfdiId(item)
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
            return { found: true, cfdiId: externalCfdiId, uuid: extractUuid(matchByExternal), hadSuccessfulLookup };
          }
        }

        const matchByOrder = collected.find((item) => extractOrderNumber(item) === expectedOrder);
        const orderCfdiId = extractCfdiId(matchByOrder);
        if (orderCfdiId) {
          return { found: true, cfdiId: orderCfdiId, uuid: extractUuid(matchByOrder), hadSuccessfulLookup };
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
          return { found: true, cfdiId: comboCfdiId, uuid: extractUuid(matchByCombo), hadSuccessfulLookup };
        }

        if (attempt < 4) {
          await sleep(1500);
        }
      }

      return { found: false, cfdiId: '', uuid: '', hadSuccessfulLookup };
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
      reserveData = await reserveTicket({
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
      });
      syncToGasBackground(reservePayload);
      console.log('MySQL reserve result:', reserveData);

      // Si el ticket ya fue timbrado previamente, detenemos la emisión para no duplicar en Facturama
      if (reserveData?.ok === true && reserveData?.status === 'TIMBRADO' && reserveData?.facturamaId) {
        return res.status(200).json({
          ok: true,
          alreadyInvoiced: true,
          facturamaId: reserveData.facturamaId,
          cfdiId: reserveData.facturamaId,
          uuid: reserveData.uuid || reserveData.facturamaId
        });
      }

      // Si está bloqueado activamente por otra transacción reciente (lock activo para evitar doble timbrado)
      if (reserveData?.ok === false && reserveData?.status === 'BLOQUEADO') {
        return res.status(409).json({
          ok: false,
          code: 'TICKET_LOCKED',
          message: reserveData.error || 'El ticket está en proceso de facturación en este momento. Intenta en unos minutos.'
        });
      }
    } catch (reserveErr) {
      console.error('mysqlReserveError', { ticketKey, error: String(reserveErr?.message || reserveErr) });
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
          let recoveryXml: string | null = null;
          try {
            recoveryXml = await fetchXmlFromFacturama(baseUrl, recovery.cfdiId, authHeader.header);
          } catch (_) {}

          let recoveryPdfBase64: string | null = null;
          if (recoveryXml) {
            try {
              const buf = await generateCfdiPdf(recoveryXml);
              recoveryPdfBase64 = buf.toString('base64');
            } catch (_) {}
          }

          let recoveryRealUuid = recovery.uuid || recovery.cfdiId;
          if (recoveryXml) {
            try {
              const parsed = parseCfdiXml(recoveryXml);
              if (parsed.timbreFiscal?.uuid) recoveryRealUuid = parsed.timbreFiscal.uuid;
            } catch (_) {}
          }

          try {
            await finalizeTicket({
              ticket: ticketValue,
              storeId,
              rfc: normalizedRfc,
              email: normalizedEmail,
              facturamaId: recovery.cfdiId,
              uuid: recoveryRealUuid,
              xmlContent: recoveryXml || undefined,
              errorMsg: ''
            });
            syncToGasBackground({
              action: 'finalize',
              ticket: ticketValue,
              storeId,
              rfc: normalizedRfc,
              email: normalizedEmail,
              facturamaId: recovery.cfdiId,
              uuid: recoveryRealUuid,
              errorMsg: ''
            });
          } catch (finalizeErr) {
            console.error('mysqlFinalizeError', { ticketKey, error: String(finalizeErr?.message || finalizeErr) });
          }

          let recoveryEmailSent = false;
          if (normalizedEmail && recoveryXml && recoveryPdfBase64) {
            try {
              await sendInvoiceEmail({
                to: normalizedEmail,
                subject: `Factura Puerto Copy – Ticket ${ticketValue}`,
                pdfBase64: recoveryPdfBase64,
                xmlBase64: Buffer.from(recoveryXml, 'utf8').toString('base64'),
                issuerRfc: process.env.FACTURAMA_ISSUER_RFC || 'PARI980727RWA',
                total: Number(totalForReserve || 0).toFixed(2),
                uuid: recoveryRealUuid,
                receiverRfc: normalizedRfc,
                ticket: ticketValue,
                context: 'original'
              });
              recoveryEmailSent = true;
            } catch (_) {}
          }

          return res.status(200).json({
            ok: true,
            recoveredAfterTimeout: true,
            message: 'Factura emitida correctamente',
            facturamaId: recovery.cfdiId,
            cfdiId: recovery.cfdiId,
            uuid: recoveryRealUuid,
            xml: recoveryXml ? Buffer.from(recoveryXml, 'utf8').toString('base64') : null,
            pdf: recoveryPdfBase64,
            emailSent: recoveryEmailSent
          });
        }

        if (recovery.hadSuccessfulLookup) {
          try {
            await failTicket({
              ticket: ticketValue,
              storeId,
              rfc: normalizedRfc,
              errorMsg: 'Facturama timeout sin CFDI encontrado'.slice(0, 500)
            });
            syncToGasBackground({
              action: 'fail',
              ticket: ticketValue,
              storeId,
              rfc: normalizedRfc,
              errorMsg: 'Facturama timeout sin CFDI encontrado'.slice(0, 500)
            });
          } catch (failErr) {
            console.error('mysqlFailError', { ticketKey, error: String(failErr?.message || failErr) });
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
        await failTicket({
          ticket: ticketValue,
          storeId,
          rfc: normalizedRfc,
          errorMsg: `Facturama error ${createRes.status}`.slice(0, 500)
        });
        syncToGasBackground({
          action: 'fail',
          ticket: ticketValue,
          storeId,
          rfc: normalizedRfc,
          errorMsg: `Facturama error ${createRes.status}`.slice(0, 500)
        });
      } catch (failErr) {
        console.error('mysqlFailError', { ticketKey, error: String(failErr?.message || failErr) });
      }

      let errorMessage = 'Error al generar CFDI';
      if (createData) {
        errorMessage = obtenerMensajeAmigable(createData) || errorMessage;
      }

      return res.status(createRes.status).json({
        message: errorMessage,
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

    // Extracción precisa de los metadatos fiscales requeridos
    const uuid =
      createData?.Complement?.TaxStamp?.Uuid ||
      createData?.Complemento?.TimbreFiscalDigital?.UUID ||
      createData?.Complemento?.TimbreFiscalDigital?.Uuid ||
      createData?.Complement?.TimbreFiscalDigital?.UUID ||
      createData?.Complement?.TimbreFiscalDigital?.Uuid ||
      createData?.Uuid ||
      createData?.uuid ||
      createData?.UUID ||
      cfdiId;

    const fechaPagoExtraida =
      createData?.Complement?.TaxStamp?.Date ||
      createData?.Complemento?.TimbreFiscalDigital?.FechaTimbrado ||
      createData?.Date ||
      fechaPago ||
      '';

    const metodoPagoExtraido =
      createData?.PaymentMethod ||
      metodoPago ||
      'PUE';

    const uuidRelacionExtraido =
      createData?.Relations?.Cfdis?.[0]?.Uuid ||
      uuidRelacionado ||
      '';

    if (!cfdiId) {
      return res.status(502).json({ message: 'Respuesta inválida de Facturama', detalles: createData });
    }
    console.log('FACTURAMA response id:', cfdiId);

    // Descargar ÚNICAMENTE el archivo XML de Facturama
    let xmlContent: string | null = null;
    try {
      xmlContent = await fetchXmlFromFacturama(baseUrl, cfdiId, authHeader.header);
      if (xmlContent) {
        console.log(`>>> XML descargado con éxito de Facturama (${xmlContent.length} bytes)`);
      } else {
        console.warn('>>> Advertencia: Facturama no devolvió el XML en los reintentos');
      }
    } catch (xmlErr: any) {
      console.error('>>> Error al recuperar XML de Facturama:', xmlErr?.message || xmlErr);
    }

    // Extracción de metadatos fiscales directamente desde el XML del SAT
    let realUuid = uuid || cfdiId;
    let realFechaPago = fechaPagoExtraida || '';
    let realMetodoPago = metodoPagoExtraido || 'PUE';
    let realTotal = Number(totalFromBody) || 0;
    let realRfc = normalizedRfc;
    let realRazonSocial = normalizedRazon;
    let realCodigoPostal = String(codigoPostal || '').trim();
    let realRegimenFiscal = fiscalRegime;
    let realUsoCfdi = cfdiUse;
    let realUuidRelacion = uuidRelacionExtraido || '';

    if (xmlContent) {
      try {
        const parsed = parseCfdiXml(xmlContent);
        if (parsed.timbreFiscal?.uuid) realUuid = parsed.timbreFiscal.uuid;
        if (parsed.timbreFiscal?.fechaTimbrado || parsed.fecha) {
          realFechaPago = parsed.timbreFiscal.fechaTimbrado || parsed.fecha;
        }
        if (parsed.metodoPago) realMetodoPago = parsed.metodoPago;
        if (parsed.total !== undefined && Number.isFinite(parsed.total)) realTotal = parsed.total;
        if (parsed.receptor?.rfc) realRfc = parsed.receptor.rfc;
        if (parsed.receptor?.nombre) realRazonSocial = parsed.receptor.nombre;
        if (parsed.receptor?.domicilioFiscalReceptor) realCodigoPostal = parsed.receptor.domicilioFiscalReceptor;
        if (parsed.receptor?.regimenFiscalReceptor) realRegimenFiscal = parsed.receptor.regimenFiscalReceptor;
        if (parsed.receptor?.usoCfdi) realUsoCfdi = parsed.receptor.usoCfdi;
        console.log(`>>> CFDI parseado con éxito: UUID=${realUuid}, Total=${realTotal}, Fecha=${realFechaPago}`);
      } catch (xmlParseErr: any) {
        console.warn('>>> Advertencia al parsear datos fiscales del XML:', xmlParseErr?.message);
      }
    }

    // Generar representación impresa en PDF bajo demanda a partir del XML
    let pdfBase64: string | null = null;
    if (xmlContent) {
      try {
        const pdfBuffer = await generateCfdiPdf(xmlContent);
        pdfBase64 = pdfBuffer.toString('base64');
      } catch (pdfErr: any) {
        console.error('>>> Error al generar PDF bajo demanda:', pdfErr?.message || pdfErr);
      }
    }

    try {
      await finalizeTicket({
        ticket: ticketValue,
        storeId,
        rfc: realRfc,
        razonSocial: realRazonSocial,
        email: normalizedEmail,
        codigoPostal: realCodigoPostal,
        usoCfdi: realUsoCfdi,
        regimenFiscal: realRegimenFiscal,
        facturamaId: cfdiId,
        uuid: realUuid,
        usuario: usuario || '',
        metodoPago: realMetodoPago,
        uuidRelacion: realUuidRelacion,
        fechaPago: realFechaPago,
        total: realTotal,
        xmlContent: xmlContent || undefined,
        errorMsg: ''
      });
      syncToGasBackground({
        action: 'finalize',
        ticket: ticketValue,
        storeId,
        rfc: realRfc,
        razonSocial: realRazonSocial,
        email: normalizedEmail,
        codigoPostal: realCodigoPostal,
        usoCfdi: realUsoCfdi,
        regimenFiscal: realRegimenFiscal,
        facturamaId: cfdiId,
        uuid: realUuid,
        usuario: usuario || '',
        metodoPago: realMetodoPago,
        uuidRelacion: realUuidRelacion,
        fechaPago: realFechaPago,
        errorMsg: ''
      });
    } catch (finalizeErr) {
      console.error('mysqlFinalizeError', { ticketKey, error: String(finalizeErr?.message || finalizeErr) });
    }

    // Envío automático de correo con la factura timbrada (PDF y XML)
    let emailSent = false;
    let emailError: string | null = null;
    if (normalizedEmail && xmlContent && pdfBase64) {
      try {
        await sendInvoiceEmail({
          to: normalizedEmail,
          subject: `Factura Puerto Copy – Ticket ${ticketValue}`,
          pdfBase64,
          xmlBase64: Buffer.from(xmlContent, 'utf8').toString('base64'),
          issuerRfc: process.env.FACTURAMA_ISSUER_RFC || 'PARI980727RWA',
          total: Number(realTotal).toFixed(2),
          uuid: realUuid,
          receiverRfc: realRfc,
          date: realFechaPago || new Date().toISOString(),
          ticket: ticketValue,
          context: 'original'
        });
        emailSent = true;
        console.log(`>>> Factura enviada por correo exitosamente a: ${normalizedEmail}`);
      } catch (mailErr: any) {
        emailSent = false;
        emailError = mailErr?.message || 'Error al enviar correo';
        console.error('>>> Error al enviar correo de factura:', mailErr?.message || mailErr);
      }
    }

    return res.status(200).json({
      ok: true,
      message: 'Factura emitida correctamente',
      cfdiId,
      uuid: realUuid,
      xml: xmlContent ? Buffer.from(xmlContent, 'utf8').toString('base64') : null,
      pdf: pdfBase64,
      emailSent,
      emailError
    });
  } catch (error: any) {
    try {
      await failTicket({
        ticket: ticketValue,
        storeId,
        rfc: normalizedRfc,
        errorMsg: String(error?.message || error).slice(0, 500)
      });
      syncToGasBackground({
        action: 'fail',
        ticket: ticketValue,
        storeId,
        rfc: normalizedRfc,
        errorMsg: String(error?.message || error).slice(0, 500)
      });
    } catch (failErr) {
      console.error('mysqlFailError', { ticketKey, error: String(failErr?.message || failErr) });
    }
    return res.status(500).json({ message: 'Error interno del servidor', error: String(error?.message || error) });
  }
}

function traducirErrorSAT(errorText: string, campo: string = ''): string {
  const texto = String(errorText || '').toLowerCase();
  const c = String(campo || '').toLowerCase();

  // Errores de Nombre / Razón Social
  if (
    texto.includes('nombre del receptor') || 
    texto.includes('debe pertenecer al nombre asociado al rfc') ||
    texto.includes('nombre o razón social') ||
    c.includes('receiver.name') ||
    c.includes('name')
  ) {
    return 'La razón social (nombre) no coincide con el RFC registrado en el SAT. Recuerda escribirla exactamente como aparece en tu Constancia de Situación Fiscal (en MAYÚSCULAS y sin el tipo de sociedad como S.A. de C.V., S. de R.L., etc.).';
  }

  // Errores de RFC
  if (
    (texto.includes('rfc') && (texto.includes('no es válido') || texto.includes('inválido') || texto.includes('no registrado') || texto.includes('no se encuentra en la lista'))) ||
    c.includes('receiver.rfc') ||
    c.includes('rfc')
  ) {
    return 'El RFC ingresado no es válido o no está registrado ante el SAT.';
  }

  // Errores de Código Postal
  if (
    texto.includes('código postal') || 
    texto.includes('domiciliofiscalreceptor') || 
    texto.includes('zipcode') || 
    texto.includes('postalcode') ||
    texto.includes('lugar de expedición') ||
    c.includes('zipcode') ||
    c.includes('taxzipcode')
  ) {
    return 'El código postal no corresponde al domicilio fiscal registrado ante el SAT para este RFC.';
  }

  // Errores de Régimen Fiscal
  if (
    texto.includes('régimen fiscal') || 
    texto.includes('regimenfiscalreceptor') ||
    texto.includes('régimen') ||
    c.includes('fiscalregime')
  ) {
    return 'El régimen fiscal seleccionado no corresponde con los registros del SAT para este RFC.';
  }

  // Errores de Uso de CFDI
  if (
    texto.includes('usocfdi') || 
    texto.includes('uso de cfdi') ||
    texto.includes('usocfdi del receptor no es válido') ||
    c.includes('cfdiuse')
  ) {
    return 'El Uso de CFDI seleccionado no es válido para tu régimen fiscal.';
  }

  return errorText;
}

function obtenerMensajeAmigable(facturamaResponse: any): string | null {
  if (!facturamaResponse) return null;

  // 1. Verificar si viene un ModelState/modelState (errores de validación de campos específicos de la API)
  const modelState = facturamaResponse.ModelState || facturamaResponse.modelState;
  if (modelState && typeof modelState === 'object') {
    const mensajes: string[] = [];
    for (const key in modelState) {
      if (Object.prototype.hasOwnProperty.call(modelState, key)) {
        const errores = modelState[key];
        if (Array.isArray(errores) && errores.length > 0) {
          errores.forEach(err => {
            mensajes.push(traducirErrorSAT(String(err), key));
          });
        }
      }
    }
    if (mensajes.length > 0) {
      return Array.from(new Set(mensajes)).join(' | ');
    }
  }

  // 2. Verificar si viene un Message/message general
  const message = facturamaResponse.Message || facturamaResponse.message;
  if (message && typeof message === 'string') {
    return traducirErrorSAT(message);
  }

  return null;
}

