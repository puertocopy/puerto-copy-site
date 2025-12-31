import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Search, FileText, ArrowRight, UserCheck, RefreshCw, Printer, Menu, X, Phone, Mail } from 'lucide-react';

/* === ESTILOS CSS INLINE PARA FUENTES Y DISEÑO === */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap');

  .font-brand {
    font-family: 'Product Sans', 'Outfit', sans-serif;
  }
`;

/* === COMPONENTES INTEGRADOS (Navbar, Footer, FloatingBubbles) === */

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Servicios', href: '/#servicios' },
    { name: 'Nosotros', href: '/#ventajas' },
    { name: 'Contacto', href: '/#contacto' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white/80 backdrop-blur-md py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex-shrink-0 flex items-center cursor-pointer decoration-transparent group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-2 bg-[#0B63B2] text-white transition-transform group-hover:scale-105`}>
              <Printer size={24} />
            </div>
            <span className={`font-bold text-2xl tracking-tight font-brand text-[#003082]`}>Puerto Copy</span>
          </a>
          
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((item) => (
              <a key={item.name} href={item.href} className="font-medium text-gray-600 hover:text-[#0B63B2] transition-colors">
                {item.name}
              </a>
            ))}
            <a href="/cotizar" className="px-5 py-2 rounded-full font-semibold transition-all inline-block bg-[#0B63B2] text-white hover:bg-[#004a8f] shadow-md shadow-blue-200">
              Cotizar
            </a>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#003082]">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden bg-white absolute w-full border-t border-gray-100 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((item) => (
              <a key={item.name} href={item.href} className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0B63B2] rounded-md">
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center mb-4">
            <div className="bg-[#0B63B2] text-white w-8 h-8 rounded-lg flex items-center justify-center mr-2">
              <Printer size={16} />
            </div>
            <span className="font-bold text-xl text-[#003082] font-brand">Puerto Copy</span>
          </div>
          <p className="text-gray-500 max-w-sm">
            Soluciones integrales de impresión en Puerto Vallarta. Calidad profesional para arquitectos, estudiantes y empresas.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-[#003082] mb-4">Enlaces</h4>
          <ul className="space-y-2 text-gray-600">
            <li><a href="/#servicios" className="hover:text-[#0B63B2]">Servicios</a></li>
            <li><a href="/factura" className="hover:text-[#0B63B2]">Facturación</a></li>
            <li><a href="#" className="hover:text-[#0B63B2]">Aviso de Privacidad</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[#003082] mb-4">Contacto</h4>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center"><Phone size={14} className="mr-2"/> 322 191 6038</li>
            <li className="flex items-center"><Mail size={14} className="mr-2"/> hola@puertocopy.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-8 text-center text-gray-400 text-sm">
        <p>© 2024 <span className="font-brand">Puerto Copy</span>. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
);

const FloatingBubbles = () => (
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
    <div className="absolute bottom-[-10%] left-[10%] w-20 h-20 bg-blue-100 rounded-full blur-xl animate-[float_10s_ease-in-out_infinite]" />
    <div className="absolute bottom-[-10%] right-[20%] w-32 h-32 bg-purple-100 rounded-full blur-xl animate-[float_15s_ease-in-out_infinite]" />
  </div>
);

/* === Panel lateral (neutro) === */
const SidePanel = ({ href = "#", side = "left", alt = "Imagen lateral" }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener"
    className="block overflow-hidden rounded-[2rem] border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group h-full relative"
    aria-label={alt}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
    <img
      src={`https://placehold.co/300x600/F3F7FC/0B63B2?text=Anuncio+${side === 'left' ? 'Izq' : 'Der'}`} // Placeholder para evitar error de API local
      alt={alt}
      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
      loading="lazy"
    />
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
    className="mt-10 flex flex-col items-center text-[#0B63B2]"
  >
    <div className="w-8 h-8 border-4 border-[#0B63B2] border-t-transparent rounded-full animate-spin mb-3"></div>
    <span className="font-medium text-lg font-brand">Procesando datos...</span>
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

  // Simulación de productos para visualización en preview
  // En producción, esto se vacía y se llena con handleBuscarTicket
  const productosSimulados = [
    { nombre: 'Impresión Plano 90x60 Bond', cantidad: 2, precio_unitario: 45.00 },
    { nombre: 'Juego de Copias Tesis', cantidad: 1, precio_unitario: 250.00 }
  ];

  const total = productos.reduce((acc, p) => acc + (p.cantidad * p.precio_unitario), 0);

  /* === Acciones === */

  const handleCargarDatosCliente = async () => {
    setLoading(true);
    setError('');

    // REEMPLAZA ESTA URL con la que obtuviste de tu Script de Google Apps
    const urlScript = 'https://script.google.com/macros/s/AKfycbzf_-GMn9ZGNrNWZOFcDSHfX_Kc4DdXsXQjACOr4AVj8SjPGJSsOFasApCeZMQeOW9r/exec';

    try {
      // Simulación para preview
      if (codigoCliente === 'DEMO') {
        setTimeout(() => {
             setDatosFiscales({
                rfc: 'XAXX010101000',
                razonSocial: 'Cliente Demo SA de CV',
                regimenFiscal: '601',
                usoCfdi: 'G03',
                codigoPostal: '48300',
                email: 'demo@cliente.com',
            });
            setSuccess('Datos cargados (Modo Demo)');
            setLoading(false);
        }, 1000);
        return;
      }

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
      // Simulación para preview si el ticket es "12345"
      if (ticket === '12345' || ticket === '1234-5') {
          setTimeout(() => {
              setProductos(productosSimulados);
              setSuccess('Ticket válido. Revisa el resumen y completa tus datos fiscales.');
              setLoading(false);
          }, 800);
          return;
      }

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
      setError(err.message || 'No se pudo validar el ticket. (Prueba con 12345 para demo)');
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
      // Simulación de éxito para preview
      setTimeout(() => {
        setFacturaGenerada({ pdf_url: null, xml_url: null });
        setSuccess('Datos enviados correctamente.');
        setLoading(false);
      }, 1500);
      return;

      /* Código real para producción:
      const res = await fetch('/api/registrar-datos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket,
          productos,
          total,
          rfc: datosFiscales.rfc,
          razonSocial: datosFiscales.razonSocial,
          regimenFiscal: regimenLabel,
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
      */
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
      <style>{styles}</style>
      <Navbar />

      {/* Fondo sutil estilo Home */}
      <div className="min-h-screen bg-[#FDFDFD] pt-28 pb-16 font-sans">
        
        {/* Contenedor GRID con laterales (xl en adelante) */}
        <div
          className="
            mx-auto w-full max-w-screen-2xl px-4
            grid grid-cols-1
            xl:grid-cols-[200px_minmax(0,1fr)_200px]
            2xl:grid-cols-[300px_minmax(0,1fr)_300px]
            gap-6
          "
        >
          {/* Lateral izquierdo - Stilo Card Flotante */}
          <div className="hidden xl:block sticky top-32 self-start h-[calc(100vh-10rem)]">
             <SidePanel side="left" alt="Publicidad Puerto Copy" />
          </div>

          {/* Contenido principal */}
          <main className="min-w-0 max-w-4xl mx-auto w-full relative z-10">
            <div className="text-center mb-10">
              <span className="text-[#0B63B2] font-bold tracking-wider uppercase text-xs bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                Autoservicio
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold mt-6 text-[#003082] tracking-tight font-brand">
                Generar Factura
              </h1>
              <p className="text-gray-500 mt-4 text-lg">Ingresa los datos de tu ticket para facturar al instante.</p>
            </div>

            {/* Paso a paso estilo Pills */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
              {[
                { label: 'Ticket', active: !productos.length && !facturaGenerada, done: productos.length > 0 },
                { label: 'Datos Fiscales', active: productos.length > 0 && !facturaGenerada, done: facturaGenerada },
                { label: 'Confirmación', active: facturaGenerada, done: false }
              ].map((step, idx) => (
                <div 
                  key={idx}
                  className={`
                    relative overflow-hidden px-4 py-3 rounded-2xl flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-2 md:gap-3 transition-all duration-300
                    ${step.active 
                      ? 'bg-[#003082] text-white shadow-lg shadow-blue-900/20 transform scale-105' 
                      : step.done
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-white text-gray-400 border border-gray-100'
                    }
                  `}
                >
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${step.active ? 'bg-white text-[#003082]' : step.done ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-500'}
                  `}>
                    {step.done ? <Check size={14} /> : idx + 1}
                  </div>
                  <span className="font-semibold text-sm md:text-base">{step.label}</span>
                </div>
              ))}
            </div>

            {/* Alertas */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-[1.5rem] border border-red-100 bg-red-50 text-red-800 px-6 py-4 flex items-center shadow-sm">
                <AlertCircle className="mr-3 shrink-0" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-[1.5rem] border border-green-100 bg-green-50 text-green-800 px-6 py-4 flex items-center shadow-sm">
                <Check className="mr-3 shrink-0 bg-green-200 rounded-full p-1" size={24} />
                {success}
              </motion.div>
            )}

            {/* Bloque: Buscar Ticket */}
            {!productos.length && !facturaGenerada && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 md:p-12 border border-gray-50"
              >
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0B63B2] mb-4">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[#003082]">Ingresa tu Ticket</h3>
                </div>

                <div className="max-w-md mx-auto space-y-6">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 ml-2">Número de ticket</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={ticket}
                        onChange={(e) => {
                          let raw = e.target.value.replace(/[^0-9]/g, '');
                          if (raw.length > 1) raw = `${raw[0]}-${raw.slice(1)}`;
                          setTicket(raw);
                        }}
                        placeholder="Ej. 12345"
                        className="w-full bg-[#F3F7FC] border border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-6 py-4 text-lg outline-none transition-all shadow-inner focus:shadow-lg focus:shadow-blue-100/50 placeholder-gray-400"
                      />
                      <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 ml-2">Prueba "12345" para ver la demo de diseño.</p>
                  </div>
                  
                  <button
                    onClick={handleBuscarTicket}
                    className="w-full py-4 bg-[#0B63B2] hover:bg-[#004a8f] text-white rounded-full font-bold text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-60 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                    disabled={!ticket || loading}
                  >
                    {loading ? 'Validando...' : 'Buscar ticket'} 
                    {!loading && <ArrowRight size={20} />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Bloque: Datos y Resumen */}
            {productos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-2 gap-8"
              >
                {/* Formulario Datos Fiscales */}
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-full">
                  <h2 className="text-2xl font-bold mb-6 text-[#003082] font-brand flex items-center gap-2">
                    <UserCheck className="text-[#0B63B2]" />
                    Datos fiscales
                  </h2>

                  {/* Checkbox y carga de cliente */}
                  <div className="bg-[#F3F7FC] p-4 rounded-2xl mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        id="yaSoyClienteCheckbox"
                        checked={showClientCodeInput}
                        onChange={(e) => setShowClientCodeInput(e.target.checked)}
                        className="w-5 h-5 text-[#0B63B2] rounded focus:ring-[#0B63B2] border-gray-300"
                      />
                      <label htmlFor="yaSoyClienteCheckbox" className="text-sm font-semibold text-gray-700 cursor-pointer">Ya soy cliente, cargar mis datos</label>
                    </div>

                    {showClientCodeInput && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex gap-2 mt-3"
                      >
                        <input
                          type="text"
                          value={codigoCliente}
                          onChange={(e) => setCodigoCliente(e.target.value.toUpperCase())}
                          placeholder="Ej. DEMO"
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#0B63B2] focus:ring-2 focus:ring-blue-100"
                        />
                        <button
                          type="button"
                          onClick={handleCargarDatosCliente}
                          className="px-4 py-2 bg-[#0B63B2] text-white rounded-xl text-sm font-bold hover:bg-[#004a8f] transition disabled:opacity-50"
                          disabled={!codigoCliente || loading}
                        >
                          Cargar
                        </button>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-4 flex-grow">
                    {[
                      { name: 'rfc', placeholder: 'RFC (Ej. ABCD800101AA1)', required: true, autoCapitalize: 'characters' },
                      { name: 'razonSocial', placeholder: 'Razón Social / Nombre', required: true },
                      { name: 'email', placeholder: 'Correo Electrónico', type: 'email', required: true },
                      { name: 'codigoPostal', placeholder: 'Código Postal', inputMode: 'numeric', pattern: '[0-9]{5}', required: true }
                    ].map((field) => (
                      <input
                        key={field.name}
                        {...field}
                        value={datosFiscales[field.name]}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3.5 outline-none transition-all shadow-sm focus:shadow-md focus:ring-4 focus:ring-blue-50 text-gray-700 placeholder-gray-400"
                      />
                    ))}

                    <select
                      name="regimenFiscal"
                      value={datosFiscales.regimenFiscal}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3.5 outline-none transition-all shadow-sm focus:shadow-md focus:ring-4 focus:ring-blue-50 text-gray-700 cursor-pointer appearance-none"
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
                      className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3.5 outline-none transition-all shadow-sm focus:shadow-md focus:ring-4 focus:ring-blue-50 text-gray-700 cursor-pointer appearance-none"
                    >
                      <option value="">Selecciona Uso de CFDI</option>
                      {usosCFDI.map((u) => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-8">
                    {!facturaGenerada ? (
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-full text-white font-bold text-lg shadow-xl transition-all transform active:scale-[0.98] ${
                          loading 
                            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                            : 'bg-[#0B63B2] hover:bg-[#004a8f] shadow-blue-500/20 hover:shadow-blue-500/30'
                        }`}
                      >
                        {loading ? 'Enviando...' : 'Facturar Ahora'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={resetTodo}
                        className="w-full py-4 bg-gray-800 text-white rounded-full font-bold shadow-lg hover:bg-gray-900 transition flex items-center justify-center gap-2"
                      >
                         <RefreshCw size={20} /> Realizar otro registro
                      </button>
                    )}
                  </div>
                </form>

                {/* Resumen del Ticket */}
                <div className="bg-[#F3F7FC] p-8 rounded-[2.5rem] shadow-inner border border-white h-fit">
                  <h3 className="text-xl font-bold mb-6 text-[#003082] font-brand">Resumen del ticket</h3>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <ul className="space-y-4 text-sm text-gray-600">
                      {productos.map((p, i) => (
                        <li key={i} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0B63B2] font-bold text-xs">
                                {p.cantidad}x
                             </div>
                             <span className="font-medium">{p.nombre}</span>
                          </div>
                          <span className="font-semibold text-gray-900">${(p.cantidad * p.precio_unitario).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center px-4">
                    <span className="text-gray-500 font-medium">Total a Pagar</span>
                    <span className="text-3xl font-extrabold text-[#0B63B2]">${total.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-8 text-xs text-center text-gray-400 leading-relaxed px-4">
                    Al dar click en Facturar, aceptas que los datos proporcionados son correctos. La refacturación puede generar cargos adicionales.
                  </div>
                </div>
              </motion.div>
            )}

            {loading && !facturaGenerada && <LoadingIndicator />}

            {facturaGenerada && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="mt-12 text-center bg-white border border-green-100 rounded-[3rem] p-10 shadow-2xl shadow-green-900/5 max-w-2xl mx-auto"
              >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h3 className="text-[#003082] font-bold text-3xl mb-4 font-brand">¡Solicitud Exitosa!</h3>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  Tus datos han sido enviados correctamente. Recibirás tu factura (PDF y XML) en tu correo electrónico en un lapso de <strong>72 horas</strong> hábiles.
                </p>
                <div className="bg-blue-50 rounded-2xl p-6 text-sm text-[#0B63B2]">
                  <p className="font-semibold mb-2">Nota Importante:</p>
                  <p className="mb-2">Por favor no realices múltiples registros con el mismo número de ticket.</p>
                  <p>Para dudas o aclaraciones: <a href="mailto:facturacion@puertocopy.com" className="underline hover:text-[#003082]">facturacion@puertocopy.com</a></p>
                </div>
              </motion.div>
            )}
          </main>

          {/* Lateral derecho - Stilo Card Flotante */}
          <div className="hidden xl:block sticky top-32 self-start h-[calc(100vh-10rem)]">
             <SidePanel side="right" alt="Publicidad Puerto Copy" />
          </div>
        </div>
      </div>

      <Footer />
      <FloatingBubbles />
    </>
  );
}