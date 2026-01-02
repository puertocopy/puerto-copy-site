import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generarCotizacionPDF(cliente, productos) {
  // Configuración inicial
  const doc = new jsPDF({ format: 'letter', unit: 'mm' });
  
  // Paleta de colores (Basada en Puerto Copy)
  const azulOscuro = '#003082'; // Tu color principal
  const azulClaro = '#E2EEFB';  // Color de fondo suave
  const grisTexto = '#4b5563';
  const grisBorde = '#d1d5db';

  // --- 1. Cargar Logo ---
  const logoUrl = '/logopngazul.png'; // Asegúrate que esta ruta sea correcta
  let logoData = null;
  try {
    logoData = await fetch(logoUrl)
      .then(res => res.blob())
      .then(blob => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      });
  } catch (error) {
    console.error("No se pudo cargar el logo", error);
  }

  // --- 2. Encabezado y Diseño Superior ---
  
  // Logo
  if (logoData) {
    doc.addImage(logoData, 'PNG', 15, 10, 30, 30); // Un poco más grande
  }

  // Datos de la Empresa (Izquierda, debajo del logo o alineado)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(azulOscuro);
  doc.text('Puerto Copy', 15, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(grisTexto);
  doc.text('Villa Colonial #573, Los Portales', 15, 51);
  doc.text('Puerto Vallarta, Jalisco, México', 15, 55);
  doc.text('Tel: 322 191 6038 | contacto@puertocopy.com', 15, 59);

  // Título y Folio (Derecha)
  const fecha = new Date();
  const folio = 'PC-' + fecha.getTime().toString().slice(-5);

  // Bloque visual para el título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(azulOscuro);
  doc.text('COTIZACIÓN', 200, 25, { align: 'right' });

  // Detalles del folio
  doc.setFontSize(10);
  doc.setTextColor(grisTexto);
  doc.text(`Folio: ${folio}`, 200, 33, { align: 'right' });
  doc.text(`Fecha: ${fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}`, 200, 38, { align: 'right' });

  // Línea divisora elegante
  doc.setDrawColor(azulOscuro);
  doc.setLineWidth(0.5);
  doc.line(15, 65, 200, 65);

  // --- 3. Sección del Cliente (Estilo Caja) ---
  
  // Fondo suave para el cliente
  doc.setFillColor(249, 250, 251); // Gris muy claro
  doc.setDrawColor(229, 231, 235); // Borde gris claro
  doc.roundedRect(15, 70, 185, 35, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(azulOscuro);
  doc.text('INFORMACIÓN DEL CLIENTE', 20, 78);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Datos del cliente en dos columnas simuladas o lista limpia
  doc.text(`Nombre: ${cliente.nombre}`, 20, 86);
  doc.text(`Teléfono: ${cliente.telefono}`, 20, 92);
  doc.text(`Correo: ${cliente.correo}`, 110, 86); // Segunda columna virtual
  if (cliente.domicilio) {
    doc.text(`Domicilio: ${cliente.domicilio}`, 110, 92);
  }

  // --- 4. Tabla de Productos ---
  
  const rows = productos.map(p => [
    p.nombre,
    p.variante || 'N/A', // Manejo de variantes vacías
    p.cantidad,
    `$${p.precio.toFixed(2)}`,
    `$${(p.precio * p.cantidad).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 115,
    head: [['CONCEPTO / PRODUCTO', 'DETALLE', 'CANT.', 'P. UNITARIO', 'IMPORTE']],
    body: rows,
    theme: 'plain', // Usamos plain para personalizar nosotros
    styles: {
      fontSize: 9,
      cellPadding: 4,
      font: 'helvetica',
      valign: 'middle',
      lineColor: [230, 230, 230],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: azulOscuro,
      textColor: '#ffffff',
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 'auto' }, // Concepto
      1: { halign: 'left' }, // Detalle
      2: { halign: 'center' }, // Cantidad
      3: { halign: 'right' }, // Precio Unitario
      4: { halign: 'right', fontStyle: 'bold' }  // Importe
    },
    alternateRowStyles: {
      fillColor: [243, 247, 252] // Azul muy pálido alternado
    },
    margin: { top: 20, right: 15, bottom: 20, left: 15 },
  });

  // --- 5. Sección de Totales ---
  
  const finalY = doc.lastAutoTable.finalY + 10;
  const subtotal = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const iva = subtotal * 0.16; 
  const total = subtotal + iva;

  // Dibujar cuadro de totales en la derecha
  const xTotales = 135;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(grisTexto);
  
  // Subtotal
  doc.text('Subtotal:', xTotales, finalY);
  doc.text(`$${subtotal.toFixed(2)}`, 200, finalY, { align: 'right' });
  
  // IVA
  doc.text('IVA (16%):', xTotales, finalY + 6);
  doc.text(`$${iva.toFixed(2)}`, 200, finalY + 6, { align: 'right' });

  // Línea de total
  doc.setDrawColor(azulOscuro);
  doc.setLineWidth(0.5);
  doc.line(xTotales, finalY + 9, 200, finalY + 9);

  // Total Grande
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(azulOscuro);
  doc.text('TOTAL:', xTotales, finalY + 16);
  doc.text(`$${total.toFixed(2)}`, 200, finalY + 16, { align: 'right' });

  // --- 6. Pie de Página y Diseño Inferior ---

  // Barra de color al final de la hoja
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFillColor(azulOscuro);
  doc.rect(0, pageHeight - 15, 216, 15, 'F'); // Barra azul inferior

  // Texto legal
  doc.setFontSize(8);
  doc.setTextColor(100);
  const legalText = 'Vigencia de 15 días. Precios sujetos a cambio sin previo aviso. Se requiere el 50% de anticipo para iniciar trabajos.';
  
  // Colocamos el texto legal justo encima de la barra azul
  doc.text(legalText, 108, pageHeight - 20, { align: 'center' });

  // Texto blanco dentro de la barra azul (web o slogan)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('www.puertocopy.com', 108, pageHeight - 9, { align: 'center' });

  // Guardar/Generar
  return doc.output('blob');
}