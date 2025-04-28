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
            
              title="Ubicación Puerto Copy"
              <iframe title="Ubicación Puerto Copy" 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d933.2921347406307!2d-105.22970340445164!3d20.662721102463827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8421452e22f8ff0f%3A0xcd9a9374cb0132a9!2sPuerto%20Copy%20Centro%20de%20Impresi%C3%B3n!5e0!3m2!1ses!2smx!4v1745801134728!5m2!1ses!2smx" 
              width="600" 
              height="450" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
              </iframe>
          </div>
        </div>
      </section>
    );
  }
  