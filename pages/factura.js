import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingBubbles from "../components/FloatingBubbles";

/* === Componente de anuncios. (con fallback) === */
const AdBanner = ({ href = "#", src, src2xl, alt = "Publicidad", fallback = "/ads/lateral-izq-300x600.jpg" }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener"
    className="block overflow-hidden rounded-2xl border border-gray-200 shadow bg-white"
    aria-label={alt}
  >
    <picture>
      {src2xl && <source media="(min-width:1536px)" srcSet={src2xl} />}
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-contain"
        loading="lazy"
        onError={(e) => {
          // si falla,, muestra el fallback para confirmar que el contenedor sí renderiza
          if (e.currentTarget.src !== window.location.origin + fallback) {
            e.currentTarget.src = fallback;
          }
        }}
      />
    </picture>
  </a>
);

/* === Catálogos === */
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
  { value: '623', label: '623 - Opcional para Grupos de Sociedades' },
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

/* === Utilidades === */
const LoadingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="mt-10 text-center text-blue-700 text-lg font-medium"
  >
    Enviando datos, por favor espera...
  </motion.div>
);

function validarRFC(rfc) {
  const regex = /^([A-ZÑ&]{3,4})\d{6}[A-Z0-9]{3}$/;
  return regex.test((rfc || '').toUpperCase());
}

// Normalizadores de códigos
function extraerRegimen(valor = '') {
  const v = String(valor).trim().toUpperCase();
  const m = v.match(/^(\d{3})/); // 601, 612, 626...
  return m ? m[1] : '';
}
function extraerUso(valor = '') {
  const v = String(valor).trim().toUpperCase();
  const m = v.match(/^([A-Z]\d{2}|[A-Z]{3})/); // G03, I01, P01...
  return m ? m[1] : '';
}

/* === Página === */
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
  const [success, setSuccess] = useState('');
  const [codigoCliente, setCodigoCliente] = useState('');
  const [showClientCodeInput, setShowClientCodeInput] = useState(false);

  const total = productos.reduce((acc, p) => acc + (p.cantidad * p.precio_unitario), 0);

  /* === Acciones === */

  const handleCargarDatosCliente = async () => {
    setLoading(true);
    setError('');

    // REEMPLAZA ESTA URL con la que obtuviste de tu Script de Google Apps
    const urlScript = 'https://script.google.com/macros/s/AKfycbybBXxsXpJSF-sp-PeTsFd5LVzS86Lf4MVJ7J2r7AtwkuLpdG3he2KHU7jngfCz2L_k/exec';

    try {
      const res = await fetch(`${urlScript}?codigo=${encodeURIComponent(codigoCliente.toUpperCase())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'No se encontraron datos de cliente con ese código.');
      }

      const cliente = data.data;

      // Normalizamos lo que viene de la hoja
      const regIn = String(cliente.regimenFiscal || '').toUpperCase().trim();
      const usoIn = String(cliente.usoCfdi || '').toUpperCase().trim();

      let regimenCode = extraerRegimen(regIn);
      let usoCode = extraerUso(usoIn);

      // Si vienen cruzados, los corregimos
      if (!regimenCode && extraerUso(regIn)) {
        usoCode = extraerUso(regIn);
      }
      if (!usoCode && extraerRegimen(usoIn)) {
        regimenCode = extraerRegimen(usoIn);
      }

      setDatosFiscales({
        rfc: cliente.rfc || '',
        razonSocial: cliente.razonSocial || '',
        regimenFiscal: regimenCode || '',
        usoCfdi: usoCode || '',
        codigoPostal: cliente.codigoPostal || '',
        email: cliente.email || '',
      });

      setSuccess('Código de cliente correcto. ¡Listo para facturar!');
    } catch (err) {
      setSuccess('');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarTicket = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setProductos([]);
    setShowClientCodeInput(false);
    setCodigoCliente('');
    setDatosFiscales({
      rfc: '',
      razonSocial: '',
      regimenFiscal: '',
      usoCfdi: '',
      codigoPostal: '',
      email: '',
    });

    try {
      const res = await fetch(`/api/consultar-ticket?ticket=${encodeURIComponent(ticket)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Error al consultar ticket');
      setProductos(Array.isArray(data.productos) ? data.productos : []);
      if (!data.productos?.length) {
        setError('No se encontraron productos para este ticket o no corresponde al mes en curso.');
      } else {
        setSuccess('Ticket válido. Revisa el resumen y completa tus datos fiscales.');
      }
    } catch (err) {
      setError(err.message || 'No se pudo validar el ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosFiscales((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setFacturaGenerada(null);

    if (!validarRFC(datosFiscales.rfc)) {
      setError('El RFC ingresado no tiene un formato válido.');
      setLoading(false);
      return;
    }

    const regimenLabel = regimenes.find(r => r.value === datosFiscales.regimenFiscal)?.label.split(' - ')[1] || '';
    const usoCfdiLabel = usosCFDI.find(u => u.value === datosFiscales.usoCfdi)?.label.split(' - ')[1] || '';

    try {
      const res = await fetch('/api/registrar-datos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket,
          productos,
          total,
          rfc: datosFiscales.rfc,
          razonSocial: datosFiscales.razonSocial,
          regimenFiscal: regimenLabel, // <- etiqueta ya derivada del código (601 -> "General de Ley...")
          usoCfdi: usoCfdiLabel,
          codigoPostal: datosFiscales.codigoPostal,
          email: datosFiscales.email,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.message || 'No se pudo registrar la información');
      }

      setFacturaGenerada({ pdf_url: null, xml_url: null });
      setSuccess('Datos enviados correctamente. Recibirás tu factura si el ticket corresponde al mes actual.');
    } catch (err) {
      setError(err.message || 'Hubo un problema al registrar los datos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetTodo = () => {
    setFacturaGenerada(null);
    setTicket('');
    setProductos([]);
    setDatosFiscales({
      rfc: '',
      razonSocial: '',
      regimenFiscal: '',
      usoCfdi: '',
      codigoPostal: '',
      email: '',
    });
    setError('');
    setSuccess('');
    setCodigoCliente('');
    setShowClientCodeInput(false);
  };

  /* === UI con laterales === */
  return (
    <>
      <Navbar />

      {/* Contenedor GRID con laterales (xl en adelante) */}
      <div className="pt-28 pb-16">
        <div
          className="
            mx-auto w-full max-w-screen-2xl px-4
            grid grid-cols-1
            xl:grid-cols-[160px_minmax(0,1fr)_160px]
            2xl:grid-cols-[300px_minmax(0,1fr)_300px]
            gap-4
          "
        >
          {/* Lateral izquierdo */}
          <aside className="hidden xl:block sticky top-28 self-start">
            <div className="w-[160px] 2xl:w-[300px]">
              <AdBanner
                src="/ads/lateral-izq-300x600.jpg"
                src2xl="/ads/lateral-izq-300x600.jpg"
                alt="Publicidad lateral izquierda"
              />
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="min-w-0">
            <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
              Generar Factura
            </h1>

            {/* Paso a paso */}
            <ol className="grid grid-cols-3 gap-3 mb-6 text-sm">
              <li className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${productos.length ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-current opacity-70" /> Validar ticket
              </li>
              <li className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${productos.length ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-400'}`}>
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-current opacity-70" /> Datos fiscales
              </li>
              <li className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${facturaGenerada ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-400'}`}>
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-current opacity-70" /> Confirmación
              </li>
            </ol>

            {/* Alertas */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
                {success}
              </div>
            )}

            {/* Bloque: Buscar Ticket */}
            {!productos.length && !facturaGenerada && (
              <div className="max-w-md mx-auto bg-white shadow-md rounded-2xl p-6 border border-gray-200">
                <label className="block mb-2 font-semibold text-gray-700">Número de ticket</label>
                <input
                  type="text"
                  value={ticket}
                  onChange={(e) => {
                    let raw = e.target.value.replace(/[^0-9]/g, '');
                    if (raw.length > 1) raw = `${raw[0]}-${raw.slice(1)}`;
                    setTicket(raw);
                  }}
                  placeholder="Ej. 59773"
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-600"
                />
                <button
                  onClick={handleBuscarTicket}
                  className="w-full mt-4 py-2.5 bg-blue-700 text-white rounded-2xl hover:brightness-110 active:scale-[.99] disabled:opacity-60 transition"
                  disabled={!ticket || loading}
                >
                  {loading ? 'Buscando...' : 'Buscar ticket'}
                </button>
              </div>
            )}

            {/* Bloque: Datos y Resumen */}
            {productos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-2 gap-8 mt-8"
              >
                {/* Formulario Datos Fiscales */}
                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow border border-gray-100">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">Datos fiscales</h2>

                  {/* Checkbox y carga de cliente */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="yaSoyClienteCheckbox"
                      checked={showClientCodeInput}
                      onChange={(e) => setShowClientCodeInput(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="yaSoyClienteCheckbox" className="text-sm font-medium text-gray-700">Ya soy cliente, cargar mis datos</label>
                  </div>

                  {showClientCodeInput && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-2 mb-4"
                    >
                      <input
                        type="text"
                        value={codigoCliente}
                        onChange={(e) => setCodigoCliente(e.target.value.toUpperCase())}
                        placeholder="Ej. CLI172"
                        className="w-full border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={handleCargarDatosCliente}
                        className="py-2.5 px-6 bg-blue-700 text-white rounded-2xl hover:brightness-110 active:scale-[.99] disabled:opacity-60 transition"
                        disabled={!codigoCliente || loading}
                      >
                        Cargar
                      </button>
                    </motion.div>
                  )}

                  <input
                    name="rfc"
                    value={datosFiscales.rfc}
                    onChange={handleChange}
                    required
                    className="w-full border p-2.5 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-600"
                    placeholder="RFC (Ej. ABCD800101AA1)"
                    autoCapitalize="characters"
                  />
                  <input
                    name="razonSocial"
                    value={datosFiscales.razonSocial}
                    onChange={handleChange}
                    required
                    className="w-full border p-2.5 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-600"
                    placeholder="Razón social / Nombre"
                  />
                  <select
                    name="regimenFiscal"
                    value={datosFiscales.regimenFiscal}
                    onChange={handleChange}
                    required
                    className="w-full border p-2.5 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-600"
                  >
                    <option value="">Selecciona Régimen Fiscal</option>
                    {regimenes.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <select
                    name="usoCfdi"
                    value={datosFiscales.usoCfdi}
                    onChange={handleChange}
                    required
                    className="w-full border p-2.5 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-600"
                  >
                    <option value="">Selecciona Uso de CFDI</option>
                    {usosCFDI.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                  <input
                    name="codigoPostal"
                    value={datosFiscales.codigoPostal}
                    onChange={handleChange}
                    required
                    className="w-full border p-2.5 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-600"
                    placeholder="Código postal (5 dígitos)"
                    inputMode="numeric"
                    pattern="[0-9]{5}"
                  />
                  <input
                    name="email"
                    type="email"
                    value={datosFiscales.email}
                    onChange={handleChange}
                    required
                    className="w-full border p-2.5 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-600"
                    placeholder="Correo electrónico"
                  />

                  {!facturaGenerada ? (
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 rounded-2xl text-white font-semibold transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:brightness-110 active:scale-[.99]'}`}
                    >
                      {loading ? 'Enviando...' : 'Enviar datos para factura'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resetTodo}
                      className="w-full py-3 bg-blue-700 text-white rounded-2xl hover:brightness-110 active:scale-[.99]"
                    >
                      Realizar otro registro
                    </button>
                  )}

                  {/* Error dentro del formulario (además del global) */}
                  {!success && error && <p className="text-red-600 text-sm">{error}</p>}
                </form>

                {/* Resumen del Ticket */}
                <div className="bg-gray-50 p-6 rounded-2xl shadow border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Resumen del ticket</h3>
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

            {loading && !facturaGenerada && <LoadingIndicator />}

            {facturaGenerada && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="mt-10 text-center bg-green-50 border border-green-500 rounded-2xl p-6"
              >
                <h3 className="text-green-700 font-semibold text-xl mb-2">Datos enviados correctamente</h3>
                <p className="text-green-700 mb-1">
                  Recibirás tu factura si los datos son correctos y el ticket corresponde al mes actual.
                </p>
                <p className="text-green-700 text-sm">
                  (Si ya tienes PDF/XML, te llegarán por correo.)
                </p>
              </motion.div>
            )}
          </main>

          {/* Lateral derecho */}
          <aside className="hidden xl:block sticky top-28 self-start">
            <div className="w-[160px] 2xl:w-[300px]">
              <AdBanner
                src="/ads/lateral-de-300x600.jpg"
                src2xl="/ads/lateral-de-300x600.jpg"
                alt="Publicidad lateral derecha"
              />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
      <FloatingBubbles />
    </>
  );
}
