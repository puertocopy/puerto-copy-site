export default async function handler(req, res) {
    const { ticket } = req.query;
  
    if (!ticket) {
      return res.status(400).json({ message: 'Falta el número de ticket' });
    }
  
    try {
      const response = await fetch(`https://api.loyverse.com/v1.0/receipts/${ticket}`, {
        headers: {
          Authorization: `Bearer ${process.env.LOYVERSE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ message: errorData.message || 'Error al consultar ticket en Loyverse' });
      }
  
      const data = await response.json();
  
      // ⚠️ Validación por fecha
      const fechaTicket = new Date(data.created_at);
      const fechaActual = new Date();
  
      const mismoMes = (
        fechaTicket.getFullYear() === fechaActual.getFullYear() &&
        fechaTicket.getMonth() === fechaActual.getMonth()
      );
  
      if (!mismoMes) {
        return res.status(400).json({ message: 'Este ticket no corresponde al mes actual y no puede ser facturado.' });
      }
  
      // Si sí es del mes actual
      const productos = data.line_items.map((item) => ({
        nombre: item.item_name,
        cantidad: item.quantity,
        precio_unitario: item.price,
      }));
  
      return res.status(200).json({ productos });
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  }
  