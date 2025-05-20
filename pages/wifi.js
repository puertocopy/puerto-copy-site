import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';   // quítalo si tu landing no lleva el navbar
import Footer from '../components/Footer';   // idem

export default function Wifi() {
  const [countdown, setCountdown] = useState(20);  // 20 s
  const [started, setStarted]   = useState(false);
  const [finished, setFinished] = useState(false);

  // ↓ Cuenta regresiva
  useEffect(() => {
    if (!started) return;

    if (countdown === 0) {
      // aquí “liberas” el acceso:
      fetch('/api/authorizeWifi', { method: 'POST' }).catch(console.error);
      setFinished(true);
      return;
    }

    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [started, countdown]);

  const handleClick = () => {
    window.open('https://facebook.com/puertocopypv', '_blank', 'noopener');
    setStarted(true);
  };

  return (
    <>
      <Head>
        <title>WiFi gratuito – Puerto Copy</title>
        <meta name="description" content="Conéctate gratis al WiFi de Puerto Copy tras apoyar nuestra fanpage" />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6">
        {/* Opcional: <Navbar /> */}

        <h1 className="text-3xl font-bold mb-8 text-center">
          Acceso WiFi gratuito
        </h1>

        {!started && (
          <button
            onClick={handleClick}
            className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            Visita nuestra página en Facebook
          </button>
        )}

        {started && !finished && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg">
              ¡Gracias! Tu acceso se habilitará en&nbsp;
              <span className="font-semibold">{countdown}s</span>…
            </p>

            {/* Barra de progreso */}
            <div className="w-64 h-3 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-1000"
                style={{ width: `${((20 - countdown) / 20) * 100}%` }}
              />
            </div>
          </div>
        )}

        {finished && (
          <p className="mt-6 text-lg font-semibold text-center">
            ¡Listo! Ya puedes navegar 🚀
          </p>
        )}

        {/* Opcional: <Footer /> */}
      </div>
    </>
  );
}
