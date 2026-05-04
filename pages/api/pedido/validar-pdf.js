import formidable from 'formidable';
import fs from 'fs/promises';
import { validarArchivoPDF } from '../../../lib/pdfAnalyzer';

export const config = {
  api: {
    bodyParser: false, // Deshabilitamos el body parser para manejar archivos con formidable
  },
};

/**
 * API Route para validar un archivo PDF subido.
 * Recibe un archivo PDF, analiza su número de páginas y su tamaño (Carta o Plano).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const form = new formidable.IncomingForm();

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Obtenemos el archivo subido (se espera que el campo se llame 'archivo')
    const archivo = files.archivo?.[0] || files.archivo;

    if (!archivo) {
      return res.status(400).json({ error: 'No se recibió ningún archivo PDF.' });
    }

    // Leer el archivo como buffer
    const buffer = await fs.readFile(archivo.filepath);

    // Analizar el PDF con nuestra utilidad
    const infoPdf = await validarArchivoPDF(buffer);

    // Opcional: Eliminar el archivo temporal si no lo vas a guardar aún
    // await fs.unlink(archivo.filepath);

    return res.status(200).json({
      success: true,
      data: {
        nombre: archivo.originalFilename,
        ...infoPdf
      }
    });

  } catch (error) {
    console.error('Error en validar-pdf:', error);
    return res.status(500).json({ 
      error: 'Error al procesar el archivo PDF.',
      detalle: error.message 
    });
  }
}
