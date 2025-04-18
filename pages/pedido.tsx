import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PedidoPage() {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const handleArchivoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivo(file);
      setMensaje('');
    }
  };

  const handleEnviarPedido = () => {
    if (!archivo) {
      setMensaje('Por favor, carga un archivo antes de enviar el pedido.');
      return;
    }
  
    const numeroPedido = Math.floor(100000 + Math.random() * 900000); // Número aleatorio de 6 dígitos
    const nombreArchivo = archivo.name;
    const mensajeWhatsApp = `Hola, acabo de realizar un pedido en línea.\n\n📦 *N° de Pedido:* ${numeroPedido}\n📄 *Archivo:* ${nombreArchivo}\n\nPor favor confirmar recepción.`;
  
    const telefono = '3223499334'; // Reemplaza con tu número real sin espacios
    const urlWhatsApp = `https://wa.me/52${telefono}?text=${encodeURIComponent(mensajeWhatsApp)}`;
  
    window.open(urlWhatsApp, '_blank');
  };
  

  return (
    <div className="bg-white text-gray-900 min-h-screen overflow-x-hidden">
      <Navbar />

      <section className="pt-28 px-4 pb-20">
        <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-3xl font-bold text-center text-[#004b71] mb-6">Realizar Pedido</h1>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carga tu archivo
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={handleArchivoChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {mensaje && <p className="text-red-600 mb-4">{mensaje}</p>}

          <button
            onClick={handleEnviarPedido}
            disabled={!archivo}
            className={`w-full py-3 px-4 rounded text-white font-semibold transition ${
              archivo
                ? 'bg-[#004b71] hover:bg-[#00678f]'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Enviar pedido por WhatsApp
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
