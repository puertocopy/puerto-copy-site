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
  // Verificación de seguridad: Movida a acciones específicas (list, listClients)
  const cookies = req.headers.cookie;
  const isAuthenticated = cookies && cookies.includes('admin_session=true');

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

    // Si la acción es LIST, usamos Facturama directamente ya que GAS no lo soporta
    if (action === 'list') {
      if (!isAuthenticated) return res.status(401).json({ ok: false, error: 'No autorizado' });
      try {
        const auth = getFacturamaAuth();
        if (!auth) {
          return res.status(500).json({ ok: false, error: 'Faltan credenciales de Facturama (FACTURAMA_USER/PASSWORD)' });
        }

        const baseUrl = getFacturamaBaseUrl();

        const { month = '01', year = '2024', rfc } = req.query;
        
        // Construir rango de fechas para el mes (YYYY-MM-DD)
        const start = `${year}-${month}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        const end = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        const params = new URLSearchParams({
          type: 'issued',
          DateStart: start,
          DateEnd: end
        });
        
        if (rfc) params.set('keyword', rfc);

        // Intentamos primero con api-lite (Multiemisor)
        const fetchUrlLite = `${baseUrl}/api-lite/cfdis?${params.toString()}`;
        console.log('>>> Consultando lista a Facturama (Lite):', fetchUrlLite);

        const rLite = await fetch(fetchUrlLite, {
          headers: { 'Authorization': auth, 'Accept': 'application/json' }
        });

        let rawItems = [];
        if (rLite.ok) {
          const data = await rLite.json();
          rawItems = Array.isArray(data) ? data : (data.Data || data.data || (Array.isArray(data.items) ? data.items : []));
        }

        // Si no hay resultados o falló, intentamos con la lista estándar
        if (rawItems.length === 0) {
          const fetchUrlStd = `${baseUrl}/cfdi?${params.toString()}`;
          console.log('>>> Consultando lista a Facturama (Std):', fetchUrlStd);
          const rStd = await fetch(fetchUrlStd, {
            headers: { 'Authorization': auth, 'Accept': 'application/json' }
          });
          if (rStd.ok) {
            const dataStd = await rStd.json();
            const stdItems = Array.isArray(dataStd) ? dataStd : (dataStd.Data || dataStd.data || (Array.isArray(dataStd.items) ? dataStd.items : []));
            rawItems = [...rawItems, ...stdItems];
          }
        }
        
        console.log(`>>> Se encontraron ${rawItems.length} facturas`);

        const items = rawItems.map(f => {
          // El RFC suele estar en f.Receiver.Rfc
          const rfc = f.Receiver?.Rfc || f.Rfc || f.rfc || 'XAXX010101000';
          const cliente = f.Receiver?.Name || f.Name || f.nombre || 'PÚBLICO EN GENERAL';
          
          return {
            fechaTicket: f.Date,
            createdAt: f.Date,
            ticket: f.OrderNumber || 'S/N',
            razonSocial: cliente,
            rfc: rfc,
            total: f.Total,
            metodoPago: f.PaymentMethod,
            formaPago: f.PaymentForm,
            facturamaId: f.Id,
            uuid: f.Uuid || f.Id
          };
        });

        return res.status(200).json({ ok: true, items });
      } catch (e) {
        console.error('>>> Error listando facturas de Facturama:', e.message);
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
