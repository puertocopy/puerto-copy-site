export default function Contacto() {
    return (
      <section id="contacto" className="bg-white py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004b71] mb-8">
            Contáctanos - Puerto Copy Puerto Vallarta
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            ¿Necesitas copias, impresión de planos o servicios de escaneo? Estamos listos para ayudarte. Visítanos o escríbenos para recibir atención personalizada.
          </p>
          
          <div className="flex flex-col items-center space-y-4 text-gray-700 text-lg">
            <div>📍 Carretera Las Palmas 2246-B, Ixtapa, Puerto Vallarta, Jalisco</div>
            <div>📞 <a href="tel:+523221234567" className="text-[#004b71] hover:underline">322 123 4567</a></div>
            <div>📧 <a href="mailto:contacto@puertocopy.com" className="text-[#004b71] hover:underline">contacto@puertocopy.com</a></div>
            <div>🕒 Lunes a Viernes: 9:00 AM – 7:00 PM</div>
          </div>
  
          {/* Mapa de Google */}
          <div className="mt-10">
            <iframe
              title="Ubicación Puerto Copy"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.839671960712!2d-105.23476868501265!3d20.653407986202745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842145741d9d7c61%3A0xfcbf8c4ec3b4d13d!2sIxtapa%2C%20Puerto%20Vallarta%2C%20Jal.!5e0!3m2!1ses!2smx!4v1682345789089!5m2!1ses!2smx"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    );
  }
  