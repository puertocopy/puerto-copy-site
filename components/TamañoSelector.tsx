import React from 'react';

interface TamañoSelectorProps {
  selectedTamaño: string;
  onSelect: (tamaño: string) => void;
}

const tamaños = ['45x60', '60x90', '60x120', '90x120', '90x150'];

export default function TamañoSelector({ selectedTamaño, onSelect }: TamañoSelectorProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">3. Selecciona el tamaño:</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tamaños.map((tamaño) => (
          <button
            key={tamaño}
            onClick={() => onSelect(tamaño)}
            className={`border rounded-lg py-2 px-4 text-sm font-medium transition ${
              selectedTamaño === tamaño
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 hover:border-blue-400'
            }`}
          >
            {tamaño}
          </button>
        ))}
      </div>
    </div>
  );
}
