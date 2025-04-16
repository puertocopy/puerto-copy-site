import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Head from "next/head";

export default function Home() {
  return (
    <div className="bg-white text-gray-900">
      <Head>
        <title>Puerto Copy | Impresiones y Facturación</title>
        <meta name="description" content="Centro de impresiones digitales, planos y facturación electrónica en Puerto Vallarta." />
      </Head>

      {/* NAVBAR */}
      <Navbar />

      {/* SERVICIOS */}
      <section className="relative bg-white text-gray-800 py-20 px-6 md:px-12 mt-24">
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
              <p className="text-gray-600">En gran formato en papel Bond y fotográfico, ideal para arquitectos e ingenieros.</p>
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

      {/* VENTAJAS */}
      <section className="bg-blue-50 py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-12">¿Por qué elegirnos?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1 duration-300">
              <div className="text-blue-700 text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Servicio Rápido</h3>
              <p className="text-gray-600">Entregamos tus trabajos en tiempo récord, sin perder calidad.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1 duration-300">
              <div className="text-blue-700 text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Alta Calidad</h3>
              <p className="text-gray-600">Usamos tecnología de impresión profesional para los mejores resultados.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1 duration-300">
              <div className="text-blue-700 text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Atención Personalizada</h3>
              <p className="text-gray-600">Nos importa cada cliente. Brindamos asesoría y soporte directo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
