// pages/api/pedido.ts
import { useState, useEffect } from 'react';

export default function Pedido() {
  const [catalog, setCatalog] = useState([]);
  const [cart, setCart] = useState([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch('/api/catalogo')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCatalog(data.catalog);
        }
      });
  }, []);

  const addToCart = (item: any, variant = '') => {
    setCart([...cart, { ...item, variant, id: `${item.id}-${variant}-${cart.length}`, quantity: 1 }]);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#004b71] mb-6">Realiza tu Pedido</h1>

      <div className="grid gap-6 mb-10">
        {catalog.map((item) => (
          <div key={item.id} className="border p-4 rounded shadow-sm">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-gray-600">${item.price.toFixed(2)}</p>

            {item.variants.length > 0 ? (
              <div className="flex gap-2 mt-2">
                {item.variants.map((variant: string) => (
                  <button
                    key={variant}
                    onClick={() => addToCart(item, variant)}
                    className="px-3 py-1 bg-blue-100 text-sm rounded hover:bg-blue-200"
                  >
                    {variant}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => addToCart(item)}
                className="mt-2 px-4 py-1 bg-[#004b71] text-white rounded hover:bg-blue-800"
              >
                Agregar al carrito
              </button>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-[#004b71] mb-4">Carrito</h2>
      <ul className="mb-6 space-y-3">
        {cart.map((item, idx) => (
          <li key={item.id} className="border p-2 rounded">
            {item.name} {item.variant && `(${item.variant})`} — ${item.price.toFixed(2)} x {item.quantity}
          </li>
        ))}
      </ul>

      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">Sube tus archivos (opcional):</label>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>

      <div className="text-right">
        <p className="mb-2 font-bold text-lg">Total: ${total.toFixed(2)}</p>
        <button className="bg-[#004b71] text-white px-6 py-2 rounded hover:bg-blue-800">
          Enviar pedido por WhatsApp
        </button>
      </div>
    </div>
  );
}
