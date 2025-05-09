import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';

const temas = [
  {
    titulo: '¿Cómo entregar mis archivos para impresión?',
    descripcion: 'Evita errores y consigue una impresión perfecta siguiendo esta guía.',
    slug: 'como-preparar-archivos',
  },
  {
    titulo: '¿Qué formatos acepta PuertoCopy?',
    descripcion: 'Descubre los tipos de archivo ideales para impresión digital.',
    slug: 'formatos-aceptados',
  },
  {
    titulo: '¿Cuánto tarda mi pedido?',
    descripcion: 'Conoce los tiempos estimados de entrega y cómo agilizar tu impresión.',
    slug: 'tiempo-entrega',
  },
];

export default function Ayuda() {
  return (
    <>
      <Head>
        <title>Centro de Ayuda | PuertoCopy</title>
        <meta name="description" content="Encuentra respuestas a tus dudas sobre impresión, formatos, tiempos de entrega y más. PuertoCopy te ayuda a resolverlo." />
      </Head>

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">Centro de Ayuda</h1>
        <p className="text-gray-600 mb-10 text-lg">Explora nuestras guías para ayudarte a imprimir sin complicaciones.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {temas.map((tema, index) => (
            <motion.div
              key={tema.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-blue-700 mb-2">{tema.titulo}</h2>
              <p className="text-gray-600 mb-4">{tema.descripcion}</p>
              <Link href={`/ayuda/${tema.slug}`}>
                <span className="text-blue-600 font-medium hover:underline">Leer más →</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
