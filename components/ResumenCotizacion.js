import { useState } from 'react';

export default function ResumenCotizacion({ productos, onEliminar, onActualizarCantidad, onContinuar }) {
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [indexEditando, setIndexEditando] = useState(null);
  const [nuevaCantidad, setNuevaCantidad] = useState(1);

  const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  const abrirPopup = (index, cantidadActual) => {
    setIndexEditando(index);
    setNuevaCantidad(cantidadActual);
    setMostrarPopup(true);
  };

  const guardarCantidad = () => {
    if (nuevaCantidad >= 1) {
      onActualizarCantidad(indexEditando, nuevaCantidad);
      setMostrarPopup(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto md:mx-0">
      <h3 className="text-2xl font-bold text-blue-700 mb-6 text-center">Resumen de Cotización</h3>

      {productos.length === 0 ? (
        <p className="text-gray-500 text-center">Aún no has agregado productos.</p>
      ) : (
        <ul className="space-y-4">
          {productos.map((prod, i) => (
            <li
              key={i}
              className="flex justify-between items-start border-b pb-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
              onClick={() => abrirPopup(i, prod.cantidad)}
            >
              <div className="text-left">
                <p className="font-semibold text-blue-800">
                  {prod.nombre.split(' ')[0]} {prod.nombre.split(' ')[1]}
                </p>
                <div className="text-sm text-gray-500 leading-tight mt-1 space-y-1">
                  <p>Color: {prod.nombre.split(' ')[2]}</p>
                  <p>Fondo: {prod.nombre.split(' ')[3]} {prod.nombre.split(' ')[4]}</p>
                  <p>Tamaño: {prod.variante}</p>
                  <p>Cantidad: <span className="font-semibold">{prod.cantidad}</span></p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-semibold text-blue-700">
                  ${ (prod.precio * prod.cantidad).toFixed(2) }
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEliminar(i);
                  }}
                  className="text-red-500 text-xs hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {productos.length > 0 && (
        <>
          <div className="border-t mt-6 pt-4 flex justify-between font-bold text-lg text-blue-800">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl text-sm font-medium transition"
            onClick={onContinuar}
          >
            Continuar
          </button>
        </>
      )}

      {mostrarPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center relative">
            <h3 className="text-lg font-bold text-blue-700 mb-3">Modificar Cantidad</h3>

            <div className="flex justify-center items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => setNuevaCantidad((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 text-xl font-bold text-blue-700 border border-blue-300 rounded-full hover:bg-blue-100 transition"
              >
                –
              </button>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                pattern="[0-9]*"
                value={nuevaCantidad}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    setNuevaCantidad(val);
                  } else if (e.target.value === '') {
                    setNuevaCantidad('');
                  }
                }}
                onBlur={() => {
                  if (nuevaCantidad === '' || nuevaCantidad < 1) setNuevaCantidad(1);
                }}
                onFocus={(e) => e.target.select()}
                className="w-20 border rounded-lg px-4 py-2 text-center shadow-sm text-sm"
              />
              <button
                type="button"
                onClick={() => setNuevaCantidad((prev) => prev + 1)}
                className="w-10 h-10 text-xl font-bold text-blue-700 border border-blue-300 rounded-full hover:bg-blue-100 transition"
              >
                +
              </button>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={guardarCantidad}
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Guardar
              </button>
              <button
                onClick={() => setMostrarPopup(false)}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
