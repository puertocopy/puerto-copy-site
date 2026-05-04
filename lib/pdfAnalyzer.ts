import { PDFDocument } from 'pdf-lib';

/**
 * Interfaz que define la respuesta detallada del análisis del PDF.
 */
export interface PDFAnalysisResult {
  numeroDePaginas: number;
  formato: 'CARTA' | 'OFICIO' | 'PLANO' | 'DESCONOCIDO';
  dimensiones: {
    width: number;
    height: number;
    unit: 'pt';
  };
}

/**
 * Analiza un archivo PDF (Buffer o Uint8Array) y detecta páginas y formato real.
 * 
 * @param buffer El contenido del archivo PDF.
 * @returns Promesa con los resultados del análisis.
 */
export async function validarArchivoPDF(buffer: Uint8Array | ArrayBuffer): Promise<PDFAnalysisResult> {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    
    // 1. Número total de páginas
    const numeroDePaginas = pdfDoc.getPageCount();
    
    // Obtenemos dimensiones de la primera página
    const primeraPagina = pdfDoc.getPage(0);
    const { width, height } = primeraPagina.getSize();

    // 2. Clasificación de Formatos (Umbrales en puntos/pt)
    // Tolerancia de +/- 25 pt para variaciones de exportación
    const tol = 25;

    let formato: 'CARTA' | 'OFICIO' | 'PLANO' | 'DESCONOCIDO' = 'DESCONOCIDO';

    // Detección de CARTA (8.5x11 in -> 612x792 pt)
    const esCarta = 
      (Math.abs(width - 612) < tol && Math.abs(height - 792) < tol) ||
      (Math.abs(width - 792) < tol && Math.abs(height - 612) < tol);

    // Detección de OFICIO (8.5x14 in -> 612x1008 pt)
    const esOficio = 
      (Math.abs(width - 612) < tol && Math.abs(height - 1008) < tol) ||
      (Math.abs(width - 1008) < tol && Math.abs(height - 612) < tol);

    // Detección de PLANO (Cualquier dimensión superior a 1000 pt)
    const esPlano = width > 1000 || height > 1000;

    if (esPlano) {
      formato = 'PLANO';
    } else if (esOficio) {
      formato = 'OFICIO';
    } else if (esCarta) {
      formato = 'CARTA';
    }

    return {
      numeroDePaginas,
      formato,
      dimensiones: {
        width: Math.round(width),
        height: Math.round(height),
        unit: 'pt'
      }
    };
  } catch (error) {
    console.error('Error crítico en el análisis del PDF:', error);
    throw new Error('El archivo PDF está dañado o no es válido para impresión.');
  }
}
