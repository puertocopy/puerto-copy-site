import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Send, CheckCircle, AlertCircle, 
  User, Building, Mail, MapPin, CreditCard, 
  ChevronRight, Package, Calculator, Loader2,
  FileText, Globe, Settings, Hash, ShieldCheck,
  Calendar, UserCheck, Link, Search, Filter,
  ArrowRightLeft, Download, Eye, RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { listInvoices } from '../lib/gasTickets';

// === CATALOGOS ===
const regimenes = [
  { value: '601', label: '601 - General de Ley Personas Morales' },
  { value: '603', label: '603 - Personas Morales con Fines no Lucrativos' },
  { value: '605', label: '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { value: '606', label: '606 - Arrendamiento' },
  { value: '608', label: '608 - Demás ingresos' },
  { value: '612', label: '612 - Personas Físicas con Actividades Empresariales y Profesionales' },
  { value: '625', label: '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
  { value: '616', label: '616 - Sin obligaciones fiscales' },
  { value: '621', label: '621 - Incorporación Fiscal' },
  { value: '626', label: '626 - Régimen Simplificado de Confianza' },
];

const usosCFDI = [
  { value: 'G01', label: 'G01 - Adquisición de mercancías' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'CP01', label: 'CP01 - Pagos' },
  { value: 'S01', label: 'S01 - Sin efectos fiscales' },
];

const formasPago = [
  { value: '01', label: '01 - Efectivo' },
  { value: '02', label: '02 - Cheque' },
  { value: '03', label: '03 - Transferencia' },
  { value: '04', label: '04 - Tarjeta Crédito' },
  { value: '28', label: '28 - Tarjeta Débito' },
  { value: '99', label: '99 - Por definir' },
];

const meses = [
  { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' }, { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' }, { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
];

const periodicidades = [
  { value: '01', label: 'Diario' },
  { value: '02', label: 'Semanal' },
  { value: '03', label: 'Quincenal' },
  { value: '04', label: 'Mensual' },
  { value: '05', label: 'Bimestral' },
];

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('emitir'); // 'emitir' | 'facturado' | 'clientes'
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ type: '', text: '' });

  // --- LÓGICA DE INACTIVIDAD (5 MIN) ---
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos en segundos
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [reauthData, setReauthData] = useState('');
  const [countdownToLogout, setCountdownToLogout] = useState(60); // 1 minuto para decidir

  useEffect(() => {
    let timer;
    if (isAuthenticated && !showInactivityModal) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setShowInactivityModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAuthenticated, showInactivityModal]);

  useEffect(() => {
    let logoutTimer;
    if (showInactivityModal) {
      logoutTimer = setInterval(() => {
        setCountdownToLogout(prev => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(logoutTimer);
  }, [showInactivityModal]);

  const resetInactivity = () => {
    if (!showInactivityModal) setTimeLeft(300);
  };

  const handleLogout = async () => {
    // Para cerrar sesión, simplemente borramos la cookie (opcionalmente en el servidor)
    // O simplemente recargamos la página ya que la cookie expirará o será inválida si implementamos un logout API
    // Por simplicidad, forzamos recarga para limpiar estados
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  };

  const handleRenewSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'isaact', password: reauthData })
      });
      if (res.ok) {
        setShowInactivityModal(false);
        setTimeLeft(300);
        setCountdownToLogout(60);
        setReauthData('');
      } else {
        alert('Contraseña incorrecta');
      }
    } catch (err) {
      alert('Error al renovar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Detectar actividad para resetear el timer (solo si no estamos en el modal de bloqueo)
  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(e => window.addEventListener(e, resetInactivity));
    return () => activityEvents.forEach(e => window.removeEventListener(e, resetInactivity));
  }, [showInactivityModal]);

  // --- ESTADO PARA DIRECTORIO ---

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/verify-admin');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Error verificando auth', err);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/login-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.message || 'Error de acceso');
      }
    } catch (err) {
      setLoginError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // --- ESTADO PARA DIRECTORIO ---
  const [showDirectory, setShowDirectory] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState('');

  // --- ESTADO PARA EMISION ---
  const [datosFiscales, setDatosFiscales] = useState({
    rfc: '', razonSocial: '', regimenFiscal: '', usoCfdi: '', codigoPostal: '', 
    email: '', formaPago: '01', metodoPago: 'PUE', serie: 'A', folio: '',
    usuario: '', uuidRelacionado: '', fechaPago: ''
  });
  const [esGlobal, setEsGlobal] = useState(false);
  const [globalInfo, setGlobalInfo] = useState({
    periodicity: '01', months: String(new Date().getMonth() + 1).padStart(2, '0'), year: new Date().getFullYear()
  });
  const [productos, setProductos] = useState([{ id: Date.now(), nombre: '', cantidad: 1, precio_unitario: 0 }]);
  const [facturaGenerada, setFacturaGenerada] = useState(null);

  // --- ESTADO PARA LISTADO ---
  const [facturas, setFacturas] = useState([]);
  const [filtros, setFiltros] = useState({
    mes: String(new Date().getMonth() + 1).padStart(2, '0'),
    year: String(new Date().getFullYear()),
    busqueda: ''
  });
  const [showCPModal, setShowCPModal] = useState(null); 
  const [showEmailModal, setShowEmailModal] = useState(null);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [emailToSend, setEmailToSend] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [cpLoading, setCpLoading] = useState(false);
  const [cpDatos, setCpDatos] = useState({ monto: 0, fecha: new Date().toISOString().split('T')[0], formaPago: '03' });

  const handleEmitirComplemento = async () => {
    setCpLoading(true);
    setMensaje({ type: '', text: '' });
    try {
      const res = await fetch('/api/complemento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factura: showCPModal,
          monto: cpDatos.monto,
          formaPago: cpDatos.formaPago,
          fechaPago: cpDatos.fecha
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al emitir complemento');
      
      setMensaje({ type: 'success', text: '¡Complemento emitido correctamente!' });
      setShowCPModal(null);
      cargarFacturas(); // Recargar lista
    } catch (err) {
      alert(err.message);
    } finally {
      setCpLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailToSend) return alert('Ingresa un correo');
    setEmailLoading(true);
    try {
      const res = await fetch(`/api/cfdi/enviar-correo?id=${showEmailModal.facturamaId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailToSend,
          ticket: showEmailModal.ticket,
          total: showEmailModal.total,
          rfc: showEmailModal.rfc,
          uuid: showEmailModal.uuid,
          fecha: showEmailModal.fechaTicket || showEmailModal.createdAt
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar');
      alert('¡Correo enviado con éxito!');
      setShowEmailModal(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  // --- EFECTOS ---
  useEffect(() => {
    if (activeTab === 'facturado') cargarFacturas();
    if (activeTab === 'clientes') cargarClientes();
  }, [activeTab, filtros.mes, filtros.year]);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      // Usamos el endpoint de gas-ticket pero con la acción listClients
      const res = await fetch('/api/gas-ticket?action=listClients');
      const data = await res.json();
      if (data.ok) setClientes(data.items || []);
      else throw new Error(data.error || 'Error al cargar clientes');
    } catch (err) {
      setMensaje({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const seleccionarCliente = (c) => {
    setDatosFiscales({
      ...datosFiscales,
      rfc: c.rfc || '',
      razonSocial: c.razonSocial || '',
      codigoPostal: c.cp || '',
      email: c.email || '',
      regimenFiscal: c.regimenFiscal || '',
      usoCfdi: c.usoCfdi || ''
    });
    setActiveTab('emitir');
    setMensaje({ type: 'success', text: `Cliente ${c.rfc} seleccionado` });
  };

  const cargarFacturas = async () => {
    setLoading(true);
    try {
      const data = await listInvoices({ month: filtros.mes, year: filtros.year });
      if (data.ok) setFacturas(data.items || []);
      else throw new Error(data.error || 'Error al cargar facturas');
    } catch (err) {
      setMensaje({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Autollenar global
  useEffect(() => {
    if (esGlobal) {
      setDatosFiscales(prev => ({
        ...prev, rfc: 'XAXX010101000', razonSocial: 'PUBLICO EN GENERAL',
        regimenFiscal: '616', usoCfdi: 'S01', codigoPostal: '48315'
      }));
    }
  }, [esGlobal]);

  // PPD -> 99
  useEffect(() => {
    if (datosFiscales.metodoPago === 'PPD') setDatosFiscales(prev => ({ ...prev, formaPago: '99' }));
  }, [datosFiscales.metodoPago]);

  // Totales
  const round2 = (v) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;
  
  // Función para formatear fecha a CDMX
  const formatFechaCDMX = (isoStr) => {
    if (!isoStr) return '---';
    try {
      const date = new Date(isoStr);
      return new Intl.DateTimeFormat('es-MX', {
        timeZone: 'America/Mexico_City',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (e) {
      return isoStr.split('T')[0];
    }
  };

  const isPM = (r) => String(r || '').trim().length === 12 && r !== 'XAXX010101000';
  const aplicaISR = isPM(datosFiscales.rfc);

  const totales = (() => {
    let sub = 0, iva = 0, isr = 0;
    productos.forEach(p => {
      const g = p.cantidad * p.precio_unitario;
      if (aplicaISR) {
        const b = round2(g / 1.1475);
        sub += b; iva += round2(b * 0.16); isr += round2(b * 0.0125);
      } else {
        const b = round2(g / 1.16);
        sub += b; iva += round2(g - b);
      }
    });
    return { sub, iva, isr, total: round2(sub + iva - isr) };
  })();

  // Handlers para productos
  const handleAddProducto = () => {
    setProductos([...productos, { id: Date.now(), nombre: '', cantidad: 1, precio_unitario: 0 }]);
  };

  const handleRemoveProducto = (id) => {
    if (productos.length > 1) {
      setProductos(productos.filter(p => p.id !== id));
    }
  };

  const handleChangeProducto = (id, field, value) => {
    setProductos(productos.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosFiscales({ ...datosFiscales, [name]: value.toUpperCase() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...datosFiscales,
      ticket: `MANUAL-${Date.now()}`,
      payments: [{ name: formasPago.find(f => f.value === datosFiscales.formaPago)?.label || 'EFECTIVO' }],
      productos: productos.map(p => ({ ...p, total_money: p.cantidad * p.precio_unitario })),
      total: totales.total,
      globalInfo: esGlobal ? globalInfo : undefined
    };
    try {
      const res = await fetch('/api/facturar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en emisión');
      setFacturaGenerada(data);
      setMensaje({ type: 'success', text: '¡Factura emitida!' });
    } catch (err) {
      setMensaje({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-[#003082] p-10 text-white text-center">
            <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-4">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-2xl font-black">Acceso Restringido</h2>
            <p className="text-blue-100 text-sm font-bold uppercase tracking-widest opacity-80 mt-2">Puerto Copy Admin</p>
          </div>
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Usuario</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  required
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                  placeholder="Usuario"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="password" 
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-black flex items-center gap-2">
                <AlertCircle size={16} /> {loginError}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-[#003082] text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center gap-3 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} /> ENTRAR AL PANEL</>}
            </button>
          </form>
          <div className="p-6 bg-gray-50 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Acceso monitoreado y protegido - Puerto Copy 2024</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar forceWhite={true} />
      
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Tabs */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#003082] tracking-tight">Puerto Copy Admin</h1>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Gestión de Facturación</p>
              </div>
            </div>

            <div className="flex bg-gray-100 p-1.5 rounded-2xl">
              <button 
                onClick={() => setActiveTab('emitir')}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'emitir' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Emitir
              </button>
              <button 
                onClick={() => setActiveTab('facturado')}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'facturado' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Facturado
              </button>
            </div>
          </div>
        </div>

        {/* --- ESTADO PARA DIRECTORIO --- */}
        {/* Se usa para controlar el modal de búsqueda de clientes */}
        {activeTab === 'emitir' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Formulario Izquierdo */}
            <div className="xl:col-span-8 space-y-8">
              {/* Controles de Folio y Global Switch */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="w-24">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Serie</label>
                    <input name="serie" value={datosFiscales.serie} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 font-black text-blue-600 border-none" placeholder="A" />
                  </div>
                  <div className="w-32">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Folio</label>
                    <input name="folio" value={datosFiscales.folio} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 font-black border-none" placeholder="Auto" />
                  </div>
                </div>
                <button 
                  onClick={() => setEsGlobal(!esGlobal)}
                  className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all ${esGlobal ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Globe size={18} /> {esGlobal ? 'Global Activa' : 'Hacer Global'}
                </button>
              </div>

              {/* Receptor */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-2"><User className="text-blue-600" /> Receptor</h2>
                  <button 
                    onClick={() => {
                      setShowDirectory(true);
                      cargarClientes();
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-100 transition-all"
                  >
                    <Search size={14} /> Directorio
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">RFC</label>
                    <input name="rfc" value={datosFiscales.rfc} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Razón Social</label>
                    <input name="razonSocial" value={datosFiscales.razonSocial} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold" />
                  </div>

                  <AnimatePresence>
                    {esGlobal && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="col-span-full"
                      >
                        <div className="bg-blue-600 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 shadow-lg shadow-blue-100 mb-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/70 uppercase tracking-widest">Periodicidad</label>
                            <select 
                              value={globalInfo.periodicity}
                              onChange={(e) => setGlobalInfo({...globalInfo, periodicity: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border-none bg-white/10 text-white text-sm font-bold backdrop-blur-md"
                            >
                              {periodicidades.map(p => <option key={p.value} value={p.value} className="text-gray-900">{p.label}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/70 uppercase tracking-widest">Mes de Venta</label>
                            <select 
                              value={globalInfo.months}
                              onChange={(e) => setGlobalInfo({...globalInfo, months: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border-none bg-white/10 text-white text-sm font-bold backdrop-blur-md"
                            >
                              {meses.map(m => <option key={m.value} value={m.value} className="text-gray-900">{m.label}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/70 uppercase tracking-widest">Año Fiscal</label>
                            <input 
                              type="number"
                              value={globalInfo.year}
                              onChange={(e) => setGlobalInfo({...globalInfo, year: e.target.value})}
                              className="w-full px-4 py-3 rounded-xl border-none bg-white/10 text-white text-sm font-bold backdrop-blur-md"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1">                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">C.P. Fiscal</label>
                    <input name="codigoPostal" value={datosFiscales.codigoPostal} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Email</label>
                    <input type="email" value={datosFiscales.email} onChange={(e) => setDatosFiscales({...datosFiscales, email: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold" />
                  </div>
                </div>
              </div>

              {/* Conceptos */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-gray-800 flex items-center gap-2"><Package className="text-emerald-600" /> Conceptos</h2>
                  <button onClick={handleAddProducto} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"><Plus /></button>
                </div>
                {productos.map(p => (
                  <div key={p.id} className="flex gap-4 bg-gray-50 p-4 rounded-2xl relative group border border-gray-100">
                    <input placeholder="Descripción..." value={p.nombre} onChange={(e) => handleChangeProducto(p.id, 'nombre', e.target.value)} className="flex-1 px-4 py-2 rounded-xl border-none font-bold text-sm bg-white" />
                    <input type="number" value={p.cantidad} onChange={(e) => handleChangeProducto(p.id, 'cantidad', e.target.value)} className="w-20 px-4 py-2 rounded-xl border-none font-bold text-sm bg-white text-center" />
                    <input type="number" value={p.precio_unitario} onChange={(e) => handleChangeProducto(p.id, 'precio_unitario', e.target.value)} className="w-28 px-4 py-2 rounded-xl border-none font-bold text-sm bg-white text-right" />
                    <button onClick={() => handleRemoveProducto(p.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha Totales */}
            <div className="xl:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 sticky top-28">
                <h3 className="text-xl font-black mb-8 flex items-center gap-2"><Calculator className="text-blue-600" /> Resumen</h3>
                <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-3xl font-bold text-sm">
                  <div className="flex justify-between text-gray-400 font-black"><span>SUBTOTAL</span><span>${totales.sub.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-400 font-black"><span>IVA (16%)</span><span>${totales.iva.toFixed(2)}</span></div>
                  {aplicaISR && <div className="flex justify-between text-red-400 font-black"><span>RET ISR</span><span>-${totales.isr.toFixed(2)}</span></div>}
                  <div className="pt-4 border-t-2 border-dashed flex justify-between items-end">
                    <span className="text-gray-900 font-black">TOTAL</span>
                    <span className="text-4xl font-black text-blue-600 leading-none">${totales.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <select name="metodoPago" value={datosFiscales.metodoPago} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none font-bold text-gray-700">
                    <option value="PUE">PUE - Una sola exhibición</option>
                    <option value="PPD">PPD - Parcialidades / Diferido</option>
                  </select>
                  <select name="formaPago" disabled={datosFiscales.metodoPago === 'PPD'} value={datosFiscales.formaPago} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none font-bold text-gray-700">
                    {formasPago.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <button onClick={handleSubmit} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center gap-3">
                    {loading ? <Loader2 className="animate-spin" /> : <><Send size={24} /> EMITIR CFDI</>}
                  </button>
                </div>

                {mensaje.text && (
                  <div className={`mt-6 p-4 rounded-2xl flex items-start gap-3 border-2 ${mensaje.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                    {mensaje.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p className="text-xs font-black">{mensaje.text}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- PESTAÑA FACTURADO (TABLA Y FILTROS) --- */}
        {activeTab === 'facturado' && (
          <div className="space-y-6">
            {/* Barra de Filtros */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar por RFC, Razón Social o Ticket..." 
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={filtros.mes} 
                    onChange={(e) => setFiltros({...filtros, mes: e.target.value})}
                    className="px-4 py-3 rounded-2xl bg-gray-50 border-none text-sm font-black text-blue-600"
                  >
                    {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <input 
                    type="number" 
                    value={filtros.year} 
                    onChange={(e) => setFiltros({...filtros, year: e.target.value})}
                    className="w-24 px-4 py-3 rounded-2xl bg-gray-50 border-none text-sm font-black text-blue-600"
                  />
                </div>
              </div>
              <button onClick={cargarFacturas} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Tabla de Facturas */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha / Ticket</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Receptor</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Importe</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Método / Pago</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {facturas
                      .filter(f => 
                        !filtros.busqueda || 
                        f.rfc?.toLowerCase().includes(filtros.busqueda.toLowerCase()) || 
                        f.razonSocial?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                        f.ticket?.toLowerCase().includes(filtros.busqueda.toLowerCase())
                      )
                      .map((f, i) => (
                      <tr 
                        key={i} 
                        className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                        onClick={(e) => {
                          // Evitar que el clic en botones dispare la vista previa
                          if (e.target.closest('button') || e.target.closest('a')) return;
                          setPreviewPdf(f);
                        }}
                      >
                        <td className="px-6 py-4">
                          <p className="text-xs font-black text-blue-600 uppercase tracking-tight">{f.ticket}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{formatFechaCDMX(f.fechaTicket || f.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-black text-blue-600 uppercase tracking-tight font-mono">{f.rfc || 'S/RFC'}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{f.razonSocial || 'PÚBLICO EN GENERAL'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-gray-900">${Number(f.total || 0).toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 items-center">
                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${f.metodoPago === 'PPD' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {f.metodoPago || 'PUE'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{f.formaPago || '01'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2 transition-all">
                            <a 
                              href={`/api/cfdi/descargar?id=${f.facturamaId}&type=pdf`} 
                              target="_blank" 
                              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 shadow-sm" 
                              title="Descargar PDF"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FileText size={16}/>
                            </a>
                            <a 
                              href={`/api/cfdi/descargar?id=${f.facturamaId}&type=xml`} 
                              download
                              className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 shadow-sm" 
                              title="Descargar XML"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Hash size={16}/>
                            </a>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEmailToSend(f.email || '');
                                setShowEmailModal(f);
                              }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 shadow-sm"
                              title="Enviar por Correo"
                            >
                              <Mail size={16}/>
                            </button>
                            {f.metodoPago === 'PPD' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCPModal(f);
                                }}
                                className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 shadow-md shadow-indigo-100"
                              >
                                <ArrowRightLeft size={14} /> Complemento
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {facturas.length === 0 && !loading && (
                <div className="p-20 text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300"><FileText size={40}/></div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No se encontraron facturas en este periodo</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- MODAL DE DIRECTORIO DE CLIENTES --- */}
        <AnimatePresence>
          {showDirectory && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#003082]/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="bg-blue-600 p-8 text-white relative">
                  <button onClick={() => setShowDirectory(false)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                    <Plus className="rotate-45" />
                  </button>
                  <h3 className="text-2xl font-black mb-1 flex items-center gap-2"><UserCheck size={28} /> Directorio de Clientes</h3>
                  <p className="text-blue-100 text-sm font-bold uppercase tracking-widest opacity-80">Selecciona un cliente para autocompletar</p>
                </div>

                <div className="p-6 border-b border-gray-50 flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar por RFC o Razón Social..." 
                      value={filtroCliente}
                      onChange={(e) => setFiltroCliente(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none text-sm font-bold"
                    />
                  </div>
                  <button onClick={cargarClientes} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100">
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">RFC</th>
                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase">Cliente</th>
                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(Array.isArray(clientes) ? clientes : [])
                        .filter(c => 
                          !filtroCliente || 
                          String(c.rfc || '').toLowerCase().includes(filtroCliente.toLowerCase()) || 
                          String(c.razonSocial || '').toLowerCase().includes(filtroCliente.toLowerCase())
                        )
                        .map((c, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                          <td className="px-4 py-4">
                            <p className="text-xs font-black text-blue-600 font-mono">{c.rfc || 'S/RFC'}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-xs font-black text-gray-800 uppercase line-clamp-1">{c.razonSocial || 'SIN NOMBRE'}</p>
                            <p className="text-[10px] font-bold text-gray-400 lowercase">{c.email || 'sin@correo.com'}</p>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button 
                              onClick={() => {
                                seleccionarCliente(c);
                                setShowDirectory(false);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-100"
                            >
                              Usar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {clientes.length === 0 && !loading && (
                    <p className="text-center py-10 text-gray-400 font-bold uppercase text-xs">No se encontraron clientes</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MODAL PARA COMPLEMENTO DE PAGO --- */}
        <AnimatePresence>
          {showCPModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#003082]/40 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="bg-indigo-600 p-8 text-white relative">
                  <button onClick={() => setShowCPModal(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Plus className="rotate-45" /></button>
                  <h3 className="text-2xl font-black mb-1">Emitir Complemento</h3>
                  <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest opacity-80">Relacionando UUID: {showCPModal.uuid?.slice(0, 18)}...</p>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Importe del Pago</label>
                      <input 
                        type="number" 
                        value={cpDatos.monto} 
                        onChange={(e) => setCpDatos({...cpDatos, monto: e.target.value})}
                        className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none font-black text-indigo-600" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha de Pago</label>
                      <input 
                        type="date" 
                        value={cpDatos.fecha} 
                        onChange={(e) => setCpDatos({...cpDatos, fecha: e.target.value})}
                        className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none font-black" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Forma de Pago del Cliente</label>
                    <select 
                      value={cpDatos.formaPago} 
                      onChange={(e) => setCpDatos({...cpDatos, formaPago: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none font-bold"
                    >
                      {formasPago.filter(f => f.value !== '99').map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <button 
                      onClick={handleEmitirComplemento}
                      disabled={cpLoading}
                      className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex justify-center items-center gap-3"
                    >
                      {cpLoading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> GENERAR PAGO (CFDI P)</>}
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-4 font-bold uppercase italic">* Esto saldará la factura en el sistema automáticamente</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MODAL PARA ENVIAR CORREO --- */}
        <AnimatePresence>
          {showEmailModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#003082]/40 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-white relative">
                  <button onClick={() => setShowEmailModal(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Plus className="rotate-45" /></button>
                  <h3 className="text-2xl font-black mb-1">Enviar Factura</h3>
                  <p className="text-blue-100 text-sm font-bold uppercase tracking-widest opacity-80">Ticket: {showEmailModal.ticket}</p>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      value={emailToSend} 
                      onChange={(e) => setEmailToSend(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none font-bold" 
                    />
                  </div>
                  <button 
                    onClick={handleSendEmail}
                    disabled={emailLoading}
                    className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex justify-center items-center gap-3"
                  >
                    {emailLoading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> ENVIAR POR CORREO</>}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MODAL PARA VISTA PREVIA PDF --- */}
        <AnimatePresence>
          {previewPdf && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-[#003082]/60 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full h-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative">
                
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 z-10">
                  <div>
                    <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                      <FileText className="text-red-500" /> Vista Previa: {previewPdf.ticket}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recuperando archivo desde Facturama...</p>
                  </div>
                  <div className="flex gap-3">
                    <a 
                      href={`/api/cfdi/descargar?id=${previewPdf.facturamaId}&type=pdf`} 
                      download
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                      <Download size={16} /> Descargar
                    </a>
                    <button onClick={() => setPreviewPdf(null)} className="p-2.5 bg-gray-200 text-gray-600 rounded-2xl hover:bg-gray-300 transition-all"><Plus className="rotate-45" /></button>
                  </div>
                </div>

                <div className="flex-1 bg-gray-100 flex items-center justify-center relative">
                  {/* Loader de fondo mientras el iframe carga */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-blue-600/30">
                    <Loader2 size={48} className="animate-spin" />
                    <p className="font-black text-sm uppercase tracking-tighter">Conectando con Facturama...</p>
                  </div>
                  
                  <iframe 
                    src={`/api/cfdi/descargar?id=${previewPdf.facturamaId}&type=pdf#toolbar=0`} 
                    className="w-full h-full border-none relative z-10"
                    title="PDF Preview"
                    onLoad={() => console.log('PDF Cargado')}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MODAL DE INACTIVIDAD / RENOVACIÓN --- */}
        <AnimatePresence>
          {showInactivityModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#003082]/80 backdrop-blur-xl">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="bg-orange-500 p-10 text-white text-center">
                  <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-4">
                    <RefreshCw size={40} className="animate-spin-slow" />
                  </div>
                  <h2 className="text-2xl font-black">¿Sigues ahí?</h2>
                  <p className="text-orange-100 text-sm font-bold uppercase tracking-widest opacity-80 mt-2">Tu sesión expirará en {countdownToLogout} segundos</p>
                </div>
                <div className="p-10 space-y-6">
                  <p className="text-sm font-bold text-gray-500 text-center uppercase tracking-tight">Para continuar sin perder tus datos, ingresa tu contraseña:</p>
                  <form onSubmit={handleRenewSession} className="space-y-4">
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="password" 
                        required
                        autoFocus
                        value={reauthData}
                        onChange={(e) => setReauthData(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700 focus:ring-2 focus:ring-orange-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={handleLogout}
                        className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                      >
                        No, Salir
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all flex justify-center items-center gap-2"
                      >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : 'Sí, Continuar'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <Footer />
    </div>
  );
}
