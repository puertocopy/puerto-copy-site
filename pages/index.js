import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const slides = ['1', '2', '3'];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setFade(true);
      }, 300);
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* SLIDER */}
      <section id="inicio" className="relative w-full mt-[60px]">
      <div className="relative min-h-[calc(100vh-60px)] overflow-x-hidden overflow-y-auto">
          {slides.map((slide, index) => {
            const imageUrl = isMobile
              ? `/slides/slide${slide}-mobile.jpg`
              : `/slides/slide${slide}-desktop.jpg`;

            return (
              <img
                key={index}
                src={imageUrl}
                alt={`Slide ${slide}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  currentSlide === index && fade ? 'opacity-100' : 'opacity-0'
                }`}
              />
            );
          })}
        </div>
      </section>

      {/* ESPACIADOR PARA FORZAR SCROLL FLUIDO */}
      <div className="h-6 md:h-8" />

      {/* SERVICIOS */}
<section id="servicios" className="relative bg-white text-gray-800 py-20 px-6 md:px-12 z-10">
  <div className="max-w-6xl mx-auto text-center" data-aos="fade-up">
    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-[#004b71]">Nuestros Servicios</h2>
    <div className="grid md:grid-cols-3 gap-10">

      {/* Impresión de Planos */}
      <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in">
        <div className="text-blue-700 text-4xl mb-4">📐</div>
        <h3 className="text-xl font-semibold mb-2">Impresión de Planos</h3>
        <p className="text-gray-600">Planos en gran formato sobre papel Bond, fotográfico o lona, ideales para arquitectura e ingeniería.</p>
      </div>

      {/* Copias e Impresiones */}
      <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in" data-aos-delay="100">
        <div className="text-blue-700 text-4xl mb-4">🖨️</div>
        <h3 className="text-xl font-semibold mb-2">Copias e Impresiones</h3>
        <p className="text-gray-600">Copias en blanco y negro o color en tamaños carta, oficio y doble carta.</p>
      </div>

      {/* Engargolados */}
      <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in" data-aos-delay="200">
        <div className="text-blue-700 text-4xl mb-4">📚</div>
        <h3 className="text-xl font-semibold mb-2">Engargolados</h3>
        <p className="text-gray-600">Presenta tus documentos de manera profesional con engargolados resistentes y estéticos.</p>
      </div>

      {/* Enmicados */}
      <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in">
        <div className="text-blue-700 text-4xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold mb-2">Enmicados</h3>
        <p className="text-gray-600">Protege tus documentos con enmicados de alta calidad, duraderos y resistentes.</p>
      </div>

      {/* Escaneo de Archivos */}
      <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in" data-aos-delay="100">
        <div className="text-blue-700 text-4xl mb-4">📁</div>
        <h3 className="text-xl font-semibold mb-2">Escaneo de Archivos</h3>
        <p className="text-gray-600">Digitaliza tus documentos físicos en alta resolución y accede a ellos cuando lo necesites.</p>
      </div>

      {/* Facturación Electrónica */}
      <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in" data-aos-delay="200">
        <div className="text-blue-700 text-4xl mb-4">🧾</div>
        <h3 className="text-xl font-semibold mb-2">Facturación Electrónica</h3>
        <p className="text-gray-600">Genera tu factura fácilmente ingresando el número de ticket y tus datos fiscales.</p>
      </div>

    </div>
  </div>
</section>
      {/* VENTAJAS */}
      <section className="bg-blue-50 py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004b71] mb-12">¿Por qué elegirnos?</h2>
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

      <Footer />
    </div>
  );
}