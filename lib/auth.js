export function isAuthenticated(req) {
  const cookies = req.headers.cookie;
  return !!(cookies && cookies.includes('admin_session=true'));
}
