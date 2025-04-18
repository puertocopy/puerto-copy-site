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
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#004b71] bg-opacity-90 shadow backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <img src="/logoweb.png" alt="Puerto Copy Logo" className="h-10 w-auto" />

        {/* Menu desktop */}
        <ul className="hidden md:flex gap-6 text-white font-medium text-sm">
          <li className="cursor-pointer hover:text-blue-200" onClick={() => scrollToSection('top')}>Inicio</li>
          <li className="cursor-pointer hover:text-blue-200" onClick={() => scrollToSection('servicios')}>Servicios</li>
          <li className="cursor-pointer hover:text-blue-200" onClick={() => router.push('/facturacion')}>Facturación</li>
          <li className="cursor-pointer hover:text-blue-200" onClick={() => scrollToSection('contacto')}>Contacto</li>
        </ul>

        {/* Menu mobile */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white focus:outline-none">
            ☰
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <ul className="md:hidden bg-[#004b71] text-white px-4 pb-4 space-y-2 font-medium text-sm">
          <li className="cursor-pointer hover:text-blue-200" onClick={() => { scrollToSection('top'); setMenuOpen(false); }}>Inicio</li>
          <li className="cursor-pointer hover:text-blue-200" onClick={() => { scrollToSection('servicios'); setMenuOpen(false); }}>Servicios</li>
          <li className="cursor-pointer hover:text-blue-200" onClick={() => { router.push('/facturar'); setMenuOpen(false); }}>Facturación</li>
          <li className="cursor-pointer hover:text-blue-200" onClick={() => { scrollToSection('contacto'); setMenuOpen(false); }}>Contacto</li>
        </ul>
      )}
    </nav>
  );
}
