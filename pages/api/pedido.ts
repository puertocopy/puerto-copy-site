// pages/api/pedido.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Pedido = {
  nombre: string;
  telefono: string;
  carrito: Array<{ producto: string; cantidad: number; precio: number }>;
  total: number;
  archivos: string[]; // rutas en el servidor
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const pedido: Pedido = req.body;
    console.log("Pedido recibido:", pedido);
    // Aquí podríamos guardar en base de datos o preparar para WhatsApp
    return res.status(200).json({ success: true, message: 'Pedido recibido correctamente' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al procesar el pedido' });
  }
}
