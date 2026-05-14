const PROD_BASE_URL = 'https://api.facturama.mx';

function getFacturamaBaseUrl() {
  let url = process.env.FACTURAMA_API_BASE_URL || PROD_BASE_URL;
  
  // Limpieza robusta: si el usuario puso la URL completa del endpoint o incluye paths, extraemos solo la base
  if (url.includes('/api-lite') || url.includes('/3/') || url.includes('/cfdi/')) {
    try {
      const parsed = new URL(url);
      url = `${parsed.protocol}//${parsed.host}`;
    } catch (e) {
      url = PROD_BASE_URL;
    }
  }
  
  // Eliminar barra diagonal final si existe
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
  // Verificación de seguridad robusta
  const cookies = req.headers.cookie || '';
  const isAuthenticated = cookies.split(';').some(c => c.trim().startsWith('admin_session=true'));

  const GAS_URL = process.env.GAS_WEBAPP_URL;
  const GAS_TOKEN = process.env.GAS_API_TOKEN;

  // Soporte para POST (Delegamos a GAS para los locks transaccionales)
  if (req.method === 'POST') {
    if (!GAS_URL || !GAS_TOKEN) {
      return res.status(500).json({ ok: false, error: 'Missing env GAS_WEBAPP_URL/GAS_API_TOKEN' });
    }
    try {
      const r = await fetch(`${GAS_URL}?token=${encodeURIComponent(GAS_TOKEN)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(req.body),
        redirect: 'follow'
      });

      const text = await r.text();
      return res.status(200).json(JSON.parse(text));
    } catch (e) {
      console.error('>>> Error en POST /api/gas-ticket:', e.message);
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // Soporte para GET
  if (req.method === 'GET') {
    const { action } = req.query;

    // Si la acción es listClients, usamos Facturama directamente
    if (action === 'listClients') {
      if (!isAuthenticated) return res.status(401).json({ ok: false, error: 'No autorizado' });
      try {
        const auth = getFacturamaAuth();
        if (!auth) return res.status(500).json({ ok: false, error: 'Faltan credenciales de Facturama' });

        const baseUrl = getFacturamaBaseUrl();

        console.log('>>> Consultando Directorio a Facturama...');

        const r = await fetch(`${baseUrl}/client`, {
          headers: { 'Authorization': auth, 'Accept': 'application/json' }
        });

        if (!r.ok) throw new Error(`Error de Facturama: ${r.status}`);

        const rawClients = await r.json();
        // Mapeamos al formato que espera el Directorio
        const items = (Array.isArray(rawClients) ? rawClients : []).map(c => ({
          rfc: c.Rfc,
          razonSocial: c.Name,
          email: c.Email,
          cp: c.Address?.ZipCode || '',
          direccion: `${c.Address?.Street || ''} ${c.Address?.ExteriorNumber || ''}`.trim(),
          regimenFiscal: c.FiscalRegime || '',
          usoCfdi: c.CfdiUse || 'G03'
        }));

        return res.status(200).json({ ok: true, items });
      } catch (e) {
        console.error('>>> Error en Directorio Facturama:', e.message);
        return res.status(500).json({ ok: false, error: e.message });
      }
    }

    // Si la acción es LIST, consultamos a GAS para obtener el histórico real con todos los campos (Usuario, UUID, etc.)
    if (action === 'list') {
      if (!isAuthenticated) return res.status(401).json({ ok: false, error: 'No autorizado' });
      
      const { month = String(new Date().getMonth() + 1).padStart(2, '0'), year = String(new Date().getFullYear()), rfc } = req.query;

      try {
        // 1. Consultar a GAS primero (Fuente de verdad transaccional)
        if (!GAS_URL || !GAS_TOKEN) {
          throw new Error('Faltan variables de entorno GAS_WEBAPP_URL o GAS_API_TOKEN');
        }

        const gasParams = new URLSearchParams({
          action: 'list',
          month,
          year,
          token: GAS_TOKEN
        });
        if (rfc) gasParams.set('rfc', rfc);

        console.log('>>> Consultando historial a GAS:', month, year);
        const gasRes = await fetch(`${GAS_URL}?${gasParams.toString()}`, {
          redirect: 'follow'
        });
        const gasData = await gasRes.json();

        if (gasData.ok && Array.isArray(gasData.items) && gasData.items.length > 0) {
          console.log(`>>> Se encontraron ${gasData.items.length} registros en GAS`);
          
          // Mapeamos los datos de GAS (Estructura de 23 columnas)
          const items = gasData.items.map(f => ({
            fechaTicket: f.fechaTicket || f.createdAt,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
            ticket: f.ticket || 'S/N',
            storeId: f.storeId,
            razonSocial: f['Razon Social'] || f.razonSocial || f.razon || 'PÚBLICO EN GENERAL',
            rfc: f.rfc,
            email: f.Correo || f.email,
            total: f.total,
            status: f.status,
            facturamaId: f.facturamaId,
            uuid: f.UUID || f.uuid || f.facturamaId,
            usuario: f.Usuario || f.usuario || '',
            metodoPago: f.MetodoPago || f.metodoPago || 'PUE',
            uuidRelacion: f.UUIDRelacion || '',
            fechaPago: f['Fecha de pago'] || f.fechaPago || '',
            codigoPostal: f['Codigo Postal'] || f.codigoPostal || '',
            usoCfdi: f['Uso de CFDI'] || f.usoCfdi || '',
            regimenFiscal: f['Regimen Fiscal'] || f.regimenFiscal || '',
            errorMsg: f.errorMsg || ''
          }));

          return res.status(200).json({ ok: true, items });
        }

        // 2. Fallback: Si GAS no devuelve nada, intentamos Facturama (como respaldo)
        console.log('>>> GAS no devolvió datos o está vacío, usando Facturama como fallback...');
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
          razonSocial: f.Receiver?.Name || f.ReceiverName || 'PÚBLICO EN GENERAL',
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
        console.error('>>> Error en listado consolidado:', e.message);
        return res.status(500).json({ ok: false, error: e.message });
      }
    }

    // Para otras acciones (como check), seguimos intentando con GAS
    if (!GAS_URL || !GAS_TOKEN) {
      return res.status(500).json({ ok: false, error: 'Missing env GAS_WEBAPP_URL/GAS_API_TOKEN' });
    }

    try {
      const query = new URLSearchParams(req.query);
      query.set('token', GAS_TOKEN);
      query.set('_t', Date.now().toString()); // Evitar caché
      
      const r = await fetch(`${GAS_URL}?${query.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow'
      });

      const text = await r.text();
      return res.status(200).json(JSON.parse(text));
    } catch (e) {
      console.error('>>> Error en GET /api/gas-ticket:', e.message);
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
