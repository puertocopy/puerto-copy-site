import React, { useState } from 'react';

export default function FormularioTarjeta({ onConfirmarPago }) {
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [expiracion, setExpiracion] = useState('');
  const [cvc, setCvc] = useState('');

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-[#004b71]">Pago con Tarjeta</h2>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la Tarjeta</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Ej. Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
          <input
            type="text"
            maxLength={19}
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="•••• •••• •••• ••••"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiración</label>
            <input
              type="text"
              value={expiracion}
              onChange={(e) => setExpiracion(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="MM/AA"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
            <input
              type="text"
              maxLength={4}
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="123"
            />
          </div>
        </div>

        <button
          type="button"
          className="mt-6 w-full bg-blue-700 text-white py-3 rounded hover:bg-blue-800 transition"
          onClick={onConfirmarPago}
        >
          Pagar ahora
        </button>
      </form>
    </div>
  );
}
