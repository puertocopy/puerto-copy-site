export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { username, password } = req.body;

  // Credenciales proporcionadas por el usuario
  const VALID_USER = 'isaact';
  const VALID_PASS = 'ISACTisact07';

  if (username === VALID_USER && password === VALID_PASS) {
    // Establecemos la cookie manualmente para evitar dependencias externas
    // Max-Age ajustado a 300 segundos (5 minutos) según solicitud
    const isProd = process.env.NODE_ENV === 'production';
    const cookieValue = `admin_session=true; HttpOnly; Path=/; Max-Age=300; SameSite=Strict${isProd ? '; Secure' : ''}`;

    res.setHeader('Set-Cookie', cookieValue);
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false, message: 'Usuario o contraseña incorrectos' });
}
