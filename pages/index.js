import Navbar from "../components/Navbar"
// pages/index.tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="flex justify-between items-center px-8 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-700">Puerto Copy</h1>
        <nav className="space-x-6">
          <a href="#servicios" className="text-gray-700 hover:text-blue-700">Servicios</a>
          <a href="#facturacion" className="text-gray-700 hover:text-blue-700">Facturación</a>
          <a href="#contacto" className="text-gray-700 hover:text-blue-700">Contacto</a>
        </nav>
      </header>

      <main className="flex flex-col justify-center items-center text-center px-4 py-24 bg-gray-50">
        <h2 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">
          Impresión profesional, rápida y confiable
        </h2>
        <p className="max-w-xl text-lg text-gray-600 mb-8">
          Copias, planos, documentos oficiales y más. Impresiones de calidad para tus necesidades diarias y profesionales.
        </p>
        <a href="/facturacion" className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-md text-lg transition">
          Generar Factura
        </a>
      </main>

      <footer className="text-center text-sm text-gray-500 mt-24 py-6 border-t">
        © {new Date().getFullYear()} Puerto Copy. Todos los derechos reservados.
      </footer>
    </div>
  );
}
