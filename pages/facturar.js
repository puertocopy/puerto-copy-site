import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const regimenes = [
  { value: '601', label: '601 - General de Ley Personas Morales' },
  { value: '603', label: '603 - Personas Morales con Fines no Lucrativos' },
  { value: '605', label: '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { value: '606', label: '606 - Arrendamiento' },
  { value: '608', label: '608 - Demás ingresos' },
  { value: '610', label: '610 - Residentes en el Extranjero sin Establecimiento Permanente en México' },
  { value: '611', label: '611 - Ingresos por Dividendos (socios y accionistas)' },
  { value: '612', label: '612 - Personas Físicas con Actividades Empresariales y Profesionales' },
  { value: '614', label: '614 - Ingresos por intereses' },
  { value: '615', label: '615 - Régimen de los ingresos por obtención de premios' },
  { value: '616', label: '616 - Sin obligaciones fiscales' },
  { value: '621', label: '621 - Incorporación Fiscal' },
  { value: '622', label: '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
  { value: '626', label: '626 - Régimen Simplificado de Confianza' },
];

const usosCFDI = [
  { value: 'G01', label: 'G01 - Adquisición de mercancías' },
  { value: 'G02', label: 'G02 - Devoluciones, descuentos o bonificaciones' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'I01', label: 'I01 - Construcciones' },
  { value: 'I02', label: 'I02 - Mobiliario y equipo de oficina por inversiones' },
  { value: 'D01', label: 'D01 - Honorarios médicos, dentales y gastos hospitalarios' },
  { value: 'D02', label: 'D02 - Gastos médicos por incapacidad o discapacidad' },
  { value: 'P01', label: 'P01 - Por definir' },
];

export default function Facturar() {
  const [ticket, setTicket] = useState('');
  const [productos, setProductos] = useState([]);
  const [datosFiscales, setDatosFiscales] = useState({
    rfc: '',
    razonSocial: '',
    regimenFiscal: '',
    usoCfdi: '',
    codigoPostal: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [facturaGenerada, setFacturaGenerada] = useState(null);

  const handleBuscarTicket = async () => {
    setLoading(true);
    setError('');
    setProductos([]);

    try {
      const res = await fetch(`/api/consultar-ticket?ticket=${ticket}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al consultar ticket');
      setProductos(data.productos);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosFiscales((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/facturar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket, productos, ...datosFiscales }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al generar factura');
      setFacturaGenerada(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const total = productos.reduce((acc, p) => acc + (p.cantidad * p.precio_unitario), 0);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-28 pb-16 min-h-screen">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-10">Generar Factura</h1>

        {/* Paso 1: Buscar Ticket */}
        {!productos.length && (
          <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <label className="block mb-2 font-semibold text-gray-700">Número de Ticket</label>
            <input
  type="text"
  value={ticket}
  onChange={(e) => {
    let raw = e.target.value.replace(/[^0-9]/g, ''); // elimina cualquier cosa que no sea número
    if (raw.length > 1) {
      raw = `${raw[0]}-${raw.slice(1)}`;
    }
    setTicket(raw);
  }}
  placeholder="Ej. 59773"
  className="w-full border border-gray-300 rounded p-2 mb-4"
/>

            <button
              onClick={handleBuscarTicket}
              className="w-full py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
              disabled={!ticket || loading}
            >
              Buscar Ticket
            </button>
            {error && <p className="mt-4 text-red-600">{error}</p>}
          </div>
        )}

        {/* Paso 2: Formulario y resumen */}
{productos.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="grid md:grid-cols-2 gap-8 mt-10"
  >
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Datos Fiscales</h2>
      <input name="rfc" value={datosFiscales.rfc} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="RFC" />
      <input name="razonSocial" value={datosFiscales.razonSocial} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="Razón Social" />
      <select name="regimenFiscal" value={datosFiscales.regimenFiscal} onChange={handleChange} required className="w-full border p-2 rounded">
        <option value="">Selecciona Régimen Fiscal</option>
        {regimenes.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
      <select name="usoCfdi" value={datosFiscales.usoCfdi} onChange={handleChange} required className="w-full border p-2 rounded">
        <option value="">Selecciona Uso de CFDI</option>
        {usosCFDI.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
      </select>
      <input name="codigoPostal" value={datosFiscales.codigoPostal} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="Código Postal" />
      <input name="email" type="email" value={datosFiscales.email} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="Correo electrónico" />
      <button type="submit" className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={loading}>
        Generar Factura
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </form>

    {/* Resumen de Ticket */}
    <div className="bg-gray-50 p-6 rounded shadow border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Resumen del Ticket</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        {productos.map((p, i) => (
          <li key={i} className="flex justify-between border-b pb-1">
            <span>{p.cantidad} x {p.nombre}</span>
            <span>${(p.cantidad * p.precio_unitario).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t pt-2 flex justify-between font-bold text-blue-800 text-base">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  </motion.div>
)}

{facturaGenerada && (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className="mt-10 text-center bg-green-50 border border-green-500 rounded p-6"
  >
    <h3 className="text-green-700 font-semibold text-xl mb-2">Factura generada correctamente</h3>
    <a href={facturaGenerada.pdf_url} target="_blank" className="text-blue-700 underline mr-4">Descargar PDF</a>
    <a href={facturaGenerada.xml_url} target="_blank" className="text-blue-700 underline">Descargar XML</a>
  </motion.div>
)}

      </main>
      <Footer />
    </>
  );
}
