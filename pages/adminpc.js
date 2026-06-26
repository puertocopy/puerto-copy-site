import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Send, CheckCircle, AlertCircle, 
  User, Building, Mail, MapPin, CreditCard, 
  ChevronRight, Package, Calculator, Loader2,
  FileText, Globe, Settings, Hash, ShieldCheck,
  Calendar, UserCheck, Link, Search, Filter,
  ArrowRightLeft, Download, Eye, RefreshCw, Printer,
  Edit, UserPlus, X, ArrowUp, ArrowDown, ArrowUpDown
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { listInvoices } from '../lib/gasTickets';
import { generarCotizacionPDF } from '../utils/generarCotizacionPDF';

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

const safeParseJson = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Respuesta no válida del servidor (${res.status}): ${text.substring(0, 150)}`);
  }
};

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('emitir'); // 'emitir' | 'facturado' | 'clientes' | 'cotizacion'
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
      const data = await safeParseJson(res);
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
      const data = await safeParseJson(res);
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

  // --- ESTADOS PARA CLIENTES CRUD ---
  const [filtroClientesTab, setFiltroClientesTab] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientFormData, setClientFormData] = useState({
    rfc: '',
    razonSocial: '',
    regimen: '',
    cp: '',
    email: '',
    usoCfdi: '',
    code: ''
  });

  const openCreateClientModal = () => {
    setEditingClient(null);
    setClientFormData({
      rfc: '',
      razonSocial: '',
      regimen: '',
      cp: '',
      email: '',
      usoCfdi: '',
      code: ''
    });
    setShowClientModal(true);
  };

  const openEditClientModal = (c) => {
    setEditingClient(c);
    setClientFormData({
      rfc: c.rfc || '',
      razonSocial: c.razonSocial || '',
      regimen: c.regimen || '',
      cp: c.cp || '',
      email: c.email || '',
      usoCfdi: c.usoCfdi || '',
      code: c.code || ''
    });
    setShowClientModal(true);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ type: '', text: '' });
    
    try {
      const cleanRfc = String(clientFormData.rfc || '').toUpperCase().trim();
      const cleanRazon = String(clientFormData.razonSocial || '').toUpperCase().trim();
      const cleanRegimen = String(clientFormData.regimen || '').trim();
      const cleanCp = String(clientFormData.cp || '').trim();
      const cleanEmail = String(clientFormData.email || '').trim();
      const cleanUso = String(clientFormData.usoCfdi || '').trim();
      const cleanCode = String(clientFormData.code || '').trim();

      const regObj = regimenes.find(r => r.value === cleanRegimen);
      const regimenFiscalLargo = regObj ? regObj.label : cleanRegimen;
      
      const payload = {
        rfc: cleanRfc,
        razonSocial: cleanRazon,
        regimen: cleanRegimen,
        codigoPostal: cleanCp,
        regimenFiscal: regimenFiscalLargo,
        email: cleanEmail,
        usoCfdi: cleanUso,
        code: cleanCode,
        // Compatibilidad con Google Sheets
        "RFC": cleanRfc,
        "Razón Social": cleanRazon,
        "Regimen": cleanRegimen,
        "CP": cleanCp,
        "Régimen Fiscal": regimenFiscalLargo,
        "Email": cleanEmail,
        "Uso CFDI": cleanUso,
        "Code": cleanCode
      };
      
      const res = await fetch('/api/registrar-datos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await safeParseJson(res);
      if (!res.ok) throw new Error(data.message || 'Error al guardar cliente');
      
      setShowClientModal(false);
      setMensaje({ type: 'success', text: `Cliente ${clientFormData.rfc} guardado con éxito` });
      cargarClientes(); // Recargar la lista
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  // --- ESTADO PARA COTIZACIÓN ---
  const [datosCotizacion, setDatosCotizacion] = useState({
    nombre: '', atencion: '', telefono: '', correo: '', domicilio: ''
  });
  const [productosCotizacion, setProductosCotizacion] = useState([{ id: Date.now(), nombre: '', variante: '', cantidad: 1, precio: 0 }]);

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
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [cfdiDetails, setCfdiDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={10} className="text-gray-300 ml-1" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={10} className="text-blue-600 ml-1 font-black" />
      : <ArrowDown size={10} className="text-blue-600 ml-1 font-black" />;
  };

  const sortedAndFilteredFacturas = useMemo(() => {
    let items = facturas.filter(f => 
      !filtros.busqueda || 
      f.rfc?.toLowerCase().includes(filtros.busqueda.toLowerCase()) || 
      f.razonSocial?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      f.ticket?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      f.usuario?.toLowerCase().includes(filtros.busqueda.toLowerCase())
    );

    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (aVal === undefined || aVal === null) aVal = '';
        if (bVal === undefined || bVal === null) bVal = '';

        if (sortConfig.key === 'total') {
          return sortConfig.direction === 'asc' 
            ? Number(aVal) - Number(bVal)
            : Number(bVal) - Number(aVal);
        }

        if (sortConfig.key === 'ticket') {
          const getTicketNum = (t) => {
            const match = String(t).match(/\d+$/);
            return match ? parseInt(match[0], 10) : 0;
          };
          const numA = getTicketNum(aVal);
          const numB = getTicketNum(bVal);
          if (numA !== numB) {
            return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
          }
        }

        const strA = String(aVal).toLowerCase();
        const strB = String(bVal).toLowerCase();

        if (strA < strB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (strA > strB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return items;
  }, [facturas, filtros.busqueda, sortConfig]);

  useEffect(() => {
    if (previewPdf) {
      if (previewPdf.status === 'TIMBRADO' && previewPdf.facturamaId) {
        setPdfError(null);
        fetchPdf(previewPdf.facturamaId);
        fetchCfdiDetails(previewPdf.facturamaId);
      } else {
        if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
        setCfdiDetails(null);
        setPdfError('Esta factura no ha sido timbrada en Facturama o se encuentra en estado de error.');
      }
    } else {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
      setCfdiDetails(null);
      setPdfError(null);
    }
  }, [previewPdf]);

  const fetchCfdiDetails = async (id) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/cfdi/descargar?id=${id}&type=details`);
      if (!res.ok) throw new Error('No se pudieron recuperar los detalles de la factura');
      const data = await res.json();
      setCfdiDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchPdf = async (id) => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await fetch(`/api/cfdi/descargar?id=${id}&type=pdf&t=${Date.now()}`);
      if (!res.ok) {
        let msg = 'No se pudo recuperar el PDF de Facturama.';
        try {
          const errorData = await res.json();
          if (errorData.message) msg = errorData.message;
        } catch (_) {
          try {
            const text = await res.text();
            if (text && text.trim().length < 150) msg = text;
          } catch (__) {}
        }
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
    } catch (err) {
      console.error(err);
      setPdfError(err.message || 'Error al cargar el PDF de Facturama.');
    } finally {
      setPdfLoading(false);
    }
  };
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
      const data = await safeParseJson(res);
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
          fecha: showEmailModal.createdAt || showEmailModal.fechaTicket
        })
      });
      const data = await safeParseJson(res);
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
      const data = await safeParseJson(res);
      if (data.ok) setClientes(data.items || []);
      else throw new Error(data.error || 'Error al cargar clientes');
    } catch (err) {
      setMensaje({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const seleccionarCliente = (c) => {
    const commonData = {
      rfc: c.rfc || '',
      razonSocial: c.razonSocial || '',
      codigoPostal: c.cp || '',
      email: c.email || '',
      regimenFiscal: c.regimenFiscal || '',
      usoCfdi: c.usoCfdi || ''
    };
    
    setDatosFiscales({
      ...datosFiscales,
      ...commonData
    });

    setDatosCotizacion({
      ...datosCotizacion,
      nombre: c.razonSocial || '',
      telefono: c.telefono || '',
      correo: c.email || ''
    });

    setMensaje({ type: 'success', text: `Cliente ${c.rfc || c.razonSocial} seleccionado` });
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
      // Si recibimos el formato de GAS (ej. 2026-02-12T21:57:12.000Z)
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return String(isoStr).split('T')[0];
      
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
      console.error('Error formateando fecha:', e, isoStr);
      return String(isoStr).split('T')[0];
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
      const data = await safeParseJson(res);
      if (!res.ok) throw new Error(data.message || 'Error en emisión');
      setFacturaGenerada(data);
      setMensaje({ type: 'success', text: '¡Factura emitida!' });
    } catch (err) {
      setMensaje({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS COTIZACIÓN ---
  const handleAddProductoCotizacion = () => {
    setProductosCotizacion([...productosCotizacion, { id: Date.now(), nombre: '', variante: '', cantidad: 1, precio: 0 }]);
  };

  const handleRemoveProductoCotizacion = (id) => {
    if (productosCotizacion.length > 1) {
      setProductosCotizacion(productosCotizacion.filter(p => p.id !== id));
    }
  };

  const handleChangeProductoCotizacion = (id, field, value) => {
    setProductosCotizacion(productosCotizacion.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleDescargarCotizacion = async () => {
    if (!datosCotizacion.nombre) return alert('Ingresa el nombre del cliente');
    setLoading(true);
    try {
      const pdfBlob = await generarCotizacionPDF(datosCotizacion, productosCotizacion);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cotizacion_${datosCotizacion.nombre.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setMensaje({ type: 'success', text: '¡Cotización generada con éxito!' });
    } catch (err) {
      console.error(err);
      setMensaje({ type: 'error', text: 'Error al generar el PDF' });
    } finally {
      setLoading(false);
    }
  };

  const totalesCotizacion = (() => {
    const total = productosCotizacion.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);
    const subtotal = total / 1.16;
    const iva = total - subtotal;
    return { subtotal, iva, total };
  })();

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
                onClick={() => setActiveTab('cotizacion')}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'cotizacion' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Cotizar
              </button>
              <button 
                onClick={() => setActiveTab('facturado')}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'facturado' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Facturado
              </button>
              <button 
                onClick={() => setActiveTab('clientes')}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'clientes' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Clientes
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

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">C.P. Fiscal</label>
                    <input name="codigoPostal" value={datosFiscales.codigoPostal} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Uso CFDI</label>
                    <select 
                      name="usoCfdi" 
                      value={datosFiscales.usoCfdi} 
                      onChange={handleInputChange} 
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold text-gray-700"
                    >
                      <option value="">Seleccionar Uso...</option>
                      {usosCFDI.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Régimen Fiscal</label>
                    <select 
                      name="regimenFiscal" 
                      value={datosFiscales.regimenFiscal} 
                      onChange={handleInputChange} 
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold text-gray-700"
                    >
                      <option value="">Seleccionar Régimen...</option>
                      {regimenes.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
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

        {/* --- PESTAÑA COTIZACIÓN --- */}
        {activeTab === 'cotizacion' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 space-y-8">
              {/* Información del Cliente */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                  <h2 className="text-xl font-black text-[#002D56] flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg"><User className="text-blue-600" size={20} /></div>
                    Datos del Cliente
                  </h2>
                  <button 
                    onClick={() => {
                      setShowDirectory(true);
                      cargarClientes();
                    }}
                    className="px-4 py-2 bg-[#002D56] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-900 transition-all shadow-lg shadow-blue-100"
                  >
                    <Search size={14} /> Buscar en Directorio
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Nombre o Empresa</label>
                    <input 
                      value={datosCotizacion.nombre} 
                      onChange={(e) => setDatosCotizacion({...datosCotizacion, nombre: e.target.value.toUpperCase()})} 
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all font-bold text-gray-700" 
                      placeholder="ARQUITECTURA VALLARTA S.A."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Atención a</label>
                    <input 
                      value={datosCotizacion.atencion} 
                      onChange={(e) => setDatosCotizacion({...datosCotizacion, atencion: e.target.value.toUpperCase()})} 
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all font-bold text-gray-700" 
                      placeholder="ARQ. ROBERTO JIMÉNEZ"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Teléfono de Contacto</label>
                    <input 
                      value={datosCotizacion.telefono} 
                      onChange={(e) => setDatosCotizacion({...datosCotizacion, telefono: e.target.value})} 
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all font-bold text-gray-700" 
                      placeholder="322 123 4567"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      value={datosCotizacion.correo} 
                      onChange={(e) => setDatosCotizacion({...datosCotizacion, correo: e.target.value})} 
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all font-bold text-gray-700" 
                      placeholder="contacto@cliente.com"
                    />
                  </div>
                </div>
              </div>

              {/* Conceptos de Cotización */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                  <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg"><Package className="text-emerald-600" size={20} /></div>
                    Conceptos a Cotizar
                  </h2>
                  <button 
                    onClick={handleAddProductoCotizacion} 
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all"
                  >
                    <Plus size={14} /> Añadir Concepto
                  </button>
                </div>
                <div className="space-y-4">
                  {productosCotizacion.map((p, index) => (
                    <div key={p.id} className="group relative bg-gray-50 hover:bg-white p-6 rounded-[2rem] border-2 border-transparent hover:border-blue-100 transition-all shadow-sm hover:shadow-md">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-5 space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Descripción del Servicio</label>
                          <input 
                            placeholder="Ej. Impresión de Planos" 
                            value={p.nombre} 
                            onChange={(e) => handleChangeProductoCotizacion(p.id, 'nombre', e.target.value)} 
                            className="w-full px-4 py-2.5 rounded-xl border-none font-bold text-sm bg-white shadow-inner" 
                          />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Variante / Detalle</label>
                          <input 
                            placeholder="Ej. Bond 90g" 
                            value={p.variante} 
                            onChange={(e) => handleChangeProductoCotizacion(p.id, 'variante', e.target.value)} 
                            className="w-full px-4 py-2.5 rounded-xl border-none font-bold text-sm bg-white shadow-inner" 
                          />
                        </div>
                        <div className="md:col-span-1 space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase text-center block">Cant.</label>
                          <input 
                            type="number" 
                            value={p.cantidad} 
                            onChange={(e) => handleChangeProductoCotizacion(p.id, 'cantidad', parseFloat(e.target.value) || 0)} 
                            className="w-full px-2 py-2.5 rounded-xl border-none font-bold text-sm bg-white text-center shadow-inner" 
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase text-right block">Precio Neto</label>
                          <input 
                            type="number" 
                            value={p.precio} 
                            onChange={(e) => handleChangeProductoCotizacion(p.id, 'precio', parseFloat(e.target.value) || 0)} 
                            className="w-full px-4 py-2.5 rounded-xl border-none font-bold text-sm bg-white text-right text-blue-600 shadow-inner" 
                          />
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <button 
                            onClick={() => handleRemoveProductoCotizacion(p.id)} 
                            className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all group-hover:opacity-100 md:opacity-0"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen y Acción */}
            <div className="xl:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 sticky top-28">
                <h3 className="text-xl font-black mb-8 flex items-center gap-2"><Calculator className="text-blue-600" /> Resumen de Cotización</h3>
                <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-3xl font-bold text-sm">
                  <div className="flex justify-between text-gray-400 font-black"><span>SUBTOTAL</span><span>${totalesCotizacion.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-400 font-black"><span>IVA (16%)</span><span>${totalesCotizacion.iva.toFixed(2)}</span></div>
                  <div className="pt-4 border-t-2 border-dashed flex justify-between items-end">
                    <span className="text-gray-900 font-black">TOTAL</span>
                    <span className="text-4xl font-black text-blue-600 leading-none">${totalesCotizacion.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleDescargarCotizacion} 
                  disabled={loading} 
                  className="w-full py-5 bg-[#003082] text-white rounded-[2rem] font-black text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Printer size={24} /> GENERAR PDF (CARTA)</>}
                </button>

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
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest select-none">
                        <div className="flex items-center gap-2">
                          <span 
                            onClick={() => handleSort('createdAt')}
                            className="cursor-pointer hover:text-blue-600 flex items-center gap-0.5 transition-all"
                          >
                            Fecha
                            {renderSortIcon('createdAt')}
                          </span>
                          <span className="text-gray-300">/</span>
                          <span 
                            onClick={() => handleSort('ticket')}
                            className="cursor-pointer hover:text-blue-600 flex items-center gap-0.5 transition-all"
                          >
                            Ticket
                            {renderSortIcon('ticket')}
                          </span>
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('razonSocial')}
                        className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-all select-none"
                      >
                        <div className="flex items-center gap-1">
                          Receptor / Usuario
                          {renderSortIcon('razonSocial')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('total')}
                        className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-all select-none"
                      >
                        <div className="flex items-center gap-1">
                          Importe
                          {renderSortIcon('total')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('metodoPago')}
                        className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-all select-none"
                      >
                        <div className="flex items-center gap-1">
                          Método / Pago
                          {renderSortIcon('metodoPago')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center select-none">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sortedAndFilteredFacturas.map((f, i) => (
                      <tr 
                        key={i} 
                        className="hover:bg-blue-50/30 transition-all group cursor-pointer"
                        onClick={(e) => {
                          if (e.target.closest('button') || e.target.closest('a')) return;
                          setPreviewPdf(f);
                        }}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-[#003082] uppercase tracking-tight leading-tight mb-0.5">
                            {f.ticket}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            {formatFechaCDMX(f.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-xs font-black text-blue-600 uppercase tracking-tight line-clamp-1">
                              {f.razonSocial || (f.rfc === 'XAXX010101000' ? 'PÚBLICO EN GENERAL' : '')}
                            </p>
                            {f.usuario && (
                              <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-black flex items-center gap-1">
                                <User size={8} /> {f.usuario}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-widest">
                            {f.rfc || 'S/RFC'}
                          </p>
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
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewPdf(f);
                              }}
                              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 shadow-sm" 
                              title="Ver PDF"
                            >
                              <FileText size={16}/>
                            </button>
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

        {/* --- PESTAÑA CLIENTES (CRUD Y LISTA) --- */}
        {activeTab === 'clientes' && (
          <div className="space-y-6">
            {/* Barra de Búsqueda y Botón Nuevo */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar cliente por Código, RFC o Razón Social..." 
                    value={filtroClientesTab}
                    onChange={(e) => setFiltroClientesTab(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none text-sm font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={cargarClientes} 
                  className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all"
                  title="Recargar clientes"
                >
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
                <button 
                  onClick={openCreateClientModal}
                  className="px-6 py-3 bg-[#003082] text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100"
                >
                  <UserPlus size={18} /> Nuevo Cliente
                </button>
              </div>
            </div>

            {/* Tabla de Clientes */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Código</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">RFC</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente / Razón Social</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Régimen Fiscal</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">C.P.</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Correo</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Uso CFDI</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(Array.isArray(clientes) ? clientes : [])
                      .filter(c => {
                        const term = filtroClientesTab.toLowerCase().trim();
                        if (!term) return true;
                        return (
                          String(c.rfc || '').toLowerCase().includes(term) ||
                          String(c.razonSocial || '').toLowerCase().includes(term) ||
                          String(c.code || '').toLowerCase().includes(term)
                        );
                      })
                      .map((c, i) => (
                      <tr 
                        key={i} 
                        className="hover:bg-blue-50/30 transition-all group"
                      >
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${c.code ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                            {c.code || 'SIN CÓDIGO'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-xs text-blue-600">
                          {c.rfc || 'S/RFC'}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-gray-800 uppercase line-clamp-1">
                            {c.razonSocial || 'SIN NOMBRE'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-gray-600 truncate max-w-[200px]" title={c.regimenFiscal}>
                            {c.regimen ? `${c.regimen} - ` : ''}{c.regimenFiscal || '---'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-500">
                          {c.cp || '---'}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-500 lowercase">
                          {c.email || '---'}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                          {c.usoCfdi || '---'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => openEditClientModal(c)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 shadow-sm"
                            title="Editar Cliente"
                          >
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {clientes.length === 0 && !loading && (
                <div className="p-20 text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                    <User size={40} />
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No se encontraron clientes registrados</p>
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

        {/* --- MODAL PARA CREAR O EDITAR CLIENTE (CRUD) --- */}
        <AnimatePresence>
          {showClientModal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#003082]/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="bg-blue-600 p-8 text-white relative">
                  <button onClick={() => setShowClientModal(false)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                    <X size={20} />
                  </button>
                  <h3 className="text-2xl font-black mb-1 flex items-center gap-2">
                    <UserCheck size={28} /> {editingClient ? 'Modificar Cliente' : 'Crear Nuevo Cliente'}
                  </h3>
                  <p className="text-blue-100 text-sm font-bold uppercase tracking-widest opacity-80">
                    {editingClient ? `RFC: ${editingClient.rfc}` : 'Ingresa los datos del receptor fiscal'}
                  </p>
                </div>

                <form onSubmit={handleSaveClient} className="flex-1 overflow-y-auto p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Código de Cliente (opcional) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Código de Cliente (H)</label>
                      <input 
                        type="text"
                        value={clientFormData.code}
                        onChange={(e) => setClientFormData({...clientFormData, code: e.target.value.toUpperCase()})}
                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej. CL-101"
                      />
                    </div>
                    {/* RFC */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">RFC (A) *</label>
                      <input 
                        type="text"
                        required
                        disabled={!!editingClient} // El RFC es llave en sheets, bloquear si es edición
                        value={clientFormData.rfc}
                        onChange={(e) => setClientFormData({...clientFormData, rfc: e.target.value.toUpperCase()})}
                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold text-gray-700 disabled:opacity-60 focus:ring-2 focus:ring-blue-500"
                        placeholder="RFC a 12 o 13 posiciones"
                      />
                    </div>
                    {/* Razón Social */}
                    <div className="space-y-1 col-span-full">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Razón Social o Nombre (B) *</label>
                      <input 
                        type="text"
                        required
                        value={clientFormData.razonSocial}
                        onChange={(e) => setClientFormData({...clientFormData, razonSocial: e.target.value.toUpperCase()})}
                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej. JUAN PÉREZ GÓMEZ o ARQUITECTURA S.A. DE C.V."
                      />
                    </div>
                    {/* Régimen Fiscal */}
                    <div className="space-y-1 col-span-full">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Régimen Fiscal (C y E) *</label>
                      <select 
                        required
                        value={clientFormData.regimen}
                        onChange={(e) => setClientFormData({...clientFormData, regimen: e.target.value})}
                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecciona el régimen...</option>
                        {regimenes.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Código Postal */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">C.P. Fiscal (D) *</label>
                      <input 
                        type="text"
                        required
                        maxLength={5}
                        value={clientFormData.cp}
                        onChange={(e) => setClientFormData({...clientFormData, cp: e.target.value})}
                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej. 48315"
                      />
                    </div>
                    {/* Correo Electrónico */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Email de Envío (F) *</label>
                      <input 
                        type="email"
                        required
                        value={clientFormData.email}
                        onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})}
                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                    {/* Uso de CFDI */}
                    <div className="space-y-1 col-span-full">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Uso de CFDI (G) *</label>
                      <select 
                        required
                        value={clientFormData.usoCfdi}
                        onChange={(e) => setClientFormData({...clientFormData, usoCfdi: e.target.value})}
                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecciona el uso...</option>
                        {usosCFDI.map(u => (
                          <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setShowClientModal(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all text-center"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> Guardar Cliente</>}
                    </button>
                  </div>
                </form>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#003082]/60 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-4xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border border-white/20">
                
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur-md z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-800 tracking-tight leading-none mb-1">
                        Vista Previa: {previewPdf.ticket}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {pdfLoading ? 'Recuperando desde Facturama...' : 'Archivo listo para visualizar'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pdfBlobUrl && (
                      <button 
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = pdfBlobUrl;
                          a.download = `Factura_${previewPdf.ticket}.pdf`;
                          a.click();
                        }}
                        className="px-5 py-2.5 bg-[#003082] text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-100"
                      >
                        <Download size={14} /> Descargar PDF
                      </button>
                    )}
                    <button onClick={() => setPreviewPdf(null)} className="p-2.5 bg-gray-200 text-gray-600 rounded-2xl hover:bg-gray-300 transition-all">
                      <Plus className="rotate-45" size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-gray-100 flex flex-col md:flex-row relative min-h-0 overflow-hidden">
                  {/* Panel izquierdo: Datos y Conceptos */}
                  <div className="w-full md:w-1/2 bg-white p-6 border-r border-gray-100 overflow-y-auto h-full flex flex-col gap-5">
                    {detailsLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-blue-600 py-10">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Cargando conceptos...</p>
                      </div>
                    ) : (
                      <>
                        {/* Cabecera de datos */}
                        <div className="space-y-3 bg-gray-50 p-4 rounded-2xl">
                          <div className="flex justify-between text-xs border-b border-gray-200/60 pb-2">
                            <span className="text-gray-400 font-bold uppercase">RFC:</span>
                            <span className="text-gray-700 font-black font-mono">{previewPdf?.rfc || 'S/N'}</span>
                          </div>
                          <div className="flex justify-between text-xs border-b border-gray-200/60 pb-2">
                            <span className="text-gray-400 font-bold uppercase">Receptor:</span>
                            <span className="text-gray-700 font-black text-right line-clamp-1">{previewPdf?.razonSocial || (previewPdf?.rfc === 'XAXX010101000' ? 'PÚBLICO EN GENERAL' : '')}</span>
                          </div>
                          <div className="flex justify-between text-xs border-b border-gray-200/60 pb-2">
                            <span className="text-gray-400 font-bold uppercase">Fecha Factura:</span>
                            <span className="text-gray-700 font-black">{formatFechaCDMX(previewPdf?.createdAt)}</span>
                          </div>
                          {previewPdf?.fechaPago && (
                            <div className="flex justify-between text-xs border-b border-gray-200/60 pb-2">
                              <span className="text-gray-400 font-bold uppercase">Fecha Pago:</span>
                              <span className="text-gray-700 font-black">{formatFechaCDMX(previewPdf?.fechaPago)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs border-b border-gray-200/60 pb-2">
                            <span className="text-gray-400 font-bold uppercase">Uso de CFDI:</span>
                            <span className="text-gray-700 font-black">{previewPdf?.usoCfdi || 'S/N'}</span>
                          </div>
                          <div className="flex justify-between text-xs border-b border-gray-200/60 pb-2">
                            <span className="text-gray-400 font-bold uppercase">Régimen Fiscal:</span>
                            <span className="text-gray-700 font-black">{previewPdf?.regimenFiscal || 'S/N'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400 font-bold uppercase">UUID Fiscal:</span>
                            <span className="text-gray-700 font-black font-mono text-[9px] break-all">{previewPdf?.uuid || 'S/N'}</span>
                          </div>
                        </div>

                        {/* Listado de Conceptos */}
                        <div className="flex-1 flex flex-col min-h-0">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Conceptos / Líneas de Factura</h4>
                          <div className="border border-gray-100 rounded-2xl overflow-hidden overflow-y-auto max-h-[250px]">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-wider border-b border-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-center w-12">Cant</th>
                                  <th className="px-4 py-2">Descripción</th>
                                  <th className="px-4 py-2 text-right">P. Unit</th>
                                  <th className="px-4 py-2 text-right">Importe</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50 font-bold text-gray-600">
                                {((cfdiDetails?.Items || cfdiDetails?.items || []).length > 0) ? (
                                  (cfdiDetails?.Items || cfdiDetails?.items).map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                      <td className="px-4 py-2.5 text-center font-black text-[#003082] bg-gray-50/20">{item.Quantity || item.quantity || 1}</td>
                                      <td className="px-4 py-2.5 line-clamp-2 max-w-[200px]" title={item.Description || item.description}>{item.Description || item.description || 'Sin descripción'}</td>
                                      <td className="px-4 py-2.5 text-right font-mono">${Number(item.UnitPrice || item.unitPrice || 0).toFixed(2)}</td>
                                      <td className="px-4 py-2.5 text-right font-black font-mono text-gray-800">${Number(item.Subtotal || item.subtotal || item.Total || item.total || 0).toFixed(2)}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400 italic">No hay conceptos cargados o es formato estándar.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Total consolidado */}
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm font-black">
                          <span className="text-gray-400 uppercase tracking-widest text-[10px]">Total Facturado:</span>
                          <span className="text-2xl text-blue-600 font-black">${Number(previewPdf?.total || 0).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Panel derecho: PDF Viewer */}
                  <div className="w-full md:w-1/2 h-[40vh] md:h-full relative bg-gray-100">
                    {pdfError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4 z-20 bg-red-50/90 backdrop-blur-sm">
                        <AlertCircle size={36} className="text-red-500" />
                        <p className="font-black text-[10px] uppercase tracking-wider text-red-600">
                          Error de Carga
                        </p>
                        <p className="text-xs text-gray-500 max-w-[280px]">
                          {pdfError}
                        </p>
                      </div>
                    ) : (pdfLoading || !pdfBlobUrl) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-blue-600 z-20 bg-gray-50/80 backdrop-blur-sm">
                        <Loader2 size={36} className="animate-spin" />
                        <p className="font-black text-[10px] uppercase tracking-wider text-gray-400">
                          {pdfLoading ? 'Cargando documento PDF...' : 'Preparando visor...'}
                        </p>
                      </div>
                    )}
                    
                    {!pdfError && pdfBlobUrl && (
                      <iframe 
                        src={`${pdfBlobUrl}#toolbar=0`} 
                        className="w-full h-full border-none relative z-10"
                        title="PDF Preview"
                      />
                    )}
                  </div>
                </div>

                <div className="p-5 bg-white border-t border-gray-100 flex flex-col md:flex-row justify-center gap-4 shadow-2xl">
                   <button 
                      onClick={() => {
                        setEmailToSend(previewPdf.email || '');
                        setShowEmailModal(previewPdf);
                      }}
                      className="px-8 py-3 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"
                    >
                      <Mail size={16}/> Enviar por Correo
                    </button>
                    <a 
                      href={`/api/cfdi/descargar?id=${previewPdf.facturamaId}&type=xml`} 
                      download
                      className="px-8 py-3 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-amber-100 transition-all"
                    >
                      <Hash size={16}/> Descargar XML
                    </a>
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
