// components/Navbar.js
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#004b71] bg-opacity-90 backdrop-blur-md shadow text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <img src="/logoweb.png" alt="Puerto Copy Logo" className="h-10 w-auto cursor-pointer" />
        </Link>

        {/* Botón hamburguesa */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={!isOpen ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'}
            />
          </svg>
        </button>

        {/* Enlaces de navegación */}
        <ul className={`md:flex md:items-center gap-6 text-sm font-medium transition-all duration-300 ${isOpen ? 'block absolute top-full left-0 w-full bg-[#004b71] p-4' : 'hidden md:flex'}`}>
          <li><a href="/" className="hover:text-blue-300 block py-2 md:py-0">Inicio</a></li>
          <li><a href="#servicios" className="hover:text-blue-300 block py-2 md:py-0">Servicios</a></li>
          <li><a href="/facturar" className="hover:text-blue-300 block py-2 md:py-0">Facturación</a></li>
          <li><a href="#contacto" className="hover:text-blue-300 block py-2 md:py-0">Contacto</a></li>
        </ul>
      </div>
    </nav>
  );
}
