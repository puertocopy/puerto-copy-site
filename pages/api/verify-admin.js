export default function handler(req, res) {
  const cookies = req.headers.cookie;
  const isAuthenticated = cookies && cookies.includes('admin_session=true');

  if (isAuthenticated) {
    return res.status(200).json({ authenticated: true });
  }

  return res.status(401).json({ authenticated: false });
}
