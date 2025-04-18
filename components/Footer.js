// components/Footer.tsx
export default function Footer() {
    return (
      <footer id="contacto" className="bg-[#004b71] text-white py-10 px-6 md:px-12" data-aos="fade-up">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {/* Logo y descripción */}
          <div>
            <img src="/logoweb.png" alt="Puerto Copy Logo" className="h-12 mb-4" />
            <p className="text-sm text-gray-300">
              Puerto Copy es tu centro de impresiones confiable en Puerto Vallarta. Calidad, rapidez y atención personalizada.
            </p>
          </div>
  
          {/* Enlaces útiles */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-blue-300 transition">Inicio</a></li>
              <li><a href="#servicios" className="hover:text-blue-300 transition">Servicios</a></li>
              <li><a href="/facturar" className="hover:text-blue-300 transition">Facturación</a></li>
              <li><a href="#contacto" className="hover:text-blue-300 transition">Contacto</a></li>
            </ul>
          </div>
  
          {/* Información de contacto */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📍 Villa Colonial 573, Los Portales, Puerto Vallarta</li>
              <li>📞 322 349 9334</li>
              <li>✉️ impresiones@puertocopy.com</li>
              <li>
                <a
                  href="https://www.facebook.com/puertocopypv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-300"
                >
                  🌐 Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>
  
        <div className="mt-10 border-t border-blue-700 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Puerto Copy. Todos los derechos reservados.
        </div>
      </footer>
    );
  }
  