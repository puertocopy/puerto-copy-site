import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const filePath = path.join(process.cwd(), 'pages/api/data/catalogo_planos.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const catalog = JSON.parse(fileContents);

    return res.status(200).json({ success: true, catalog });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al cargar el catálogo', error });
  }
}
