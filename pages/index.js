import Navbar from "../components/Navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <section className="text-center py-20 bg-gray-100">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a Puerto Copy</h1>
        <p className="text-lg">Centro de copiado profesional en Puerto Vallarta</p>
      </section>
    </div>
  )
}