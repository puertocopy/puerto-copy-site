import { useState } from 'react';

export default function PasoSeleccionProducto({ productos, onAgregar }) {
  const [selecciones, setSelecciones] = useState({});

  const handleSelect = (nombre, campo, valor) => {
    setSelecciones((prev) => ({
      ...prev,
      [nombre]: {
        ...prev[nombre],
        [campo]: valor
      }
    }));
  };

  const handleAgregar = (producto, idxVariante) => {
    const cantidad = parseInt(selecciones[producto.Nombre]?.cantidad) || 1;
    const variacion = producto.Variaciones[idxVariante];

    onAgregar({
      nombre: producto.Nombre,
      variante: variacion.Variante,
      precio: variacion.Precio,
      cantidad
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Selecciona tu producto</h2>

      {productos.map((producto, idx) => (
        <div key={idx} className="bg-white p-4 rounded-xl shadow mb-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">{producto.Nombre}</h3>
          <p className="text-sm text-gray-500 mb-2">{producto.Categoria}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {producto.Variaciones.map((v, i) => (
              <button
                key={i}
                onClick={() => handleSelect(producto.Nombre, 'varianteIndex', i)}
                className={`border px-3 py-2 rounded-lg text-sm transition ${
                  selecciones[producto.Nombre]?.varianteIndex === i
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-100'
                }`}
              >
                {v.Variante} — ${parseFloat(v.Precio).toFixed(2)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-2">
            <input
              type="number"
              min="1"
              value={selecciones[producto.Nombre]?.cantidad || 1}
              onChange={(e) =>
                handleSelect(producto.Nombre, 'cantidad', e.target.value)
              }
              className="w-20 border rounded px-3 py-1"
            />

            <button
              disabled={selecciones[producto.Nombre]?.varianteIndex === undefined}
              onClick={() => handleAgregar(producto, selecciones[producto.Nombre]?.varianteIndex)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
