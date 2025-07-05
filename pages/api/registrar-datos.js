export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const {
    ticket,
    rfc,
    razonSocial,
    regimenFiscal,
    usoCfdi,
    codigoPostal,
    email,
    productos,
    total
  } = req.body;

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbybBXxsXpJSF-sp-PeTsFd5LVzS86Lf4MVJ7J2r7AtwkuLpdG3he2KHU7jngfCz2L_k/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket,
        rfc,
        razonSocial,
        regimenFiscal,
        usoCfdi,
        codigoPostal,
        email,
        productos,
        total,
      }),
    });

    if (!response.ok) {
      throw new Error('No se pudo registrar en la hoja de Google');
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error al enviar datos al Apps Script:', err);
    res.status(500).json({ error: 'Error al registrar en Google Sheets' });
  }
}
