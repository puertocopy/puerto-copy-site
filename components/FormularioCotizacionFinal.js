import { useState } from 'react';

export default function FormularioCotizacionFinal({ carrito, total }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Aquí se integrará EmailJS, Resend o API personalizada
    console.log('Enviando cotización a:', correo);
    console.log('Cliente:', nombre);
    console.log('Carrito:', carrito);

    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="p-6 bg-green-50 rounded-xl text-center mt-6">
        <h2 className="text-2xl font-bold text-green-700">¡Cotización enviada!</h2>
        <p>Gracias {nombre}, revisa tu correo: <strong>{correo}</strong></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Datos del cliente</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">Nombre completo</label>
        <input
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Correo electrónico</label>
        <input
          type="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Resumen de cotización:</h3>
        {carrito.map((item, idx) => (
          <p key={idx} className="text-sm text-gray-700">
            {item.nombre} ({item.variante}) x{item.cantidad} — ${(
              item.precio * item.cantidad
            ).toFixed(2)}
          </p>
        ))}
        <p className="font-bold mt-2">Total: ${total.toFixed(2)}</p>
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700">
        Enviar cotización
      </button>
    </form>
  );
}
