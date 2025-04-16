// components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-blue-900 bg-opacity-80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* LOGO */}
        <Link href="/">
          <img
            src="/logoweb.png"
            alt="Puerto Copy Logo"
            className="h-10 w-auto cursor-pointer"
          />
        </Link>

        {/* MENÚ */}
        <ul className="flex gap-6 text-sm font-medium text-white">
          <li>
            <Link href="/" className="hover:text-blue-300 transition">
              Inicio
            </Link>
          </li>
          <li>
            <Link href="#servicios" className="hover:text-blue-300 transition">
              Servicios
            </Link>
          </li>
          <li>
            <Link href="/facturar" className="hover:text-blue-300 transition">
              Facturación
            </Link>
          </li>
          <li>
            <Link href="#contacto" className="hover:text-blue-300 transition">
              Contacto
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
