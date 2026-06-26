// pages/api/consultar-cliente.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const { codigo } = req.query;
  if (!codigo) {
    return res.status(400).json({ status: 'error', message: 'Codigo is required' });
  }

  try {
    const gasUrl = process.env.GAS_WEBAPP_URL;
    const gasToken = process.env.GAS_API_TOKEN;

    if (!gasUrl || !gasToken) {
      throw new Error('Faltan variables de entorno GAS_WEBAPP_URL/GAS_API_TOKEN');
    }

    const response = await fetch(
      `${gasUrl}?token=${encodeURIComponent(gasToken)}&action=buscarcliente&codigo=${encodeURIComponent(codigo)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        redirect: 'follow'
      }
    );

    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    if (!response.ok) {
      return res.status(502).json({ status: 'error', message: 'Upstream error', upstream: json });
    }

    return res.status(200).json(json);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: String(err) });
  }
}
