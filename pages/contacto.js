import Navbar from "../components/Navbar"

export default function Contacto() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <section className="py-16 px-6">
        <h2 className="text-3xl font-semibold mb-6 text-center">Contáctanos</h2>
        <div className="max-w-xl mx-auto space-y-4 text-center">
          <p>Dirección: Calle Ejemplo #123, Puerto Vallarta, Jalisco</p>
          <p>WhatsApp: 322-123-4567</p>
          <p>Email: contacto@puertocopy.com</p>
        </div>
      </section>
    </div>
  )
}
