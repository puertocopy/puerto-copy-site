export type GasCheckResponse = {
  ok?: boolean;
  exists?: boolean;
  status?: string;
  rfc?: string;
  email?: string;
  facturamaId?: string;
  updatedAt?: string;
  error?: string;
};

export type GasActionPayload = {
  action: 'reserve' | 'finalize' | 'fail';
  ticket: string;
  storeId: string;
  fechaTicket?: string;
  total?: number;
  rfc?: string;
  email?: string;
  facturamaId?: string;
  errorMsg?: string;
  payload?: any;
};

async function readJson(res: Response) {
  const text = await res.text().catch(() => '');
  try {
    return JSON.parse(text || '{}');
  } catch (err) {
    return { ok: false, error: 'Invalid JSON from API', raw: text };
  }
}

export async function checkTicket(ticket: string, storeId = 'PV'): Promise<GasCheckResponse> {
  const res = await fetch(`/api/gas-ticket-check?ticket=${encodeURIComponent(ticket)}&storeId=${encodeURIComponent(storeId)}`);
  return readJson(res);
}

export async function reserveTicket(payload: Omit<GasActionPayload, 'action'>) {
  const res = await fetch('/api/gas-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reserve', ...payload })
  });
  return readJson(res);
}

export async function finalizeTicket(payload: Omit<GasActionPayload, 'action'>) {
  const res = await fetch('/api/gas-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'finalize', ...payload })
  });
  return readJson(res);
}

export async function failTicket(payload: Omit<GasActionPayload, 'action'>) {
  const res = await fetch('/api/gas-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'fail', ...payload })
  });
  return readJson(res);
}
