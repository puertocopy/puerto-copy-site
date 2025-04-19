// components/PasoColor.tsx
import React from 'react';

export default function PasoColor({ onSelect }: { onSelect: (color: string) => void }) {
  return (
    <div className="text-center py-10">
      <h2 className="text-2xl font-semibold mb-6 text-[#004b71]">Selecciona el tipo de color</h2>
      <div className="flex flex-col md:flex-row justify-center gap-6">
        <button
          onClick={() => onSelect('blanco_negro')}
          className="bg-white border-2 border-[#004b71] hover:bg-[#004b71] hover:text-white transition-all rounded-lg p-6 shadow-md w-64 text-lg"
        >
          Blanco y Negro
        </button>
        <button
          onClick={() => onSelect('color')}
          className="bg-white border-2 border-[#004b71] hover:bg-[#004b71] hover:text-white transition-all rounded-lg p-6 shadow-md w-64 text-lg"
        >
          A Color
        </button>
      </div>
    </div>
  );
}
