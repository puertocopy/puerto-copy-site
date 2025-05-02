import { useState } from 'react';

export default function ServicioCotizacionSelector({ onSelect }) {
  const [seleccionado, setSeleccionado] = useState(null);

  const productos = [
    { nombre: "CARPETA T/CARTA", precio: 6.00 },
    { nombre: "CD/DVD", precio: 37.00 },
    { nombre: "CLIP", precio: 0.50 },
    { nombre: "COPIA DE INE", precio: 2.00 },
    { nombre: "COPIA PLANO IMG/FONDO B/N 45X60", precio: 39.00 },
    { nombre: "COPIA PLANO IMG/FONDO B/N 60X90", precio: 60.00 },
    { nombre: "COPIA PLANO IMG/FONDO B/N 90X120", precio: 100.00 },
    { nombre: "FOTOGRAFÍA 10X15", precio: 10.00 },
    { nombre: "IMPRESIÓN CARTA COLOR", precio: 5.00 },
    { nombre: "IMPRESIÓN OFICIO B/N", precio: 2.00 },
    { nombre: "ENGARGOLADO CHICO", precio: 25.00 },
    { nombre: "IMPRESIÓN LONA 90X120", precio: 120.00 },
    { nombre: "COPIA A COLOR TABLOIDE", precio: 8.00 },
    // Agrega más productos si los deseas aquí...
  ];

  const handleSelect = (producto) => {
    setSeleccionado(producto.nombre);
    onSelect(producto); // Envia el producto seleccionado al padre
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Selecciona un servicio</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {productos.map((producto, index) => (
          <button
            key={index}
            onClick={() => handleSelect(producto)}
            className={`p-4 border rounded-2xl shadow hover:bg-blue-100 transition-all duration-200 ${
              seleccionado === producto.nombre ? 'bg-blue-200 font-bold' : 'bg-white'
            }`}
          >
            <div className="text-lg">{producto.nombre}</div>
            <div className="text-sm text-gray-600">${producto.precio.toFixed(2)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
