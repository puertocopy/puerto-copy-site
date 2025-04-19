// components/PasoTipoTrabajo.tsx
import React from 'react';

export default function PasoTipoTrabajo({ onSelect }: { onSelect: (tipo: string) => void }) {
  return (
    <div className="text-center py-10">
      <h2 className="text-2xl font-semibold mb-6 text-[#004b71]">¿Qué deseas imprimir?</h2>
      <div className="flex flex-col md:flex-row justify-center gap-6">
        <button
          onClick={() => onSelect('copias')}
          className="bg-white border-2 border-[#004b71] hover:bg-[#004b71] hover:text-white transition-all rounded-lg p-6 shadow-md w-64 text-lg"
        >
          Copias de Planos
        </button>
        <button
          onClick={() => onSelect('impresion')}
          className="bg-white border-2 border-[#004b71] hover:bg-[#004b71] hover:text-white transition-all rounded-lg p-6 shadow-md w-64 text-lg"
        >
          Impresión de Planos
        </button>
      </div>
    </div>
  );
}
