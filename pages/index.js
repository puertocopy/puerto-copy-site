import React, { useEffect, useState } from 'react';
import { Construction, MessageCircle } from 'lucide-react';
import { MapPin, Phone, Mail, Clock, Printer, FileText, BookOpen, Lock, ScanLine, FileCheck, Zap, Target, Heart, ChevronRight, Sparkles, Check, ChevronDown, Wrench, Menu, X } from 'lucide-react';

// === PARA TU PROYECTO LOCAL: DESCOMENTA ESTAS LINEAS ===
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingBubbles from '../components/FloatingBubbles';

/* === COMPONENTES INTERNOS DE LA HOME (Secciones específicas) === */

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
                    <p className="text-gray-600">Lun - Vie: 8:00 - 18:00 | Sáb: 10:00 - 14:00</p>
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 fade-in-up flex flex-col items-center justify-center text-center h-full min-h-[400px]">
  
  {/* Círculo decorativo con icono */}
  <div className="bg-blue-50 text-[#0B63B2] w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm">
    <Construction size={40} strokeWidth={1.5} />
  </div>

  {/* Título y Texto */}
  <h3 className="text-2xl font-bold text-gray-800 mb-3 font-brand">
    ¡Estamos mejorando!
  </h3>
  
  <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
    Estamos actualizando nuestro sistema de pedidos web para darte un mejor servicio. Por el momento, atendemos todas tus cotizaciones directamente por WhatsApp.
  </p>

  {/* Botón de WhatsApp */}
  <a 
    href="https://wa.me/5213221916038?text=Hola%20Puerto%20Copy,%20quisiera%20hacer%20una%20cotización..." 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 transition transform active:scale-95 flex items-center justify-center gap-3"
  >
    <MessageCircle size={24} />
    <span>Enviar WhatsApp</span>
  </a>

  <p className="mt-4 text-sm text-gray-400">
    Respuesta rápida garantizada
  </p>
</div>
    </div>
  </section>
);

/* === COMPONENTE PRINCIPAL (PÁGINA HOME) === */

export default function Home() {
  const slides = [
    '/slides/hero-plotter-1.svg', // Precisión Técnica (Líneas de planos)
    '/slides/hero-plotter-2.svg', // Flujo CMYK (Calidad de impresión)
    '/slides/hero-plotter-3.svg'  // Movimiento de Papel (Rapidez de entrega)
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fading, setFading] = useState(true);
  const [isToolsOpen, setIsToolsOpen] = useState(false); // Estado para el menú desplegable

  // Intersection Observer para animaciones al hacer scroll
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

  // Lógica del Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setFading(false);
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
        setFading(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden font-sans">
      {/* Componentes reutilizables importados */}
      <Navbar /> 

      {/* SEO para buscadores (No visible pero indexable) */}
      <section className="sr-only">
        <h1>Puerto Copy | Centro de Impresiones y Planos en Puerto Vallarta</h1>
        <h2>Copias a color, blanco y negro, impresión de planos gran formato y engargolados.</h2>
        <p>Calidad profesional, servicio rápido y atención personalizada en Puerto Copy Puerto Vallarta. Especialistas en planos técnicos, documentos de oficina y servicios digitales.</p>
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
                {/* Overlay Degradado */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#003082]/90 via-[#003082]/30 to-black/30" />
                
                {/* Contenedor del Logo y Texto Hero */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-4 transition-all duration-1000 transform ${active ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    
                    {/* LOGO PUERTO COPY CENTRADO */}
                    <div className="mb-8">
                      <h1 className="text-6xl md:text-8xl font-brand font-bold text-white mb-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] tracking-tight">
                        Puerto <span className="text-blue-100/90">Copy</span>
                      </h1>
                      <div className="flex items-center justify-center gap-4 mt-1">
                        <div className="h-[1px] w-8 md:w-16 bg-white/40" />
                        <p className="text-white/80 text-sm md:text-lg font-light tracking-[0.2em] uppercase">
                          Centro de impresiones
                        </p>
                        <div className="h-[1px] w-8 md:w-16 bg-white/40" />
                      </div>
                    </div>

                    {/* TITULO DEL SERVICIO ACTUAL */}
                    <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-lg mb-4">
                      <h2 className="text-xl md:text-3xl font-extrabold text-white drop-shadow-lg tracking-tight">
                          {index === 0 && "Impresión de Planos"}
                          {index === 1 && "Calidad Profesional"}
                          {index === 2 && "Soluciones Rápidas"}
                      </h2>
                    </div>

                    <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-80">
                        Tu socio de confianza en Puerto Vallarta para todo tipo de proyectos.
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

      {/* MENU DE HERRAMIENTAS RÁPIDAS (Dropdown style) */}
      <section className="relative z-20 px-4 md:px-12 -mt-20 mb-8">
        <div className="max-w-xl mx-auto">
          <div className="fade-in-up bg-white rounded-[2rem] shadow-2xl shadow-blue-900/15 border border-white/50 backdrop-blur-sm relative overflow-hidden">
            
            {/* Botón Principal (Trigger) */}
            <button 
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className="w-full flex items-center justify-between p-6 md:p-8 bg-white hover:bg-gray-50 transition-colors duration-300 outline-none"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0B63B2] text-white flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <Wrench size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-[#003082] font-brand">Herramientas</h3>
                        <p className="text-gray-500 text-sm">Selecciona una opción</p>
                    </div>
                </div>
                <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 transition-transform duration-300 ${isToolsOpen ? 'rotate-180 bg-blue-100 text-[#0B63B2]' : ''}`}>
                    <ChevronDown size={20} />
                </div>
            </button>

            {/* Contenido Desplegable */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isToolsOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
                    
                    {/* Opción Cotizar */}
                    <a href="/cotizar" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300 group">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B63B2] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800 group-hover:text-[#0B63B2] transition-colors">Cotizar</h4>
                            <p className="text-xs text-gray-500">Calcula costos al instante</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-[#0B63B2]" />
                    </a>

                    {/* Opción Facturar */}
                    <a href="/factura" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300 group">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B63B2] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileCheck size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800 group-hover:text-[#0B63B2] transition-colors">Facturar</h4>
                            <p className="text-xs text-gray-500">Genera tu factura aquí</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-[#0B63B2]" />
                    </a>

                    {/* Opción IA */}
                    <a href="/ia" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300 group">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B63B2] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Sparkles size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800 group-hover:text-[#0B63B2] transition-colors">Puerto Copy AI</h4>
                            <p className="text-xs text-gray-500">Mejora y corrige tus textos</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-[#0B63B2]" />
                    </a>

                </div>
            </div>

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

/* === COMPONENTES DE UI REUTILIZABLES (INTERNOS PARA TARJETAS) === */

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
