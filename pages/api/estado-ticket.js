export default async function handler(req, res) {
    try {
      const { ticket } = req.query;
      if (!ticket) return res.status(400).json({ success: false, error: 'Missing ticket' });
  
      // Pega tu URL /exec NUEVA aquí o usa variable de entorno
      const GAS = process.env.GAS_FACTURAS_URL
        || 'https://script.google.com/macros/s/AKfycbybBXxsXpJSF-sp-PeTsFd5LVzS86Lf4MVJ7J2r7AtwkuLpdG3he2KHU7jngfCz2L_k/exec';
  
      const ticketDigits = String(ticket).replace(/\D+/g, '');
      const url = `${GAS}?ticket=${encodeURIComponent(ticketDigits)}`;
  
      const r = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
      const j = await r.json().catch(() => null);
  
      if (!r.ok || !j) {
        return res.status(502).json({ success: false, error: 'Upstream error', status: r.status });
      }
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(j);
    } catch (err) {
      return res.status(500).json({ success: false, error: err?.message || 'Internal error' });
    }
  }
  