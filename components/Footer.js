export default function Footer() {
  return (
    <footer className="bg-[#003082] text-white pt-10 pb-6 px-6 md:px-12 mt-12">
      <div className="max-w-6xl mx-auto space-y-6 text-sm md:text-base">
        
        {/* Navegación interna */}
        <nav aria-label="Enlaces rápidos">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 font-medium">
            <li>
              <a href="#inicio" className="hover:text-[#A7C9F2] transition-colors">
                Inicio
              </a>
            </li>
            <li>
              <a href="#servicios" className="hover:text-[#A7C9F2] transition-colors">
                Servicios
              </a>
            </li>
            <li>
              <a href="#contacto" className="hover:text-[#A7C9F2] transition-colors">
                Contacto
              </a>
            </li>
            <li>
              <a href="/factura" className="hover:text-[#A7C9F2] transition-colors">
                Facturación
              </a>
            </li>
            <li>
              <a href="/cotizar" className="hover:text-[#A7C9F2] transition-colors">
                Cotizar
              </a>
            </li>
          </ul>
        </nav>

        {/* Línea divisoria */}
        <hr className="border-white/20 max-w-xs mx-auto" />

        {/* Dirección y contacto */}
        <address className="not-italic text-center leading-relaxed">
          📍 Villa Colonial #573, Los Portales, Puerto Vallarta, Jalisco <br />
          📞 <a href="tel:+523223499334" className="hover:text-[#A7C9F2]">322 349 9334</a> 
          {" "}| 📧{" "}
          <a href="mailto:contacto@puertocopy.com" className="hover:text-[#A7C9F2]">
            contacto@puertocopy.com
          </a>
        </address>

        {/* Nombre y año automático */}
        <div className="text-center text-white/80 text-xs md:text-sm pt-2">
          © {new Date().getFullYear()} <span className="font-semibold">Puerto Copy</span> — Copias e Impresión de Planos en Puerto Vallarta
        </div>
      </div>
    </footer>
  );
}
