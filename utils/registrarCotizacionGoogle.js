export async function registrarCotizacionEnGoogle(data) {
    try {
      const response = await fetch('/api/registrar-cotizacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error al registrar cotización en Google:', error);
      throw error;
    }
  }
  