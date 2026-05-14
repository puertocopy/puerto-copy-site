export function isAuthenticated(req) {
  const cookies = req.headers.cookie || '';
  return cookies.split(';').some(c => c.trim().startsWith('admin_session=true'));
}
