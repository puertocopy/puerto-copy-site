/**
 * lib/loyverse.ts
 * Utilidades para preparar la integración con la API de Loyverse.
 */

export interface CarritoItem {
  id: string;
  nombreServicio: string; // Ej: 'Carta B/N', 'Plano B/N 90x120'
  cantidad: number;
  precioUnitario: number; // El precio calculado por obtenerPresupuesto()
  pdfName: string;
  pdfUrl: string;
}

import mapping from '../data/loyverse_mapping.json';

/**
 * Mapeo de servicios web a IDs de variantes de Loyverse.
 * Cargado automáticamente desde data/loyverse_mapping.json
 */
const MAPEO_LOYVERSE: Record<string, string> = mapping;

/**
 * Prepara el cuerpo del recibo para enviar a la API de Loyverse.
 * Documentación: https://developer.loyverse.com/docs/api/v1.0/receipts/
 * 
 * @param carrito Lista de items del carrito con sus detalles de PDF.
 * @returns Objeto estructurado para el endpoint /receipts de Loyverse.
 */
export function prepararVentaLoyverse(carrito: CarritoItem[]) {
  const lineItems = carrito.map(item => {
    // Buscamos el ID de variante en nuestro mapeo
    const variantId = MAPEO_LOYVERSE[item.nombreServicio] || 'VAR_ID_GENERICO';

    return {
      variant_id: variantId,
      quantity: item.cantidad,
      price: item.precioUnitario, // Enviamos el precio calculado en la web
      note: `Archivo: ${item.pdfName} | Descarga: ${item.pdfUrl}`
    };
  });

  // Estructura para el endpoint /receipts
  return {
    receipt_date: new Date().toISOString(),
    source: "Web Checkout",
    note: "Venta generada desde puertocopy.com",
    line_items: lineItems,
    // Puedes añadir total_money si prefieres enviarlo ya calculado, 
    // pero Loyverse suele recalcularlo basándose en line_items.
  };
}

/**
 * Ejemplo de cómo enviarías esto a Loyverse (Pseudo-código)
 */
export async function enviarALoyverse(payload: any, apiKey: string) {
  const response = await fetch('https://api.loyverse.com/v1.0/receipts', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
}
