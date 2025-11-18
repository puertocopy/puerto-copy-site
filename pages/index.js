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
        setCurrentSlide((prev) => (prev + 1) % slides.length);
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

      {/* HERO / SLIDER */}
      <section id="inicio" className="relative w-full">
        {/* (Se retiró la guirnalda/listón de arriba) */}

        <div className="relative w-full h-[58vh] md:h-[70vh] overflow-hidden">
          {/* Nieve sutil */}
          <div className="pointer-events-none absolute inset-0 z-20 snow-layer" />
          {/* Santa + renos pasando */}
          <SantaSleigh />

          {slides.map((slide, index) => {
            const active = currentSlide === index && fading;
            return (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full transition-opacity duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${active ? 'opacity-100' : 'opacity-0'}`}
              >
                <picture>
                  <source media="(max-width: 767px)" srcSet={`/slides/slide${slide}-mobile.jpg`} />
                  <img
                    src={`/slides/slide${slide}-desktop.jpg`}
                    alt={`Slide ${slide}`}
                    className={`inset-0 w-full h-full object-cover will-change-transform ${active ? 'animate-[kenburns_7s_ease-in-out_forwards]' : ''}`}
                  />
                </picture>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-black/0" />
              </div>
            );
          })}

          {/* Texto centrado */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full ring-1 ring-black/5 mb-4" data-aos="fade-down">
                <span className="text-[#B20B2C]">●</span>
                <span className="text-xs md:text-sm font-medium text-gray-700">Temporada Navideña · Diseño especial</span>
              </div>

              <h1
                className="relative text-white text-[clamp(1.7rem,4.2vw,3rem)] md:text-[clamp(2rem,3.2vw,3.4rem)] font-extrabold leading-tight drop-shadow-sm inline-block"
                data-aos="fade-up"
              >
                <span className="relative inline-block with-hat">Impresiones y Planos</span> con <span className="text-[#D4AF37]">toque navideño</span> ✨
              </h1>

              <p className="max-w-2xl text-white/90 mt-3 md:mt-4 text-[clamp(0.95rem,1.15vw,1.1rem)]" data-aos="fade-up" data-aos-delay="100">
                Minimal, elegante y con animaciones sutiles. Sin promociones ni botones extra.
              </p>

              {/* Mantengo tus 2 botones existentes, sin añadir nuevos */}
              <div className="mt-6 flex flex-wrap items-center gap-3" data-aos="fade-up" data-aos-delay="200">
                <a
                  href="/cotizar"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white font-semibold bg-[#0B5D4F] hover:brightness-110 shadow-md ring-1 ring-black/5 transition glow-soft"
                >
                  Generar cotización
                </a>
                <a
                  href="/factura"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold bg-white text-[#0B2A24] hover:bg-white/90 shadow-md ring-1 ring-black/5 transition"
                >
                  Facturar compra
                </a>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => setCurrentSlide(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === currentSlide ? 'w-8 bg-[#B20B2C]' : 'w-2.5 bg-white/70 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Esquinas decoradas (opcional, sutil) */}
        <CornerOrnaments />
      </section>

      {/* DESTACADOS (Cotización / Facturación) */}
      <section className="bg-[#F4F8FB] py-16 md:py-20 px-6 md:px-12" data-aos="fade-up">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {/* COTIZACIÓN */}
          <div className="flex flex-col justify-between rounded-3xl p-8 md:p-10 border border-[#E4EDF6] bg-gradient-to-br from-white to-[#F7FAFE] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <h2 className="text-[clamp(1.6rem,3.2vw,2rem)] font-extrabold text-[#0B2A24] mb-3">
                <span className="relative inline-block with-hat">¿Necesitas una cotización?</span>
              </h2>
              <p className="text-[clamp(0.95rem,1.2vw,1.1rem)] text-gray-700 mb-8">
                Cotiza planos u otros servicios de impresión en línea. Rápido, claro y con precios competitivos.
              </p>
              <a href="/cotizar" className="inline-block bg-[#0B5D4F] hover:brightness-110 text-white font-semibold px-7 py-3 rounded-full shadow-md transition focus:outline-none focus:ring-4 focus:ring-[#0B5D4F]/25">
                Generar cotización
              </a>
            </div>
          </div>

          {/* FACTURACIÓN */}
          <div className="flex flex-col justify-between rounded-3xl p-8 md:p-10 border border-[#E4EDF6] bg-gradient-to-br from-white to-[#F7FAFE] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <h2 className="text-[clamp(1.6rem,3.2vw,2rem)] font-extrabold text-[#0B2A24] mb-3">
                <span className="relative inline-block with-hat">Factura tu compra</span>
              </h2>
              <p className="text-[clamp(0.95rem,1.2vw,1.1rem)] text-gray-700 mb-8">
                Ingresa tu número de ticket y tus datos fiscales. Servicio rápido, sin complicaciones.
              </p>
              <a href="/factura" className="inline-block bg-white text-[#0B2A24] font-semibold px-7 py-3 rounded-full shadow-md transition focus:outline-none focus:ring-4 focus:ring-[#0B5D4F]/20 border border-[#E4EDF6] hover:bg-white/90">
                Facturar compra
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="relative bg-white text-gray-800 py-16 md:py-20 px-6 md:px-12 z-10">
        <div className="max-w-6xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-[clamp(1.6rem,3.2vw,2rem)] md:text-[clamp(1.8rem,2.6vw,2.4rem)] font-extrabold mb-10 text-[#0B2A24]">
            <span className="relative inline-block with-hat">Servicios de Impresión, Copiado y Escaneo en Puerto Vallarta</span>
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <Card icon="📐" title="Impresión de Planos en Puerto Vallarta">
              Planos arquitectónicos y de ingeniería en gran formato: Bond, fotográfico o lona. Entrega rápida y calidad garantizada.
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
      <section id="ventajas" className="bg-[#F4F8FB] py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-[clamp(1.6rem,3.2vw,2rem)] md:text-[clamp(1.8rem,2.6vw,2.4rem)] font-extrabold text-[#0B2A24] mb-10">
            <span className="relative inline-block with-hat">¿Por qué elegir Puerto Copy?</span>
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

      {/* FOOTER + Burbujas */}
      <Footer />
      <FloatingBubbles />

      {/* Estilos globales */}
      <style jsx global>{`
        :root {
          --pine: #0B5D4F;
          --crimson: #B20B2C;
          --gold: #D4AF37;
        }

        @keyframes kenburns {
          0%   { transform: scale(1.03) translateZ(0); }
          50%  { transform: scale(1.08) translateZ(0); }
          100% { transform: scale(1.03) translateZ(0); }
        }

        /* Nieve mínima */
        @keyframes snow {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        .snow-layer::before,
        .snow-layer::after {
          content: "";
          position: absolute;
          inset: -10% 0 0 0;
          background-repeat: repeat;
          pointer-events: none;
        }
        .snow-layer::before {
          background-image:
            radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.7) 99%, transparent 100%),
            radial-gradient(2px 2px at 80px 120px, rgba(255,255,255,0.6) 99%, transparent 100%),
            radial-gradient(2px 2px at 160px 60px, rgba(255,255,255,0.55) 99%, transparent 100%);
          background-size: 200px 200px;
          animation: snow 14s linear infinite;
        }
        .snow-layer::after {
          background-image:
            radial-gradient(1.6px 1.6px at 40px 80px, rgba(255,255,255,0.6) 99%, transparent 100%),
            radial-gradient(1.6px 1.6px at 140px 20px, rgba(255,255,255,0.5) 99%, transparent 100%),
            radial-gradient(1.6px 1.6px at 200px 140px, rgba(255,255,255,0.45) 99%, transparent 100%);
          background-size: 240px 240px;
          animation: snow 20s linear infinite;
        }

        /* Glow suave para botón primario existente */
        .glow-soft { animation: glow 3.2s ease-in-out infinite; }
        @keyframes glow {
          0% { box-shadow: 0 0 0 0 rgba(212,175,55,0.0); }
          50% { box-shadow: 0 0 24px 2px rgba(212,175,55,0.25); }
          100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.0); }
        }

        /* === SANTA + RENOS === */
        @keyframes runAcross {
          0% { transform: translateX(-20%) translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(120%) translateY(0); opacity: 0; }
        }
        .santa-track {
          position: absolute;
          top: 12%;
          left: 0; right: 0;
          height: 90px;
          z-index: 22;
          pointer-events: none;
        }
        .santa {
          position: absolute;
          top: 0;
          left: -20%;
          width: 260px;
          height: 90px;
          opacity: 0;
          animation: runAcross 12s linear infinite;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.25));
        }
        .santa.delay-1 { animation-delay: 2.4s; transform: scale(0.95); top: 10%; }
        .santa.delay-2 { animation-delay: 5.8s; transform: scale(1.05); top: 14%; }
        .santa.delay-3 { animation-delay: 9.0s; transform: scale(1.0);  top: 12%; }

        /* === GORRITOS NAVIDEÑOS PARA TITULARES === */
        .with-hat {
          position: relative;
          display: inline-block;
          padding-right: .2rem;
        }
        .with-hat::after {
          content: "";
          position: absolute;
          top: -0.85em;
          right: -0.15em;
          width: 1.15em;
          height: 0.75em;
          background:
            radial-gradient(circle at 12% 88%, #fff 0 20%, transparent 21%),
            linear-gradient(180deg, #b91c1c 0%, #7f1d1d 100%);
          border-top-left-radius: 60% 120%;
          border-top-right-radius: 60% 120%;
          border-bottom-left-radius: 10px;
          transform: rotate(18deg);
          box-shadow: 0 1px 0 rgba(0,0,0,0.15);
        }
        .with-hat::before {
          content: "";
          position: absolute;
          top: -0.25em;
          right: -0.45em;
          width: 0.45em;
          height: 0.45em;
          background: #fff;
          border-radius: 999px;
          box-shadow: 0 1px 0 rgba(0,0,0,0.15);
          transform: rotate(18deg);
        }

        /* === ORNAMENT CORNERS === */
        .corner {
          position: absolute;
          width: 100px; height: 100px;
          opacity: 0.7;
          z-index: 21;
          pointer-events: none;
        }
        .corner.top-left { top: 6px; left: 6px; transform: rotate(-8deg); }
        .corner.top-right { top: 6px; right: 6px; transform: rotate(8deg); }
      `}</style>
    </div>
  );
}

/* === Santa + renos (SVG liviano) === */
function SantaSleigh() {
  return (
    <div className="santa-track">
      <svg className="santa" viewBox="0 0 300 110" fill="none">
        <SantaSleighSilhouette />
      </svg>
      <svg className="santa delay-1" viewBox="0 0 300 110" fill="none">
        <SantaSleighSilhouette opacity={0.9} />
      </svg>
      <svg className="santa delay-2" viewBox="0 0 300 110" fill="none">
        <SantaSleighSilhouette opacity={0.85} />
      </svg>
      <svg className="santa delay-3" viewBox="0 0 300 110" fill="none">
        <SantaSleighSilhouette opacity={0.92} />
      </svg>
    </div>
  );
}

function SantaSleighSilhouette({ opacity = 1 }) {
  return (
    <g opacity={opacity}>
      {/* Trineo rojo */}
      <path d="M18 78 C40 90, 78 90, 110 78 L122 82 C92 98, 46 98, 14 86 Z" fill="#B20B2C" />
      <rect x="92" y="56" width="28" height="18" rx="3" fill="#B20B2C" />
      {/* Patines del trineo */}
      <path d="M18 86 C28 94, 42 96, 56 92" stroke="#D4AF37" strokeWidth="3" fill="none" />
      <path d="M58 92 C78 98, 100 96, 122 86" stroke="#D4AF37" strokeWidth="3" fill="none" />

      {/* Santa (cuerpo) */}
      <circle cx="106" cy="52" r="8" fill="#fff" />
      <rect x="98" y="46" width="16" height="12" rx="3" fill="#B20B2C" />
      {/* Gorro de Santa */}
      <path d="M100 42 C103 36, 112 36, 114 42 L114 42 Q108 43, 100 42 Z" fill="#B20B2C" />
      <circle cx="114" cy="42" r="3" fill="#fff" />
      <rect x="98" y="46" width="16" height="3" fill="#fff" />

      {/* Cuerdas */}
      <path d="M122 64 C150 56, 178 54, 198 56" stroke="#fff" strokeWidth="2" fill="none" />
      <path d="M122 62 C162 52, 210 50, 246 52" stroke="#fff" strokeWidth="2" fill="none" />

      {/* Tres renos (crema) */}
      <Reindeer x={170} y={50} scale={1.02} fill="#F8FAFC" />
      <Reindeer x={214} y={46} scale={1.0} fill="#F8FAFC" />
      <Reindeer x={258} y={48} scale={0.98} fill="#F8FAFC" />
    </g>
  );
}

function Reindeer({ x, y, scale = 1, fill = 'white' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 20 C8 10, 26 6, 40 10 C54 14, 64 22, 68 30 C70 34, 66 38, 60 40 C54 42, 40 42, 28 40 C16 38, 8 34, 6 28 C4 24, -2 26, 0 20 Z" fill={fill}/>
      <circle cx="56" cy="20" r="6" fill={fill}/>
      <path d="M58 16 l6 -8 M54 16 l-6 -8 M54 22 l-7 6 M58 22 l7 6" stroke={fill} strokeWidth="2" />
      <rect x="24" y="38" width="6" height="16" fill={fill}/>
      <rect x="46" y="38" width="6" height="16" fill={fill}/>
      <rect x="12" y="36" width="6" height="12" fill={fill}/>
      <rect x="60" y="36" width="6" height="12" fill={fill}/>
    </g>
  );
}

function CornerOrnaments() {
  return (
    <>
      <div className="corner top-left">
        <svg viewBox="0 0 100 100">
          <circle cx="20" cy="20" r="3" fill="#D4AF37" />
          <path d="M10 10 L40 40" stroke="#D4AF37" strokeWidth="2" />
          <path d="M25 8 L25 22" stroke="#B20B2C" strokeWidth="3" />
          <circle cx="25" cy="25" r="6" fill="#0B5D4F" />
        </svg>
      </div>
      <div className="corner top-right">
        <svg viewBox="0 0 100 100">
          <circle cx="80" cy="20" r="3" fill="#D4AF37" />
          <path d="M60 10 L90 40" stroke="#D4AF37" strokeWidth="2" />
          <path d="M75 8 L75 22" stroke="#0B5D4F" strokeWidth="3" />
          <circle cx="75" cy="25" r="6" fill="#B20B2C" />
        </svg>
      </div>
    </>
  );
}

/* === Tarjetas reutilizables (con opción de gorrito en título por CSS .with-hat) === */
function Card({ icon, title, children, delay = '0' }) {
  return (
    <div
      className="group bg-[#F7FAFE] hover:bg-white transition rounded-2xl p-6 shadow-sm hover:shadow-md border border-[#E2EEFB] text-left transform hover:-translate-y-1 duration-300"
      data-aos="zoom-in"
      data-aos-delay={delay}
    >
      <div className="text-[2rem] mb-4 transition-all duration-300 group-hover:scale-110">
        <span className="inline-block drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-[#0B2A24]"><span className="with-hat">{title}</span></h3>
      <p className="text-gray-600">{children}</p>
      <div className="mt-4 h-1 w-0 bg-gradient-to-r from-[#0B5D4F] via-[#D4AF37] to-[#B20B2C] rounded-full transition-all duration-300 group-hover:w-16" />
    </div>
  );
}

function AdvCard({ icon, title, children }) {
  return (
    <div
      className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition transform hover:-translate-y-1 duration-300 border border-[#E5EEF9]"
      data-aos="fade-up"
    >
      <div className="text-[2.4rem] mb-4 transition-all duration-300 group-hover:scale-110">
        <span className="inline-block">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-[#0B2A4]">
        <span className="with-hat">{title}</span>
      </h3>
      <p className="text-gray-600">{children}</p>
    </div>
  );
}
