import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface CheckoutCardFormProps {
  total: number;
  items: any[];
  onClose: () => void;
}

/**
 * Componente de Formulario de Tarjeta Integrado (Checkout API)
 * 
 * Permite a los clientes de Puerto Copy ingresar su tarjeta de crédito o débito
 * directamente en el sitio sin ser redirigidos.
 */
export const CheckoutCardForm: React.FC<CheckoutCardFormProps> = ({ total, items, onClose }) => {
  const router = RouterHook();

  const [cargando, setCargando] = useState(false);
  const [sdkListo, setSdkListo] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Campos del formulario
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardExpirationMonth, setCardExpirationMonth] = useState('');
  const [cardExpirationYear, setCardExpirationYear] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [email, setEmail] = useState('');
  const [docType, setDocType] = useState('RFC');
  const [docNumber, setDocNumber] = useState('XAXX010101000');
  const [cardBrand, setCardBrand] = useState<string>('desconocida');

  // Hook auxiliar para evitar errores de router en SSR
  function RouterHook() {
    return useRouter();
  }

  // Cargar SDK v2 de Mercado Pago de forma dinámica
  useEffect(() => {
    const existingScript = document.getElementById('mercadopago-sdk');
    if (existingScript) {
      setSdkListo(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'mercadopago-sdk';
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => setSdkListo(true);
    document.body.appendChild(script);
  }, []);

  // Detectar marca de tarjeta por los primeros dígitos (BIN)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Solo números
    if (val.length > 16) val = val.slice(0, 16);
    
    // Formatear en bloques de 4 números
    const formatted = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);

    // Detección simple de marca
    if (val.startsWith('4')) setCardBrand('visa');
    else if (/^5[1-5]/.test(val) || /^2[2-7]/.test(val)) setCardBrand('mastercard');
    else if (/^3[47]/.test(val)) setCardBrand('amex');
    else setCardBrand('desconocida');
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);

    if (val.length >= 2) {
      const month = val.slice(0, 2);
      const year = val.slice(2);
      setCardExpirationMonth(month);
      setCardExpirationYear(year.length === 2 ? `20${year}` : year);
    } else {
      setCardExpirationMonth(val);
      setCardExpirationYear('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    // Validaciones básicas de campos
    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length < 13) {
      setErrorForm('Por favor ingresa un número de tarjeta válido.');
      return;
    }
    if (!cardholderName.trim()) {
      setErrorForm('Ingresa el nombre del titular como aparece en la tarjeta.');
      return;
    }
    if (!cardExpirationMonth || !cardExpirationYear) {
      setErrorForm('Ingresa la fecha de vencimiento (MM/AA).');
      return;
    }
    if (securityCode.length < 3) {
      setErrorForm('Ingresa el código de seguridad (CVV).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorForm('Ingresa un correo electrónico válido para tu comprobante.');
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (!publicKey || publicKey.includes('TEST-00000000-0000')) {
      setErrorForm('Debes configurar tu Public Key (NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) en .env.local');
      return;
    }

    try {
      setCargando(true);

      // Inicializar objeto de Mercado Pago en ventana
      if (!window.MercadoPago) {
        throw new Error('El SDK de Mercado Pago no ha terminado de cargar. Intenta de nuevo.');
      }

      const mp = new window.MercadoPago(publicKey, { locale: 'es-MX' });

      // Generar token de la tarjeta
      const cardTokenResponse = await mp.createCardToken({
        cardNumber: rawCard,
        cardholderName: cardholderName.trim(),
        cardExpirationMonth: cardExpirationMonth,
        cardExpirationYear: cardExpirationYear.length === 2 ? `20${cardExpirationYear}` : cardExpirationYear,
        securityCode: securityCode,
        identificationType: docType,
        identificationNumber: docNumber,
      });

      if (!cardTokenResponse || !cardTokenResponse.id) {
        throw new Error('No se pudo validar la tarjeta. Revisa los números ingresados.');
      }

      // Enviar el token al backend para realizar el cobro vía Checkout API
      const res = await fetch('/api/mercadopago/procesar-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: cardTokenResponse.id,
          paymentMethodId: cardBrand === 'desconocida' ? 'visa' : cardBrand,
          installments: 1,
          total,
          items,
          payer: {
            email: email.trim(),
            firstName: cardholderName.split(' ')[0] || 'Cliente',
            lastName: cardholderName.split(' ').slice(1).join(' ') || 'Puerto Copy',
            identification: {
              type: docType,
              number: docNumber
            }
          }
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'El pago fue rechazado. Revisa tus datos e intenta nuevamente.');
      }

      // Redirigir a pantalla de confirmación
      router.push(`/checkout/respuesta?status=success&payment_id=${data.paymentId}&ref=${data.externalReference}`);

    } catch (err: any) {
      console.error('Error al procesar tarjeta:', err);
      const msg = err.message || '';
      if (msg.includes('secure connection') || msg.includes('SSL') || msg.includes('certificate')) {
        setErrorForm('Mercado Pago requiere una conexión segura (HTTPS/SSL) para procesar tarjetas.');
      } else {
        setErrorForm(msg || 'Ocurrió un error inesperado al procesar el pago.');
      }
      setCargando(false);
    }
  };

  const handlePagarConPreferencia = async () => {
    try {
      setCargando(true);
      const res = await fetch('/api/mercadopago/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total })
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.error || 'No se pudo generar la preferencia de pago.');
      }
    } catch (err: any) {
      setErrorForm(err.message);
      setCargando(false);
    }
  };

  const esErrorSSL = errorForm?.includes('HTTPS/SSL') || errorForm?.includes('secure connection') || errorForm?.includes('SSL');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-black/5 max-h-[90vh] flex flex-col">
        
        {/* ENCABEZADO */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Pago Directo Seguro</span>
            <h3 className="text-2xl font-black tracking-tight">Tarjeta de Crédito / Débito</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* MUESTRA VIRTUAL DE TARJETA */}
        <div className="px-6 pt-6 bg-slate-50">
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
              <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black tracking-widest opacity-70">PUERTO COPY PAY</span>
              <span className="text-sm font-black uppercase tracking-wider bg-white/10 px-3 py-1 rounded-lg">
                {cardBrand !== 'desconocida' ? cardBrand : '💳 Tarjeta'}
              </span>
            </div>

            <p className="text-xl sm:text-2xl font-mono tracking-widest mb-6">
              {cardNumber || '•••• •••• •••• ••••'}
            </p>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Titular</p>
                <p className="text-sm font-bold truncate max-w-[180px]">{cardholderName || 'TU NOMBRE AQUÍ'}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Expira</p>
                <p className="text-sm font-bold">
                  {cardExpirationMonth ? `${cardExpirationMonth}/${cardExpirationYear.slice(-2)}` : 'MM/AA'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
          {errorForm && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-medium space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-bold text-amber-950 text-sm mb-1">
                    {esErrorSSL ? 'Requisito de Conexión Cifrada (HTTPS/SSL)' : 'Atención al procesar el pago'}
                  </p>
                  <p className="leading-relaxed">{errorForm}</p>
                </div>
              </div>

              {esErrorSSL && (
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handlePagarConPreferencia}
                    className="flex-1 bg-[#003399] text-white py-3 px-4 rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-blue-800 transition-all shadow"
                  >
                    Pagar vía Mercado Pago (Checkout Pro)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.location.protocol === 'http:') {
                        window.location.href = window.location.href.replace('http:', 'https:');
                      }
                    }}
                    className="flex-1 bg-amber-200 text-amber-900 py-3 px-4 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-amber-300 transition-all border border-amber-300"
                  >
                    Cambiar a HTTPS (https://)
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Número de Tarjeta
            </label>
            <input 
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-slate-800 text-lg transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Nombre en la Tarjeta
            </label>
            <input 
              type="text"
              placeholder="JUAN PEREZ GUTIERREZ"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-800 text-sm font-bold transition-all uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                Vencimiento (MM/AA)
              </label>
              <input 
                type="text"
                placeholder="12/28"
                maxLength={5}
                onChange={handleExpirationChange}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center font-mono text-slate-800 text-base transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                Código CVV
              </label>
              <input 
                type="password"
                placeholder="123"
                maxLength={4}
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center font-mono text-slate-800 text-base transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Correo Electrónico del Comprobante
            </label>
            <input 
              type="email"
              placeholder="cliente@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-800 text-sm font-medium transition-all"
              required
            />
          </div>

          {/* BOTÓN DE PAGO */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={cargando || !sdkListo}
              className={`w-full py-5 rounded-2xl font-black text-white text-base uppercase tracking-widest transition-all shadow-xl flex justify-center items-center gap-3 ${
                cargando || !sdkListo
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[#003399] hover:bg-blue-800 hover:scale-[1.01] active:scale-95 shadow-blue-900/30'
              }`}
            >
              {cargando ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  PROCESANDO COBRO...
                </>
              ) : (
                `PAGAR $${total.toFixed(2)} MXN`
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
