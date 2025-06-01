import Navbar from "../components/Navbar"
import FloatingBubbles from "../components/FloatingBubbles";

export default function Servicios() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <section className="py-16 px-6">
        <h2 className="text-3xl font-semibold mb-6 text-center">Nuestros Servicios</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <li className="p-4 shadow rounded bg-gray-50">Impresión de planos</li>
          <li className="p-4 shadow rounded bg-gray-50">Copias y escaneos</li>
          <li className="p-4 shadow rounded bg-gray-50">Impresión en lona y fotográfico</li>
          <li className="p-4 shadow rounded bg-gray-50">Tabloides y formatos especiales</li>
          <li className="p-4 shadow rounded bg-gray-50">Trámites gubernamentales</li>
          <li className="p-4 shadow rounded bg-gray-50">Encuadernado y plastificado</li>
        </ul>
      </section>
    </div>
  )
}
