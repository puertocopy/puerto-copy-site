import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * Interfaz para las opciones del token de Mercado Pago
 */
export interface MercadoPagoAuthOptions {
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  isSandbox?: boolean;
}

/**
 * Obtiene un Access Token válido de Mercado Pago.
 * 
 * Si ya se tiene MERCADOPAGO_ACCESS_TOKEN en las variables de entorno, lo usa directamente.
 * Si en su lugar se configuró CLIENT_ID y CLIENT_SECRET, utiliza la API /oauth/token
 * (grant_type: client_credentials) para generar/renovar el Access Token automáticamente.
 */
export async function obtenerAccessToken(): Promise<string> {
  const envToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
  const isSandbox = process.env.MERCADOPAGO_SANDBOX !== 'false';

  // 1. Si existe un Access Token directo configurado y no es el marcador de posición
  if (envToken && !envToken.includes('TEST-0000000000000000') && !envToken.includes('APP_USR-0000000000000000')) {
    return envToken;
  }

  // 2. Si se proporcionaron Client ID y Client Secret, solicitamos el Access Token mediante OAuth (/oauth/token)
  if (clientId && clientSecret && !clientId.includes('0000000000000000')) {
    console.log('🔄 Generando Access Token mediante OAuth (/oauth/token) con Client Credentials...');
    
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        test_token: isSandbox ? 'true' : 'false',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      console.error('❌ Error al obtener token por OAuth:', data);
      throw new Error(data.message || data.error || 'No se pudo autenticar con Mercado Pago vía OAuth.');
    }

    console.log('✅ Access Token obtenido con éxito vía OAuth');
    return data.access_token;
  }

  throw new Error(
    'Faltan las credenciales de Mercado Pago. Debes configurar MERCADOPAGO_ACCESS_TOKEN o la dupla MERCADOPAGO_CLIENT_ID + MERCADOPAGO_CLIENT_SECRET en el archivo .env.local'
  );
}

/**
 * Crea una preferencia de pago en Mercado Pago Checkout Pro
 */
export async function crearPreferencia(items: any[], orderId: string, baseUrl: string) {
  const accessToken = await obtenerAccessToken();
  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  const mpItems = items.map((item: any, idx: number) => {
    const precioCalculado = item.total ? item.total / item.cantidad : item.precioUnitario || 0;

    return {
      id: item.id || `item-${idx + 1}`,
      title: `${item.nombre}${item.variante ? ` (${item.variante})` : ''}`,
      description: item.needsFile ? 'Servicio de Impresión/Plano' : 'Producto de Papelería',
      quantity: Number(item.cantidad) || 1,
      unit_price: Number(precioCalculado.toFixed(2)),
      currency_id: 'MXN',
    };
  });

  const isSandbox = process.env.MERCADOPAGO_SANDBOX !== 'false';
  const refPedido = orderId || `PC-${Date.now()}`;

  const preferenceData = {
    body: {
      items: mpItems,
      external_reference: refPedido,
      back_urls: {
        success: `${baseUrl}/checkout/respuesta?status=success&ref=${refPedido}`,
        failure: `${baseUrl}/checkout/respuesta?status=failure&ref=${refPedido}`,
        pending: `${baseUrl}/checkout/respuesta?status=pending&ref=${refPedido}`,
      },
      auto_return: 'approved',
      statement_descriptor: 'PUERTO COPY',
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
    },
  };

  const response = await preference.create(preferenceData);

  const redirectUrl = isSandbox && response.sandbox_init_point
    ? response.sandbox_init_point
    : response.init_point;

  return {
    preferenceId: response.id,
    initPoint: response.init_point,
    sandboxInitPoint: response.sandbox_init_point,
    redirectUrl,
    isSandbox,
  };
}
