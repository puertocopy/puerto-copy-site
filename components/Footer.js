// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-[#16284f] text-white text-center py-8 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-4 text-sm">

        {/* Nombre y año automático */}
        <div>
          © {new Date().getFullYear()} Puerto Copy — Copias e Impresión de Planos en Puerto Vallarta
        </div>

        {/* Navegación interna */}
        <div className="flex justify-center space-x-6">
          <a href="#inicio" className="hover:underline">Inicio</a>
          <a href="#servicios" className="hover:underline">Servicios</a>
          <a href="#contacto" className="hover:underline">Contacto</a>
        </div>

        {/* Dirección y contacto */}
        <div>
          📍 Carretera Las Palmas 2246-B, Ixtapa, Puerto Vallarta, Jalisco | 📞 322 123 4567
        </div>

      </div>
    </footer>
  );
}
