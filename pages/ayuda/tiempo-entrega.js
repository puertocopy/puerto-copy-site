import Head from 'next/head';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function TiempoEntrega() {
  return (
    <>
      <Head>
        <title>¿Cuánto tarda un pedido de impresión en PuertoCopy?</title>
        <meta name="description" content="Conoce los tiempos promedio de impresión en PuertoCopy: desde impresiones rápidas el mismo día hasta trabajos grandes en 24 a 48 horas." />
      </Head>

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-blue-800">
          ¿Cuánto tarda un pedido de impresión en PuertoCopy?
        </h1>

        <p className="mb-4 text-lg">
          En PuertoCopy entendemos la urgencia de tus proyectos. Ya sea que necesites imprimir tareas, planos, documentos oficiales o lonas, trabajamos para entregarte todo de forma rápida y profesional.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">⏱️ Tiempos promedio de entrega</h2>
        <ul className="list-disc ml-6 mb-6">
          <li><strong>Impresiones comunes (tamaño carta, oficio, tabloide):</strong> 15 a 30 minutos.</li>
          <li><strong>Planos y grandes formatos:</strong> 1 a 2 horas (dependiendo del volumen).</li>
          <li><strong>Impresión de fotografías o canvas:</strong> entre 2 y 4 horas.</li>
          <li><strong>Trabajos por volumen o con acabado especial:</strong> 24 a 48 horas (te confirmamos al recibir el archivo).</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">📦 ¿Puedo recoger el mismo día?</h2>
        <p className="mb-4">
          ¡Sí! En la mayoría de los casos, tu pedido estará listo el mismo día. Para garantizarlo:
        </p>
        <ul className="list-disc ml-6 mb-6">
          <li>Envía tu archivo en el formato correcto y en buena calidad.</li>
          <li>Evita enviar trabajos cerca del horario de cierre.</li>
          <li>Pregunta por WhatsApp si tu pedido requiere más tiempo.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">📲 Atención rápida por WhatsApp</h2>
        <p className="mb-6">
          ¿Tienes prisa o necesitas saber exactamente cuándo estará tu impresión?  
          Escríbenos al <a href="https://wa.me/523223499334" target="_blank" className="text-green-600 underline">WhatsApp</a> y te daremos un tiempo estimado personalizado.
        </p>

        <p className="text-lg">
          En PuertoCopy imprimimos con rapidez, pero sin perder calidad. Nuestro objetivo es que tus documentos estén listos cuando los necesitas, siempre con un acabado profesional.
        </p>
      </main>

      <Footer />
    </>
  );
}
