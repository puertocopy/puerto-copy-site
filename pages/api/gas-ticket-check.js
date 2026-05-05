export default async function handler(req, res) {
  const GAS_URL = process.env.GAS_WEBAPP_URL;
  const GAS_TOKEN = process.env.GAS_API_TOKEN;
  if (!GAS_URL || !GAS_TOKEN) {
    console.error('>>> ERROR: Faltan variables de entorno GAS_WEBAPP_URL o GAS_API_TOKEN');
    return res.status(500).json({ 
      ok: false, 
      error: 'Error de configuración del servidor (GAS)',
      details: process.env.NODE_ENV !== 'production' ? 'Missing env GAS_WEBAPP_URL/GAS_API_TOKEN' : undefined
    });
  }

  const { ticket = '', storeId = 'PV' } = req.query;
  if (!ticket) {
    return res.status(400).json({ ok: false, error: 'ticket required' });
  }

  try {
    const url = `${GAS_URL}?action=check&ticket=${encodeURIComponent(ticket)}&storeId=${encodeURIComponent(storeId)}&token=${encodeURIComponent(GAS_TOKEN)}`;
    const r = await fetch(url, { method: 'GET', redirect: 'follow' });
    const text = await r.text();
    const trimmed = text.trim();
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
      return res.status(502).json({ ok: false, error: 'GAS returned HTML', raw: text.slice(0, 200) });
    }

    return res.status(200).json(JSON.parse(text));
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
