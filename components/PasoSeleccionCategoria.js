import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex flex-col items-center">
      <h2 className="text-xl md:text-2xl font-bold text-[#0D2A4E] mb-8 text-center">
        Selecciona el tipo de servicio que necesitas:
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {ordenadas.map((cat, index) => (
          <div key={index} className="relative w-full">
            <button
              onClick={() => manejarClick(cat)}
              className={`
                w-full text-left p-6 rounded-2xl border transition-all duration-300 transform
                ${cat === 'Planos'
                  ? 'bg-[#0B63B2] text-white border-[#0B63B2] shadow-lg hover:shadow-xl hover:-translate-y-1'
                  : 'bg-white text-gray-700 border-[#E2EEFB] shadow-sm hover:shadow-md hover:-translate-y-0.5'
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Icono de ejemplo, puedes reemplazarlo por uno más específico */}
                <span className={`text-3xl ${cat !== 'Planos' ? 'text-gray-400' : 'text-white'}`}>
                  {cat === 'Planos' ? '📐' : '📄'}
                </span>
                <span className={`text-lg font-semibold ${cat !== 'Planos' ? 'text-gray-600' : 'text-white'}`}>
                  {cat}
                </span>
              </div>
            </button>
            
            {cat !== 'Planos' && (
              <span className="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg shadow-sm transform -translate-y-1 -translate-x-1 rotate-3">
                PRÓXIMAMENTE
              </span>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {mostrarPopup && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-8 w-11/12 md:w-96 text-center relative z-50"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <h3 className="text-2xl font-extrabold text-[#0B63B2] mb-4">¡En preparación! 🛠️</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Este servicio estará disponible muy pronto para ti. Estamos trabajando para ofrecerte la mejor calidad.
              </p>
              <button
                onClick={() => setMostrarPopup(false)}
                className="bg-[#0B63B2] hover:brightness-110 text-white font-semibold px-7 py-3 rounded-full shadow-md transition"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}