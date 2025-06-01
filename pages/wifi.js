import { useState, useEffect } from 'react';
import Head from 'next/head';

// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';

export default function Wifi() {
  const [countdown, setCountdown] = useState(20);
  const [started, setStarted]   = useState(false);
  const [finished, setFinished] = useState(false);

  /* Cuenta regresiva */
  useEffect(() => {
    if (!started) return;

    if (countdown === 0) {
      fetch('/api/authorizeWifi', { method: 'POST' }).catch(console.error);
      setFinished(true);
      return;
    }

    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [started, countdown]);

  /* ─────────────────────────────
     Intentamos abrir la app → fb://…
     Si el esquema falla (p.ej. no hay app
     o el portal cautivo lo bloquea),
     caemos al enlace web.
  ───────────────────────────── */
  const handleClick = () => {
    const pageWeb  = 'https://www.facebook.com/puertocopypv';
    const deepLink = `fb://facewebmodal/f?href=${encodeURIComponent(pageWeb)}`;

    const openedAt = Date.now();
    window.location.href = deepLink;          // intento 1: app

    /* Después de 1.5 s comprobamos si la app
       realmente se abrió.  Si no, abrimos web
       en una nueva pestaña */
    setTimeout(() => {
      if (Date.now() - openedAt < 2000) {
        window.open(pageWeb, '_blank', 'noopener'); // fallback: web
      }
    }, 1500);

    setStarted(true);
  };

  return (
    <>
      <Head>
        <title>WiFi gratis – Puerto Copy</title>
        <meta name="description" content="Conéctate gratis al WiFi de Puerto Copy en solo 20 s" />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 text-white px-6">
        {/* <Navbar /> */}

        <img
          src="/logoweb.png"
          alt="Puerto Copy"
          className="w-40 md:w-52 lg:w-60 mb-8 drop-shadow-xl select-none"
        />

        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
          WiFi gratuito para clientes
        </h1>
        <p className="text-lg text-center max-w-md mb-10 opacity-90">
          Solo apóyanos con un&nbsp;
          <span className="font-semibold">“Me gusta”</span> en nuestra página
          de Facebook. ¡Tardarás menos de medio minuto!
        </p>

        {!started && (
          <button
            onClick={handleClick}
            className="bg-white/90 text-blue-800 font-bold tracking-wide rounded-full px-8 py-4 text-lg shadow-xl hover:scale-105 hover:bg-white transition-transform"
          >
            ❤️ Dale Me Gusta y Continúa
          </button>
        )}

        {started && !finished && (
          <div className="flex flex-col items-center gap-5">
            <p className="text-lg">
              ¡Gracias! Tu acceso se habilitará en&nbsp;
              <span className="font-bold">{countdown}s</span>…
            </p>

            <div className="w-72 h-3 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-1000"
                style={{ width: `${((20 - countdown) / 20) * 100}%` }}
              />
            </div>
          </div>
        )}

        {finished && (
          <p className="mt-8 text-xl font-semibold text-center">
            ✅ ¡Listo! Ya puedes navegar 🚀
          </p>
        )}

        {/* <Footer /> */}
      </div>
    </>
  );
}
