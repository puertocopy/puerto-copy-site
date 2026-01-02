import React from 'react';
import { Phone, Mail, Printer } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          
          <div className="col-span-1 md:col-span-2">
  <div className="flex items-center mb-4">
    <span className="font-bold text-xl text-[#003082] font-brand">Puerto Copy</span>
  </div>
  {/* El resto del contenido de la columna iría aquí */}
</div>
            <p className="text-gray-500 max-w-sm">
              Soluciones integrales de impresión en Puerto Vallarta. Calidad profesional para arquitectos, estudiantes y empresas.
            </p>
          </div>

          {/* Links Col */}
          <div>
            <h4 className="font-bold text-[#003082] mb-4">Enlaces</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/#servicios" className="hover:text-[#0B63B2]">Servicios</a></li>
              <li><a href="/factura" className="hover:text-[#0B63B2]">Facturación</a></li>
              <li><a href="#" className="hover:text-[#0B63B2]">Aviso de Privacidad</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="font-bold text-[#003082] mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center"><Phone size={14} className="mr-2"/> 322 191 6038</li>
              <li className="flex items-center"><Mail size={14} className="mr-2"/> hola@puertocopy.com</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 <span className="font-brand">Puerto Copy</span>. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}