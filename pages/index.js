import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Printer, FileText, BookOpen, Lock, ScanLine, FileCheck, Zap, Target, Heart, Menu, X, ChevronRight } from 'lucide-react';

/* === ESTILOS CSS INLINE PARA ANIMACIONES Y FUENTES === */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap');

  html {
    scroll-behavior: smooth;
  }

  .font-brand {
    font-family: 'Product Sans', 'Outfit', sans-serif;
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
  @keyframes kenburns {
    0% { transform: scale(1.0); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1.0); }
  }
  .fade-in-up {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  }
  .fade-in-up.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .bubble {
    position: absolute;
    bottom: -100px;
    background-color: rgba(11, 99, 178, 0.1);
    border-radius: 50%;
    animation: floatUp 15s linear infinite;
  }
  @keyframes floatUp {
    0% { transform: translateY(0); opacity: 0; }
    10% { opacity: 0.8; }
    90% { opacity: 0.8; }
    100% { transform: translateY(-100vh); opacity: 0; }
  }
`;

/* === COMPONENTES INTERNOS (Simulando los archivos importados) === */

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mapeo de navegación para que coincida con los IDs de las secciones
  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Nosotros', href: '#ventajas' }, // "Nosotros" dirige a la sección de Ventajas/Por qué elegirnos
    { name: 'Contacto', href: '#contacto' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex-shrink-0 flex items-center cursor-pointer decoration-transparent">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-2 ${scrolled ? 'bg-[#0B63B2] text-white' : 'bg-white text-[#0B63B2]'}`}>
              <Printer size={24} />
            </div>
            {/* APLICANDO FUENTE PRODUCT SANS AQUI */}
            <span className={`font-bold text-2xl tracking-tight font-brand ${scrolled ? 'text-[#003082]' : 'text-[#003082] md:text-white'}`}>Puerto Copy</span>
          </a>
          
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((item) => (
              <a key={item.name} href={item.href} className={`font-medium hover:text-[#0B63B2] transition-colors ${scrolled ? 'text-gray-600' : 'text-white/90 hover:text-white'}`}>
                {item.name}
              </a>
            ))}
            {/* Botón funcional hacia /cotizar */}
            <a href="/cotizar" className={`px-5 py-2 rounded-full font-semibold transition-all inline-block ${scrolled ? 'bg-[#0B63B2] text-white hover:bg-[#004a8f]' : 'bg-white text-[#0B63B2] hover:bg-gray-100'}`}>
              Cotizar
            </a>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className={`${scrolled ? 'text-gray-800' : 'text-[#003082]'}`}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white absolute w-full border-t border-gray-100 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((item) => (
              <a key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0B63B2] rounded-md">
                {item.name}
              </a>
            ))}
            <a href="/cotizar" className="block px-3 py-3 text-base font-bold text-[#0B63B2] bg-blue-50 rounded-md text-center mt-2">
                Cotizar Ahora
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center mb-4">
            <div className="bg-[#0B63B2] text-white w-8 h-8 rounded-lg flex items-center justify-center mr-2">
              <Printer size={16} />
            </div>
            {/* APLICANDO FUENTE PRODUCT SANS AQUI */}
            <span className="font-bold text-xl text-[#003082] font-brand">Puerto Copy</span>
          </div>
          <p className="text-gray-500 max-w-sm">
            Soluciones integrales de impresión en Puerto Vallarta. Calidad profesional para arquitectos, estudiantes y empresas.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-[#003082] mb-4">Enlaces</h4>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#servicios" className="hover:text-[#0B63B2]">Servicios</a></li>
            <li><a href="/factura" className="hover:text-[#0B63B2]">Facturación</a></li>
            <li><a href="#" className="hover:text-[#0B63B2]">Aviso de Privacidad</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-[#003082] mb-4">Contacto</h4>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center"><Phone size={14} className="mr-2"/> 322 191 6038</li>
            <li className="flex items-center"><Mail size={14} className="mr-2"/> hola@puertocopy.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-8 text-center text-gray-400 text-sm">
        {/* APLICANDO FUENTE PRODUCT SANS AQUI */}
        <p>© 2024 <span className="font-brand">Puerto Copy</span>. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
);

const FloatingBubbles = () => {
  // Simulación visual simple
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Las burbujas se generarían dinámicamente o con CSS puro, aquí usamos el estilo inyectado */}
    </div>
  );
};

const Contacto = () => (
  <section id="contacto" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="fade-in-up">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#003082] mb-6">Estamos para ayudarte</h2>
        <p className="text-gray-600 mb-8 text-lg">Visítanos en nuestra sucursal o envíanos un mensaje. Respondemos rápido.</p>
        
        <div className="space-y-6">
            <div className="flex items-start bg-blue-50 p-4 rounded-2xl">
                <MapPin className="text-[#0B63B2] mt-1 mr-4 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-[#003082]">Ubicación</h4>
                    <p className="text-gray-600">Villa Colonial 573, Los Portales, Puerto Vallarta, Jal.</p>
                </div>
            </div>
            <div className="flex items-start bg-blue-50 p-4 rounded-2xl">
                <Clock className="text-[#0B63B2] mt-1 mr-4 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-[#003082]">Horario</h4>
                    <p className="text-gray-600">Lun - Vie: 9:00 - 19:00 | Sáb: 10:00 - 14:00</p>
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 fade-in-up">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Mensaje enviado (simulación)'); }}>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0B63B2] focus:ring-2 focus:ring-blue-100 outline-none transition" placeholder="Tu nombre" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0B63B2] focus:ring-2 focus:ring-blue-100 outline-none transition" placeholder="322 000 0000" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0B63B2] focus:ring-2 focus:ring-blue-100 outline-none transition" placeholder="¿Qué necesitas imprimir?"></textarea>
            </div>
            <button className="w-full bg-[#0B63B2] hover:bg-[#004a8f] text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95">
                Enviar Mensaje
            </button>
        </form>
      </div>
    </div>
  </section>
);

/* === COMPONENTE PRINCIPAL === */

export default function Home() {
  // Imágenes de placeholder de alta calidad (Unsplash) porque no tengo acceso a tus archivos locales
  const slides = [
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop', // Planos
    'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?q=80&w=2000&auto=format&fit=crop', // Impresora
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2000&auto=format&fit=crop'  // Oficina
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fading, setFading] = useState(true);

  // Hook para detectar elementos en viewport y animarlos (reemplazo de AOS)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Slider Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setFading(false);
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
        setFading(true);
      }, 500); // Tiempos ajustados para suavidad
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden font-sans">
      <style>{styles}</style>
      <Navbar />

      {/* SEO oculto */}
      <section aria-hidden="true" className="sr-only">
        <h1>Copias, Impresiones de Planos y Documentos en Puerto Vallarta</h1>
        <p>Calidad profesional, servicio rápido y atención personalizada en Puerto Copy.</p>
      </section>

      {/* SLIDER HERO SECTION */}
      <section id="inicio" className="relative w-full">
        <div className="relative w-full h-[65vh] md:h-[80vh] overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-2xl z-0">
          {slides.map((slideUrl, index) => {
            const active = currentSlide === index && fading;
            return (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full transition-opacity duration-[1000ms] ease-in-out ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slideUrl}
                  alt={`Slide ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover ${
                    active ? 'animate-[kenburns_7s_ease-in-out_forwards]' : ''
                  }`}
                />
                {/* Overlay Degradado Profundo */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#003082]/90 via-[#003082]/30 to-black/30" />
                
                {/* Texto Hero Opcional */}
                <div className={`absolute bottom-32 left-0 w-full text-center px-4 transition-all duration-1000 transform ${active ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight">
                        {index === 0 && "Impresión de Planos"}
                        {index === 1 && "Calidad Profesional"}
                        {index === 2 && "Soluciones Rápidas"}
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        Tu centro de copiado e impresión de confianza en Puerto Vallarta.
                    </p>
                </div>
              </div>
            );
          })}

          {/* Dots Indicator */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-500 shadow-md backdrop-blur-md ${
                  i === currentSlide
                    ? 'w-10 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* MENU DE HERRAMIENTAS RÁPIDAS (Cotizar y Facturar) */}
      <section className="relative z-20 px-4 md:px-12 -mt-20 mb-12">
        <div className="max-w-5xl mx-auto">
          <div className="fade-in-up bg-white rounded-[2rem] shadow-2xl shadow-blue-900/15 p-3 md:p-4 flex flex-col md:flex-row gap-3 md:gap-4 border border-white/50 backdrop-blur-sm">
            
            {/* Botón Cotizar */}
            <a href="/cotizar" className="flex-1 group relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-white to-blue-50/50 hover:to-blue-50 border border-gray-100 p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 decoration-transparent">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#0B63B2] text-white flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform duration-300">
                     <FileText size={28} />
                  </div>
                  <div>
                     <h3 className="text-xl md:text-2xl font-bold text-[#003082] font-brand">Cotizar</h3>
                     <p className="text-gray-500 font-medium text-sm md:text-base">Calcula costos al instante</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-[#0B63B2] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                   <ChevronRight size={20} />
                </div>
              </div>
            </a>

            {/* Botón Facturar */}
            <a href="/factura" className="flex-1 group relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-white to-blue-50/50 hover:to-blue-50 border border-gray-100 p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 decoration-transparent">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#F3F7FC] text-[#0B63B2] flex items-center justify-center shadow-sm border border-blue-100 group-hover:scale-110 transition-transform duration-300">
                     <FileCheck size={28} />
                  </div>
                  <div>
                     <h3 className="text-xl md:text-2xl font-bold text-[#003082] font-brand">Facturar</h3>
                     <p className="text-gray-500 font-medium text-sm md:text-base">Genera tu factura aquí</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-[#0B63B2] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                   <ChevronRight size={20} />
                </div>
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="relative bg-[#FDFDFD] py-20 md:py-28 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 md:mb-20 fade-in-up">
            <span className="text-[#0B63B2] font-bold tracking-wider uppercase text-xs bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              Nuestros Servicios
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-6 text-[#003082] tracking-tight mb-4">
              Soluciones de Impresión
            </h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">Calidad y precisión en cada detalle para tus proyectos más importantes.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard 
              Icon={ScanLine} 
              title="Impresión de Planos" 
              desc="Impresión gran formato en Bond, fotográfico o lona. Entrega rápida y calidad garantizada."
              delay="0"
            />
            <ServiceCard 
              Icon={Printer} 
              title="Copias Color y B/N" 
              desc="Alta resolución en carta, oficio y tabloide. Ideal para tesis, manuales y presentaciones."
              delay="100ms"
            />
            <ServiceCard 
              Icon={BookOpen} 
              title="Engargolados" 
              desc="Acabados profesionales para organizar y proteger tus documentos con distintos estilos."
              delay="200ms"
            />
            <ServiceCard 
              Icon={Lock} 
              title="Enmicado" 
              desc="Protección duradera contra el agua y desgaste para tus certificados y credenciales."
              delay="0"
            />
            <ServiceCard 
              Icon={FileText} 
              title="Escaneo Digital" 
              desc="Digitaliza documentos a alta resolución. Respalda tus archivos físicos en PDF."
              delay="100ms"
            />
            <ServiceCard 
              Icon={FileCheck} 
              title="Facturación Rápida" 
              desc="Sistema de autoservicio para generar tu factura con tu ticket. Fácil y eficiente."
              delay="200ms"
            />
          </div>
        </div>
      </section>

      {/* VENTAJAS */}
      <section id="ventajas" className="bg-[#F3F7FC] py-24 px-4 md:px-12 rounded-t-[4rem] -mt-10 relative z-0">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-3xl md:text-5xl font-extrabold text-[#003082] mb-20 tracking-tight fade-in-up">
            {/* APLICANDO FUENTE PRODUCT SANS AQUI */}
            ¿Por qué elegir <span className="font-brand">Puerto Copy</span>?
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
            <AdvantageCard 
              Icon={Zap} 
              title="Rapidez Total" 
              desc="Entendemos la urgencia. Entregas puntuales para tus proyectos críticos." 
              delay="0"
            />
            <AdvantageCard 
              Icon={Target} 
              title="Precisión y Calidad" 
              desc="Equipos de última generación para líneas nítidas y colores fieles." 
              delay="200ms"
            />
            <AdvantageCard 
              Icon={Heart} 
              title="Atención Humana" 
              desc="Más que impresiones, te ofrecemos asesoría experta y trato amable." 
              delay="400ms"
            />
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <div className="bg-white pt-10">
          <Contacto />
      </div>

      <Footer />
      <FloatingBubbles />
    </div>
  );
}

/* === COMPONENTES DE UI REUTILIZABLES === */

function ServiceCard({ Icon, title, desc, delay }) {
  return (
    <div
      className="fade-in-up group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-100 transition-all duration-300 ease-out hover:-translate-y-2"
      style={{transitionDelay: delay}}
    >
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#F3F7FC] flex items-center justify-center text-[#0B63B2] group-hover:bg-[#0B63B2] group-hover:text-white transition-colors duration-300 shadow-inner">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3 text-[#003082] tracking-tight">
        {title}
      </h3>
      <p className="text-gray-500 leading-relaxed text-base font-medium">
        {desc}
      </p>
    </div>
  );
}

function AdvantageCard({ Icon, title, desc, delay }) {
  return (
    <div
      className="fade-in-up bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-[#E5EEF9] flex flex-col items-center text-center group"
      style={{transitionDelay: delay}}
    >
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-[#0B63B2] mb-8 group-hover:scale-110 transition-transform duration-300">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-bold mb-4 text-[#0D2A4E]">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}