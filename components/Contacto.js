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
            <div>📍 Villa Colonial 573, Los Portales, Puerto Vallarta, Jalisco</div>
            <div>📞 <a href="tel:+523223499334" className="text-[#004b71] hover:underline">322 349 9334</a></div>
            <div>📧 <a href="mailto:contacto@puertocopy.com" className="text-[#004b71] hover:underline">contacto@puertocopy.com</a></div>
            <div>🕒 Lunes a Viernes: 9:00 AM – 7:00 PM</div>
          </div>
  
          {/* Mapa de Google */}
          <div className="mt-10">
            <iframe
              title="Ubicación Puerto Copy"
              src="https://www.google.com/maps/place/Puerto+Copy+Centro+de+Impresi%C3%B3n/@20.662617,-105.2333807,17z/data=!3m1!4b1!4m6!3m5!1s0x8421452e22f8ff0f:0xcd9a9374cb0132a9!8m2!3d20.662612!4d-105.2285098!16s%2Fg%2F11q1t0k81h?hl=es&entry=ttu&g_ep=EgoyMDI1MDQyMy4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D"
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
  