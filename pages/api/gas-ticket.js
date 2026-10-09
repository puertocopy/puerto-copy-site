import {
  reserveTicket,
  finalizeTicket,
  failTicket,
  listInvoices,
  checkTicket
} from '../../lib/gasTickets';
import pool from '../../lib/db';

const PROD_BASE_URL = 'https://api.facturama.mx';

function getFacturamaBaseUrl() {
  let url = process.env.FACTURAMA_API_BASE_URL || PROD_BASE_URL;
  
  if (url.includes('/api-lite') || url.includes('/3/') || url.includes('/cfdi/')) {
    try {
      const parsed = new URL(url);
      url = `${parsed.protocol}//${parsed.host}`;
    } catch (e) {
      url = PROD_BASE_URL;
    }
  }
  
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  
  return url;
}

function getFacturamaAuth() {
  const user = process.env.FACTURAMA_USER;
  const pass = process.env.FACTURAMA_PASSWORD;
  if (!user || !pass) return null;
  return 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
}

export default async function handler(req, res) {
  const cookies = req.headers.cookie || '';
  const isAuthenticated = cookies.split(';').some(c => c.trim().startsWith('admin_session=true'));

  // ==========================================
  // SOPORTE PARA POST (Operaciones de tickets)
  // ==========================================
  if (req.method === 'POST') {
    const { action, ...payload } = req.body || {};

    try {
      if (action === 'reserve') {
        const result = await reserveTicket(payload);
        return res.status(200).json(result);
      }

      if (action === 'finalize') {
        const result = await finalizeTicket(payload);
        return res.status(200).json(result);
      }

      if (action === 'fail') {
        const result = await failTicket(payload);
        return res.status(200).json(result);
      }

      return res.status(400).json({ ok: false, error: `Acción POST desconocida: ${action}` });
    } catch (e) {
      console.error('>>> Error en POST /api/gas-ticket:', e.message);
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // ==========================================
  // SOPORTE PARA GET (Listados y consultas)
  // ==========================================
  if (req.method === 'GET') {
    const { action } = req.query;

    // Directorio de Clientes (para Admin)
    if (action === 'listClients') {
      if (!isAuthenticated) return res.status(401).json({ ok: false, error: 'No autorizado' });

      try {
        console.log('>>> Consultando Directorio de Clientes en MySQL...');
        const [rows] = await pool.query(`
          SELECT 
            rfc,
            MAX(razon_social) AS razonSocial,
            MAX(regimen_fiscal) AS regimen,
            MAX(regimen_fiscal) AS regimenFiscal,
            MAX(codigo_postal) AS cp,
            MAX(COALESCE(correo, email)) AS email,
            MAX(uso_cfdi) AS usoCfdi,
            MAX(ticket) AS code
          FROM tickets_facturados
          WHERE rfc IS NOT NULL AND rfc != ''
          GROUP BY rfc
          ORDER BY MAX(updated_at) DESC
        `);

        if (Array.isArray(rows) && rows.length > 0) {
          const items = rows.map(c => ({
            rfc: c.rfc || '',
            razonSocial: c.razonSocial || '',
            regimen: c.regimen || '',
            cp: c.cp || '',
            regimenFiscal: c.regimenFiscal || '',
            email: c.email || '',
            usoCfdi: c.usoCfdi || 'G03',
            code: c.code || ''
          }));
          return res.status(200).json({ ok: true, items });
        }

        // Si MySQL no tiene clientes y existe URL de GAS, fallback a GAS
        const GAS_URL = process.env.GAS_WEBAPP_URL;
        const GAS_TOKEN = process.env.GAS_API_TOKEN;
        if (GAS_URL && GAS_TOKEN) {
          console.log('>>> MySQL vacío para clientes, intentando fallback GAS...');
          const r = await fetch(`${GAS_URL}?token=${encodeURIComponent(GAS_TOKEN)}&action=listarclientes`, {
            headers: { 'Accept': 'application/json' },
            redirect: 'follow'
          });
          if (r.ok) {
            const data = await r.json();
            if (data.ok && Array.isArray(data.items)) {
              return res.status(200).json({ ok: true, items: data.items });
            }
          }
        }

        return res.status(200).json({ ok: true, items: [] });
      } catch (e) {
        console.error('>>> Error en Directorio de Clientes:', e.message);
        return res.status(500).json({ ok: false, error: e.message });
      }
    }

    // Listado de Facturas (para Admin)
    if (action === 'list') {
      if (!isAuthenticated) return res.status(401).json({ ok: false, error: 'No autorizado' });

      const {
        month = String(new Date().getMonth() + 1).padStart(2, '0'),
        year = String(new Date().getFullYear()),
        rfc
      } = req.query;

      try {
        console.log('>>> Consultando historial de facturas en MySQL:', { month, year, rfc });
        const result = await listInvoices({ month, year, rfc });

        if (result.ok && Array.isArray(result.items) && result.items.length > 0) {
          console.log(`>>> Se encontraron ${result.items.length} registros en MySQL`);
          return res.status(200).json({ ok: true, items: result.items });
        }

        // Fallback a Facturama si MySQL no tiene registros aún para este mes
        console.log('>>> MySQL sin registros para el periodo, consultando Facturama como fallback...');
        const auth = getFacturamaAuth();
        if (!auth) return res.status(200).json({ ok: true, items: [] });

        const baseUrl = getFacturamaBaseUrl();
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        const start = `01/${month}/${year}`;
        const end = `${String(lastDay).padStart(2, '0')}/${month}/${year}`;

        const params = new URLSearchParams({ 
          type: 'issuedLite', 
          dateStart: start, 
          dateEnd: end, 
          page: '0' 
        });
        if (rfc) params.set('rfc', rfc);

        const response = await fetch(`${baseUrl}/cfdi?${params.toString()}`, {
          headers: { 'Authorization': auth, 'Accept': 'application/json' }
        });

        let rawItems = [];
        if (response.ok) {
          const data = await response.json();
          rawItems = Array.isArray(data) ? data : (data.Data || data.data || []);
        }

        const itemsFallback = rawItems.map(f => ({
          fechaTicket: f.Date,
          createdAt: f.Date,
          ticket: f.OrderNumber || f.Folio || 'S/N',
          razonSocial: f.Receiver?.Name || f.ReceiverName || ((f.Receiver?.Rfc === 'XAXX010101000' || f.ReceiverRfc === 'XAXX010101000') ? 'PÚBLICO EN GENERAL' : ''),
          rfc: f.Receiver?.Rfc || f.ReceiverRfc || 'XAXX010101000',
          total: f.Total,
          metodoPago: f.PaymentMethod,
          formaPago: f.PaymentForm,
          facturamaId: f.Id,
          uuid: f.Uuid || f.Id,
          status: 'TIMBRADO'
        }));

        return res.status(200).json({ ok: true, items: itemsFallback });
      } catch (e) {
        console.error('>>> Error en listado de facturas:', e.message);
        return res.status(500).json({ ok: false, error: e.message });
      }
    }

    // Consulta puntual de un ticket (action=check)
    if (action === 'check') {
      const { ticket = '', storeId = 'PV' } = req.query;
      try {
        const result = await checkTicket(ticket, storeId);
        return res.status(200).json(result);
      } catch (e) {
        console.error('>>> Error en check de ticket:', e.message);
        return res.status(500).json({ ok: false, error: e.message });
      }
    }

    return res.status(400).json({ ok: false, error: `Acción GET desconocida: ${action}` });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
