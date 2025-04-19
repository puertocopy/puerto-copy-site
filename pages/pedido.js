
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServicioSelector from '../components/ServicioSelector';
import ColorSelector from '../components/ColorSelector';
import TamanoSelector from '../components/TamanoSelector';
import TipoImpresionSelector from '../components/TipoImpresionSelector';
import MetodoPagoSelector from '../components/MetodoPagoSelector';
import PagoFormulario from '../components/PagoFormulario';

export default function Pedido() {
  const [total, setTotal] = useState(0);
  const [seleccion, setSeleccion] = useState({
    servicio: '',
    color: '',
    tamano: '',
    tipo: '',
  });

  const [archivo, setArchivo] = useState(null);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState('');

  return (
    <div className="bg-white text-gray-900">
      <Navbar />

      <section className="mt-[60px] px-6 py-16 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#004b71] mb-8 text-center">Realizar Pedido</h1>

        <div className="space-y-10">
          <ServicioSelector onSelect={(s) => setSeleccion((prev) => ({ ...prev, servicio: s }))} />
          <ColorSelector onSelect={(c) => setSeleccion((prev) => ({ ...prev, color: c }))} />
          <TamanoSelector onSelect={(t) => setSeleccion((prev) => ({ ...prev, tamano: t }))} />
          <TipoImpresionSelector onSelect={(ti) => setSeleccion((prev) => ({ ...prev, tipo: ti }))} />
        </div>

        {/* SUBIDA DE ARCHIVOS */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold mb-4">Sube tus archivos</h2>
          <input
            type="file"
            multiple
            className="w-full border rounded p-2"
            onChange={(e) => setArchivo(e.target.files[0])}
          />
        </div>

        {/* TOTAL Y BOTÓN DE PAGO */}
        <div className="mt-10 text-right">
          <p className="text-lg font-semibold mb-4">
            Total: <span className="text-[#004b71]">${total.toFixed(2)}</span>
          </p>
          <button
            type="button"
            className="bg-[#004b71] hover:bg-blue-800 text-white px-6 py-3 rounded shadow"
            onClick={() => setMostrarPago(true)}
          >
            Proceder al Pago
          </button>
        </div>

        {/* MÉTODO DE PAGO Y FORMULARIO */}
        {mostrarPago && (
          <div className="mt-10">
            <MetodoPagoSelector
              metodo={metodoPago}
              setMetodo={setMetodoPago}
              onConfirmar={() => setMostrarPago(true)}
            />
            {metodoPago && <PagoFormulario metodo={metodoPago} />}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
