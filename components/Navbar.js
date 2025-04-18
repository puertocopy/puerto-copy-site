import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/#${id}`);
    }
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#004b71] bg-opacity-80 backdrop-blur-md shadow text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img src="/logoweb.png" alt="Puerto Copy Logo" className="h-10 w-auto" />
        </a>

        {/* Menú Desktop */}
        <ul className="hidden md:flex gap-6 text-sm font-medium">
          <li onClick={() => scrollToSection('inicio')} className="hover:text-blue-300 cursor-pointer">Inicio</li>
          <li onClick={() => scrollToSection('servicios')} className="hover:text-blue-300 cursor-pointer">Servicios</li>
          <li onClick={() => router.push('/facturacion')} className="hover:text-blue-300 cursor-pointer">Facturación</li>
          <li onClick={() => scrollToSection('contacto')} className="hover:text-blue-300 cursor-pointer">Contacto</li>
        </ul>

        {/* Menú Mobile Icono */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Menú Mobile */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4">
          <ul className="flex flex-col gap-3">
            <li onClick={() => scrollToSection('inicio')} className="hover:text-blue-300 cursor-pointer">Inicio</li>
            <li onClick={() => scrollToSection('servicios')} className="hover:text-blue-300 cursor-pointer">Servicios</li>
            <li onClick={() => router.push('/facturacion')} className="hover:text-blue-300 cursor-pointer">Facturación</li>
            <li onClick={() => scrollToSection('contacto')} className="hover:text-blue-300 cursor-pointer">Contacto</li>
          </ul>
        </div>
      )}
    </nav>
  );
}
