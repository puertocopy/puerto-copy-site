import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Outfit } from 'next/font/google';
import '../styles/globals.css';
import { CartProvider } from '../context/CartContext';
import { FileUploadModal } from '../components/FileUploadModal';
import WorldCupDecorations from '../components/WorldCupDecorations';
import GoalClickEffect from '../components/GoalClickEffect';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <CartProvider>
      <Head>
        <title>Puerto Copy | Centro de Impresiones en Puerto Vallarta</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Centro de copias e impresión de planos en Puerto Vallarta. Copias en carta, oficio, doble carta y gran formato. Servicio rápido, calidad profesional y atención personalizada en Puerto Copy."/>
        
        {/* URL Canónica */}
        <link rel="canonical" href="https://puertocopy.com" />

        {/* Ícono en la pestaña */}
        <link rel="icon" href="/favicon.png" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="Puerto Copy | Centro de Impresiones en Puerto Vallarta" />
        <meta property="og:description" content="Expertos en impresión de planos, copias a color y B/N, y soluciones de oficina en Puerto Vallarta." />
        <meta property="og:image" content="https://puertocopy.com/logopngazul.png" />
        <meta property="og:url" content="https://puertocopy.com" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Puerto Copy | Centro de Impresiones en Puerto Vallarta" />
        <meta name="twitter:description" content="Servicio rápido de copias e impresión de planos en Puerto Vallarta." />
        <meta name="twitter:image" content="https://puertocopy.com/logopngazul.png" />

        {/* Datos Estructurados (JSON-LD) para Negocio Local */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Puerto Copy",
              "image": "https://puertocopy.com/logopngazul.png",
              "@id": "https://puertocopy.com",
              "url": "https://puertocopy.com",
              "telephone": "+5213221916038",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Villa Colonial 573, Los Portales",
                "addressLocality": "Puerto Vallarta",
                "addressRegion": "JAL",
                "postalCode": "48315",
                "addressCountry": "MX"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 20.6663, 
                "longitude": -105.2239
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "08:00",
                  "closes": "18:00"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Saturday",
                  "opens": "10:00",
                  "closes": "14:00"
                }
              ],
              "sameAs": [
                "https://www.facebook.com/puertocopy"
              ]
            }),
          }}
        />
      </Head>

      <div className={`${outfit.variable} font-sans`}>
        {mounted && <GoalClickEffect />}
        <Component {...pageProps} />
        {mounted && <FileUploadModal />}
      </div>
    </CartProvider>
  );
}

export default MyApp;
