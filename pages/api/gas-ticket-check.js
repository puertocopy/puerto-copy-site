import { checkTicket } from '../../lib/gasTickets';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { ticket = '', storeId = 'PV' } = req.query;
  if (!ticket) {
    return res.status(400).json({ ok: false, error: 'ticket required' });
  }

  try {
    const result = await checkTicket(ticket, storeId);
    return res.status(200).json(result);
  } catch (e) {
    console.error('>>> Error en /api/gas-ticket-check:', e);
    return res.status(500).json({ ok: false, error: e?.message || 'Error interno del servidor' });
  }
}
