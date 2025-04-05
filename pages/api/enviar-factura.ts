// pages/api/enviar-factura.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const {
    rfc,
    razonSocial,
    correo,
    codigoPostal,
    numeroTicket,
    usoCFDI,
    regimenFiscal
  } = req.body;

  if (!rfc || !razonSocial || !correo || !codigoPostal || !numeroTicket || !usoCFDI || !regimenFiscal) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Aquí conectaremos con el PAC más adelante
    console.log('Datos recibidos para facturación:', req.body);

    // Simulación de éxito (luego aquí haremos la conexión real con el PAC)
    return res.status(200).json({ message: 'Datos recibidos correctamente. Factura en proceso.' });
  } catch (error) {
    console.error('Error al procesar la factura:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
