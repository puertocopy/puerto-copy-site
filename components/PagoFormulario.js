import React from 'react';

export default function PagoFormulario({ metodo }) {
  if (metodo === 'spei') {
    return (
      <div className="bg-blue-50 p-6 rounded mt-6">
        <h3 className="font-semibold text-lg mb-2 text-[#004b71]">Datos para Transferencia (SPEI)</h3>
        <p><strong>Banco:</strong> BBVA</p>
        <p><strong>CLABE:</strong> 012345678901234567</p>
        <p><strong>Referencia:</strong> PUERTOCOPY{Math.floor(Math.random() * 10000)}</p>
        <p className="mt-4 text-sm text-gray-600">Envía tu comprobante a WhatsApp para validar el pago.</p>
      </div>
    );
  }

  if (metodo === 'tarjeta') {
    return (
      <div className="bg-blue-50 p-6 rounded mt-6">
        <h3 className="font-semibold text-lg mb-4 text-[#004b71]">Formulario de Tarjeta</h3>
        <form className="grid gap-4">
          <input type="text" placeholder="Nombre en la tarjeta" className="border p-2 rounded" />
          <input type="text" placeholder="Número de tarjeta" className="border p-2 rounded" />
          <div className="flex gap-4">
            <input type="text" placeholder="MM/AA" className="border p-2 rounded w-1/2" />
            <input type="text" placeholder="CVC" className="border p-2 rounded w-1/2" />
          </div>
          <button
            type="submit"
            className="bg-[#004b71] text-white font-bold py-2 px-4 rounded hover:bg-blue-800"
          >
            Pagar
          </button>
        </form>
      </div>
    );
  }

  if (metodo === 'efectivo') {
    return (
      <div className="bg-blue-50 p-6 rounded mt-6">
        <h3 className="font-semibold text-lg mb-2 text-[#004b71]">Pago en Efectivo</h3>
        <p>Podrás pagar directamente en el local al recoger tu pedido.</p>
      </div>
    );
  }

  return null;
}
