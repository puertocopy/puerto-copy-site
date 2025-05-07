import { useState } from 'react';

export default function PasoSeleccionVariacion({ variaciones, onConfirmar }) {
  const [seleccion, setSeleccion] = useState({});

  const handleSeleccion = (grupo, valor) => {
    setSeleccion((prev) => ({ ...prev, [grupo]: valor }));
  };

  const todasSeleccionadas = Object.keys(variaciones).every(
    (grupo) => seleccion[grupo]
  );

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Elige las opciones</h2>

      {Object.entries(variaciones).map(([grupo, opciones], i) => (
        <div key={i} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{grupo}</h3>
          <div className="flex flex-wrap gap-3">
            {opciones.map((opcion, idx) => (
              <button
                key={idx}
                onClick={() => handleSeleccion(grupo, opcion)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                  seleccion[grupo] === opcion
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-100'
                }`}
              >
                {opcion}
              </button>
            ))}
          </div>
        </div>
      ))}

      {todasSeleccionadas && (
        <div className="text-center mt-8">
          <button
            onClick={() => onConfirmar(seleccion)}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
          >
            Confirmar selección
          </button>
        </div>
      )}
    </div>
  );
}
