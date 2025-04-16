// components/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-blue-900 bg-opacity-70 backdrop-blur-md shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <img src="/logoweb.png" alt="Puerto Copy Logo" className="h-10 w-auto" />
        <ul className="flex gap-6 text-sm font-medium text-white">
          <li className="hover:text-blue-300 cursor-pointer">Inicio</li>
          <li className="hover:text-blue-300 cursor-pointer">Servicios</li>
          <li className="hover:text-blue-300 cursor-pointer">Facturación</li>
          <li className="hover:text-blue-300 cursor-pointer">Contacto</li>
        </ul>
      </div>
    </nav>
  );
}
