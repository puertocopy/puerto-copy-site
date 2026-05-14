import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generarCotizacionPDF(cliente, productos) {
  // Configuración inicial con compresión activada para reducir peso
  const doc = new jsPDF({ 
    format: 'letter', 
    unit: 'mm',
    compress: true // Activa compresión interna
  });
  
  // Colores Institucionales Puerto Copy
  const navyBlue = '#002D56'; 
  const lightGray = '#F3F4F6';
  const textMain = '#1F2937';
  const textMuted = '#6B7280';
  const borderGrey = '#E5E7EB';

  // --- 1. Cargar Logo ---
  const logoUrl = '/logopngazul.png'; // Usamos la versión de 64KB
  let logoData = null;
  try {
    const res = await fetch(logoUrl);
    const blob = await res.blob();
    logoData = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("No se pudo cargar el logo", error);
  }

  // --- 2. Encabezado ---
  
  // Logo (Cuadrado 1800x1800, ajustamos a 32x32mm para mejor simetría)
  if (logoData) {
    doc.addImage(logoData, 'PNG', 15, 10, 32, 32, 'LOGO', 'FAST'); 
  }

  // Título y Meta-data (Derecha)
  const fecha = new Date();
  const folio = 'PC-' + fecha.getFullYear() + '-' + fecha.getTime().toString().slice(-4);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(navyBlue);
  doc.text('COTIZACIÓN', 200, 24, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(navyBlue);
  
  // Bloque de Meta-data alineado
  const metaX = 160;
  doc.text('FOLIO:', metaX, 32);
  doc.text('FECHA:', metaX, 37);
  doc.text('VIGENCIA:', metaX, 42);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMain);
  doc.text(folio, 200, 32, { align: 'right' });
  doc.text(fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }), 200, 37, { align: 'right' });
  doc.text('15 días naturales', 200, 42, { align: 'right' });

  // Línea gruesa Navy Blue (como en el HTML)
  doc.setDrawColor(navyBlue);
  doc.setLineWidth(1.2);
  doc.line(15, 50, 200, 50);

  // --- 3. Cuadrícula de Información ---
  
  const infoY = 60;
  
  // Columna 1: Información del Cliente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(navyBlue);
  doc.text('INFORMACIÓN DEL CLIENTE', 15, infoY);
  doc.setDrawColor(borderGrey);
  doc.setLineWidth(0.2);
  doc.line(15, infoY + 2, 100, infoY + 2);

  doc.setFontSize(11);
  doc.setTextColor(textMain);
  const clientName = cliente.nombre || 'PÚBLICO EN GENERAL';
  doc.text(clientName.substring(0, 45), 15, infoY + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMain);
  if (cliente.atencion) doc.text(`Atención: ${cliente.atencion}`, 15, infoY + 13);
  doc.setTextColor(textMuted);
  doc.text(`Tel: ${cliente.telefono || 'N/A'}`, 15, infoY + 18);
  doc.text(`Email: ${cliente.correo || 'N/A'}`, 15, infoY + 23);

  // Columna 2: Datos de Puerto Copy
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(navyBlue);
  doc.text('DATOS DE PUERTO COPY', 115, infoY);
  doc.line(115, infoY + 2, 200, infoY + 2);

  doc.setFontSize(10);
  doc.setTextColor(textMain);
  doc.text('Puerto Copy - Centro de Impresión', 115, infoY + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted);
  doc.text('Villa Colonial 573, Los Portales.', 115, infoY + 13);
  doc.text('Puerto Vallarta, Jal. C.P. 48290', 115, infoY + 18);
  doc.text('Tel: 322 191 6038 | impresiones@puertocopy.com', 115, infoY + 23);

  // --- 4. Tabla de Servicios ---
  
  const tableRows = productos.map(p => {
    const precioNeto = Number(p.precio) || 0;
    const importeNeto = precioNeto * (Number(p.cantidad) || 0);
    
    return [
      { 
        content: p.nombre, 
        styles: { fontStyle: 'bold' } 
      },
      { content: p.cantidad.toString(), styles: { halign: 'center' } },
      { content: `$${precioNeto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, styles: { halign: 'right' } },
      { content: `$${importeNeto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, styles: { halign: 'right', fontStyle: 'bold' } }
    ];
  });

  autoTable(doc, {
    startY: 95,
    head: [['Descripción del Servicio', 'Cant.', 'Unitario', 'Total']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: navyBlue,
      textColor: '#FFFFFF',
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textMain,
      cellPadding: 4,
      lineColor: borderGrey,
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 105 }, 
      1: { cellWidth: 20 },  
      2: { cellWidth: 30 },  
      3: { cellWidth: 30 }   
    },
    alternateRowStyles: {
      fillColor: [250, 251, 252]
    },
    margin: { left: 15, right: 15 },
    didDrawCell: (data) => {
      // Si hay variante, la dibujamos debajo del nombre con fuente más pequeña (simulando <small>)
      if (data.section === 'body' && data.column.index === 0) {
        const p = productos[data.row.index];
        if (p.variante) {
          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(textMuted);
          doc.text(p.variante, data.cell.x + 4, data.cell.y + 8.5);
        }
      }
    }
  });

  // --- 5. Totales y Términos ---
  
  let finalY = doc.lastAutoTable.finalY + 12;
  const pageHeight = doc.internal.pageSize.height;

  // Si nos quedamos sin espacio al final de la hoja, saltamos (aunque en carta es difícil con pocos items)
  if (finalY > pageHeight - 50) {
    doc.addPage();
    finalY = 20;
  }
  
  const totalNeto = productos.reduce((acc, p) => acc + (Number(p.precio) * Number(p.cantidad)), 0);
  const subtotal = totalNeto / 1.16;
  const iva = totalNeto - subtotal;

  // Términos y Condiciones
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(navyBlue);
  doc.text('TÉRMINOS Y CONDICIONES', 15, finalY);
  
  doc.setFillColor(lightGray);
  doc.roundedRect(15, finalY + 3, 100, 18, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted);
  doc.text('• Forma de Pago: 50% de anticipo y 50% contra entrega.', 18, finalY + 9);
  doc.text('• Precios sujetos a cambio sin previo aviso. Vigencia 15 días.', 18, finalY + 14);

  // Cuadro de Totales
  const xLabel = 155;
  const xValue = 200;

  doc.setFontSize(9);
  doc.setTextColor(textMain);
  doc.text('Subtotal:', xLabel, finalY + 5);
  doc.text(`$${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, xValue, finalY + 5, { align: 'right' });

  doc.text('IVA (16%):', xLabel, finalY + 11);
  doc.text(`$${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, xValue, finalY + 11, { align: 'right' });

  doc.setDrawColor(navyBlue);
  doc.setLineWidth(0.8);
  doc.line(xLabel, finalY + 14, xValue, finalY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(navyBlue);
  doc.text('TOTAL:', xLabel, finalY + 21);
  doc.text(`$${totalNeto.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, xValue, finalY + 21, { align: 'right' });

  // --- 6. Pie de Página ---
  
  doc.setDrawColor(borderGrey);
  doc.setLineWidth(0.2);
  doc.line(15, pageHeight - 20, 200, pageHeight - 20);

  doc.setFontSize(8.5);
  doc.setTextColor(textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text('Gracias por su preferencia. Puerto Copy - Calidad que se imprime.', 108, pageHeight - 14, { align: 'center' });
  doc.text('Villa Colonial 573, Los Portales, Puerto Vallarta | Tel: 322 191 6038', 108, pageHeight - 9, { align: 'center' });

  // Propiedades del documento para limpieza
  doc.setProperties({
    title: `Cotización ${folio}`,
    subject: 'Puerto Copy Quotation',
    author: 'Puerto Copy Admin',
    creator: 'Puerto Copy System'
  });

  return doc.output('blob');
}
