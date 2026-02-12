export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const GAS_URL = process.env.GAS_WEBAPP_URL;
  const GAS_TOKEN = process.env.GAS_API_TOKEN;
  if (!GAS_URL || !GAS_TOKEN) {
    return res.status(500).json({ ok: false, error: 'Missing env GAS_WEBAPP_URL/GAS_API_TOKEN' });
  }

  try {
    const r = await fetch(`${GAS_URL}?token=${encodeURIComponent(GAS_TOKEN)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(req.body),
      redirect: 'follow'
    });

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
