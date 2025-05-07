import { useState, useRef } from 'react';
import { generarCotizacionPDF } from '../utils/generarCotizacionPDF';

export default function PasoSubirArchivos({ productos, archivosAsignados, setArchivosAsignados }) {
  const inputRef = useRef();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [form, setForm] = useState({ nombre: '', telefono: '', correo: '', domicilio: '' });

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const asignaciones = productos.map(() => 0);
    const nuevoArchivo = { nombre: file.name, asignaciones };
    setArchivosAsignados([...archivosAsignados, nuevoArchivo]);
    inputRef.current.value = null;
  };

  const actualizarAsignacion = (archivoIndex, productoIndex, cantidad) => {
    const nuevos = [...archivosAsignados];
    nuevos[archivoIndex].asignaciones[productoIndex] = cantidad;
    setArchivosAsignados(nuevos);
  };

  const calcularRestante = (productoIndex) => {
    const totalAsignado = archivosAsignados.reduce(
      (sum, arch) => sum + (arch.asignaciones[productoIndex] || 0),
      0
    );
    return productos[productoIndex].cantidad - totalAsignado;
  };

  const faltanPlanos = productos.some((_, i) => calcularRestante(i) !== 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const enviarCotizacion = async () => {
    if (!form.nombre || !form.telefono || !form.correo) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    try {
      setGenerando(true);
      const pdfBlob = await generarCotizacionPDF(form, productos);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cotizacion.pdf';
      a.click();
      URL.revokeObjectURL(url);
      alert('Cotización generada correctamente.');
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Ocurrió un error al generar la cotización.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Sube tus archivos</h2>

      <div className="text-center mb-6">
  <div className="inline-block relative">
    <button
      disabled
      className="bg-gray-300 text-gray-500 px-6 py-2 rounded-xl text-sm font-medium shadow-md cursor-not-allowed"
    >
      Agregar archivo
    </button>
    <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold px-2 py-0.5 rounded-bl-xl">
      Próximamente
    </span>
  </div>
</div>



      {archivosAsignados.map((arch, i) => (
        <div key={i} className="border rounded-xl p-4 mb-4">
          <h3 className="text-md font-semibold text-blue-600 mb-3 truncate max-w-full">
            {arch.nombre.length > 25 ? arch.nombre.slice(0, 20) + '...' : arch.nombre}
          </h3>
          <div className="space-y-4">
            {productos.map((prod, j) => {
              const restante = calcularRestante(j);
              const asignado = arch.asignaciones[j] || 0;
              const error = asignado > restante + asignado;

              return (
                <div key={j} className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
                  <span className="text-gray-600 w-full md:w-1/2">
                    {prod.nombre} ({prod.variante}) - Restantes: {restante}
                  </span>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => actualizarAsignacion(i, j, Math.max(0, asignado - 1))}
                      className="w-8 h-8 text-base font-bold text-blue-700 border border-blue-300 rounded-full hover:bg-blue-100 transition"
                    >
                      –
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={prod.cantidad}
                      value={asignado}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (val >= 0) {
                          actualizarAsignacion(i, j, val);
                        }
                      }}
                      className={`w-20 px-3 py-1 border rounded-lg text-center shadow-sm ${
                        error ? 'border-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => actualizarAsignacion(i, j, asignado + 1)}
                      className="w-8 h-8 text-base font-bold text-blue-700 border border-blue-300 rounded-full hover:bg-blue-100 transition"
                    >
                      +
                    </button>
                    {error && (
                      <span className="text-red-500 text-xs font-medium">Excede lo disponible</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-10 text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-800 transition"
          >
            Solicitar cotización
          </button>
          <button
            disabled
            className="bg-gray-200 text-gray-500 px-6 py-3 rounded-xl text-sm font-medium cursor-not-allowed relative"
          >
            Realizar pago
            <span className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-2 py-0.5 rounded-bl-xl">
              Próximamente
            </span>
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-white p-6 mt-6 rounded-xl shadow-md max-w-md mx-auto text-left border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-700 mb-4 text-center">Datos para la cotización</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700">Nombre / Razón Social *</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Correo electrónico *</label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Domicilio (opcional)</label>
                <input
                  type="text"
                  name="domicilio"
                  value={form.domicilio}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>
              <div className="text-center mt-6">
                <button
                  onClick={enviarCotizacion}
                  disabled={generando}
                  className={`bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition ${
                    generando ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800'
                  }`}
                >
                  {generando ? 'Generando PDF...' : 'Enviar cotización'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
