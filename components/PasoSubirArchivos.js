import { useState, useRef } from 'react';
import { generarCotizacionPDF } from '../utils/generarCotizacionPDF';
import { registrarCotizacionEnGoogle } from '../utils/registrarCotizacionGoogle';

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

      const folio = 'PC-' + Date.now().toString().slice(-5);
      const fecha = new Date();
      const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

      // 1. Generar PDF (adaptado para folio/fecha y pie de página legal)
      const pdfBlob = await generarCotizacionPDF(
        { ...form, folio, fecha: fecha.toLocaleDateString() },
        productos
      );

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cotizacion.pdf';
      a.click();
      URL.revokeObjectURL(url);

      // 2. Registrar en Google Sheets
      await registrarCotizacionEnGoogle({
        folio,
        fecha: fecha.toLocaleString(),
        nombre: form.nombre,
        telefono: form.telefono,
        correo: form.correo,
        domicilio: form.domicilio,
        productos: productos.map(p => `${p.nombre} x${p.cantidad}`),
        total
      });

      alert('Cotización generada y registrada correctamente.');
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al generar o registrar la cotización:', error);
      alert('Ocurrió un error al procesar la cotización.');
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

      <div className="text-center">
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-800 transition"
        >
          Solicitar cotización
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
                {generando ? 'Generando...' : 'Enviar cotización'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
