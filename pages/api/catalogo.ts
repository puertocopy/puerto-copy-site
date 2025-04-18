// pages/api/catalogo.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = join(process.cwd(), 'pages', 'api', 'data', 'catalog.json');
  try {
    const data = readFileSync(filePath, 'utf8');
    const catalog = JSON.parse(data);
    res.status(200).json({ success: true, catalog });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al leer el catálogo' });
  }
}
