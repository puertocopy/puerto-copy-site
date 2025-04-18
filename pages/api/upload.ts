// pages/api/upload.ts
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), '/public/uploads'),
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error al subir archivo' });

    const filePaths = Object.values(files).map((file: any) => '/uploads/' + path.basename(file.filepath));
    return res.status(200).json({ success: true, archivos: filePaths });
  });
}
