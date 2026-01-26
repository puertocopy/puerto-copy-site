import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Search, ArrowRight, UserCheck, RefreshCw, FileText as FileIcon, Menu, X, Printer, Phone, Mail } from 'lucide-react';

// === PARA TU PROYECTO LOCAL: DESCOMENTA ESTAS LINEAS ===
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingBubbles from '../components/FloatingBubbles';

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
  { value: '625', label: '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
  { value: '616', label: '616 - Sin obligaciones fiscales' },
  { value: '621', label: '621 - Incorporación Fiscal' },
  { value: '626', label: '626 - Régimen Simplificado de Confianza' },
  { value: '623', label: '623 - Opcional para Grupos de Sociedades' },
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

function isPersonaMoral(rfc) {
  const cleaned = String(rfc || '').trim().toUpperCase();
  if (cleaned === 'XAXX010101000' || cleaned === 'XEXX010101000') {
    return false;
  }
  return cleaned.length === 12;
}

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export default function Facturar() {
  const [mounted, setMounted] = useState(false);
  const [ticket, setTicket] = useState('');
  const [ticketInput, setTicketInput] = useState('');
  const [step, setStep] = useState(1);
  const [verifyAmount, setVerifyAmount] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verified, setVerified] = useState(false);
  const [receiptTotal, setReceiptTotal] = useState(0);
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
  const [loadingAction, setLoadingAction] = useState('');
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);
  const [facturaGenerada, setFacturaGenerada] = useState(null);
  const [success, setSuccess] = useState('');
  const [alreadyInvoiced, setAlreadyInvoiced] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailStatusCode, setEmailStatusCode] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [pdfLen, setPdfLen] = useState(0);
  const [xmlLen, setXmlLen] = useState(0);
  const [pollMessage, setPollMessage] = useState('');
  const [payments, setPayments] = useState([]);
  const [codigoCliente, setCodigoCliente] = useState('');
  const [showClientCodeInput, setShowClientCodeInput] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = productos.reduce((acc, p) => acc + (p.cantidad * p.precio_unitario), 0);
  const issuerRegimen = process.env.NEXT_PUBLIC_FACTURAMA_ISSUER_REGIMEN;
  const appliesIsr = isPersonaMoral(datosFiscales.rfc) && issuerRegimen === '626';

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    if (!showConfirm) return undefined;
    const body = document.body;
    const prevBodyOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prevBodyOverflow;
    };
  }, [showConfirm]);

  if (!mounted) {
    return null;
  }

  const resolvePaymentForm = (paymentsValue) => {
    if (!Array.isArray(paymentsValue) || paymentsValue.length === 0) return '99';
    if (paymentsValue.length > 1) return '99';
    const name = String(paymentsValue[0]?.name || '').toUpperCase().trim();
    if (name === 'EFECTIVO') return '01';
    if (name === 'T/DEBITO' || name === 'TARJETA DEBITO') return '28';
    if (name === 'T/CREDITO' || name === 'TARJETA CREDITO') return '04';
    if (name === 'TRANSFERENCIA' || name.includes('SPEI')) return '03';
    return '99';
  };

  const paymentFormLabelMap = {
    '01': '01 - Efectivo',
    '28': '28 - Tarjeta de Debito',
    '04': '04 - Tarjeta de Credito',
    '03': '03 - Transferencia',
    '99': '99 - Por definir'
  };

  const formatMoney = (value) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
      Number.isFinite(Number(value)) ? Number(value) : 0
    );

  const calcBreakdown = (grossTotal) => {
    if (!Number.isFinite(Number(grossTotal)) || Number(grossTotal) <= 0) {
      return { subtotal: 0, iva: 0, isr: 0, total: 0 };
    }
    const gross = Number(grossTotal);
    if (appliesIsr) {
      const base = round2(gross / 1.1475);
      const iva = round2(base * 0.16);
      const isr = round2(base * 0.0125);
      return {
        subtotal: base,
        iva,
        isr,
        total: round2(base + iva - isr)
      };
    }
    const subtotal = round2(gross / 1.16);
    const iva = round2(gross - subtotal);
    return { subtotal, iva, isr: 0, total: round2(gross) };
  };

  const parseAmount = (value) => {
    const cleaned = String(value || '').replace(/[^0-9.-]/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  };

  const loadVerifyState = () => {
    if (typeof window === 'undefined') return { tickets: {}, global: { count: 0, blockedUntil: 0 } };
    try {
      const raw = window.localStorage.getItem('facturaVerifyState');
      return raw ? JSON.parse(raw) : { tickets: {}, global: { count: 0, blockedUntil: 0 } };
    } catch {
      return { tickets: {}, global: { count: 0, blockedUntil: 0 } };
    }
  };

  const saveVerifyState = (state) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('facturaVerifyState', JSON.stringify(state));
  };

  const isBlocked = (currentTicket) => {
    const state = loadVerifyState();
    const now = Date.now();
    const ticketState = state.tickets?.[currentTicket] || { count: 0, blockedUntil: 0 };
    if (ticketState.blockedUntil && ticketState.blockedUntil > now) {
      return true;
    }
    if (state.global?.blockedUntil && state.global.blockedUntil > now) {
      return true;
    }
    return false;
  };

  const registerFailure = (currentTicket) => {
    const state = loadVerifyState();
    const now = Date.now();
    const ticketState = state.tickets?.[currentTicket] || { count: 0, blockedUntil: 0 };
    ticketState.count = (ticketState.count || 0) + 1;
    if (ticketState.count >= 3) {
      ticketState.blockedUntil = now + 5 * 60 * 1000;
    }
    state.tickets = state.tickets || {};
    state.tickets[currentTicket] = ticketState;
    const globalState = state.global || { count: 0, blockedUntil: 0 };
    globalState.count = (globalState.count || 0) + 1;
    if (globalState.count >= 10) {
      globalState.blockedUntil = now + 10 * 60 * 1000;
    }
    state.global = globalState;
    saveVerifyState(state);
  };

  const resetFailures = (currentTicket) => {
    const state = loadVerifyState();
    if (state.tickets?.[currentTicket]) {
      state.tickets[currentTicket] = { count: 0, blockedUntil: 0 };
    }
    state.global = { count: 0, blockedUntil: 0 };
    saveVerifyState(state);
  };

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
    setLoadingAction('buscar');
    setError(''); 
    setErrorDetails(null);
    setSuccess(''); 
    setProductos([]);
    setPayments([]);
    
    try {
      const res = await fetch(`/api/consultar-ticket?ticket=${encodeURIComponent(ticket)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data?.message || 'Error al consultar ticket');
      
      setProductos(Array.isArray(data.productos) ? data.productos : []);
      setPayments(Array.isArray(data.payments) ? data.payments : []);
      setReceiptTotal(Number(data.total_money || 0));
      
      if (!data.productos?.length) {
        setError('Ticket sin productos o de mes vencido.');
      } else {
        setSuccess('Ticket válido.');
      }
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
      setLoadingAction('');
    }
  };

  const handleContinue = () => {
    setTicket(ticketInput);
    setStep(2);
    setVerifyAmount('');
    setVerifyError('');
    setVerified(false);
    setProductos([]);
    setPayments([]);
    setReceiptTotal(0);
    setError('');
    setErrorDetails(null);
  };

  const handleVerifyTicket = async () => {
    if (isBlocked(ticket)) {
      setVerifyError('Verificación temporalmente bloqueada. Intenta más tarde.');
      return;
    }
    setLoading(true);
    setLoadingAction('verificar');
    setVerifyError('');
    setError('');
    setErrorDetails(null);
    try {
      const res = await fetch(`/api/consultar-ticket?ticket=${encodeURIComponent(ticket)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        registerFailure(ticket);
        setVerifyError('No se pudo verificar el ticket.');
        return;
      }

      const totalEsperado = Number(data.total_money || 0);
      const totalIngresado = parseAmount(verifyAmount);
      const matches = Math.abs(totalEsperado - totalIngresado) <= 0.01;
      if (!matches) {
        registerFailure(ticket);
        setVerifyError('Verificación fallida.');
        return;
      }

      resetFailures(ticket);
      setVerified(true);
      setStep(3);
      setProductos(Array.isArray(data.productos) ? data.productos : []);
      setPayments(Array.isArray(data.payments) ? data.payments : []);
      setReceiptTotal(Number(data.total_money || 0));
    } catch (err) {
      registerFailure(ticket);
      setVerifyError('No se pudo verificar el ticket.');
    } finally {
      setLoading(false);
      setLoadingAction('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'codigoPostal') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 5);
      setDatosFiscales((prev) => ({ ...prev, [name]: digitsOnly }));
      return;
    }
    setDatosFiscales((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmitFactura = async () => {
    setConfirmLoading(true);
    setLoading(true);
    setLoadingAction('timbrar');
    setError('');
    setErrorDetails(null);
    setSuccess('');
    setFacturaGenerada(null);
    setAlreadyInvoiced(false);
    setPdfLen(0);
    setXmlLen(0);
    setPollMessage('');
    setEmailStatus(null);
    setEmailStatusCode(null);
    setEmailError(null);

    try {
      const res = await fetch('/api/facturar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ticket, 
          productos, 
          total, 
          payments,
          ...datosFiscales, 
          regimenFiscal: datosFiscales.regimenFiscal, 
          usoCfdi: datosFiscales.usoCfdi 
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMessage = data?.message || 'No se pudo timbrar la factura.';
        const details = process.env.NODE_ENV !== 'production' ? data : null;
        const err = new Error(errorMessage);
        err.details = details;
        throw err;
      }

      const cfdiId = data?.cfdiId || null;
      const pdf = data?.pdf || null;
      const xml = data?.xml || null;
      const isAlreadyInvoiced = data?.alreadyInvoiced === true;
      if (isAlreadyInvoiced) {
        setAlreadyInvoiced(true);
        setFacturaGenerada({ cfdiId, pdf, xml });
        setPdfLen(pdf ? pdf.length : 0);
        setXmlLen(xml ? xml.length : 0);
        setSuccess('Este ticket ya fue facturado');
        if (cfdiId && (!pdf || !xml)) {
          let attempts = 0;
          const maxAttempts = 20;
          const interval = setInterval(async () => {
            attempts += 1;
            try {
              const pollRes = await fetch(`/api/cfdi/${cfdiId}/files`);
              const pollData = await pollRes.json().catch(() => ({}));
              const newPdf = pollData?.pdf || '';
              const newXml = pollData?.xml || '';
              const newPdfLen = newPdf ? newPdf.length : 0;
              const newXmlLen = newXml ? newXml.length : 0;
              setPdfLen(newPdfLen);
              setXmlLen(newXmlLen);
              if (process.env.NODE_ENV !== 'production') {
                console.log('cfdiFilesPoll', {
                  attempt: attempts,
                  status: pollRes.status,
                  pdfLen: newPdfLen,
                  xmlLen: newXmlLen
                });
              }
              if (newPdfLen > 50 && newXmlLen > 50) {
                setFacturaGenerada((prev) => ({
                  ...(prev || {}),
                  pdf: newPdf,
                  xml: newXml
                }));
                setPollMessage('');
                clearInterval(interval);
                return;
              }
            } catch (pollError) {
              if (process.env.NODE_ENV !== 'production') {
                console.log('cfdiFilesPollError', pollError);
              }
            }

            if (attempts >= maxAttempts) {
              setPollMessage('Factura timbrada, PDF/XML aún no disponibles. Reintentar.');
              clearInterval(interval);
            }
          }, 1000);
        }
        return;
      }
      const emailSent = data?.emailSent;
      const emailStatusValue = Number.isFinite(Number(data?.emailStatus))
        ? Number(data?.emailStatus)
        : null;
      setFacturaGenerada({ cfdiId, pdf, xml });
      setPdfLen(pdf ? pdf.length : 0);
      setXmlLen(xml ? xml.length : 0);
      setSuccess('Factura hecha.');
      setEmailStatus(emailSent === true ? 'sent' : emailSent === false ? 'failed' : null);
      setEmailStatusCode(emailStatusValue);
      setEmailError(emailSent === false ? data?.emailError || null : null);

      if (cfdiId && (!pdf || !xml)) {
        let attempts = 0;
        const maxAttempts = 20;
        const interval = setInterval(async () => {
          attempts += 1;
          try {
            const pollRes = await fetch(`/api/cfdi/${cfdiId}/files`);
            const pollData = await pollRes.json().catch(() => ({}));
            const newPdf = pollData?.pdf || '';
            const newXml = pollData?.xml || '';
            const newPdfLen = newPdf ? newPdf.length : 0;
            const newXmlLen = newXml ? newXml.length : 0;
            setPdfLen(newPdfLen);
            setXmlLen(newXmlLen);
            if (process.env.NODE_ENV !== 'production') {
              console.log('cfdiFilesPoll', {
                attempt: attempts,
                status: pollRes.status,
                pdfLen: newPdfLen,
                xmlLen: newXmlLen
              });
            }
            if (newPdfLen > 50 && newXmlLen > 50) {
              setFacturaGenerada((prev) => ({
                ...(prev || {}),
                pdf: newPdf,
                xml: newXml
              }));
              setPollMessage('');
              clearInterval(interval);
              return;
            }
          } catch (pollError) {
            if (process.env.NODE_ENV !== 'production') {
              console.log('cfdiFilesPollError', pollError);
            }
          }

          if (attempts >= maxAttempts) {
            setPollMessage('Factura timbrada, PDF/XML aún no disponibles. Reintentar.');
            clearInterval(interval);
          }
        }, 1000);
      }
    } catch (err) { 
      setError('No pudimos timbrar la factura. Intenta nuevamente o contáctanos.');
      setErrorDetails(err.details || err.message);
    } finally {
      setLoading(false);
      setLoadingAction('');
      setConfirmLoading(false);
      setShowConfirm(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setErrorDetails(null);
    setSuccess('');
    setEmailStatus(null);
    setEmailStatusCode(null);
    setEmailError(null);
    setAlreadyInvoiced(false);

    if (!validarRFC(datosFiscales.rfc)) {
      setError('RFC inválido.');
      return;
    }

    setShowConfirm(true);
  };

  const resetTodo = () => {
    setFacturaGenerada(null); 
    setTicket(''); 
    setTicketInput('');
    setStep(1);
    setVerifyAmount('');
    setVerifyError('');
    setVerified(false);
    setProductos([]); 
    setError(''); 
    setErrorDetails(null);
    setSuccess('');
    setPdfLen(0);
    setXmlLen(0);
    setPollMessage('');
    setEmailStatus(null);
    setEmailStatusCode(null);
    setEmailError(null);
    setCodigoCliente('');
    setShowClientCodeInput(false);
    setPayments([]);
    setReceiptTotal(0);
    setShowConfirm(false);
    setConfirmLoading(false);
    setDatosFiscales({ 
      rfc: '', 
      razonSocial: '', 
      regimenFiscal: '', 
      usoCfdi: '', 
      codigoPostal: '', 
      email: '' 
    });
  };

  const normalizeBase64 = (base64Raw) => {
    if (!base64Raw || typeof base64Raw !== 'string') return { value: '', error: 'base64 vacío' };
    let trimmed = base64Raw.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (!parsed || typeof parsed.Content !== 'string') {
          return { value: '', error: 'JSON sin Content' };
        }
        trimmed = parsed.Content;
      } catch (err) {
        return { value: '', error: 'JSON inválido' };
      }
    }
    let cleaned = trimmed.replace(/^data:.*;base64,/, '').replace(/\s/g, '');
    cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');
    const mod = cleaned.length % 4;
    if (mod) {
      cleaned = cleaned + '='.repeat(4 - mod);
    }
    if (!/^[A-Za-z0-9+/=]+$/.test(cleaned)) {
      return { value: '', error: `base64 inválido: ${cleaned.slice(0, 16)}` };
    }
    return { value: cleaned, error: null };
  };

  const downloadBase64File = (base64Raw, filename, mimeType) => {
    const normalized = normalizeBase64(base64Raw);
    if (!normalized.value) {
      setError(`No se pudo descargar: ${normalized.error}`);
      return;
    }
    const binary = atob(normalized.value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar forceWhite={true} />
      
      <div className="min-h-screen bg-[#FDFDFD] pt-24 md:pt-28 pb-16 font-sans overflow-x-hidden">
        <div className="mx-auto w-full max-w-screen-2xl px-4 grid grid-cols-1 xl:grid-cols-[200px_minmax(0,1fr)_200px] 2xl:grid-cols-[300px_minmax(0,1fr)_300px] gap-6">
          
          {/* Panel Izquierdo (banners removidos) */}
          <div className="hidden xl:block sticky top-32 self-start h-[calc(100vh-10rem)]" />
          
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
                {process.env.NODE_ENV !== 'production' && errorDetails && (
                  <pre className="mt-3 text-xs text-red-700 whitespace-pre-wrap max-w-full overflow-x-auto">{JSON.stringify(errorDetails, null, 2)}</pre>
                )}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-[1.5rem] border border-green-100 bg-green-50 text-green-800 px-6 py-4 flex items-center shadow-sm">
                <Check className="mr-3 shrink-0 bg-green-200 rounded-full p-1" size={24} /> {success}
              </motion.div>
            )}
            {emailStatus === 'sent' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-[1.5rem] border border-blue-100 bg-blue-50 text-blue-800 px-6 py-4 flex items-center shadow-sm">
                <Mail className="mr-3 shrink-0" size={22} /> Factura enviada al correo
              </motion.div>
            )}
            {emailStatus === 'failed' && emailStatusCode === 404 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-[1.5rem] border border-blue-100 bg-blue-50 text-blue-800 px-6 py-4 flex items-center shadow-sm">
                <Mail className="mr-3 shrink-0" size={22} /> El correo se enviará automáticamente en producción.
              </motion.div>
            )}
            {emailStatus === 'failed' && emailStatusCode !== 404 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-[1.5rem] border border-amber-100 bg-amber-50 text-amber-900 px-6 py-4 flex items-center shadow-sm">
                <AlertCircle className="mr-3 shrink-0" size={22} /> No se pudo enviar el correo, descargue PDF/XML
                {process.env.NODE_ENV !== 'production' && emailError && (
                  <pre className="mt-3 text-xs text-amber-900 whitespace-pre-wrap max-w-full overflow-x-auto">{JSON.stringify(emailError, null, 2)}</pre>
                )}
              </motion.div>
            )}
            {process.env.NODE_ENV !== 'production' && facturaGenerada && (
              <div className="mb-4 text-xs text-gray-500">
                PDF: {pdfLen} | XML: {xmlLen}
              </div>
            )}
            {pollMessage && (
              <div className="mb-4 text-sm text-blue-700">{pollMessage}</div>
            )}
            {showConfirm && (
              <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/40 px-4">
                <div className="w-full md:max-w-2xl h-[90dvh] md:h-auto overflow-y-auto overscroll-contain md:overflow-visible rounded-t-[2rem] md:rounded-[2rem] bg-white shadow-2xl border border-gray-100 p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-[#003082] font-brand">Confirmar datos</h3>
                      <p className="text-sm text-gray-500 mt-1">Revisa cuidadosamente antes de emitir la factura.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={confirmLoading}
                      aria-label="Cerrar"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div className="rounded-2xl bg-[#F3F7FC] p-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Ticket</div>
                      <div className="font-semibold text-[#003082]">{ticket || '-'}</div>
                    </div>
                    <div className="rounded-2xl bg-[#F3F7FC] p-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Total</div>
                      <div className="font-semibold text-[#003082]">{formatMoney(total)}</div>
                    </div>
                    <div className="rounded-2xl bg-[#F3F7FC] p-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">RFC</div>
                      <div className="font-semibold text-[#003082]">{datosFiscales.rfc || '-'}</div>
                    </div>
                    <div className="rounded-2xl bg-[#F3F7FC] p-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Razón social</div>
                      <div className="font-semibold text-[#003082]">{datosFiscales.razonSocial || '-'}</div>
                    </div>
                    <div className="rounded-2xl bg-[#F3F7FC] p-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Régimen fiscal</div>
                      <div className="font-semibold text-[#003082]">{datosFiscales.regimenFiscal || '-'}</div>
                    </div>
                    <div className="rounded-2xl bg-[#F3F7FC] p-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Uso CFDI</div>
                      <div className="font-semibold text-[#003082]">{datosFiscales.usoCfdi || '-'}</div>
                    </div>
                    <div className="rounded-2xl bg-[#F3F7FC] p-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Forma de pago</div>
                      <div className="font-semibold text-[#003082]">
                        {paymentFormLabelMap[resolvePaymentForm(payments)] || resolvePaymentForm(payments)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#F3F7FC] p-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Correo</div>
                      <div className="font-semibold text-[#003082] break-all">{datosFiscales.email || '-'}</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
                    <div className="font-semibold mb-2">Desglose</div>
                    {(() => {
                      const breakdown = calcBreakdown(total);
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Subtotal</span>
                            <span className="font-semibold">{formatMoney(breakdown.subtotal)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>IVA</span>
                            <span className="font-semibold">{formatMoney(breakdown.iva)}</span>
                          </div>
                          {appliesIsr && (
                            <div className="flex items-center justify-between">
                              <span>Retención ISR</span>
                              <span className="font-semibold">-{formatMoney(breakdown.isr)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-blue-100 mt-2">
                            <span>Total</span>
                            <span className="font-semibold">{formatMoney(breakdown.total)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mt-5 text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-2">
                    <AlertCircle className="mt-0.5 shrink-0" size={18} />
                    <p>Verifica cuidadosamente tus datos fiscales. La factura no se puede modificar después de emitida.</p>
                  </div>

                  <div className="mt-6 flex flex-col md:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      className="w-full md:w-auto px-6 py-3 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                      disabled={confirmLoading}
                    >
                      Editar datos
                    </button>
                    <button
                      type="button"
                      onClick={handleEmitFactura}
                      className="w-full md:flex-1 px-6 py-3 rounded-full bg-[#0B63B2] hover:bg-[#004a8f] text-white font-semibold shadow-lg disabled:opacity-70"
                      disabled={confirmLoading}
                    >
                      {confirmLoading ? 'Emitiendo...' : 'Confirmar y emitir factura'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 1: Ingreso de Ticket */}
            {step === 1 && !facturaGenerada && (
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
                      value={ticketInput} 
                      onChange={(e) => { 
                        let raw = e.target.value.replace(/[^0-9]/g, ''); 
                        if (raw.length > 1) raw = `${raw[0]}-${raw.slice(1)}`; 
                        setTicketInput(raw); 
                      }} 
                      placeholder="Ej. 12345" 
                      className="w-full bg-[#F3F7FC] border border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-6 py-3 md:py-4 text-base md:text-sm outline-none transition-all shadow-inner focus:shadow-lg placeholder-gray-400" 
                    />
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                  <button 
                    onClick={handleContinue} 
                    className="w-full py-3 md:py-4 bg-[#0B63B2] hover:bg-[#004a8f] text-white rounded-full font-bold text-lg shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-60 transition-all flex justify-center gap-2" 
                    disabled={!ticketInput || loading}
                  >
                    Continuar {!loading && <ArrowRight size={20} />}
                  </button>
                </div>
                <div className="mt-3 w-full max-w-sm mx-auto rounded-2xl border border-blue-100 bg-blue-50/60 text-blue-900 px-5 py-2.5 text-xs md:text-sm flex items-start gap-2">
                  <Check className="shrink-0 mt-0.5 text-blue-700" size={16} />
                  <p>✅ La factura se emite automáticamente al confirmar tus datos.</p>
                </div>
              </motion.div>
            )}

            {/* Paso 2: Verificación */}
            {step === 2 && !facturaGenerada && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 md:p-12 border border-gray-50">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0B63B2] mb-4">
                    <FileIcon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[#003082]">Verificación</h3>
                  <p className="text-sm text-gray-500 mt-2">Ticket: {ticket}</p>
                </div>
                <div className="max-w-md mx-auto space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={verifyAmount}
                      onChange={(e) => setVerifyAmount(e.target.value)}
                      placeholder="Ingresa el monto total del ticket"
                      className="w-full bg-[#F3F7FC] border border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-6 py-3 md:py-4 text-base md:text-sm outline-none transition-all shadow-inner focus:shadow-lg placeholder-gray-400"
                    />
                  </div>
                  <button
                    onClick={handleVerifyTicket}
                    className="w-full py-3 md:py-4 bg-[#0B63B2] hover:bg-[#004a8f] text-white rounded-full font-bold text-lg shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-60 transition-all flex justify-center gap-2"
                    disabled={!verifyAmount || loading}
                  >
                    {loading && loadingAction === 'verificar' ? 'Verificando...' : 'Verificar'} {!loading && <ArrowRight size={20} />}
                  </button>
                </div>
                {verifyError && (
                  <div className="mt-4 text-sm text-red-700 text-center">{verifyError}</div>
                )}
              </motion.div>
            )}

            {/* Paso 2: Datos Fiscales */}
            {step === 3 && productos.length > 0 && verified && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        className="w-5 h-5 text-base md:text-sm text-[#0B63B2] rounded focus:ring-[#0B63B2]" 
                      />
                      <label htmlFor="yaSoyClienteCheckbox" className="text-sm font-semibold text-gray-700 cursor-pointer">Ya soy cliente</label>
                    </div>
                    {showClientCodeInput && (
                    <div className="flex flex-col md:flex-row gap-2 mt-3">
                      <input 
                        type="text" 
                        value={codigoCliente} 
                        onChange={(e) => setCodigoCliente(e.target.value.toUpperCase())} 
                        placeholder="Ej. CLI172" 
                        className="w-full md:flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#0B63B2]" 
                      />
                      <button 
                        type="button" 
                        onClick={handleCargarDatosCliente} 
                        className="w-full md:w-auto px-4 py-3 bg-[#0B63B2] text-white rounded-xl text-sm font-bold" 
                        disabled={loading}
                      >
                        Cargar
                      </button>
                      </div>
                    )}
                  </div>

                  {/* Campos del Formulario */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                    <input name="rfc" value={datosFiscales.rfc} onChange={handleChange} placeholder="RFC" className="w-full text-base md:text-sm bg-gray-50 border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3 md:py-3.5 outline-none shadow-sm" />
                    <input name="razonSocial" value={datosFiscales.razonSocial} onChange={handleChange} placeholder="Razón Social" className="w-full md:col-span-2 text-base md:text-sm bg-gray-50 border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3 md:py-3.5 outline-none shadow-sm" />
                    <input name="email" value={datosFiscales.email} onChange={handleChange} placeholder="Correo" className="w-full md:col-span-2 text-base md:text-sm bg-gray-50 border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3 md:py-3.5 outline-none shadow-sm" />
                    <input
                      name="codigoPostal"
                      value={datosFiscales.codigoPostal}
                      onChange={handleChange}
                      placeholder="CP Receptor (domicilio fiscal)"
                      type="text"
                      maxLength={5}
                      className="w-full text-base md:text-sm bg-gray-50 border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3 md:py-3.5 outline-none shadow-sm"
                    />
                    
                    <select name="regimenFiscal" value={datosFiscales.regimenFiscal} onChange={handleChange} className="w-full text-base md:text-sm bg-gray-50 border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3 md:py-3.5 outline-none shadow-sm">
                      <option value="">Régimen Fiscal</option>
                      {regimenes.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    
                    <select name="usoCfdi" value={datosFiscales.usoCfdi} onChange={handleChange} className="w-full text-base md:text-sm bg-gray-50 border-transparent focus:bg-white focus:border-[#0B63B2] rounded-2xl px-5 py-3 md:py-3.5 outline-none shadow-sm">
                      <option value="">Uso CFDI</option>
                      {usosCFDI.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                  </div>

                  <div className="mt-8">
                    {!facturaGenerada ? (
                      <button type="submit" disabled={loading} className="w-full py-3 md:py-4 bg-[#0B63B2] text-white rounded-full font-bold shadow-lg hover:bg-[#004a8f] disabled:bg-gray-300">
                        {loading && loadingAction === 'timbrar' ? 'Timbrando...' : 'Facturar Ahora'}
                      </button>
                    ) : (
                      <button type="button" onClick={resetTodo} className="w-full py-3 md:py-4 bg-gray-800 text-white rounded-full font-bold shadow-lg flex justify-center gap-2">
                        <RefreshCw size={20} /> Otro registro
                      </button>
                    )}
                  </div>
                </form>

                {/* Resumen del Ticket */}
                <div className="bg-[#F3F7FC] p-6 md:p-8 rounded-[2.5rem] shadow-inner h-fit">
                  <h3 className="text-xl font-bold mb-6 text-[#003082]">Resumen</h3>
                  <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 mb-6 space-y-4">
                    {productos.map((p, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0B63B2] font-bold text-xs">{p.cantidad}x</div>
                          <span className="font-medium text-sm break-words">{p.nombre}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-gray-500 font-medium">Total verificado</span>
                    <span className="text-3xl font-extrabold text-[#0B63B2]">—</span>
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
                <h3 className="text-[#003082] font-bold text-3xl mb-4 font-brand">
                  {alreadyInvoiced ? 'Este ticket ya fue facturado' : 'Factura hecha'}
                </h3>
                {facturaGenerada?.cfdiId && (
                  <p className="text-gray-600 text-sm mb-6">CFDI: {facturaGenerada.cfdiId}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      downloadBase64File(
                        facturaGenerada?.pdf,
                        `factura-${facturaGenerada?.cfdiId || 'cfdi'}.pdf`,
                        'application/pdf'
                      )
                    }
                    disabled={!facturaGenerada?.pdf}
                    className={`px-6 py-3 rounded-full font-bold ${facturaGenerada?.pdf ? 'bg-[#0B63B2] text-white hover:bg-[#004a8f]' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                  >
                    Descargar PDF
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadBase64File(
                        facturaGenerada?.xml,
                        `factura-${facturaGenerada?.cfdiId || 'cfdi'}.xml`,
                        'application/xml'
                      )
                    }
                    disabled={!facturaGenerada?.xml}
                    className={`px-6 py-3 rounded-full font-bold ${facturaGenerada?.xml ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                  >
                    Descargar XML
                  </button>
                </div>
              </motion.div>
            )}
          </main>

          {/* Panel Derecho (banners removidos) */}
          <div className="hidden xl:block sticky top-32 self-start h-[calc(100vh-10rem)]" />
        </div>
      </div>

      <Footer />
      <FloatingBubbles />
    </>
  );
}
