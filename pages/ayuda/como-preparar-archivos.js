import Head from 'next/head';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ComoPrepararArchivos() {
  return (
    <>
      <Head>
        <title>Cómo entregar tus archivos para una óptima impresión | PuertoCopy</title>
        <meta
          name="description"
          content="Aprende cómo preparar correctamente tus archivos para impresión profesional. Evita errores y mejora la calidad de tus documentos en PuertoCopy."
        />
      </Head>

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          🖨️ Cómo Entregar Tus Archivos Para una Óptima Impresión
        </h1>
        <p className="text-lg mb-8">
          Ya sea que necesites imprimir planos, documentos importantes, tareas escolares o presentaciones, entregar tus archivos correctamente puede marcar la diferencia entre una impresión perfecta y un dolor de cabeza.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">📁 1. Usa el Formato Correcto</h2>
        <ul className="list-disc ml-6 mb-6">
          <li><strong>PDF</strong>: El más recomendado. Mantiene estructura y calidad.</li>
          <li><strong>TIFF o JPG de alta resolución</strong>: Ideal si es imagen.</li>
          <li><strong>Evita Word, PowerPoint, Excel</strong>: pueden desconfigurarse.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">📐 2. Tamaño Real del Documento</h2>
        <p className="mb-4">
          Asegúrate de que el archivo esté al <strong>tamaño final de impresión</strong>: Carta, Oficio, Tabloide o los tamaños de planos como 45x60 cm, 60x90 cm, 90x120 cm, etc.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">🎨 3. Revisa Resolución y Calidad</h2>
        <ul className="list-disc ml-6 mb-6">
          <li>Mínimo <strong>300 dpi</strong> para imágenes claras.</li>
          <li>Evita capturas de pantalla o imágenes borrosas.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">🔤 4. Incrusta o Convierte las Fuentes</h2>
        <p className="mb-4">
          Si usas fuentes especiales, convierte el texto en curvas o exporta el archivo con las fuentes incrustadas para evitar cambios de diseño.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">⚠️ 5. Deja Márgenes y Sangrados</h2>
        <p className="mb-4">
          Si tu diseño llega hasta el borde del papel, deja al menos <strong>3 mm de sangrado</strong> y <strong>5 mm de margen interior</strong>.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">✅ Revisión Final</h2>
        <ul className="list-disc ml-6 mb-6">
          <li>¿Está en PDF?</li>
          <li>¿Está al tamaño correcto?</li>
          <li>¿Las imágenes se ven nítidas?</li>
          <li>¿El texto está incrustado?</li>
          <li>¿Incluye márgenes o sangrado?</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">📬 ¿Cómo enviar tu archivo a PuertoCopy?</h2>
        <p className="mb-4">
          Puedes subir tus archivos directamente en nuestra página web o enviarlos por <a href="https://wa.me/523223499334" target="_blank" className="text-green-600 underline">WhatsApp</a>. Aceptamos archivos PDF, JPG, PNG o TIFF de alta calidad.
        </p>

        <div className="bg-blue-100 p-4 rounded-lg mt-6">
          <strong>Tip de experto:</strong> Un archivo bien preparado te ahorra tiempo, evita errores y garantiza una impresión como la esperas.
        </div>

        <p className="mt-8 text-lg">
          En <strong>PuertoCopy</strong> nos encargamos de darte una impresión profesional, rápida y sin sorpresas. Síguenos en redes o contáctanos para más tips.
        </p>
      </main>

      <Footer />
    </>
  );
}
