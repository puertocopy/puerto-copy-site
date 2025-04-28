import Navbar from "../components/Navbar"

export default function Contacto() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <section id="contacto" className="bg-white py-20 px-6 md:px-12">
  <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
    <h2 className="text-3xl md:text-4xl font-bold text-[#004b71] mb-8">
      Contáctanos - Puerto Copy Puerto Vallarta
    </h2>
    <p className="text-lg text-gray-700 mb-8">
      ¿Necesitas copias, impresión de planos o servicios de escaneo? Estamos listos para ayudarte. Visítanos o escríbenos.
    </p>
    
    <div className="flex flex-col items-center space-y-4 text-gray-700 text-lg">
      <div>📍 Villa Colonial #573, Los Portales, Puerto Vallarta, Jalisco</div>
      <div>📞 <a href="tel:+523223499334" className="text-[#004b71] hover:underline">322 349 9334</a></div>
      <div>📧 <a href="mailto:contacto@puertocopy.com" className="text-[#004b71] hover:underline">contacto@puertocopy.com</a></div>
      <div>🕒 Lunes a Viernes: 8:00 AM – 6:00 PM
              Sabado 10:00 AM – 2:00 PM 
      </div>
    </div>

    {/* Mapa de Google opcional */}
    <div className="mt-10">
      <iframe
        title="Ubicación Puerto Copy"
        src="hhttps://www.google.com/maps?rlz=1C5CHFA_enMX1146MX1146&gs_lcrp=EgZjaHJvbWUqDggDEEUYJxg7GIAEGIoFMgYIABBFGDkyBggBEEUYPDIGCAIQIxgnMg4IAxBFGCcYOxiABBiKBTIGCAQQRRg7Mg8IBRAuGEMYsQMYgAQYigUyBggGEEUYPDIGCAcQRRg80gEIMzc0M2owajmoAgCwAgE&um=1&ie=UTF-8&fb=1&gl=mx&sa=X&geocode=KQ__-CIuRSGEMakyAct0k5rN&daddr=Villa+Colonial+573,+Los+Portales,+48315+Puerto+Vallarta,+Jal."
        width="100%"
        height="300"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>
    </div>
  </div>
</section>
</div>

  )
}//fotos
