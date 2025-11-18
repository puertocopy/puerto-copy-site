import { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingBubbles from "../components/FloatingBubbles";
import Contacto from '../components/Contacto';

export default function Home() {
  const slides = ['1', '2', '3'];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fading, setFading] = useState(true);

  const typewriterText = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 900, once: true });

    const interval = setInterval(() => {
      setFading(false);
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
        setFading(true);
      }, 280);
    }, 5200);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">

      <Navbar />

      {/* SEO oculto */}
      <section aria-hidden="true" className="sr-only">
        <h1>Copias, Impresiones de Planos y Documentos en Puerto Vallarta</h1>
        <p>Calidad profesional, servicio rápido y atención personalizada en Puerto Copy.</p>
      </section>

      {/* SLIDER */}
      <section id="inicio" className="relative w-full">
        <div className="relative w-full h-[58vh] md:h-[70vh] overflow-hidden">

          {slides.map((slide, index) => {
            const active = currentSlide === index && fading;

            return (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full transition-opacity duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <picture>
                  <source
                    media="(max-width: 767px)"
                    srcSet={`/slides/slide${slide}-mobile.jpg`}
                  />
                  <img
                    src={`/slides/slide${slide}-desktop.jpg`}
                    alt={`Slide ${slide}`}
                    className={`inset-0 w-full h-full object-cover will-change-transform ${
                      active ? 'animate-[kenburns_7s_ease-in-out_forwards]' : ''
                    }`}
                  />
                </picture>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
              </div>
            );
          })}

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => setCurrentSlide(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? 'w-8 bg-[#0B63B2]'
                    : 'w-2.5 bg-white/70 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="bg-[#F3F7FC] py-16 md:py-20 px-6 md:px-12" data-aos="fade-up">

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">

          {/* COTIZACIÓN */}
          <div className="flex flex-col justify-between rounded-3xl p-8 md:p-10 border border-[#D8E6F6] bg-gradient-to-br from-white to-[#F3F7FC] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <h2 className="text-[clamp(1.6rem,3.2vw,2rem)] font-extrabold text-[#003082] mb-3">
                ¿Necesitas una cotización?
              </h2>

              <p className="text-[clamp(0.95rem,1.2vw,1.1rem)] text-gray-700 mb-8">
                Cotiza planos u otros servicios de impresión en línea, rápido y claro. Ideal para trámites, proyectos y presupuestos.
              </p>

              <a
                href="/cotizar"
                className="inline-block bg-[#0B63B2] hover:brightness-110 text-white font-semibold px-7 py-3 rounded-full shadow-md transition focus:outline-none focus:ring-4 focus:ring-[#0B63B2]/30"
              >
                Generar cotización
              </a>
            </div>
          </div>

          {/* FACTURACIÓN */}
          <div className="flex flex-col justify-between rounded-3xl p-8 md:p-10 border border-[#D8E6F6] bg-gradient-to-br from-white to-[#F3F7FC] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <h2 className="text-[clamp(1.6rem,3.2vw,2rem)] font-extrabold text-[#003082] mb-3">
                Factura tu compra
              </h2>

              <p className="text-[clamp(0.95rem,1.2vw,1.1rem)] text-gray-700 mb-8">
                Ingresa tu número de ticket y tus datos fiscales. Servicio rápido, sin complicaciones.
              </p>

              <a
                href="/factura"
                className="inline-block bg-[#0B63B2] hover:brightness-110 text-white font-semibold px-7 py-3 rounded-full shadow-md transition focus:outline-none focus:ring-4 focus:ring-[#0B63B2]/30"
              >
                Facturar compra
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="relative bg-white text-gray-800 py-16 md:py-20 px-6 md:px-12 z-10">

        <div className="max-w-6xl mx-auto text-center" data-aos="fade-up">

          <h2 className="text-[clamp(1.6rem,3.2vw,2rem)] md:text-[clamp(1.8rem,2.6vw,2.4rem)] font-extrabold mb-10 text-[#003082]">
            Servicios de Impresión, Copiado y Escaneo en Puerto Vallarta
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">

            <Card icon="📐" title="Impresión de Planos en Puerto Vallarta">
              Imprime planos arquitectónicos y de ingeniería en gran formato: Bond, fotográfico o lona. Entrega rápida y calidad garantizada.
            </Card>

            <Card icon="🖨️" title="Copias a Color y Blanco y Negro" delay="100">
              Copias en carta, oficio y tabloide. Calidad excelente, ideal para trámites y presentaciones.
            </Card>

            <Card icon="📚" title="Engargolados Profesionales" delay="200">
              Organiza y protege tus documentos con distintos estilos y tamaños.
            </Card>

            <Card icon="🔒" title="Enmicado de Documentos">
              Protege certificados, fotos o documentos contra el desgaste diario.
            </Card>

            <Card icon="📁" title="Escaneo de Documentos" delay="100">
              Digitaliza documentos en alta resolución. Respalda y simplifica trámites.
            </Card>

            <Card icon="🧾" title="Facturación Electrónica Rápida" delay="200">
              Genera tu factura ingresando ticket y datos fiscales. Fácil y sin complicaciones.
            </Card>

          </div>
        </div>
      </section>

      {/* VENTAJAS */}
      <section id="ventajas" className="bg-[#F3F7FC] py-16 md:py-20 px-6 md:px-12">

        <div className="max-w-6xl mx-auto text-center" data-aos="fade-up">

          <h2 className="text-[clamp(1.6rem,3.2vw,2rem)] md:text-[clamp(1.8rem,2.6vw,2.4rem)] font-extrabold text-[#003082] mb-10">
            ¿Por qué elegir Puerto Copy?
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">

            <AdvCard icon="⚡" title="Entrega Rápida y Puntual">
              Recibe tus impresiones o planos en el menor tiempo y con gran calidad. Ideal para proyectos urgentes.
            </AdvCard>

            <AdvCard icon="🎯" title="Calidad Profesional Garantizada">
              Equipos de alta definición para copias nítidas y colores vivos.
            </AdvCard>

            <AdvCard icon="🤝" title="Atención Cercana y Personalizada">
              Te asesoramos para ofrecerte exactamente el servicio que necesitas.
            </AdvCard>

          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <Contacto />

      {/* FOOTER */}
      <Footer />
      <FloatingBubbles />

      {/* Ken Burns */}
      <style jsx global>{`
        @keyframes kenburns {
          0% { transform: scale(1.03) translateZ(0); }
          50% { transform: scale(1.08) translateZ(0); }
          100% { transform: scale(1.03) translateZ(0); }
        }
      `}</style>
    </div>
  );
}

/* === COMPONENTES REUTILIZABLES === */

function Card({ icon, title, children, delay = '0' }) {
  return (
    <div
      className="group bg-[#F7FAFE] hover:bg-white transition rounded-2xl p-6 shadow-sm hover:shadow-md border border-[#E2EEFB] text-left transform hover:-translate-y-1 duration-300"
      data-aos="zoom-in"
      data-aos-delay={delay}
    >
      <div className="text-[#0B63B2] text-4xl mb-4 transition-all duration-300 group-hover:scale-110">
        {icon}
      </div>

      <h3 className="text-lg font-semibold mb-2 text-[#0D2A4E]">
        {title}
      </h3>

      <p className="text-gray-600">{children}</p>

      <div className="mt-4 h-1 w-0 bg-[#0B63B2] rounded-full transition-all duration-300 group-hover:w-16" />
    </div>
  );
}

function AdvCard({ icon, title, children }) {
  return (
    <div
      className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition transform hover:-translate-y-1 duration-300 border border-[#E5EEF9]"
      data-aos="fade-up"
    >
      <div className="text-[#0B63B2] text-5xl mb-4 transition-all duration-300 group-hover:scale-110">
        {icon}
      </div>

      <h3 className="text-lg font-semibold mb-2 text-[#0D2A4E]">
        {title}
      </h3>

      <p className="text-gray-600">{children}</p>
    </div>
  );
}
