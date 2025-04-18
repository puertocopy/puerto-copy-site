import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const filePath = path.join(process.cwd(), 'public', 'export_items.csv');
  const productos = [];

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => productos.push(data))
      .on('end', () => {
        res.status(200).json({ success: true, productos });
      });
  } catch (error) {
    res.status(500).json({ error: 'Error al leer los productos', detalle: error.message });
  }
}
