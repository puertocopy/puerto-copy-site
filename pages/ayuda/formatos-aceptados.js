import Head from 'next/head';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Image from 'next/image';

export default function FormatosAceptados() {
  return (
    <>
      <Head>
        <title>¿Qué formatos acepta PuertoCopy para impresión? | Ayuda</title>
        <meta name="description" content="Conoce los tipos de archivos ideales para una impresión sin errores: PDF, JPG, PNG, TIFF. Evita fallas y asegura calidad profesional en PuertoCopy." />
      </Head>

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-blue-800">
          ¿Qué formatos acepta PuertoCopy para impresión?
        </h1>

        <p className="mb-6 text-lg">
          Elegir el formato adecuado al enviar tus archivos es esencial para garantizar una impresión clara, rápida y profesional. En PuertoCopy aceptamos diversos tipos de archivo, pero te recomendamos seguir estas pautas para evitar problemas y asegurar una experiencia óptima.
        </p>

        <div className="my-8 rounded-xl overflow-hidden shadow-md">
          <Image
            src="/img/ayuda-formatos.png"
            alt="Formatos ideales para impresión"
            width={1200}
            height={600}
            className="object-cover w-full h-auto"
          />
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-blue-700">✅ Formatos recomendados</h2>
        <ul className="list-disc ml-6 mb-6 text-gray-700">
          <li className="mb-2"><strong>PDF</strong> (Portable Document Format): El formato más estable. Mantiene diseño, fuentes y proporciones sin riesgo de errores.</li>
          <li className="mb-2"><strong>JPG o JPEG:</strong> Ideal para imágenes y fotografías. Recomendamos resolución mínima de 300 dpi.</li>
          <li className="mb-2"><strong>PNG:</strong> Perfecto para logos, gráficos y diseños con fondo transparente.</li>
          <li><strong>TIFF:</strong> Muy utilizado en impresión profesional y gran formato (como planos o fotos).</li>
        </ul>

        <div className="my-8">
          <Image
            src="/img/formatos-aceptados.png"
            alt="Ejemplo visual de formatos aceptados"
            width={900}
            height={450}
            className="rounded-lg shadow"
          />
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-blue-700">⚠️ Formatos que NO recomendamos</h2>
        <ul className="list-disc ml-6 mb-6 text-gray-700">
          <li className="mb-2"><strong>Word (.doc, .docx), Excel, PowerPoint:</strong> Suelen desconfigurarse al abrirse en otras computadoras.</li>
          <li className="mb-2"><strong>Capturas de pantalla:</strong> Baja resolución, texto borroso o imágenes pixeladas.</li>
          <li><strong>Archivos comprimidos (.zip, .rar):</strong> Pueden contener formatos no compatibles o virus.</li>
        </ul>

        <div className="bg-yellow-100 p-4 rounded-xl my-6">
          <strong className="block mb-2 text-yellow-800">💡 Consejo:</strong>
          Si tu archivo no está en formato PDF, puedes exportarlo fácilmente desde Word, Illustrator, Photoshop o incluso desde el navegador. Siempre revisa que se vea igual antes de enviarlo.
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-blue-700">🧠 Consejos finales para una impresión perfecta</h2>
        <ul className="list-disc ml-6 mb-6 text-gray-700">
          <li>Revisa el archivo final antes de enviarlo.</li>
          <li>Evita colores demasiado oscuros en texto pequeño.</li>
          <li>Asegúrate de que no falten imágenes o fuentes (exportando a PDF se evita esto).</li>
        </ul>

        <p className="mt-6 text-lg">
          Si tienes dudas sobre tu archivo o necesitas ayuda para convertirlo, en <strong>PuertoCopy</strong> te apoyamos con gusto.  
          Puedes enviarnos tu archivo directo por <a href="https://wa.me/523223499334" target="_blank" className="text-green-600 underline">WhatsApp</a> para revisarlo antes de imprimir.
        </p>
      </main>

      <Footer />
    </>
  );
}
