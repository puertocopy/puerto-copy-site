import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { side = 'left' } = req.query;

  // Intenta nombres neutrales primero; si no existen, prueba tus nombres actuales.
  const candidates = side === 'right'
    ? ['pc-right.jpg', 'lateral-de-300x600.jpg', 'lateral-der-300x600.jpg']
    : ['pc-left.jpg', 'lateral-izq-300x600.jpg'];

  let filePath = null;
  for (const name of candidates) {
    const p = path.join(process.cwd(), 'public', 'media', name); // usa /public/media/
    try {
      await fs.access(p);
      filePath = p;
      break;
    } catch {}
  }

  if (!filePath) {
    res.status(404).end('not found');
    return;
  }

  try {
    const buf = await fs.readFile(filePath);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(buf);
  } catch {
    res.status(500).end('error');
  }
}
