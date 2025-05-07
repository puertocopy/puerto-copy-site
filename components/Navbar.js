import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [herramientasOpen, setHerramientasOpen] = useState(false);
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

  const toggleHerramientas = () => {
    setHerramientasOpen((prev) => !prev);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#004b71] bg-opacity-80 backdrop-blur-md shadow text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img src="/logoweb.png" alt="Puerto Copy Logo" className="h-10 w-auto" />
        </a>

        {/* Menú Desktop */}
        <ul className="hidden md:flex gap-6 text-sm font-medium items-center relative">
          <li onClick={() => scrollToSection('inicio')} className="hover:text-blue-300 cursor-pointer">Inicio</li>
          <li onClick={() => scrollToSection('servicios')} className="hover:text-blue-300 cursor-pointer">Servicios</li>
          <li onClick={() => router.push('/facturacion')} className="hover:text-blue-300 cursor-pointer">Facturación</li>
          <li onClick={() => scrollToSection('contacto')} className="hover:text-blue-300 cursor-pointer">Contacto</li>

          {/* Herramientas con submenú */}
          <div className="relative">
            <li
              onClick={toggleHerramientas}
              className="hover:text-blue-300 cursor-pointer flex items-center gap-1"
            >
              Herramientas
              <svg className="w-4 h-4 mt-[1px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </li>

            {herramientasOpen && (
              <ul
                onMouseLeave={() => setHerramientasOpen(false)}
                className="absolute right-0 mt-2 bg-white text-blue-700 rounded shadow-md py-2 w-48 z-50"
              >
                <li
                  onClick={() => {
                    setHerramientasOpen(false);
                    router.push('/cotizar');
                  }}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                >
                  Realizar cotización
                </li>
              </ul>
            )}
          </div>
        </ul>

        {/* Menú Mobile Icono */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
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
            <li onClick={() => router.push('/cotizar')} className="hover:text-blue-300 cursor-pointer">Realizar cotización</li>
          </ul>
        </div>
      )}
    </nav>
  );
}
