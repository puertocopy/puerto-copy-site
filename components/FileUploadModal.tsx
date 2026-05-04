import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

/**
 * Modal global para la carga y validación de archivos PDF.
 */
export const FileUploadModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen, itemToUpload, processFile } = useCart();
  const [loading, setLoading] = useState(false);
  const [cobertura, setCobertura] = useState<'LINEAS' | 'FONDO'>('LINEAS');

  if (!isModalOpen || !itemToUpload) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      await processFile(itemToUpload.id, file, cobertura);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-in fade-in zoom-in duration-300">
        <h2 className="text-2xl font-black text-blue-900 mb-2">
          ¡Casi listo! 📄
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Has agregado <span className="font-bold text-blue-700">{itemToUpload.nombre}</span> ({itemToUpload.variante}). 
          Necesitamos analizar tu archivo PDF para calcular el precio exacto.
        </p>

        {itemToUpload.variante.toLowerCase().includes('plano') && (
          <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-sm font-bold text-blue-800 mb-3">¿Qué tipo de cobertura tiene tu plano?</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="cobertura" 
                  checked={cobertura === 'LINEAS'} 
                  onChange={() => setCobertura('LINEAS')}
                  className="accent-blue-700 w-4 h-4"
                />
                <span className="text-sm group-hover:text-blue-700 transition">Líneas (poca tinta)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="cobertura" 
                  checked={cobertura === 'FONDO'} 
                  onChange={() => setCobertura('FONDO')}
                  className="accent-blue-700 w-4 h-4"
                />
                <span className="text-sm group-hover:text-blue-700 transition">Fondo (mucha tinta)</span>
              </label>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className={`
            flex flex-col items-center justify-center border-2 border-dashed border-blue-200 
            rounded-3xl p-10 cursor-pointer transition-all
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-blue-50/50'}
          `}>
            <div className="text-4xl mb-2">☁️</div>
            <span className="text-blue-700 font-bold">
              {loading ? 'Analizando archivo...' : 'Seleccionar archivo PDF'}
            </span>
            <span className="text-gray-400 text-xs mt-1">Máximo 50MB</span>
            <input 
              type="file" 
              className="hidden" 
              accept="application/pdf" 
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>

          <button 
            onClick={() => setIsModalOpen(false)}
            className="w-full py-3 text-gray-400 text-sm font-medium hover:text-gray-600 transition"
          >
            Cancelar y quitar del carrito
          </button>
        </div>
      </div>
    </div>
  );
};
