import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generarCotizacionPDF(cliente, productos) {
  const doc = new jsPDF();
  const azul = '#1e3a8a';

  // 1. Logo desde public/
  const logoUrl = '/logopngazul.png';
  const logoImage = await fetch(logoUrl)
    .then(res => res.blob())
    .then(blob => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    });

  // 2. Encabezado
  doc.addImage(logoImage, 'PNG', 15, 10, 25, 25);
  doc.setTextColor(azul);
  doc.setFontSize(18);
  doc.text('Puerto Copy', 45, 20);

  doc.setFontSize(11);
  doc.text('Villa Colonial #573, Los Portales', 45, 27);
  doc.text('Puerto Vallarta, Jalisco, México', 45, 32);
  doc.text('Tel: 3223499334 | contacto@puertocopy.com', 45, 37);

  const fecha = new Date();
  const folio = 'PC-' + fecha.getTime().toString().slice(-5);
  doc.text(`Folio: ${folio}`, 195, 20, { align: 'right' });
  doc.text(`Fecha: ${fecha.toLocaleDateString()}`, 195, 26, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.line(15, 42, 195, 42);

  // 3. Cliente
  doc.setFontSize(12);
  doc.setTextColor('#000000');
  doc.text(`Cliente: ${cliente.nombre}`, 15, 52);
  doc.text(`Teléfono: ${cliente.telefono}`, 15, 58);
  doc.text(`Correo: ${cliente.correo}`, 15, 64);
  if (cliente.domicilio) doc.text(`Domicilio: ${cliente.domicilio}`, 15, 70);

  // 4. Tabla de productos
  const rows = productos.map(p => [
    p.nombre,
    p.variante,
    p.cantidad,
    `$${p.precio.toFixed(2)}`,
    `$${(p.precio * p.cantidad).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: cliente.domicilio ? 80 : 75,
    head: [['Producto', 'Tamaño', 'Cantidad', 'P. Unitario', 'Total']],
    body: rows,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: '#ffffff',
    },
    theme: 'striped',
  });

  // 5. Totales (usamos la posición real del final de la tabla)
  const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const ivaIncluido = total - total / 1.16;
  const y = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.setTextColor('#000000');
  doc.text(`IVA (ya incluido): $${ivaIncluido.toFixed(2)}`, 195, y, { align: 'right' });

  doc.setTextColor(azul);
  doc.setFontSize(12);
  doc.text(`Total: $${total.toFixed(2)}`, 195, y + 8, { align: 'right' });

   // Pie legal
   doc.setFontSize(9);
doc.setTextColor(120);
doc.text(
  '* Esta cotización tiene una vigencia de 15 días a partir de la fecha de emisión. Los precios pueden ajustarse si no se siguen las especificaciones indicadas (por ejemplo: si un archivo con fondo completo es enviado como línea y texto).',
  105, // posición X centrada (A4 = 210mm, por eso 105mm)
  247, // 297mm alto total - 50mm = 247mm desde arriba
  {
    maxWidth: 180,
    align: 'center'
  }
);

  return doc.output('blob');
}
