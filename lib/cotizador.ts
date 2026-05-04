import { PDFAnalysisResult } from './pdfAnalyzer';
import reglasPrecios from '../data/reglas_precios.json';

/**
 * Interfaz para la configuración elegida por el usuario.
 */
export interface UserConfig {
  tipoServicio: 'CARTA_BN' | 'CARTA_COLOR' | 'OFICIO_BN' | 'PLANO_BN' | 'PLANO_COLOR';
  cobertura?: 'LINEAS' | 'FONDO'; // Solo para planos
  cantidadJuegos?: number;
}

/**
 * Interfaz para el resultado del cálculo de precio.
 */
export interface PrecioCalculado {
  precio_unitario: number;
  subtotal: number;
  iva_16: number;
  total_final: number;
  error?: string;
}

/**
 * Función central del motor de precios de Puerto Copy.
 * Calcula el precio final basándose en el análisis técnico del PDF y las reglas de negocio.
 * 
 * @param datosPDF Resultado de la función validarArchivoPDF.
 * @param configuracionUsuario Selección del usuario en el frontend.
 * @returns Un objeto con el desglose del precio o un error de validación.
 */
export function calcularPrecioFinal(
  datosPDF: PDFAnalysisResult,
  configuracionUsuario: UserConfig
): PrecioCalculado {
  const { numeroDePaginas, formato } = datosPDF;
  const { tipoServicio, cobertura, cantidadJuegos = 1 } = configuracionUsuario;

  // 1. VALIDACIONES DE SEGURIDAD (BLOQUEO)
  
  // Si el archivo es un Plano pero el usuario eligió Impresión Estándar (Carta/Oficio)
  if (formato === 'PLANO' && !tipoServicio.includes('PLANO')) {
    throw new Error('Validación fallida: El archivo subido es un Plano, pero has seleccionado Impresión Estándar. Por favor elige el servicio de Planos.');
  }

  // Si el archivo es Carta/Oficio pero el usuario eligió Plano
  if ((formato === 'CARTA' || formato === 'OFICIO') && tipoServicio.includes('PLANO')) {
    throw new Error('Validación fallida: El archivo subido es tamaño estándar, pero has seleccionado un servicio de Planos.');
  }

  // Validación de cobertura obligatoria para Planos
  if (tipoServicio.includes('PLANO') && !cobertura) {
    throw new Error('Por favor selecciona el tipo de cobertura (Líneas o Fondo) para poder cotizar tu plano.');
  }

  let precioUnitario = 0;

  // 2. LÓGICA DE PRECIOS POR ESCALA (CARTA / OFICIO)
  if (tipoServicio.includes('CARTA') || tipoServicio.includes('OFICIO')) {
    const escalas = reglasPrecios.escalas_impresion[tipoServicio];
    
    if (!escalas) {
      throw new Error(`No se encontraron escalas de precio para el servicio: ${tipoServicio}`);
    }

    // Buscamos la escala correspondiente al número de páginas
    const escalaCorrecta = escalas.find(e => 
      numeroDePaginas >= e.min && numeroDePaginas <= e.max
    );

    if (escalaCorrecta) {
      precioUnitario = escalaCorrecta.precio;
    } else {
      // Si no cae en ninguna escala, usamos el último precio definido (mayoreo máximo)
      precioUnitario = escalas[escalas.length - 1].precio;
    }
  }

  // 3. LÓGICA DE PRECIOS PARA PLANOS
  else if (tipoServicio.includes('PLANO')) {
    const esColor = tipoServicio.includes('COLOR');
    const colorTag = esColor ? 'COLOR' : 'BN';
    
    // Generamos la llave para el objeto de planos (Ej: "90x120_LINEAS_BN")
    // Por ahora asumimos 90x120 como base, pero esto puede expandirse con las dimensiones reales de datosPDF
    const key = `90x120_${cobertura}_${colorTag}`;
    precioUnitario = reglasPrecios.planos_precios[key] || 65.00;
  }

  // 4. CÁLCULOS FINALES
  // Subtotal = (Precio Unitario * Páginas) * Cantidad de juegos/copias
  const subtotal = (precioUnitario * numeroDePaginas) * cantidadJuegos;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  return {
    precio_unitario: precioUnitario,
    subtotal: Number(subtotal.toFixed(2)),
    iva_16: Number(iva.toFixed(2)),
    total_final: Number(total.toFixed(2))
  };
}
