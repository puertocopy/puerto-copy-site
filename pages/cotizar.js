import { useState } from 'react';
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
      <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center pt-24">
        <h1 className="text-3xl font-bold text-center mb-8">Realiza tu Cotización</h1>

        <div className="w-full max-w-5xl flex flex-col md:flex-row md:items-start gap-8">
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

          {!mostrarCargaArchivos && (
            <div className="md:w-[350px] w-full">
              <ResumenCotizacion
                productos={carrito}
                onEliminar={eliminarDelCarrito}
                onActualizarCantidad={actualizarCantidad}
                onContinuar={() => setMostrarCargaArchivos(true)}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
