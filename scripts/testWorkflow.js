/**
 * scripts/testWorkflow.js
 * Simulación del flujo completo de compra: Análisis -> Cotización -> Loyverse
 */

// 1. Mock de los módulos que creamos (lógica manual para prueba rápida en JS)
function mockAnalizarPDF() {
  console.log('📄 [Analizando PDF...]');
  return {
    numeroDePaginas: 120,
    formato: 'Carta',
    dimensiones: { width: 612, height: 792, unit: 'pt' }
  };
}

function mockObtenerPresupuesto(analisis, tipoServicio) {
  console.log(`💰 [Calculando presupuesto para ${tipoServicio}...]`);
  const numPags = analisis.numeroDePaginas;
  let precioUnitario = 1.0;

  // Escala de mayoreo que definimos
  if (numPags >= 101 && numPags <= 350) {
    precioUnitario = 0.69;
  }

  const subtotal = Number((precioUnitario * numPags).toFixed(2));
  const iva = Number((subtotal * 0.16).toFixed(2));
  const total = Number((subtotal + iva).toFixed(2));

  return { precioUnitario, cantidadPaginas: numPags, subtotal, iva, total };
}

function mockPrepararVentaLoyverse(presupuesto, mapping, pdfName, pdfUrl) {
  console.log('🛒 [Preparando envío a Loyverse...]');
  const variantId = mapping['Carta B/N'] || 'ERROR_ID';

  return {
    receipt_date: new Date().toISOString(),
    source: "Web Checkout",
    note: "Venta generada desde puertocopy.com",
    line_items: [
      {
        variant_id: variantId,
        quantity: presupuesto.cantidadPaginas,
        price: presupuesto.precioUnitario,
        note: `Archivo: ${pdfName} | Descarga: ${pdfUrl}`
      }
    ],
    summary: {
      subtotal: presupuesto.subtotal,
      iva: presupuesto.iva,
      total: presupuesto.total
    }
  };
}

// 2. Ejecución del Test
async function runTest() {
  const mapping = require('../data/loyverse_mapping.json');
  
  // A. Simular análisis de PDF
  const analisis = mockAnalizarPDF();
  
  // B. Simular cotización
  const presupuesto = mockObtenerPresupuesto(analisis, 'Carta B/N');
  
  // C. Preparar ticket para Loyverse
  const payload = mockPrepararVentaLoyverse(
    presupuesto, 
    mapping, 
    'proyecto_final_puerto_copy.pdf', 
    'https://puertocopy.com/uploads/xyz-123.pdf'
  );

  // 3. Resultado Final
  console.log('\n=======================================');
  console.log('        RESULTADO DEL WORKFLOW         ');
  console.log('=======================================');
  console.log(`Servicio: Carta B/N`);
  console.log(`Páginas: ${presupuesto.cantidadPaginas}`);
  console.log(`Precio Mayoreo: $${presupuesto.precioUnitario}`);
  console.log(`Subtotal: $${presupuesto.subtotal}`);
  console.log(`IVA (16%): $${presupuesto.iva}`);
  console.log(`TOTAL: $${presupuesto.total}`);
  console.log('---------------------------------------');
  console.log('JSON FINAL PARA LOYVERSE:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('=======================================');
}

runTest();
