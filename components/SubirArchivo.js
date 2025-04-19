// components/SubirArchivo.js
export default function SubirArchivo({ archivo, setArchivo }) {
    const handleArchivoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setArchivo(file);
      }
    };
  
    return (
      <div className="mt-8 bg-white p-6 border rounded shadow-md">
        <h3 className="text-xl font-semibold text-[#004b71] mb-4">Sube tu archivo</h3>
        <input
          type="file"
          accept=".pdf,.jpg,.png"
          onChange={handleArchivoChange}
          className="w-full border border-gray-300 rounded p-2"
        />
        {archivo && (
          <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: <strong>{archivo.name}</strong></p>
        )}
      </div>
    );
  }
  