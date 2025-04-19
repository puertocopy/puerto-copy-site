import React from 'react';

export default function FormularioSPEI({ onConfirmarPago }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-[#004b71]">Pago por SPEI</h2>
      
      <p className="mb-2 text-sm text-gray-600">Realiza la transferencia con los siguientes datos:</p>

      <ul className="text-sm text-gray-800 space-y-2 mb-6">
        <li><strong>Banco:</strong> BBVA</li>
        <li><strong>Cuenta CLABE:</strong> 012345678901234567</li>
        <li><strong>Beneficiario:</strong> Puerto Copy</li>
        <li><strong>Concepto:</strong> Tu nombre o número de pedido</li>
        <li><strong>Monto:</strong> Se mostrará automáticamente más adelante</li>
      </ul>

      <button
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded w-full transition"
        onClick={onConfirmarPago}
      >
        Ya realicé el pago
      </button>
    </div>
  );
}
