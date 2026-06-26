// pages/api/registrar-datos.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const GAS_POST_URL = process.env.GAS_WEBAPP_URL;
    const token = process.env.GAS_API_TOKEN;

    if (!GAS_POST_URL || !token) {
      throw new Error('Faltan variables de entorno GAS_WEBAPP_URL/GAS_API_TOKEN');
    }

    const payload = {
      ...req.body,
      action: 'registrarcliente'
    };

    const r = await fetch(`${GAS_POST_URL}?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const text = await r.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (process.env.NODE_ENV !== 'production') {
      console.log('GAS response', { status: r.status, text });
    }

    if (!r.ok) {
      return res.status(502).json({ status: 'error', message: 'Upstream error', upstream: json });
    }

    if (json && json.status === 'error') {
      return res.status(400).json(json);
    }

    if (!json || json.status !== 'ok') {
      return res.status(200).json({ status: 'ok', message: text, upstream: json });
    }

    return res.status(200).json(json);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: String(err) });
  }
}
