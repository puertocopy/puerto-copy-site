import Navbar from "../components/Navbar"

export default function Facturacion() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <section className="py-16 px-6 bg-gray-100">
        <h2 className="text-3xl font-semibold mb-6 text-center">Generar Factura</h2>
        <div className="max-w-xl mx-auto space-y-4 bg-white p-6 rounded shadow">
          <input type="text" placeholder="Número de ticket" className="w-full border p-2 rounded" />
          <input type="text" placeholder="RFC" className="w-full border p-2 rounded" />
          <input type="text" placeholder="Razón social" className="w-full border p-2 rounded" />
          <input type="text" placeholder="Uso de CFDI" className="w-full border p-2 rounded" />
          <input type="email" placeholder="Correo electrónico" className="w-full border p-2 rounded" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Generar factura</button>
        </div>
      </section>
    </div>
  )
}
