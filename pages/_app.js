import Head from 'next/head';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Puerto Copy | Centro de Impresiones</title>
        <meta name="description" content="Centro de copias e impresión de planos en Puerto Vallarta. Copias en carta, oficio, doble carta y gran formato. Servicio rápido, calidad profesional y atención personalizada en Puerto Copy."/>

        {/* Ícono en la pestaña */}
        <link rel="icon" href="/favicon.png" />

        {/* SEO básico (opcional) */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Puerto Copy - Centro de impresiones en Puerto Vallarta" />
        <meta property="og:title" content="Puerto Copy" />
        <meta property="og:image" content="https://puertocopy.com/favicon.png" />
        <meta property="og:url" content="https://puertocopy.com" />
        <meta property="og:type" content="website" />

        {/* Logo para resultados de Google (opcional, ayuda con SEO) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "url": "https://puertocopy.com",
              "logo": "https://puertocopy.com/favicon.png"
            }),
          }}
        />
    
      </Head>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
