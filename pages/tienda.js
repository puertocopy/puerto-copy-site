import Head from 'next/head';
import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { CardPaymentBrickModal } from '../components/CardPaymentBrick';
import FlujoPlanos from '../components/FlujoPlanos';
import productosData from '../data/productosPorTipoPrincipal_conPlanos.json';




// --- COMPONENTE DE TARJETA DE PRODUCTO (SENIOR UX) ---
const ProductCard = ({ producto, esImpresion, onAdd }) => {
  const [cantidad, setCantidad] = useState(1);

  const increment = () => setCantidad(prev => prev + 1);
  const decrement = () => setCantidad(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full relative">
      {/* Indicador visual de tipo */}
      <div className={`h-2.5 w-full ${esImpresion ? 'bg-[#003399]' : 'bg-emerald-500'}`} />
      
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {producto.Categoria}
          </span>
          {esImpresion && (
            <span className="bg-blue-50 border border-blue-100 text-[#003399] text-[10px] font-black px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              📄 Requiere PDF
            </span>
          )}
        </div>
        
        <h3 className="text-2xl font-black text-slate-800 mb-1 leading-tight group-hover:text-[#003399] transition-colors">
          {producto.Nombre}
        </h3>
        <p className="text-sm text-slate-400 mb-8 font-bold uppercase tracking-wide">
          {producto.varianteNombre}
        </p>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black mb-1 tracking-widest">Precio Unitario</p>
              <p className="text-3xl font-black text-slate-900">
                <span className="text-lg font-bold text-slate-400 mr-1">$</span>
                {producto.precioBase.toFixed(2)}
              </p>
            </div>
            
            {/* Controles de Cantidad UX */}
            <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 border border-slate-200 shadow-inner">
              <button 
                onClick={decrement}
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-[#003399] hover:bg-white rounded-xl transition-all font-black text-xl shadow-none hover:shadow-sm"
              >
                −
              </button>
              <span className="w-10 text-center font-black text-slate-800 text-lg">
                {cantidad}
              </span>
              <button 
                onClick={increment}
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-[#003399] hover:bg-white rounded-xl transition-all font-black text-xl shadow-none hover:shadow-sm"
              >
                +
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => {
              onAdd({ 
                nombre: producto.Nombre, 
                variante: producto.varianteNombre, 
                precioUnitario: producto.precioBase, 
                cantidad 
              });
              setCantidad(1);
            }}
            className="w-full bg-[#003399] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-800 active:scale-[0.98] transition-all shadow-[0_10px_20px_-5px_rgba(0,51,153,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(0,51,153,0.4)] flex justify-center items-center gap-3"
          >
            Añadir al pedido
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};


// --- PÁGINA PRINCIPAL DE TIENDA (RECONSTRUCCIÓN TOTAL) ---
export default function Tienda() {
  const { cart, addItem, removeItem, updateQuantity, validarCarrito } = useCart();
  const [busqueda, setBusqueda] = useState('');
  const [tabActiva, setTabActiva] = useState('Planos');

  // Categorización Senior
  const TABS = [
    { id: 'Planos', icon: '📐', cats: ['PLANOS', 'IMP GRAN FORMATO'] },
    { id: 'Papelería', icon: '📂', cats: ['PAPELERÍA', 'PAPEL ESPECIAL'] },
    { id: 'Impresiones', icon: '🖨️', cats: ['IMP T/ESTÁNDAR', 'COP/IMP T/ESTÁNDAR CON FONDO O IMAGEN', 'COPIA T/ESTANDAR', 'ESCANEO'] },
    { id: 'Servicios', icon: '⚙️', cats: ['ENGARGOLADOS', 'ENMICADOS'] }
  ];

  // Motor de datos
  const productosAplanados = useMemo(() => {
    const lista = [];
    productosData.forEach(grupo => {
      grupo.Productos.forEach(p => {
        p.Variaciones.forEach(v => {
          lista.push({
            ...p,
            tipoPrincipal: grupo.TipoPrincipal,
            precioBase: v.Precio,
            varianteNombre: v.Variante
          });
        });
      });
    });
    return lista.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
  }, []);

  // Filtrado de alto rendimiento
  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return productosAplanados.filter(p => {
      const matchBusqueda = p.Nombre.toLowerCase().includes(q) || p.Categoria.toLowerCase().includes(q);
      if (q !== '') return matchBusqueda;

      const tab = TABS.find(t => t.id === tabActiva);
      return tab?.cats.includes(p.Categoria);
    });
  }, [busqueda, tabActiva, productosAplanados]);

  // Totales precisos
  const subtotal = cart.reduce((acc, i) => acc + (i.subtotal || 0), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const [cargandoPago, setCargandoPago] = useState(false);
  const [errorPago, setErrorPago] = useState(null);
  const [mostrarFormTarjeta, setMostrarFormTarjeta] = useState(false);

  const handlePagar = () => {
    setErrorPago(null);
    const { needsFile } = validarCarrito();

    // Si algún artículo requiere subir archivo PDF, el modal se abre automáticamente y detiene el checkout
    if (needsFile) {
      return;
    }

    // Abrir el formulario integrado de tarjeta (Checkout API)
    setMostrarFormTarjeta(true);
  };



  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-[#003399]">
      <Head>
        <title>Catálogo de Servicios e Impresiones | Puerto Copy</title>
        <meta name="description" content="Explora nuestro catálogo de servicios de impresión, papelería y soluciones digitales en Puerto Vallarta. Calidad garantizada en cada trabajo." />
      </Head>
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <header className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
            Impresiones de <span className="text-[#003399]">calidad</span>,<br />al instante.
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed">
            Explora nuestro catálogo completo de papelería y servicios digitales. 
            Sube tus archivos y obtén una cotización real sincronizada con Loyverse.
          </p>
        </header>

        {/* BUSCADOR PRO */}
        <div className="max-w-3xl mx-auto mb-16 relative group">
          <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
            <svg className="w-6 h-6 text-slate-300 group-focus-within:text-[#003399] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            type="text"
            placeholder="¿Qué necesitas hoy? (Ej: Planos, Copias, USB...)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-20 pr-8 py-7 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border-0 ring-1 ring-slate-200 focus:ring-4 focus:ring-blue-100 outline-none text-xl transition-all bg-white font-medium"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* CATÁLOGO DINÁMICO */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            
            {/* TABS DE NAVEGACIÓN */}
            {busqueda === '' && (
              <div className="flex overflow-x-auto pb-4 sm:pb-0 gap-3 no-scrollbar">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTabActiva(t.id)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap ${
                      tabActiva === t.id 
                      ? 'bg-[#003399] text-white shadow-xl shadow-blue-900/20 scale-105' 
                      : 'bg-white text-slate-500 border border-slate-100 hover:border-blue-200 hover:text-blue-600'
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    {t.id}
                  </button>
                ))}
              </div>
            )}

            {tabActiva === 'Planos' && busqueda === '' ? (
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-4 sm:p-8">
                <FlujoPlanos onAgregar={addItem} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filtrados.map((p, i) => (
                  <ProductCard 
                    key={`${p.Nombre}-${p.varianteNombre}-${i}`}
                    producto={p} 
                    esImpresion={p.Categoria.includes('PLANOS') || p.Categoria.includes('COPIA') || p.Categoria.includes('IMP')}
                    onAdd={addItem}
                  />
                ))}
                {filtrados.length === 0 && (
                  <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                    <p className="text-7xl mb-6">🏜️</p>
                    <h3 className="text-3xl font-black text-slate-800 mb-2">Sin coincidencias</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Intenta con otro término de búsqueda</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CHECKOUT EXPERIENCE (CARRITO) */}
          <div className="lg:col-span-4 sticky top-12">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-50 overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-black/5">
              
              <div className="bg-slate-900 p-8 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter">TU PEDIDO</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Puerto Copy Express</p>
                  </div>
                  <div className="bg-[#003399] w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                    {cart.length}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🛒</div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tu carrito está vacío</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="group relative bg-white border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-black text-slate-800 leading-tight text-lg uppercase tracking-tight">{item.nombre}</h4>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{item.variante}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-100">
                          <button onClick={() => updateQuantity(item.id, item.cantidad - 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#003399] font-black">−</button>
                          <span className="text-sm font-black text-slate-700 w-6 text-center">{item.cantidad}</span>
                          <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#003399] font-black">+</button>
                        </div>
                        <p className="font-black text-slate-900 text-xl">
                          ${(item.total || item.precioUnitario * item.cantidad).toFixed(2)}
                        </p>
                      </div>

                      {item.needsFile && (
                        <div className={`mt-4 px-4 py-3 rounded-2xl flex items-center gap-3 border ${
                          item.fileAnalyzed ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-orange-50 border-orange-100 text-orange-700'
                        }`}>
                          <span className="text-lg">{item.fileAnalyzed ? '✅' : '⏳'}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {item.fileAnalyzed ? `${item.analisis?.numeroDePaginas} Págs - ${item.analisis?.formato}` : 'Archivo pendiente'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-slate-50 border-t border-slate-100">
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                      <span>IVA (16%)</span>
                      <span>${iva.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-slate-200 mt-4">
                      <span className="text-slate-900 font-black text-sm uppercase tracking-[0.2em]">Total</span>
                      <div className="text-right">
                        <p className="text-4xl font-black text-[#003399] tracking-tighter leading-none">
                          ${total.toFixed(2)}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Pesos Mexicanos</p>
                      </div>
                    </div>
                  </div>

                  {errorPago && (
                    <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-start gap-2">
                      <span className="text-base">⚠️</span>
                      <p>{errorPago}</p>
                    </div>
                  )}

                  <button
                    onClick={handlePagar}
                    disabled={cargandoPago}
                    className={`w-full py-6 rounded-[2rem] font-black text-white shadow-2xl transition-all text-lg uppercase tracking-[0.3em] flex items-center justify-center gap-3 ${
                      cargandoPago 
                        ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-[#003399] hover:bg-blue-800 hover:scale-[1.02] active:scale-95 shadow-blue-900/30'
                    }`}
                  >
                    {cargandoPago ? (
                      <>
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        PROCESANDO...
                      </>
                    ) : (
                      <>
                        PAGAR CON MERCADO PAGO
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>

      {/* CARD PAYMENT BRICK OFICIAL (MÉTODO A - ORDERS API) */}
      {mostrarFormTarjeta && (
        <CardPaymentBrickModal
          total={total}
          items={cart}
          onClose={() => setMostrarFormTarjeta(false)}
        />
      )}

      <Footer />


      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 20px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
