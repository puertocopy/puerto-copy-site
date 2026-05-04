const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default async function handler(req, res) {
    const { ticket } = req.query;
    console.log("AUDITORÍA LOYVERSE - BACKEND RECIBE:", ticket);
    console.log("AUDITORÍA LOYVERSE - TIPO DE VALOR:", isUUID(ticket) ? "UUID" : "RECEIPT_NUMBER (o formato corto)");
    console.log("AUDITORÍA LOYVERSE - LONGITUD:", ticket?.length);
  
    if (!ticket) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return res.status(400).json({ message: 'No se pudo verificar el ticket.' });
    }
  
    try {
      // Timeout anterior: ninguno explícito. Nuevo timeout: 300,000 ms.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);
      const urlFinal = `https://api.loyverse.com/v1.0/receipts/${ticket}`;
      console.log("AUDITORÍA LOYVERSE - REQUEST A LOYVERSE:", urlFinal);

      const response = await fetch(urlFinal, {
        headers: {
          Authorization: `Bearer ${process.env.LOYVERSE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      console.log("AUDITORÍA LOYVERSE - STATUS RESPUESTA:", response.status);
  
      if (!response.ok) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return res.status(response.status).json({ message: 'No se pudo verificar el ticket.' });
      }
  
      const data = await response.json();
      console.log("AUDITORÍA LOYVERSE - DATA RECIBIDA (receipt_id):", data?.receipt_id);
      console.log("AUDITORÍA LOYVERSE - DATA RECIBIDA (receipt_number):", data?.receipt_number);
  
      // ⚠️ Validación por fecha
      const fechaTicket = new Date(data.created_at);
      const fechaActual = new Date();
  
      const mismoMes = (
        fechaTicket.getFullYear() === fechaActual.getFullYear() &&
        fechaTicket.getMonth() === fechaActual.getMonth()
      );
  
      if (!mismoMes) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return res.status(400).json({ message: 'No se pudo verificar el ticket.' });
      }
  
      // Si sí es del mes actual
      const productos = data.line_items.map((item) => ({
        nombre: item.item_name,
        cantidad: item.quantity,
        precio_unitario: item.price,
        total_money: item.total_money,
        gross_total_money: item.gross_total_money,
        line_taxes: item.line_taxes,
      }));

      const payments = Array.isArray(data.payments) ? data.payments : [];
  
      return res.status(200).json({ productos, payments, total_money: data.total_money, created_at: data.created_at });
    } catch (error) {
      if (error?.name === 'AbortError') {
        return res.status(504).json({
          ok: false,
          code: 'TIMEOUT',
          message: 'La operación tardó demasiado, reintenta.'
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      return res.status(500).json({ message: 'No se pudo verificar el ticket.' });
    }
  }
  
