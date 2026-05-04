import { NextApiRequest } from 'next';

export function isAuthenticated(req: NextApiRequest): boolean {
  const cookies = req.headers.cookie;
  return !!(cookies && cookies.includes('admin_session=true'));
}
