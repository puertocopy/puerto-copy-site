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

      const folio = 'PC-' + Date.now().toString().slice(-5);
      await registrarCotizacionEnGoogle({
        folio,
        fecha: new Date().toLocaleString(),
        nombre: form.nombre,
        telefono: form.telefono,
        correo: form.correo,
        domicilio: form.domicilio,
        productos: productos.map(p => `${p.nombre} x${p.cantidad}`),
        total: productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0)
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

      {/* resto del código... (no se modifica la sección visual) */}
    </div>
  );
}
