import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingBubbles from "../components/FloatingBubbles";
import Contacto from '../components/Contacto'; // Asegúrate de tener este componente

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

      {/* ENCABEZADO PRINCIPAL */}
      <section className="text-center bg-[#16284f] text-white pt-20 pb-0 px-6 md:px-12">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-2">
          Copias, Impresiones de Planos y Documentos en Puerto Vallarta
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mt-2 max-w-3xl mx-auto">
          Calidad profesional, servicio rápido y atención personalizada en <strong className="text-white">Puerto Copy</strong>.
        </p>
      </section>

      {/* SLIDER */}
      <section id="inicio" className="relative w-full">
        <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
          {slides.map((slide, index) => {
            const imageUrl = isMobile
              ? `/slides/slide${slide}-mobile.jpg`
              : `/slides/slide${slide}-desktop.jpg`;

            return (
              <img
                key={index}
                src={imageUrl}
                alt={`Slide ${slide}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1500 ease-in-out ${
                  currentSlide === index && fade ? 'opacity-100' : 'opacity-0'
                }`}
              />
            );
          })}
        </div>
      </section>
      {/* DESTACADO DE COTIZACIÓN */}
<section className="bg-blue-50 py-16 px-6 md:px-12" data-aos="fade-up">
  <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8 text-center border border-blue-100">
    <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">
      ¿Necesitas una cotización?
    </h2>
    <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
      Cotiza planos u otros servicios de impresión en línea, de forma rápida, clara y sin compromiso. Ideal para trámites, proyectos y presupuestos empresariales.
    </p>
    <a
      href="/cotizar"
      className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-medium px-8 py-3 rounded-full text-lg shadow-md transition"
    >
      Generar cotización
    </a>
  </div>
</section>



      {/* INTRODUCCIÓN DE SERVICIOS */}
      <section className="bg-white text-center pt-16 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004b71] leading-tight mb-6">
            Servicios de Copiado e Impresión en Puerto Vallarta
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mt-4 mb-8">
            En <strong className="text-[#004b71]">Puerto Copy</strong> realizamos impresión de planos arquitectónicos, copias en distintos tamaños, escaneo de documentos, enmicados y engargolados profesionales. 
            Nuestro compromiso es ofrecerte calidad, rapidez y atención personalizada en Puerto Vallarta.
          </p>
          <a 
            href="#servicios" 
            className="inline-block bg-[#004b71] text-white py-3 px-8 rounded-full text-lg hover:bg-blue-800 transition duration-300"
          >
            Conoce nuestros servicios
          </a>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="relative bg-white text-gray-800 py-20 px-6 md:px-12 z-10">
        <div className="max-w-6xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-[#004b71]">
            Servicios de Impresión, Copiado y Escaneo en Puerto Vallarta
          </h2>
          <div className="grid md:grid-cols-3 gap-10">

            {/* Impresión de Planos */}
            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in">
              <div className="text-blue-700 text-4xl mb-4">📐</div>
              <h3 className="text-xl font-semibold mb-2">Impresión de Planos en Puerto Vallarta</h3>
              <p className="text-gray-600">Imprime tus planos arquitectónicos y de ingeniería en gran formato sobre papel Bond, fotográfico o lona. Entregas rápidas y alta calidad garantizada.</p>
            </div>

            {/* Copias e Impresiones */}
            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-blue-700 text-4xl mb-4">🖨️</div>
              <h3 className="text-xl font-semibold mb-2">Copias a Color y Blanco y Negro</h3>
              <p className="text-gray-600">Copias de documentos en tamaños carta, oficio y doble carta. Calidad de impresión excelente, ideal para trámites y presentaciones.</p>
            </div>

            {/* Engargolados */}
            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-blue-700 text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Engargolados Profesionales</h3>
              <p className="text-gray-600">Organiza y protege tus documentos importantes con nuestros servicios de engargolado en diferentes estilos y tamaños.</p>
            </div>

            {/* Enmicados */}
            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in">
              <div className="text-blue-700 text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Enmicado de Documentos</h3>
              <p className="text-gray-600">Protege tus certificados, fotografías o documentos importantes contra el desgaste diario con enmicados de alta calidad.</p>
            </div>

            {/* Escaneo */}
            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in" data-aos-delay="100">
              <div className="text-blue-700 text-4xl mb-4">📁</div>
              <h3 className="text-xl font-semibold mb-2">Escaneo de Documentos</h3>
              <p className="text-gray-600">Digitaliza tus documentos físicos en alta resolución. Ideal para respaldar información y simplificar trámites.</p>
            </div>

            {/* Facturación */}
            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-lg p-6 shadow-lg" data-aos="zoom-in" data-aos-delay="200">
              <div className="text-blue-700 text-4xl mb-4">🧾</div>
              <h3 className="text-xl font-semibold mb-2">Facturación Electrónica Rápida</h3>
              <p className="text-gray-600">Genera tu factura electrónica al momento ingresando tu ticket y datos fiscales. ¡Fácil, rápido y sin complicaciones!</p>
            </div>

          </div>
        </div>
      </section>

      {/* VENTAJAS */}
      <section id="ventajas" className="bg-blue-50 py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004b71] mb-12">
            ¿Por Qué Elegir Puerto Copy para Tus Servicios de Impresión en Puerto Vallarta?
          </h2>
          <div className="grid md:grid-cols-3 gap-10">

            {/* Rápido */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1 duration-300" data-aos="fade-right">
              <div className="text-blue-700 text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Entrega Rápida y Puntual</h3>
              <p className="text-gray-600">Recibe tus copias, impresiones o planos en el menor tiempo posible, sin comprometer la calidad. Ideal para proyectos urgentes y trámites express.</p>
            </div>

            {/* Calidad */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1 duration-300" data-aos="fade-up">
              <div className="text-blue-700 text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Calidad Profesional Garantizada</h3>
              <p className="text-gray-600">Utilizamos equipos de impresión de alta definición para asegurar copias nítidas, colores vivos y documentos listos para cualquier presentación profesional.</p>
            </div>

            {/* Atención */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1 duration-300" data-aos="fade-left">
              <div className="text-blue-700 text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Atención Cercana y Personalizada</h3>
              <p className="text-gray-600">En <strong>Puerto Copy</strong> cada cliente es importante. Asesoramos personalmente para ofrecerte exactamente el servicio de impresión o copiado que necesitas.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <Contacto />

      {/* FOOTER */}
      <Footer />
      <FloatingBubbles />
    </div>
  );
}
