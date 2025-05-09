// utils/generarCotizacionPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generarCotizacionPDF(cliente, productos) {
  const doc = new jsPDF();
  const azul = '#1e3a8a';

  doc.setTextColor(azul);
  doc.setFontSize(18);
  doc.text('Puerto Copy', 15, 20);

  doc.setFontSize(11);
  doc.text('Villa Colonial #573, Los Portales', 15, 27);
  doc.text('Puerto Vallarta, Jalisco, México', 15, 32);
  doc.text('Tel: 3223499334 | contacto@puertocopy.com', 15, 37);

  const fecha = new Date();
  const folio = 'PC-' + fecha.getTime().toString().slice(-5);
  doc.text(`Folio: ${folio}`, 195, 20, { align: 'right' });
  doc.text(`Fecha: ${fecha.toLocaleDateString()}`, 195, 26, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.line(15, 42, 195, 42);

  doc.setFontSize(12);
  doc.setTextColor('#000000');
  doc.text(`Cliente: ${cliente.nombre}`, 15, 52);
  doc.text(`Teléfono: ${cliente.telefono}`, 15, 58);
  doc.text(`Correo: ${cliente.correo}`, 15, 64);
  if (cliente.domicilio) doc.text(`Domicilio: ${cliente.domicilio}`, 15, 70);

  const rows = productos.map((p) => [
    p.nombre,
    p.variante,
    p.cantidad,
    `$${p.precio.toFixed(2)}`,
    `$${(p.precio * p.cantidad).toFixed(2)}`
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

  const finalY = doc.lastAutoTable.finalY || 90;
  const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  doc.setFontSize(12);
  doc.setTextColor(azul);
  doc.text(`Total: $${total.toFixed(2)}`, 195, finalY + 10, { align: 'right' });

  return doc.output('blob');
}
