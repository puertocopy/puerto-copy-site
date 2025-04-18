import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const form = new formidable.IncomingForm({
    uploadDir: './public/uploads',
    keepExtensions: true
  });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error al subir archivo' });

    const uploaded = Object.values(files).map(file => ({
      name: file.originalFilename,
      path: file.filepath.replace('public', '')
    }));

    res.status(200).json({ success: true, archivos: uploaded });
  });
}
