import Navbar from "../components/Navbar"
// HERO (con fondo)
<section className="relative h-screen bg-cover bg-center" style={{ backgroundImage: "url('/heroweb.png')" }}>
  <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 opacity-80"></div>
  <div className="relative z-10 flex flex-col justify-center items-center text-white text-center h-full px-6">
    <img src="/logoweb.png" alt="Logo Puerto Copy" className="w-24 h-24 mb-6" />
    <h1 className="text-4xl md:text-6xl font-bold">Bienvenido a Puerto Copy</h1>
    <p className="text-lg md:text-xl mt-4">Impresiones digitales, copias y planos con estilo profesional.</p>
    <a href="/facturar" className="mt-6 inline-block bg-white text-blue-800 font-semibold px-6 py-3 rounded hover:bg-gray-200 transition">
      Generar Factura
    </a>
  </div>
</section>

{/* SECCIÓN SERVICIOS */}
<section className="relative bg-white text-gray-800 py-20 px-6 md:px-12 z-10">
  <div className="max-w-6xl mx-auto text-center">
    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-blue-900">Nuestros Servicios</h2>
    <div className="grid md:grid-cols-3 gap-10">
      {/* Servicio 1 */}
      <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg">
        <div className="text-blue-700 text-4xl mb-4">📄</div>
        <h3 className="text-xl font-semibold mb-2">Impresión de Documentos</h3>
        <p className="text-gray-600">Tamaños carta, oficio y doble carta con excelente calidad.</p>
      </div>
      {/* Servicio 2 */}
      <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg">
        <div className="text-blue-700 text-4xl mb-4">📐</div>
        <h3 className="text-xl font-semibold mb-2">Impresión de Planos</h3>
        <p className="text-gray-600">Gran formato en Bond o fotográfico, ideal para arquitectura.</p>
      </div>
      {/* Servicio 3 */}
      <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg">
        <div className="text-blue-700 text-4xl mb-4">🧾</div>
        <h3 className="text-xl font-semibold mb-2">Facturación Electrónica</h3>
        <p className="text-gray-600">Factura fácil usando el número de ticket + tus datos fiscales.</p>
      </div>
    </div>
  </div>
</section>

