// components/Footer.tsx
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Footer() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <footer className="bg-blue-900 text-white py-10 px-6 mt-20">
      <div
        className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10"
        data-aos="fade-up"
      >
        {/* Información de contacto */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Puerto Copy</h3>
          <p className="text-sm">Centro de Impresiones Digitales</p>
          <p className="mt-2 text-sm">Carretera Las Palmas 2246-B, Ixtapa, 48280 Puerto Vallarta, Jal.</p>
          <p className="text-sm">Tel: 322 233 2185</p>
        </div>

        {/* Horarios */}
        <div>
          <h4 className="text-xl font-semibold mb-3">Horarios</h4>
          <p className="text-sm">Lunes a Viernes: 9:00 AM - 7:00 PM</p>
          <p className="text-sm">Sábado: 9:00 AM - 3:00 PM</p>
          <p className="text-sm">Domingo: Cerrado</p>
        </div>

        {/* Navegación */}
        <div>
          <h4 className="text-xl font-semibold mb-3">Navegación</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-blue-300">Inicio</a></li>
            <li><a href="/#servicios" className="hover:text-blue-300">Servicios</a></li>
            <li><a href="/facturacion" className="hover:text-blue-300">Facturación</a></li>
            <li><a href="/#contacto" className="hover:text-blue-300">Contacto</a></li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-blue-300 mt-10">
        © {new Date().getFullYear()} Puerto Copy. Todos los derechos reservados.
      </div>
    </footer>
  );
}
