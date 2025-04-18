// pages/pedido.js
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Pedido() {
  const [total, setTotal] = useState(0);

  return (
    <div className="bg-white text-gray-900">
      <Navbar />

      <section className="mt-[60px] px-6 py-16 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#004b71] mb-8 text-center">Realizar Pedido</h1>

        <form className="space-y-8">
          {/* SELECCIÓN DE SERVICIOS */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Selecciona tus servicios</h2>
            {/* Aquí más adelante colocaremos checkboxes o selects con precio */}
            <p className="text-sm text-gray-600">Ejemplo: impresión de planos, enmicado, etc.</p>
          </div>

          {/* SUBIDA DE ARCHIVOS */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Sube tus archivos</h2>
            <input type="file" multiple className="w-full border rounded p-2" />
          </div>

          {/* TOTAL Y PAGO */}
          <div className="text-right">
            <p className="text-lg font-semibold mb-4">Total: <span className="text-[#004b71]">${total.toFixed(2)}</span></p>
            <button
              type="button"
              className="bg-[#004b71] hover:bg-blue-800 text-white px-6 py-3 rounded shadow"
            >
              Proceder al Pago
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </div>
  );
}
