import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingBubbles from "../components/FloatingBubbles";
import PasoSeleccionCategoria from '../components/PasoSeleccionCategoria';
import FlujoPlanos from '../components/FlujoPlanos';
import ResumenCotizacion from '../components/ResumenCotizacion';
import productosData from '../data/productosPorTipoPrincipal_conPlanos.json';
import PasoSubirArchivos from '../components/PasoSubirArchivos';

export default function Cotizar() {
  const [categoria, setCategoria] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [mostrarCargaArchivos, setMostrarCargaArchivos] = useState(false);
  const [archivosAsignados, setArchivosAsignados] = useState([]);

  // Inicializamos AOS
  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  const categorias = productosData.map((cat) => cat.TipoPrincipal);

  const productosSeleccionados = productosData.find(
    (p) => p.TipoPrincipal === categoria
  )?.Productos || [];

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

  return (
    <>
      <Navbar />
      
      {/* Sección principal con un estilo más profesional y centrado */}
      <main className="min-h-screen bg-[#F3F7FC] text-gray-900 p-6 flex flex-col items-center pt-24 md:py-20">
        
        <div className="w-full max-w-7xl px-4 md:px-8">
          <h1 
            className="text-[clamp(2rem,3.5vw,2.8rem)] font-extrabold text-[#003082] text-center mb-12"
            data-aos="fade-up"
          >
            Generar tu Cotización
          </h1>

          <div 
            className="w-full max-w-5xl mx-auto flex flex-col md:flex-row md:items-start gap-10 p-6 md:p-10 bg-white rounded-3xl shadow-xl border border-[#E2EEFB]"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {/* Contenedor principal para los pasos del formulario */}
            <div className="flex-1">
              {!categoria && !mostrarCargaArchivos && (
                <PasoSeleccionCategoria
                  categorias={categorias}
                  onSelect={(cat) => {
                    setCategoria(cat);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {categoria === 'Planos' && !mostrarCargaArchivos && (
                <FlujoPlanos onAgregar={agregarAlCarrito} />
              )}

              {mostrarCargaArchivos && (
                <PasoSubirArchivos
                  productos={carrito}
                  archivosAsignados={archivosAsignados}
                  setArchivosAsignados={setArchivosAsignados}
                />
              )}
            </div>

            {/* Resumen de la cotización con estilo mejorado */}
            <div className="md:w-[350px] w-full border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
              <ResumenCotizacion
                productos={carrito}
                onEliminar={eliminarDelCarrito}
                onActualizarCantidad={actualizarCantidad}
                onContinuar={() => setMostrarCargaArchivos(true)}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingBubbles />
    </>
  );
}

// Nota: Asegúrate de que los componentes como PasoSeleccionCategoria, FlujoPlanos, etc.,
// tengan estilos que también sigan la misma línea de diseño (colores, sombras, bordes redondeados).
// Por ejemplo, para los botones, usar 'bg-[#0B63B2] hover:brightness-110' como en la página de inicio.