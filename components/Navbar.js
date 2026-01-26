import React, { useState, useEffect } from 'react';
import { Menu, X, Printer } from 'lucide-react';

export default function Navbar({ forceWhite = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clases dinámicas según el estado
  const navBgClass = forceWhite || scrolled 
    ? 'bg-white shadow-md py-2' 
    : 'bg-transparent py-4';
    
  const textClass = forceWhite || scrolled
    ? 'text-gray-600 hover:text-[#0B63B2]'
    : 'text-white/90 hover:text-white';

  const brandClass = forceWhite || scrolled
    ? 'text-[#003082]'
    : 'text-[#003082] md:text-white';

  const iconBgClass = forceWhite || scrolled
    ? 'bg-[#0B63B2] text-white'
    : 'bg-white text-[#0B63B2]';

  const menuButtonClass = forceWhite || scrolled
    ? 'text-gray-800'
    : 'text-[#003082] md:text-white';

  // Enlaces de navegación con rutas absolutas
  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Servicios', href: '/#servicios' },
    { name: 'Nosotros', href: '/#ventajas' },
    { name: 'Contacto', href: '/#contacto' }
  ];

  return (
    <nav className={`fixed w-full z-40 transition-all duration-300 ${navBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
         {/* Logo: Solo Texto */}
<a href="/" className="flex-shrink-0 flex items-center cursor-pointer decoration-transparent group">
  <span className={`font-bold text-2xl tracking-tight font-brand ${brandClass}`}>
    Puerto Copy
  </span>
</a>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((item) => (
              <a key={item.name} href={item.href} className={`font-medium transition-colors ${textClass}`}>
                {item.name}
              </a>
            ))}
            <a href="/factura" className={`px-5 py-2 rounded-full font-semibold transition-all inline-block ${forceWhite || scrolled ? 'bg-[#0B63B2] text-white hover:bg-[#004a8f]' : 'bg-white text-[#0B63B2] hover:bg-gray-100'}`}>
              Facturar
            </a>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className={menuButtonClass}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-white absolute w-full border-t border-gray-100 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((item) => (
              <a key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0B63B2] rounded-md">
                {item.name}
              </a>
            ))}
            <a href="/factura" className="block px-3 py-3 text-base font-bold text-[#0B63B2] bg-blue-50 rounded-md text-center mt-2">
                Facturar
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
