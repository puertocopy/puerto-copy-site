import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="bg-white text-gray-900">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-blue-900 bg-opacity-80 backdrop-blur-md shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <img src="/logoweb.png" alt="Puerto Copy Logo" className="h-10 w-auto" />
          <ul className="flex gap-6 text-sm font-medium text-white">
            <li className="hover:text-blue-300 cursor-pointer">Inicio</li>
            <li className="hover:text-blue-300 cursor-pointer">Servicios</li>
            <li className="hover:text-blue-300 cursor-pointer">Facturación</li>
            <li className="hover:text-blue-300 cursor-pointer">Contacto</li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <header
        className="relative flex items-center justify-center h-screen pt-24 text-white"
        style={{ backgroundImage: "url('/heroweb.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 opacity-80"></div>
        <div className="relative z-10 text-center max-w-2xl px-4">
          <img src="/logoweb.png" className="mx-auto h-24 w-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Bienvenido a Puerto Copy</h1>
          <p className="text-lg md:text-xl mb-6">Impresiones digitales, copias y planos con estilo profesional.</p>
          <a
            href="/facturar"
            className="inline-block bg-white text-blue-800 hover:bg-blue-100 transition px-6 py-3 rounded-full font-semibold shadow"
          >
            Generar Factura
          </a>
        </div>
      </header>

      {/* SERVICIOS */}
      <section className="relative bg-white text-gray-800 py-20 px-6 md:px-12 z-10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-blue-900">Nuestros Servicios</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Servicio 1 */}
            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg">
              <div className="text-blue-700 text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold mb-2">Impresión de Documentos</h3>
              <p className="text-gray-600">Impresión en tamaño carta, oficio y doble carta con la mejor calidad.</p>
            </div>

            {/* Servicio 2 */}
            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg">
              <div className="text-blue-700 text-4xl mb-4">📐</div>
              <h3 className="text-xl font-semibold mb-2">Impresión de Planos</h3>
              <p className="text-gray-600">Impresión en gran formato en papel Bond y fotográfico, ideal para arquitectos e ingenieros.</p>
            </div>

            {/* Servicio 3 */}
            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg">
              <div className="text-blue-700 text-4xl mb-4">🧾</div>
              <h3 className="text-xl font-semibold mb-2">Facturación Electrónica</h3>
              <p className="text-gray-600">Genera tu factura fácil y rápido con tu número de ticket y datos fiscales.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
