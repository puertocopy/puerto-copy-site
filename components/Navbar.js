import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#004b71] bg-opacity-95 shadow">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center h-[60px]">
        <a href="/">
          <Image src="/logoweb.png" alt="Puerto Copy Logo" width={85} height={27} />
        </a>
        <ul className="hidden md:flex gap-4 text-sm font-medium text-white">
          <li><a href="/" className="hover:text-blue-200">Inicio</a></li>
          <li><a href="#servicios" className="hover:text-blue-200">Servicios</a></li>
          <li><a href="/facturar" className="hover:text-blue-200">Facturación</a></li>
          <li><a href="#contacto" className="hover:text-blue-200">Contacto</a></li>
        </ul>
      </div>
    </nav>
  );
}
