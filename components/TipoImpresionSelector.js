import { useState } from 'react';

export default function TipoImpresionSelector({ onSelect }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (tipo) => {
    setSelected(tipo);
    onSelect(tipo);
  };

  const opciones = [
    {
      nombre: 'Líneas / Texto',
      valor: 'lineas',
      imagen: '/tipo/lineas.jpg', // Puedes cambiar esta imagen luego
    },
    {
      nombre: 'Cobertura Completa',
      valor: 'completa',
      imagen: '/tipo/completa.jpg', // Puedes cambiar esta imagen luego
    },
  ];

  return (
    <div className="py-8 text-center">
      <h2 className="text-2xl font-bold text-[#004b71] mb-6">¿Qué tipo de impresión necesitas?</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {opciones.map((opcion) => (
          <div
            key={opcion.valor}
            onClick={() => handleSelect(opcion.valor)}
            className={`cursor-pointer rounded-lg overflow-hidden shadow-md border-4 ${
              selected === opcion.valor ? 'border-[#004b71]' : 'border-transparent'
            } transition duration-300 max-w-xs`}
          >
            <img src={opcion.imagen} alt={opcion.nombre} className="w-full h-40 object-cover" />
            <div className="bg-white text-gray-800 font-semibold py-3">{opcion.nombre}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
