import React from 'react';

export default function MetodoPagoSelector({ metodo, setMetodo, onConfirmar }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-[#004b71]">Selecciona el método de pago</h2>

      <div className="flex flex-col space-y-4 mb-6">
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            value="spei"
            checked={metodo === 'spei'}
            onChange={(e) => setMetodo(e.target.value)}
          />
          <span>SPEI (Transferencia Bancaria)</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="radio"
            value="tarjeta"
            checked={metodo === 'tarjeta'}
            onChange={(e) => setMetodo(e.target.value)}
          />
          <span>Tarjeta de Crédito/Débito</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="radio"
            value="efectivo"
            checked={metodo === 'efectivo'}
            onChange={(e) => setMetodo(e.target.value)}
          />
          <span>Efectivo en tienda</span>
        </label>
      </div>

      <button
        className="bg-[#004b71] hover:bg-blue-800 text-white font-bold py-3 px-6 rounded w-full transition"
        onClick={onConfirmar}
      >
        Continuar
      </button>
    </div>
  );
}
