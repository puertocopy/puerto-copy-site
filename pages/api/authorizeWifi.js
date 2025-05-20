/**
 * Lugar para tu lógica real de “liberar” al cliente:
 *  - Llamar a la API de tu router (MikroTik, UniFi, etc.)
 *  - Registrar la IP/MAC en tu RADIUS/Hotspot
 *  - O simplemente devolver 200 si lo resuelves en otra capa.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }
  
    // TODO: sustituye este bloque por la integración real
    try {
      console.log('Autorizando cliente WiFi…');
      // …tu código…
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Fallo al autorizar WiFi' });
    }
  }
  