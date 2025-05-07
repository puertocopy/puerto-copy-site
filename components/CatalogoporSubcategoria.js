import { useState } from 'react';

export default function CatalogoPorSubcategoria({ productos, onAgregar }) {
  const [seleccion, setSeleccion] = useState({});

  const handleSeleccion = (nombre, campo, valor) => {
    setSeleccion(prev => ({
      ...prev,
      [nombre]: {
        ...prev[nombre],
        [campo]: valor
      }
    }));
  };

  const agregarProducto = (producto, variacion) => {
    const cantidad = seleccion[producto.Nombre]?.cantidad || 1;
    onAgregar({
      nombre: producto.Nombre,
      categoria: producto.Categoria,
      variante: variacion.Variante,
      precio: variacion.Precio,
      cantidad: parseInt(cantidad)
    });
  };

  return (
    <div className="space-y-6">
      {productos.map((producto, index) => (
        <div key={index} className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-1">{producto.Nombre}</h3>
          <p className="text-sm text-gray-500 mb-2">{producto.Categoria}</p>

          <div className="flex flex-wrap items-center gap-4">
            <select
              className="border rounded px-3 py-1"
              onChange={(e) =>
                handleSeleccion(producto.Nombre, 'variacion', e.target.value)
              }
              defaultValue=""
            >
              <option value="" disabled>Seleccionar variación</option>
              {producto.Variaciones.map((v, i) => (
                <option key={i} value={i}>
                  {v.Variante} — ${parseFloat(v.Precio).toFixed(2)}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={seleccion[producto.Nombre]?.cantidad || 1}
              onChange={(e) =>
                handleSeleccion(producto.Nombre, 'cantidad', e.target.value)
              }
              className="w-20 border rounded px-3 py-1"
            />

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => {
                const index = seleccion[producto.Nombre]?.variacion;
                if (index !== undefined) {
                  const variacion = producto.Variaciones[index];
                  agregarProducto(producto, variacion);
                }
              }}
              disabled={seleccion[producto.Nombre]?.variacion === undefined}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
