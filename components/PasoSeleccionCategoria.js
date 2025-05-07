import { useState } from 'react';

export default function PasoSeleccionCategoria({ categorias, onSelect }) {
  const [mostrarPopup, setMostrarPopup] = useState(false);

  const ordenadas = [
    'Planos',
    ...categorias.filter((cat) => cat !== 'Planos')
  ];

  const manejarClick = (cat) => {
    if (cat === 'Planos') {
      onSelect(cat);
    } else {
      setMostrarPopup(true);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-6">Selecciona una categoría:</h2>

      <div className="flex flex-wrap justify-center gap-4">
        {ordenadas.map((cat, index) => (
          <div key={index} className="relative">
            <button
              onClick={() => manejarClick(cat)}
              className={`px-6 py-4 min-w-[140px] text-sm font-medium rounded-xl border transition-all duration-200 shadow
                ${cat === 'Planos'
                  ? 'bg-blue-700 text-white border-blue-700 hover:bg-blue-800'
                  : 'bg-white text-gray-400 border-gray-300 cursor-pointer hover:shadow-md'
                }`}
            >
              {cat}
            </button>
            {cat !== 'Planos' && (
              <span className="absolute top-0 right-0 bg-yellow-400 text-white text-[10px] font-bold px-2 py-[2px] rounded-br-lg rounded-tl-lg shadow-sm">
                Próximamente
              </span>
            )}
          </div>
        ))}
      </div>

      {mostrarPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center relative z-50">
            <h3 className="text-lg font-bold text-blue-700 mb-3">¡En preparación!</h3>
            <p className="text-gray-600 mb-4">
              Este servicio aún está en desarrollo. Pronto estará disponible.
            </p>
            <button
              onClick={() => setMostrarPopup(false)}
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-xl text-sm font-medium transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
