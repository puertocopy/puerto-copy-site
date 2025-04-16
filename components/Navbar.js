// components/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white bg-opacity-90 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <img src="/logoweb.png" alt="Puerto Copy Logo" className="h-10 w-auto" />
        <ul className="flex gap-6 text-sm font-medium text-gray-800">
          <li className="hover:text-blue-700 transition-colors">Inicio</li>
          <li className="hover:text-blue-700 transition-colors">Servicios</li>
          <li className="hover:text-blue-700 transition-colors">Facturación</li>
          <li className="hover:text-blue-700 transition-colors">Contacto</li>
        </ul>
      </div>
    </nav>
  );
}
