import { useState } from 'react';

export default function PasoConfirmacionProducto({ productoBase, seleccion, onAgregar }) {
  const [cantidad, setCantidad] = useState(1);

  const nombreFinal = `${productoBase} (${Object.values(seleccion).join(" / ")})`;

  // Simulación de precio según variación (ajustable)
  const precioUnitario = 10; // ⚠️ Cambiar luego con lógica real por variación
  const total = cantidad * precioUnitario;

  return (
    <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6 mt-6">
      <h2 className="text-xl font-bold mb-4 text-center">Resumen de tu producto</h2>

      <div className="mb-3">
        <p className="font-medium text-blue-700">{nombreFinal}</p>
        <p className="text-gray-600 text-sm">Precio unitario: ${precioUnitario.toFixed(2)}</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Cantidad:</label>
        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={(e) => setCantidad(parseInt(e.target.value))}
          className="w-24 border rounded px-3 py-1"
        />
      </div>

      <div className="flex justify-between items-center font-semibold mb-4">
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <button
        onClick={() =>
          onAgregar({
            nombre: nombreFinal,
            variante: Object.values(seleccion).join(" / "),
            precio: precioUnitario,
            cantidad
          })
        }
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
      >
        Agregar al carrito
      </button>
    </div>
  );
}
