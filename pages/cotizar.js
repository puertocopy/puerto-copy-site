import Head from 'next/head';
import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Check, CheckCircle } from 'lucide-react'; // Asegúrate de tener lucide-react instalado, o elimina esta línea si no lo usas.

// Componentes originales
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingBubbles from "../components/FloatingBubbles";
import PasoSeleccionCategoria from '../components/PasoSeleccionCategoria';
import FlujoPlanos from '../components/FlujoPlanos';
import ResumenCotizacion from '../components/ResumenCotizacion';
import PasoSubirArchivos from '../components/PasoSubirArchivos';

// Datos
import productosData from '../data/productosPorTipoPrincipal_conPlanos.json';

export default function Cotizar() {
  const [categoria, setCategoria] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [mostrarCargaArchivos, setMostrarCargaArchivos] = useState(false);
  const [archivosAsignados, setArchivosAsignados] = useState([]);
  const [completado, setCompletado] = useState(false); // Estado para mostrar mensaje final si es necesario

  // Inicializamos AOS
  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  const categorias = productosData.map((cat) => cat.TipoPrincipal);

  // Funciones de lógica original
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => [...prev, producto]);
    setCategoria('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarDelCarrito = (index) => {
    const nuevo = [...carrito];
    nuevo.splice(index, 1);
    setCarrito(nuevo);
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    const nuevos = [...carrito];
    nuevos[index].cantidad = nuevaCantidad;
    setCarrito(nuevos);
  };

  const finalizarCotizacion = () => {
    // Aquí iría tu lógica de envío final si la tienes en PasoSubirArchivos, 
    // o simplemente cambiamos el estado visual
    setCompletado(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#FDFDFD] min-h-screen flex flex-col font-sans text-gray-900">
      <Head>
        <title>Cotizador en Línea | Puerto Copy Puerto Vallarta</title>
        <meta name="description" content="Calcula el costo de tus impresiones de planos, copias y servicios de oficina al instante con nuestro cotizador en línea." />
      </Head>
      {/* Navbar forzando fondo blanco para consistencia con el diseño nuevo */}
      <Navbar /> 
      <FloatingBubbles />

      <main className="flex-grow pt-28 pb-20 px-4 md:px-8 relative z-10">
        
        {!completado ? (
          <div className="max-w-7xl mx-auto">
            
            {/* Encabezado con Diseño Nuevo */}
            <div className="text-center mb-12" data-aos="fade-up">
              <span className="text-[#0B63B2] font-bold tracking-wider uppercase text-xs bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                Cotizador en Línea
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold mt-6 text-[#003082] tracking-tight font-brand">
                {mostrarCargaArchivos ? 'Adjuntar Archivos' : 'Generar Cotización'}
              </h1>
              <p className="text-gray-500 mt-4 text-lg max-w-2xl mx-auto">
                {mostrarCargaArchivos 
                  ? 'Sube los archivos necesarios para completar tu pedido.' 
                  : 'Selecciona una categoría y configura tus productos.'}
              </p>
            </div>

            {/* Estructura Flex: Izquierda (Formulario) - Derecha (Resumen Sticky) */}
            <div className="flex flex-col lg:flex-row gap-8 items-start relative">
              
              {/* COLUMNA IZQUIERDA: Flujo de selección */}
              <div className="flex-1 w-full min-w-0" data-aos="fade-up" data-aos-delay="200">
                
                {/* Paso 1: Selección de Categoría */}
                {!categoria && !mostrarCargaArchivos && (
                  <PasoSeleccionCategoria
                    categorias={categorias}
                    onSelect={(cat) => {
                      setCategoria(cat);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}

                {/* Paso 2: Flujo Específico (Planos u otros) */}
                {/* Nota: Envuelto en div para mantener animaciones */}
                {categoria && !mostrarCargaArchivos && (
                  <div className="animate-fade-in-up">
                    <button 
                      onClick={() => setCategoria('')} 
                      className="mb-4 text-sm text-gray-500 hover:text-[#0B63B2] flex items-center gap-1 transition-colors"
                    >
                      ← Volver a categorías
                    </button>
                    {/* Aquí renderizamos tu componente original FlujoPlanos */}
                    <FlujoPlanos onAgregar={agregarAlCarrito} />
                  </div>
                )}

                {/* Paso 3: Subida de Archivos */}
                {mostrarCargaArchivos && (
                  <PasoSubirArchivos
                    productos={carrito}
                    archivosAsignados={archivosAsignados}
                    setArchivosAsignados={setArchivosAsignados}
                    // Si PasoSubirArchivos tiene un botón finalizar, pásale la función:
                    onFinalizar={finalizarCotizacion} 
                  />
                )}
              </div>

              {/* COLUMNA DERECHA: Resumen (Solo aparece si hay items y no hemos terminado) */}
              {carrito.length > 0 && !completado && (
                <div 
                  className="w-full lg:w-[400px] flex-shrink-0 sticky top-28" 
                  data-aos="fade-left" 
                  data-aos-delay="300"
                >
                  <ResumenCotizacion
                    productos={carrito}
                    onEliminar={eliminarDelCarrito}
                    onActualizarCantidad={actualizarCantidad}
                    onContinuar={() => {
                        setMostrarCargaArchivos(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* PANTALLA DE ÉXITO (Opcional, basado en el diseño nuevo) */
          <div className="max-w-2xl mx-auto text-center py-20 px-4" data-aos="zoom-in">
             <div className="w-28 h-28 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-100 border-4 border-white">
                {/* Usando icono CheckCircle de lucide o un SVG simple */}
                <CheckCircle size={56} strokeWidth={2} />
             </div>
             <h2 className="text-4xl md:text-5xl font-extrabold text-[#003082] mb-6 font-brand">¡Cotización Lista!</h2>
             <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Hemos procesado tu información.
             </p>
             <div className="flex justify-center gap-4">
                <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm">
                  Nueva Cotización
                </button>
                <a href="/" className="px-8 py-4 bg-[#0B63B2] text-white font-bold rounded-xl hover:bg-[#004a8f] shadow-lg shadow-blue-500/20 transition-all">
                  Volver al Inicio
                </a>
             </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
