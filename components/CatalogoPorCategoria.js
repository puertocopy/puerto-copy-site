import { useState } from 'react';

export default function CatalogoPorCategoria({ productos, onAgregar }) {
  const categorias = [...new Set(productos.map(p => p.Categoria))];
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(categorias[0]);
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
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {categorias.map((cat, i) => (
          <button
            key={i}
            onClick={() => setCategoriaSeleccionada(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              cat === categoriaSeleccionada
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {productos
        .filter((p) => p.Categoria === categoriaSeleccionada)
        .map((producto, index) => (
          <div key={index} className="mb-6 bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-bold">{producto.Nombre}</h3>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <label className="text-sm">Variación:</label>
              <select
                className="border rounded px-2 py-1"
                onChange={(e) =>
                  handleSeleccion(producto.Nombre, 'variacion', e.target.value)
                }
                defaultValue=""
              >
                <option value="" disabled>Seleccionar</option>
                {producto.Variaciones.map((v, i) => (
                  <option key={i} value={i}>
                    {v.Variante} — ${parseFloat(v.Precio).toFixed(2)}
                  </option>
                ))}
              </select>

              <label className="text-sm">Cantidad:</label>
              <input
                type="number"
                min="1"
                value={seleccion[producto.Nombre]?.cantidad || 1}
                onChange={(e) =>
                  handleSeleccion(producto.Nombre, 'cantidad', e.target.value)
                }
                className="w-20 border rounded px-2 py-1"
              />

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
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
