import { useState } from 'react';
import ServicioCotizacionSelector from '../components/ServicioCotizacionSelector';
import ResumenCotizacion from '../components/ResumenCotizacion';
import FormularioCotizacion from '../components/FormularioCotizacion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


export default function Cotizar() {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [paso, setPaso] = useState(1); // 1: selector, 2: resumen, 3: formulario

  const avanzarPaso = () => setPaso(paso + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-6">Cotización Interactiva</h1>

        {paso === 1 && (
          <ServicioCotizacionSelector
            onSelect={(producto) => {
              setProductoSeleccionado(producto);
              avanzarPaso();
            }}
          />
        )}

        {paso === 2 && (
          <ResumenCotizacion
            producto={productoSeleccionado}
            onContinuar={avanzarPaso}
          />
        )}

        {paso === 3 && (
          <FormularioCotizacion producto={productoSeleccionado} />
        )}
      </main>
      <Footer />
    </div>
  );
}
