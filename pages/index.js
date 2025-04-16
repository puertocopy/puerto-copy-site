import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="bg-white text-gray-900">
      <Navbar />

      {/* HERO */}
      <header
        className="relative flex items-center justify-center h-screen pt-24 text-white"
        style={{ backgroundImage: "url('/heroweb.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 opacity-80"></div>
        <div className="relative z-10 text-center max-w-2xl px-4" data-aos="fade-up">
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
      <section
        id="servicios"
        className="relative bg-white text-gray-800 py-20 px-6 md:px-12 z-10"
      >
        <div className="max-w-6xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-blue-900">Nuestros Servicios</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in">
              <div className="text-blue-700 text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold mb-2">Impresión de Documentos</h3>
              <p className="text-gray-600">Impresión en tamaño carta, oficio y doble carta con la mejor calidad.</p>
            </div>

            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-blue-700 text-4xl mb-4">📐</div>
              <h3 className="text-xl font-semibold mb-2">Impresión de Planos</h3>
              <p className="text-gray-600">Impresión en gran formato en papel Bond y fotográfico, ideal para arquitectos e ingenieros.</p>
            </div>

            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-blue-700 text-4xl mb-4">🧾</div>
              <h3 className="text-xl font-semibold mb-2">Facturación Electrónica</h3>
              <p className="text-gray-600">Genera tu factura fácil y rápido con tu número de ticket y datos fiscales.</p>
            </div>
          </div>
        </div>
      </section>
      {/* VENTAJAS */}
      <section className="bg-blue-50 py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-12">¿Por qué elegirnos?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1 duration-300" data-aos="fade-right">
              <div className="text-blue-700 text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Servicio Rápido</h3>
              <p className="text-gray-600">Entregamos tus trabajos en tiempo récord, sin perder calidad.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1 duration-300" data-aos="fade-up">
              <div className="text-blue-700 text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Alta Calidad</h3>
              <p className="text-gray-600">Utilizamos tecnología de impresión profesional para los mejores resultados.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1 duration-300" data-aos="fade-left">
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
}//act 

