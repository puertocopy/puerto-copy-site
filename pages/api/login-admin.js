export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { username, password } = req.body;

  // Credenciales proporcionadas por el usuario
  const VALID_USER = 'isaact';
  const VALID_PASS = 'ISACTisact07';

  if (username === VALID_USER && password === VALID_PASS) {
    // Aumentamos el tiempo de sesión a 8 horas (28800 segundos) para evitar cierres inesperados
    const SESSION_TIME = 28800;
    const isProd = process.env.NODE_ENV === 'production';
    
    // Solo usamos Secure si estamos en producción y NO es una prueba local
    const useSecure = isProd && !process.env.DISABLE_SECURE_COOKIE;
    
    const cookieValue = `admin_session=true; HttpOnly; Path=/; Max-Age=${SESSION_TIME}; SameSite=Lax${useSecure ? '; Secure' : ''}`;

    res.setHeader('Set-Cookie', cookieValue);
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false, message: 'Usuario o contraseña incorrectos' });
}
