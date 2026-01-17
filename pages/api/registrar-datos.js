// pages/api/registrar-datos.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    // ⚠️ Pega aquí tu URL /exec del Apps Script que tiene el doPost:
    const GAS_POST_URL = 'https://script.google.com/macros/s/AKfycbzf_-GMn9ZGNrNWZOFcDSHfX_Kc4DdXsXQjACOr4AVj8SjPGJSsOFasApCeZMQeOW9r/exec';

    const r = await fetch(GAS_POST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // importante
      body: JSON.stringify(req.body),
    });

    const text = await r.text(); // Apps Script siempre responde texto
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (!r.ok) {
      return res.status(502).json({ status: 'error', message: 'Upstream error', upstream: json });
    }

    if (json && json.status === 'error') {
      return res.status(400).json(json);
    }

    return res.status(200).json(json);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: String(err) });
  }
}
