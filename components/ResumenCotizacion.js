export default function ResumenCotizacion({ producto, onContinuar }) {
  if (!producto) return null;

  return (
    <div className="p-6 mt-6 border-t">
      <h2 className="text-2xl font-semibold mb-4 text-center">Resumen de Cotización</h2>

      <div className="bg-white rounded-2xl shadow p-6 max-w-md mx-auto text-center">
        <p className="text-lg font-medium">{producto.nombre}</p>
        <p className="text-xl text-blue-600 font-bold mt-2">${producto.precio.toFixed(2)}</p>

        <button
          onClick={onContinuar}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

