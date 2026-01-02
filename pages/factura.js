import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Search, ArrowRight, UserCheck, RefreshCw, FileText as FileIcon, Menu, X, Printer, Phone, Mail } from 'lucide-react';

// === PARA TU PROYECTO LOCAL: DESCOMENTA ESTAS LINEAS ===
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingBubbles from '../components/FloatingBubbles';

/* === ESTILOS CSS INLINE === */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap');
  .font-brand { font-family: 'Product Sans', 'Outfit', sans-serif; }
`;

/* === PANEL LATERAL (Local en esta página) === */
const SidePanel = ({ href = "#", side = "left", alt = "Imagen lateral" }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="block overflow-hidden rounded-[2rem] border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group h-full relative" 
    aria-label={alt}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
    <img 
      src={`/api/panel?side=${side}`} 
      alt={alt} 
      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
      loading="lazy" 
      onError={(e) => { 
        e.target.style.display = 'none'; 
        e.target.parentElement.style.backgroundColor = '#F3F7FC'; 
      }} 
    />
  </a>
);

/* === LOGICA DE FACTURACIÓN === */
const regimenes = [
  { value: '601', label: '601 - General de Ley Personas Morales' },
  { value: '603', label: '603 - Personas Morales con Fines no Lucrativos' },
  { value: '605', label: '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { value: '606', label: '606 - Arrendamiento' },
  { value: '608', label: '608 - Demás ingresos' },
  { value: '612', label: '612 - Personas Físicas con Actividades Empresariales y Profesionales' },
  { value: '616', label: '616 - Sin obligaciones fiscales' },
  { value: '621', label: '621 - Incorporación Fiscal' },
  { value: '626', label: '626 - Régimen Simplificado de Confianza' },
];

const usosCFDI = [
  { value: 'G01', label: 'G01 - Adquisición de mercancías' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'P01', label: 'P01 - Por definir' },
];

const LoadingIndicator = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 flex flex-col items-center text-[#0B63B2]">
    <div className="w-8 h-8 border-4 border-[#0B63B2] border-t-transparent rounded-full animate-spin mb-3"></div>
    <span className="font-medium text-lg font-brand">Procesando datos...</span>
  </motion.div>
);

function validarRFC(rfc) {
  const regex = /^([A-ZÑ&]{3,4})\d{6}[A-Z0-9]{3}$/;
  return regex.test((rfc || '').toUpperCase());
}

function extraerRegimen(valor = '') {
  const v = String(valor).trim().toUpperCase();
  const m = v.match(/^(\d{3})/); 
  return m ? m[1] : '';
}

function extraerUso(valor = '') {
  const v = String(valor).trim().toUpperCase();
  const m = v.match(/^([A-Z]\d{2}|[A-Z]{3})/); 
  return m ? m[1] : '';
}

export default function Facturar() {
  const [ticket, setTicket] = useState('');
  const [productos, setProductos] = useState([]);
  const [datosFiscales, setDatosFiscales] = useState({ 
    rfc: '', 
    razonSocial: '', 
    regimenFiscal: '', 
    usoCfdi: '', 
    codigoPostal: '', 
    email: '' 
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [facturaGenerada, setFacturaGenerada] = useState(null);
  const [success, setSuccess] = useState('');
  const [codigoCliente, setCodigoCliente] = useState('');
  const [showClientCodeInput, setShowClientCodeInput] = useState(false);

  const total = productos.reduce((acc, p) => acc + (p.cantidad * p.precio_unitario), 0);

  const handleCargarDatosCliente = async () => {
    setLoading(true); 
    setError('');
    
    // REEMPLAZA CON TU URL REAL DEL SCRIPT DE GOOGLE
    const urlScript = 'https://script.google.com/macros/s/AKfycbzf_-GMn9ZGNrNWZOFcDSHfX_Kc4DdXsXQjACOr4AVj8SjPGJSsOFasApCeZMQeOW9r/exec';
    
    try {
      const res = await fetch(`${urlScript}?codigo=${encodeURIComponent(codigoCliente.toUpperCase())}`);
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'No se encontraron datos.');
      }
      
      const cliente = data.data;
      let regimenCode = extraerRegimen(String(cliente.regimenFiscal || ''));
      let usoCode = extraerUso(String(cliente.usoCfdi || ''));
      
      if (!regimenCode && extraerUso(String(cliente.regimenFiscal || ''))) {
        regimenCode = extraerUso(String(cliente.regimenFiscal || ''));
      }
      if (!usoCode && extraerRegimen(String(cliente.usoCfdi || ''))) {
        regimenCode = extraerRegimen(String(cliente.usoCfdi || ''));
      }

      setDatosFiscales({
        rfc: cliente.rfc || '',
        razonSocial: cliente.razonSocial || '',
        regimenFiscal: regimenCode || '',
        usoCfdi: usoCode || '',
        codigoPostal: cliente.codigoPostal || '',
        email: cliente.email || '',
      });
      setSuccess('Datos cargados correctamente.');
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
    
    try {
      const res = await fetch(`/api/consultar-ticket?ticket=${encodeURIComponent(ticket)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data?.message || 'Error al consultar ticket');
      
      setProductos(Array.isArray(data.productos) ? data.productos : []);
      
      if (!data.productos?.length) {
        setError('Ticket sin productos o de mes vencido.');
      } else {
        setSuccess('Ticket válido.');
      }
    } catch (err) { 
      setError(err.message); 
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
      setError('RFC inválido.'); 
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
          ...datosFiscales, 
          regimenFiscal: regimenLabel, 
          usoCfdi: usoCfdiLabel 
        }),
      });
      
      if (!res.ok) throw new Error('Error al registrar.');
      
      setFacturaGenerada({ pdf_url: null });
      setSuccess('Solicitud enviada correctamente.');
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const resetTodo = () => {
    setFacturaGenerada(null); 
    setTicket(''); 
    setProductos([]); 
    setError(''); 
    setSuccess('');
    setCodigoCliente('');
    setShowClientCodeInput(false);
    setDatosFiscales({ 
      rfc: '', 
      razonSocial: '', 
      regimenFiscal: '', 
      usoCfdi: '', 
      codigoPostal: '', 
      email: '' 
    });
  };

  return (
    <>
      <style>{styles}</style>
      <Navbar forceWhite={true} />
      
      <div className="min-h-screen bg-[#FDFDFD] pt-28 pb-16 font-sans">
        <div className="mx-auto w-full max-w-screen-2xl px-4 grid grid-cols-1 xl:grid-cols-[200px_minmax(0,1fr)_200px] 2xl:grid-cols-[300px_minmax(0,1fr)_300px] gap-6">
          
          {/* Panel Izquierdo */}
          <div className="hidden xl:block sticky top-32 self-start h-[calc(100vh-10rem)]">
             <SidePanel side="left" alt="Publicidad Puerto Copy Izquierda" />
          </div>
          
          {/* Contenido Principal */}
          <main className="min-w-0 max-w-4xl mx-auto w-full relative z-10">
            <div className="text-center mb-10">
              <span className="text-[#0B63B2] font-bold tracking-wider uppercase text-xs bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                Autoservicio
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold mt-6 text-[#003082] tracking-tight font-brand">
                Generar Factura
              </h1>
            </div>

            {/* Mensajes de Estado */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-[1.5rem] border border-red-100 bg-red-50 text-red-800 px-6 py-4 flex items-center shadow-sm">
                <AlertCircle className="mr-3 shrink-0" /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-[1.5rem] border border-green-100 bg-green-50 text-green-800 px-6 py-4 flex items-center shadow-sm">
                <Check className="mr-3 shrink-0 bg-green-200 rounded-full p-1" size={24} /> {success}
              </motion.div>
            )}

            {/* Paso 1: Ingreso de Ticket */}
            {!productos.length && !facturaGenerada && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 md:p-12 border border-gray-50">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0B63B2] mb-4">
                    <FileIcon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[#003082]">Ingresa tu Ticket</h3>
                </div>
                <div className="max-w-md mx-auto space-y-6">
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
                      className="w-full bg-[#F3F7FC] border border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-6 py-4 text-lg outline-none transition-all shadow-inner focus:shadow-lg placeholder-gray-400" 
                    />
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                  <button 
                    onClick={handleBuscarTicket} 
                    className="w-full py-4 bg-[#0B63B2] hover:bg-[#004a8f] text-white rounded-full font-bold text-lg shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-60 transition-all flex justify-center gap-2" 
                    disabled={!ticket || loading}
                  >
                    {loading ? 'Validando...' : 'Buscar ticket'} {!loading && <ArrowRight size={20} />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Paso 2: Datos Fiscales */}
            {productos.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-full">
                  <h2 className="text-2xl font-bold mb-6 text-[#003082] font-brand flex items-center gap-2">
                    <UserCheck className="text-[#0B63B2]" /> Datos fiscales
                  </h2>
                  
                  {/* Opción Cargar Cliente */}
                  <div className="bg-[#F3F7FC] p-4 rounded-2xl mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <input 
                        type="checkbox" 
                        id="yaSoyClienteCheckbox" 
                        checked={showClientCodeInput} 
                        onChange={(e) => setShowClientCodeInput(e.target.checked)} 
                        className="w-5 h-5 text-[#0B63B2] rounded focus:ring-[#0B63B2]" 
                      />
                      <label htmlFor="yaSoyClienteCheckbox" className="text-sm font-semibold text-gray-700 cursor-pointer">Ya soy cliente</label>
                    </div>
                    {showClientCodeInput && (
                      <div className="flex gap-2 mt-3">
                        <input 
                          type="text" 
                          value={codigoCliente} 
                          onChange={(e) => setCodigoCliente(e.target.value.toUpperCase())} 
                          placeholder="Ej. CLI172" 
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#0B63B2]" 
                        />
                        <button 
                          type="button" 
                          onClick={handleCargarDatosCliente} 
                          className="px-4 py-2 bg-[#0B63B2] text-white rounded-xl text-sm font-bold" 
                          disabled={loading}
                        >
                          Cargar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Campos del Formulario */}
                  <div className="space-y-4 flex-grow">
                    <input name="rfc" value={datosFiscales.rfc} onChange={handleChange} placeholder="RFC" className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3.5 outline-none shadow-sm" />
                    <input name="razonSocial" value={datosFiscales.razonSocial} onChange={handleChange} placeholder="Razón Social" className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3.5 outline-none shadow-sm" />
                    <input name="email" value={datosFiscales.email} onChange={handleChange} placeholder="Correo" className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3.5 outline-none shadow-sm" />
                    <input name="codigoPostal" value={datosFiscales.codigoPostal} onChange={handleChange} placeholder="C.P." className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3.5 outline-none shadow-sm" />
                    
                    <select name="regimenFiscal" value={datosFiscales.regimenFiscal} onChange={handleChange} className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3.5 outline-none shadow-sm">
                      <option value="">Régimen Fiscal</option>
                      {regimenes.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    
                    <select name="usoCfdi" value={datosFiscales.usoCfdi} onChange={handleChange} className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3.5 outline-none shadow-sm">
                      <option value="">Uso CFDI</option>
                      {usosCFDI.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                  </div>

                  <div className="mt-8">
                    {!facturaGenerada ? (
                      <button type="submit" disabled={loading} className="w-full py-4 bg-[#0B63B2] text-white rounded-full font-bold shadow-lg hover:bg-[#004a8f] disabled:bg-gray-300">
                        Facturar Ahora
                      </button>
                    ) : (
                      <button type="button" onClick={resetTodo} className="w-full py-4 bg-gray-800 text-white rounded-full font-bold shadow-lg flex justify-center gap-2">
                        <RefreshCw size={20} /> Otro registro
                      </button>
                    )}
                  </div>
                </form>

                {/* Resumen del Ticket */}
                <div className="bg-[#F3F7FC] p-8 rounded-[2.5rem] shadow-inner h-fit">
                  <h3 className="text-xl font-bold mb-6 text-[#003082]">Resumen</h3>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 space-y-4">
                    {productos.map((p, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0B63B2] font-bold text-xs">{p.cantidad}x</div>
                          <span className="font-medium text-sm">{p.nombre}</span>
                        </div>
                        <span className="font-semibold text-gray-900">${(p.cantidad * p.precio_unitario).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-gray-500 font-medium">Total</span>
                    <span className="text-3xl font-extrabold text-[#0B63B2]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Pantalla de Éxito */}
            {facturaGenerada && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-12 text-center bg-white border border-green-100 rounded-[3rem] p-10 shadow-2xl max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                  <Check size={40} />
                </div>
                <h3 className="text-[#003082] font-bold text-3xl mb-4 font-brand">¡Éxito!</h3>
                <p className="text-gray-600 text-lg mb-6">Recibirás tu factura en 72 horas hábiles.</p>
              </motion.div>
            )}
          </main>

          {/* Panel Derecho */}
          <div className="hidden xl:block sticky top-32 self-start h-[calc(100vh-10rem)]">
             <SidePanel side="right" alt="Publicidad Puerto Copy Derecha" />
          </div>
        </div>
      </div>

      <Footer />
      <FloatingBubbles />
    </>
  );
}