import { useState } from 'react';

export default function CatalogoAgrupado({ productos, onAgregar }) {
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Catálogo de productos</h2>
      {productos.map((producto, i) => (
        <div key={i} className="mb-6 border-b pb-4">
          <p className="text-sm text-gray-500">{producto.Categoria}</p>
          <h3 className="text-lg font-semibold">{producto.Nombre}</h3>

          <div className="mt-2 flex flex-wrap gap-3 items-center">
            <label className="text-sm">Variación:</label>
            <select
              className="border rounded px-2 py-1"
              onChange={(e) =>
                handleSeleccion(producto.Nombre, "variacion", e.target.value)
              }
              defaultValue=""
            >
              <option value="" disabled>Seleccionar</option>
              {producto.Variaciones.map((v, idx) => (
                <option key={idx} value={idx}>
                  {v.Variante} — ${v.Precio.toFixed(2)}
                </option>
              ))}
            </select>

            <label className="text-sm">Cantidad:</label>
            <input
              type="number"
              min="1"
              value={seleccion[producto.Nombre]?.cantidad || 1}
              onChange={(e) =>
                handleSeleccion(producto.Nombre, "cantidad", e.target.value)
              }
              className="w-20 border rounded px-2 py-1"
            />

            <button
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
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
