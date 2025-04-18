// components/Navbar.js
// components/Navbar.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isHome, setIsHome] = useState(false);

  useEffect(() => {
    setIsHome(router.pathname === '/');
  }, [router.pathname]);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#004b71] bg-opacity-90 backdrop-blur-md shadow text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <img src="/logoweb.png" alt="Puerto Copy Logo" className="h-10 w-auto cursor-pointer" />
        </Link>

        <ul className="hidden md:flex gap-6 text-sm font-medium">
          <li className="hover:text-blue-300 cursor-pointer" onClick={() => router.push('/')}>Inicio</li>
          <li className="hover:text-blue-300 cursor-pointer" onClick={() => scrollToSection('servicios')}>Servicios</li>
          <li className="hover:text-blue-300 cursor-pointer" onClick={() => router.push('/facturacion')}>Facturación</li>
          <li className="hover:text-blue-300 cursor-pointer" onClick={() => scrollToSection('contacto')}>Contacto</li>
        </ul>
      </div>
    </nav>
  );
}
