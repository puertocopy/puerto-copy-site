import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { cliente, carrito, total, comentarios, archivos } = req.body;

  if (!cliente || !carrito || !total) {
    return res.status(400).json({ error: 'Faltan datos del pedido' });
  }

  const pedidoId = uuidv4();

  // Aquí se podría guardar en una DB o enviar a una API
  const pedido = {
    id: pedidoId,
    cliente,
    carrito,
    total,
    comentarios,
    archivos,
    fecha: new Date().toISOString()
  };

  console.log('Nuevo pedido:', pedido);

  res.status(200).json({ success: true, pedidoId });
}
