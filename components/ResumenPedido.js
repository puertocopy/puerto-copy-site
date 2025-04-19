import React from 'react';

export default function ResumenPedido({ servicio, color, tamano, tipo, total, onContinuar }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-[#004b71]">Resumen del Pedido</h2>
      <ul className="text-gray-700 space-y-2 mb-4">
        <li><strong>Servicio:</strong> {servicio || 'No seleccionado'}</li>
        <li><strong>Color:</strong> {color || 'No seleccionado'}</li>
        <li><strong>Tamaño:</strong> {tamano || 'No seleccionado'}</li>
        <li><strong>Tipo:</strong> {tipo || 'No seleccionado'}</li>
      </ul>
      <p className="text-lg font-semibold mb-6">Total: <span className="text-[#004b71]">${total.toFixed(2)}</span></p>
      <button
        className="bg-[#004b71] hover:bg-blue-800 text-white font-bold py-3 px-6 rounded w-full transition"
        onClick={onContinuar}
      >
        Proceder al Pago
      </button>
    </div>
  );
}
