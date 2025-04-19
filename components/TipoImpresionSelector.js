// components/TipoImpresionSelector.js
import React from 'react';

export default function TipoImpresionSelector({ tipo, setTipo }) {
  const opciones = [
    { valor: 'lineas', nombre: 'Líneas / Texto', icono: '📏' },
    { valor: 'cobertura', nombre: 'Cobertura Completa', icono: '🎨' }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Tipo de Impresión</h2>
      <div className="flex flex-wrap gap-6">
        {opciones.map((op) => (
          <button
            key={op.valor}
            onClick={() => setTipo(op.valor)}
            className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg shadow transition-all w-36 ${
              tipo === op.valor
                ? 'border-[#004b71] bg-blue-50'
                : 'border-gray-300 hover:border-[#004b71]'
            }`}
            type="button"
          >
            <span className="text-4xl mb-2">{op.icono}</span>
            <span className="text-sm font-medium text-center">{op.nombre}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
