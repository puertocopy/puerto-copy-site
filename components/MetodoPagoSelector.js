import React from 'react';

export default function MetodoPagoSelector({ metodo, setMetodo }) {
  const opciones = [
    { valor: 'tarjeta', label: 'Tarjeta', icono: '💳' },
    { valor: 'efectivo', label: 'Efectivo', icono: '💸' },
    { valor: 'spei', label: 'Transferencia SPEI', icono: '🔁' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-6 text-[#004b71]">Selecciona un método de pago</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {opciones.map((opcion) => (
          <div
            key={opcion.valor}
            className={`cursor-pointer border rounded-lg p-4 text-center transition duration-300 ${
              metodo === opcion.valor
                ? 'border-[#004b71] bg-blue-50 text-[#004b71] font-semibold'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setMetodo(opcion.valor)}
          >
            <div className="text-3xl mb-2">{opcion.icono}</div>
            <div>{opcion.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

