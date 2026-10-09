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
  fechaTicket?: string;
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
  fechaPago?: string;
  facturamaId?: string;
  uuid?: string;
  errorMsg?: string;
  payload?: any;
};

async function readJson(res: Response) {
  const text = await res.text().catch(() => '');
  try {
    return JSON.parse(text || '{}');
  } catch (err) {
    return { ok: false, error: 'Respuesta inválida del servidor', raw: text };
  }
}

/**
 * Cliente de navegador: verifica el estado del ticket llamando a la API local de Next.js
 */
export async function checkTicket(ticket: string, storeId = 'PV'): Promise<GasCheckResponse> {
  const res = await fetch(`/api/gas-ticket-check?ticket=${encodeURIComponent(ticket)}&storeId=${encodeURIComponent(storeId)}`);
  return readJson(res);
}

/**
 * Cliente de navegador: reserva el ticket antes de timbrar llamando a la API local
 */
export async function reserveTicket(payload: Omit<GasActionPayload, 'action'>) {
  const res = await fetch('/api/gas-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reserve', ...payload })
  });
  return readJson(res);
}

/**
 * Cliente de navegador: finaliza el ticket guardando el CFDI
 */
export async function finalizeTicket(payload: Omit<GasActionPayload, 'action'>) {
  const res = await fetch('/api/gas-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'finalize', ...payload })
  });
  return readJson(res);
}

/**
 * Cliente de navegador: notifica el fallo del ticket
 */
export async function failTicket(payload: Omit<GasActionPayload, 'action'>) {
  const res = await fetch('/api/gas-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'fail', ...payload })
  });
  return readJson(res);
}

/**
 * Cliente de navegador: lista los tickets facturados para el panel administrativo
 */
export async function listInvoices(params: { month?: string; year?: string; rfc?: string }) {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/gas-ticket?action=list&${query}`);
  return readJson(res);
}
