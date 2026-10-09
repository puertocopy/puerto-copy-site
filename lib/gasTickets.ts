import pool from './db';
import { parseCfdiXml } from './cfdiPdfGenerator';

/**
 * Tipos de estado posibles para un ticket facturado:
 * - 'BLOQUEADO': En proceso de facturación (lock para evitar duplicados simultáneos)
 * - 'TIMBRADO': Factura emitida con éxito en Facturama y timbrada por el SAT
 * - 'ERROR': Error durante el proceso de emisión
 */
export type TicketStatus = 'TIMBRADO' | 'ERROR' | 'BLOQUEADO';

export type GasCheckResponse = {
  ok?: boolean;
  exists?: boolean;
  status?: string;
  rfc?: string;
  email?: string;
  facturamaId?: string;
  uuid?: string;
  updatedAt?: string;
  error?: string;
};

export type GasActionPayload = {
  action?: 'reserve' | 'finalize' | 'fail';
  ticket: string;
  storeId?: string;
  fechaTicket?: string | Date;
  total?: number;
  rfc?: string;
  razonSocial?: string;
  email?: string;
  codigoPostal?: string;
  usoCfdi?: string;
  regimenFiscal?: string;
  usuario?: string;
  metodoPago?: string;
  uuidRelacion?: string;
  fechaPago?: string | Date;
  facturamaId?: string;
  uuid?: string;
  errorMsg?: string;
  xmlContent?: string;
  payload?: any;
};

/**
 * Construye la clave única del ticket (ticket_key), por ejemplo: "PV:12345"
 */
export function buildTicketKey(ticket: string, storeId = 'PV'): string {
  const cleanStore = String(storeId || 'PV').trim() || 'PV';
  const cleanTicket = String(ticket || '').trim();
  return `${cleanStore}:${cleanTicket}`;
}

/**
 * Convierte cualquier fecha a formato DATETIME compatible con MySQL ('YYYY-MM-DD HH:MM:SS')
 */
function toMysqlDatetime(dateInput?: string | Date | null): string | null {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * 1. VERIFICACIÓN (checkTicket)
 * Consulta en MySQL si el ticket ya fue timbrado, está bloqueado en proceso o si no existe.
 */
export async function checkTicket(ticket: string, storeId = 'PV'): Promise<GasCheckResponse> {
  const ticketKey = buildTicketKey(ticket, storeId);

  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM tickets_facturados WHERE ticket_key = ? LIMIT 1',
      [ticketKey]
    );

    if (!rows || rows.length === 0) {
      return { ok: true, exists: false };
    }

    const row = rows[0];

    // Caso A: Ya está timbrado exitosamente
    if (row.status === 'TIMBRADO') {
      return {
        ok: true,
        exists: true,
        status: 'TIMBRADO',
        facturamaId: row.facturama_id,
        uuid: row.uuid || row.facturama_id,
        rfc: row.rfc,
        email: row.email || row.correo,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
      };
    }

    // Caso B: Está bloqueado (en proceso de timbrado)
    if (row.status === 'BLOQUEADO') {
      // Si el bloqueo tiene más de 5 minutos, se considera expirado (abandono de compra o caída)
      const updatedAt = new Date(row.updated_at || row.created_at).getTime();
      const now = Date.now();
      const lockExpired = now - updatedAt > 5 * 60 * 1000;

      if (!lockExpired) {
        return {
          ok: true,
          exists: true,
          status: 'BLOQUEADO',
          rfc: row.rfc,
          email: row.email || row.correo,
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
        };
      } else {
        // Bloqueo expirado: se permite que el cliente vuelva a intentar facturar
        return {
          ok: true,
          exists: false,
          status: 'EXPIRADO',
        };
      }
    }

    // Caso C: Marcado con error previo (permite volver a intentar)
    if (row.status === 'ERROR') {
      return {
        ok: true,
        exists: false,
        status: 'ERROR',
        error: row.error_msg,
      };
    }

    return {
      ok: true,
      exists: true,
      status: row.status,
    };
  } catch (error: any) {
    console.error('>>> Error en checkTicket (MySQL):', error?.message || error);
    return { ok: false, exists: false, error: error?.message || 'Error al consultar ticket en base de datos' };
  }
}

/**
 * 2. BLOQUEO / RESERVA (reserveTicket)
 * Reserva el ticket marcándolo como 'BLOQUEADO' antes de llamar a Facturama.
 * Evita que dos usuarios o pestañas timbren el mismo ticket al mismo tiempo.
 */
export async function reserveTicket(payload: Omit<GasActionPayload, 'action'>) {
  const storeId = String(payload.storeId || 'PV').trim() || 'PV';
  const ticket = String(payload.ticket || '').trim();
  const ticketKey = buildTicketKey(ticket, storeId);
  const email = String(payload.email || '').trim();
  const fechaTicketMysql = toMysqlDatetime(payload.fechaTicket) || toMysqlDatetime(new Date());
  const fechaPagoMysql = toMysqlDatetime(payload.fechaPago);
  const total = Number.isFinite(Number(payload.total)) ? Number(payload.total) : 0;

  try {
    // Consultamos si el ticket ya existe en la base de datos
    const [rows]: any = await pool.query(
      'SELECT * FROM tickets_facturados WHERE ticket_key = ? LIMIT 1',
      [ticketKey]
    );

    if (rows && rows.length > 0) {
      const existing = rows[0];

      // Si ya está timbrado, detenemos el proceso y devolvemos los datos para no duplicar timbrado
      if (existing.status === 'TIMBRADO') {
        return {
          ok: true,
          exists: true,
          status: 'TIMBRADO',
          facturamaId: existing.facturama_id,
          uuid: existing.uuid || existing.facturama_id,
          rfc: existing.rfc,
          email: existing.email || existing.correo,
          ticketKey,
        };
      }

      // Si está bloqueado activamente hace menos de 5 minutos, protegemos la transacción si es un cliente distinto
      if (existing.status === 'BLOQUEADO') {
        const lastUpdate = new Date(existing.updated_at || existing.created_at).getTime();
        const diffMs = Date.now() - lastUpdate;
        const lockDurationMs = 5 * 60 * 1000;

        const existingRfc = String(existing.rfc || '').trim().toUpperCase();
        const incomingRfc = String(payload.rfc || '').trim().toUpperCase();
        const isDifferentClient = existingRfc && incomingRfc && existingRfc !== incomingRfc;

        // Solo bloqueamos si es un RFC diferente intentando facturar el ticket mientras sigue activo el bloqueo
        if (diffMs < lockDurationMs && isDifferentClient) {
          return {
            ok: false,
            exists: true,
            status: 'BLOQUEADO',
            error: 'El ticket se encuentra en proceso de facturación por otro usuario. Intenta en unos minutos.',
            ticketKey,
          };
        }
      }

      // Si el bloqueo expiró, estaba en ERROR o es el mismo cliente/sesión continuando (ej. llamada desde /api/facturar),
      // renovamos el bloqueo con los datos actualizados
      await pool.query(
        `UPDATE tickets_facturados
         SET status = 'BLOQUEADO',
             total = ?,
             rfc = ?,
             email = ?,
             correo = ?,
             razon_social = ?,
             codigo_postal = ?,
             uso_cfdi = ?,
             regimen_fiscal = ?,
             usuario = ?,
             metodo_pago = ?,
             uuid_relacion = ?,
             fecha_pago = ?,
             error_msg = NULL,
             updated_at = NOW()
         WHERE ticket_key = ? AND status != 'TIMBRADO'`,
        [
          total,
          payload.rfc || null,
          email || null,
          email || null,
          payload.razonSocial || null,
          payload.codigoPostal || null,
          payload.usoCfdi || null,
          payload.regimenFiscal || null,
          payload.usuario || null,
          payload.metodoPago || 'PUE',
          payload.uuidRelacion || null,
          fechaPagoMysql,
          ticketKey,
        ]
      );

      return {
        ok: true,
        status: 'BLOQUEADO',
        ticketKey,
      };
    }

    // Si no existe, creamos el nuevo registro con status 'BLOQUEADO'
    await pool.query(
      `INSERT INTO tickets_facturados (
         ticket_key, ticket, store_id, fecha_ticket, total,
         rfc, email, correo, razon_social, codigo_postal,
         uso_cfdi, regimen_fiscal, usuario, metodo_pago,
         uuid_relacion, fecha_pago, status, created_at, updated_at
       ) VALUES (
         ?, ?, ?, ?, ?,
         ?, ?, ?, ?, ?,
         ?, ?, ?, ?,
         ?, ?, 'BLOQUEADO', NOW(), NOW()
       )`,
      [
        ticketKey,
        ticket,
        storeId,
        fechaTicketMysql,
        total,
        payload.rfc || null,
        email || null,
        email || null,
        payload.razonSocial || null,
        payload.codigoPostal || null,
        payload.usoCfdi || null,
        payload.regimenFiscal || null,
        payload.usuario || null,
        payload.metodoPago || 'PUE',
        payload.uuidRelacion || null,
        fechaPagoMysql,
      ]
    );

    return {
      ok: true,
      status: 'BLOQUEADO',
      ticketKey,
    };
  } catch (error: any) {
    // Si dos llamadas llegaron al mismo milisegundo (colisión de llave única en MySQL)
    if (error.code === 'ER_DUP_ENTRY') {
      const [existingRows]: any = await pool.query(
        'SELECT * FROM tickets_facturados WHERE ticket_key = ? LIMIT 1',
        [ticketKey]
      );
      if (existingRows && existingRows.length > 0) {
        const item = existingRows[0];
        if (item.status === 'TIMBRADO') {
          return {
            ok: true,
            exists: true,
            status: 'TIMBRADO',
            facturamaId: item.facturama_id,
            uuid: item.uuid || item.facturama_id,
            rfc: item.rfc,
            email: item.email || item.correo,
            ticketKey,
          };
        }
        const existingRfc = String(item.rfc || '').trim().toUpperCase();
        const incomingRfc = String(payload.rfc || '').trim().toUpperCase();
        const isDifferentClient = existingRfc && incomingRfc && existingRfc !== incomingRfc;
        const lastUpdate = new Date(item.updated_at || item.created_at).getTime();
        const diffMs = Date.now() - lastUpdate;
        const lockDurationMs = 5 * 60 * 1000;

        if (diffMs < lockDurationMs && isDifferentClient) {
          return {
            ok: false,
            exists: true,
            status: 'BLOQUEADO',
            error: 'El ticket se encuentra en proceso de facturación por otro usuario.',
            ticketKey,
          };
        }

        return {
          ok: true,
          status: 'BLOQUEADO',
          ticketKey,
        };
      }
    }

    console.error('>>> Error en reserveTicket (MySQL):', error?.message || error);
    return { ok: false, error: error?.message || 'Error al reservar ticket en base de datos' };
  }
}

/**
 * 3. ACTUALIZACIÓN DE TIMBRADO (finalizeTicket)
 * Guarda el CFDI emitido por Facturama en MySQL con status 'TIMBRADO', UUID y Facturama ID.
 */
export async function finalizeTicket(payload: Omit<GasActionPayload, 'action'>) {
  const storeId = String(payload.storeId || 'PV').trim() || 'PV';
  const ticket = String(payload.ticket || '').trim();
  const ticketKey = buildTicketKey(ticket, storeId);
  const email = String(payload.email || '').trim();
  const fechaPagoMysql = toMysqlDatetime(payload.fechaPago);
  const facturamaId = payload.facturamaId || '';
  const uuid = payload.uuid || facturamaId;

  const xmlContent = payload.xmlContent || null;

  let finalUuid = payload.uuid || facturamaId;
  let finalFechaPagoMysql = fechaPagoMysql;
  let finalMetodoPago = payload.metodoPago || 'PUE';
  let finalTotal = payload.total !== undefined ? Number(payload.total) : null;
  let finalRfc = payload.rfc || null;
  let finalRazonSocial = payload.razonSocial || null;
  let finalCodigoPostal = payload.codigoPostal || null;
  let finalRegimenFiscal = payload.regimenFiscal || null;
  let finalUsoCfdi = payload.usoCfdi || null;

  if (xmlContent) {
    try {
      const parsed = parseCfdiXml(xmlContent);
      if (parsed.timbreFiscal?.uuid) finalUuid = parsed.timbreFiscal.uuid;
      if (parsed.timbreFiscal?.fechaTimbrado || parsed.fecha) {
        finalFechaPagoMysql = toMysqlDatetime(parsed.timbreFiscal.fechaTimbrado || parsed.fecha);
      }
      if (parsed.metodoPago) finalMetodoPago = parsed.metodoPago;
      if (parsed.total !== undefined && Number.isFinite(parsed.total)) finalTotal = parsed.total;
      if (parsed.receptor?.rfc) finalRfc = parsed.receptor.rfc;
      if (parsed.receptor?.nombre) finalRazonSocial = parsed.receptor.nombre;
      if (parsed.receptor?.domicilioFiscalReceptor) finalCodigoPostal = parsed.receptor.domicilioFiscalReceptor;
      if (parsed.receptor?.regimenFiscalReceptor) finalRegimenFiscal = parsed.receptor.regimenFiscalReceptor;
      if (parsed.receptor?.usoCfdi) finalUsoCfdi = parsed.receptor.usoCfdi;
    } catch (xmlParseErr: any) {
      console.warn('>>> Error al extraer datos del XML en finalizeTicket:', xmlParseErr?.message);
    }
  }

  try {
    // Aseguramos la persistencia usando INSERT ... ON DUPLICATE KEY UPDATE
    await pool.query(
      `INSERT INTO tickets_facturados (
         ticket_key, ticket, store_id, rfc, email, correo,
         razon_social, codigo_postal, uso_cfdi, regimen_fiscal,
         facturama_id, uuid, usuario, metodo_pago, uuid_relacion,
         fecha_pago, status, total, xml_content, created_at, updated_at
       ) VALUES (
         ?, ?, ?, ?, ?, ?,
         ?, ?, ?, ?,
         ?, ?, ?, ?, ?,
         ?, 'TIMBRADO', ?, ?, NOW(), NOW()
       )
       ON DUPLICATE KEY UPDATE
         status = 'TIMBRADO',
         facturama_id = VALUES(facturama_id),
         uuid = VALUES(uuid),
         rfc = COALESCE(VALUES(rfc), rfc),
         email = COALESCE(VALUES(email), email),
         correo = COALESCE(VALUES(correo), correo),
         razon_social = COALESCE(VALUES(razon_social), razon_social),
         codigo_postal = COALESCE(VALUES(codigo_postal), codigo_postal),
         uso_cfdi = COALESCE(VALUES(uso_cfdi), uso_cfdi),
         regimen_fiscal = COALESCE(VALUES(regimen_fiscal), regimen_fiscal),
         usuario = COALESCE(VALUES(usuario), usuario),
         metodo_pago = COALESCE(VALUES(metodo_pago), metodo_pago),
         uuid_relacion = COALESCE(VALUES(uuid_relacion), uuid_relacion),
         fecha_pago = COALESCE(VALUES(fecha_pago), fecha_pago),
         total = COALESCE(VALUES(total), total),
         xml_content = COALESCE(VALUES(xml_content), xml_content),
         error_msg = NULL,
         updated_at = NOW()`,
      [
        ticketKey,
        ticket,
        storeId,
        finalRfc,
        email || null,
        email || null,
        finalRazonSocial,
        finalCodigoPostal,
        finalUsoCfdi,
        finalRegimenFiscal,
        facturamaId,
        finalUuid,
        payload.usuario || null,
        finalMetodoPago,
        payload.uuidRelacion || null,
        finalFechaPagoMysql,
        finalTotal,
        xmlContent,
      ]
    );

    return {
      ok: true,
      status: 'TIMBRADO',
      ticketKey,
      facturamaId,
      uuid: finalUuid,
    };
  } catch (error: any) {
    console.error('>>> Error en finalizeTicket (MySQL):', error?.message || error);
    return { ok: false, error: error?.message || 'Error al finalizar ticket en base de datos' };
  }
}

/**
 * Consulta un ticket y sus datos fiscales / XML por ticket_key, ticket, facturama_id o uuid
 */
export async function getTicket(identifier: string) {
  const clean = String(identifier || '').trim();
  if (!clean) return null;
  try {
    const [rows]: any = await pool.query(
      `SELECT * FROM tickets_facturados 
       WHERE ticket_key = ? OR ticket = ? OR facturama_id = ? OR uuid = ?
       LIMIT 1`,
      [clean, clean, clean, clean]
    );
    if (!rows || rows.length === 0) return null;
    return rows[0];
  } catch (err: any) {
    console.error('>>> Error en getTicket (MySQL):', err?.message || err);
    return null;
  }
}

/**
 * 4. REGISTRO DE FALLO (failTicket)
 * Registra el motivo del error en MySQL con status 'ERROR' para auditoría y permitir reintentos.
 * IMPORTANTE: Nunca sobreescribe un registro que ya haya sido 'TIMBRADO'.
 */
export async function failTicket(payload: Omit<GasActionPayload, 'action'>) {
  const storeId = String(payload.storeId || 'PV').trim() || 'PV';
  const ticket = String(payload.ticket || '').trim();
  const ticketKey = buildTicketKey(ticket, storeId);
  const errorMsg = String(payload.errorMsg || 'Error desconocido').slice(0, 500);

  try {
    const [result]: any = await pool.query(
      `UPDATE tickets_facturados
       SET status = 'ERROR',
           error_msg = ?,
           updated_at = NOW()
       WHERE ticket_key = ? AND status != 'TIMBRADO'`,
      [errorMsg, ticketKey]
    );

    // Si no existía el registro previo, lo insertamos con estado ERROR
    if (result.affectedRows === 0) {
      await pool.query(
        `INSERT IGNORE INTO tickets_facturados (
           ticket_key, ticket, store_id, rfc, status,
           error_msg, created_at, updated_at
         ) VALUES (
           ?, ?, ?, ?, 'ERROR',
           ?, NOW(), NOW()
         )`,
        [ticketKey, ticket, storeId, payload.rfc || null, errorMsg]
      );
    }

    return { ok: true, status: 'ERROR', ticketKey };
  } catch (error: any) {
    console.error('>>> Error en failTicket (MySQL):', error?.message || error);
    return { ok: false, error: error?.message || 'Error al registrar fallo de ticket' };
  }
}

/**
 * 5. CONSULTA HISTÓRICA (listInvoices)
 * Lista los tickets registrados en la base de datos MySQL para el panel administrativo.
 */
export async function listInvoices(params: { month?: string; year?: string; rfc?: string }) {
  try {
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.month) {
      conditions.push('(MONTH(created_at) = ? OR MONTH(fecha_ticket) = ?)');
      values.push(Number(params.month), Number(params.month));
    }

    if (params.year) {
      conditions.push('(YEAR(created_at) = ? OR YEAR(fecha_ticket) = ?)');
      values.push(Number(params.year), Number(params.year));
    }

    if (params.rfc) {
      conditions.push('rfc = ?');
      values.push(String(params.rfc).trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT * FROM tickets_facturados
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const [rows]: any = await pool.query(query, values);

    const items = (Array.isArray(rows) ? rows : []).map((f: any) => {
      let formaPago = '01';
      let realUuid = f.uuid || f.facturama_id || '';
      let metodoPago = f.metodo_pago || 'PUE';

      if (f.xml_content) {
        try {
          const uuidMatch = f.xml_content.match(/UUID="([0-9a-fA-F-]{36})"/i);
          if (uuidMatch) realUuid = uuidMatch[1];
          const formaPagoMatch = f.xml_content.match(/FormaPago="([0-9]{2})"/i);
          if (formaPagoMatch) formaPago = formaPagoMatch[1];
          const metodoPagoMatch = f.xml_content.match(/MetodoPago="([A-Z]{3})"/i);
          if (metodoPagoMatch) metodoPago = metodoPagoMatch[1];
        } catch (_) {}
      }

      return {
        fechaTicket: f.fecha_ticket ? new Date(f.fecha_ticket).toISOString() : f.created_at,
        createdAt: f.created_at ? new Date(f.created_at).toISOString() : '',
        updatedAt: f.updated_at ? new Date(f.updated_at).toISOString() : '',
        ticket: f.ticket || (f.ticket_key ? String(f.ticket_key).split(':').pop() : 'S/N'),
        storeId: f.store_id,
        razonSocial: f.razon_social || (f.rfc === 'XAXX010101000' ? 'PÚBLICO EN GENERAL' : ''),
        rfc: f.rfc,
        email: f.correo || f.email,
        total: f.total ? Number(f.total) : 0,
        status: f.status,
        facturamaId: f.facturama_id,
        uuid: realUuid,
        usuario: f.usuario || '',
        metodoPago: metodoPago,
        formaPago: formaPago,
        uuidRelacion: f.uuid_relacion || '',
        fechaPago: f.fecha_pago ? new Date(f.fecha_pago).toISOString() : '',
        codigoPostal: f.codigo_postal || '',
        usoCfdi: f.uso_cfdi || '',
        regimenFiscal: f.regimen_fiscal || '',
        errorMsg: f.error_msg || '',
      };
    });

    return { ok: true, items };
  } catch (error: any) {
    console.error('>>> Error en listInvoices (MySQL):', error?.message || error);
    return { ok: false, error: error?.message || 'Error al listar facturas desde base de datos' };
  }
}
