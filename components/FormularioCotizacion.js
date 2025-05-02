import { useState } from 'react';

export default function FormularioCotizacion({ producto }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Aquí puedes agregar integración con EmailJS o Resend
    console.log('Enviando cotización:', { nombre, correo, producto });

    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-green-600">¡Cotización enviada!</h2>
        <p>Gracias, {nombre}. Revisa tu correo: {correo}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">Datos para envío</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Nombre completo</label>
        <input
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border p-2 rounded-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Correo electrónico</label>
        <input
          type="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full border p-2 rounded-lg"
        />
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <p className="font-semibold">Servicio:</p>
        <p>{producto.nombre}</p>
        <p className="text-blue-600 font-bold">${producto.precio.toFixed(2)}</p>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
      >
        Enviar cotización
      </button>
    </form>
  );
}
