import React, { useEffect, useState } from 'react';

/**
 * Componente que añade balones de fútbol grises que flotan sobre la página.
 * Se usa como overlay con baja opacidad para asegurar visibilidad sin estorbar.
 */
const WorldCupDecorations = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Generamos balones con posiciones y tamaños aleatorios
  const balls = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    size: Math.random() * (50 - 20) + 20, // Un poco más grandes para que se vean bien
    left: Math.random() * 100,
    duration: Math.random() * (20 - 12) + 12, // Velocidad moderada
    delay: Math.random() * 8,
    opacity: Math.random() * (0.25 - 0.15) + 0.15, // Opacidad aumentada para visibilidad clara
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
      <style jsx>{`
        @keyframes floatBall {
          0% {
            transform: translateY(110vh) rotate(0deg);
          }
          100% {
            transform: translateY(-10vh) rotate(360deg);
          }
        }
        .soccer-ball {
          position: absolute;
          animation: floatBall linear infinite;
        }
      `}</style>

      {balls.map((ball) => (
        <div
          key={ball.id}
          className="soccer-ball"
          style={{
            left: `${ball.left}%`,
            width: `${ball.size}px`,
            height: `${ball.size}px`,
            animationDuration: `${ball.duration}s`,
            animationDelay: `${ball.delay}s`,
            opacity: ball.opacity,
            bottom: '-60px',
          }}
        >
          <svg
            viewBox="0 0 512 512"
            fill="currentColor"
            className="text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm0 464c-114.7 0-208-93.3-208-208S141.3 48 256 48s208 93.3 208 208-93.3 208-208 208z"/>
            <path d="M373.4 163.6l-50.6-29.2-22.9-63.1c-1.8-5-6.6-8.3-11.9-8.3h-64c-5.3 0-10.1 3.3-11.9 8.3l-22.9 63.1-50.6 29.2c-4.6 2.7-7.4 7.6-7.4 13v58.5l-43.9 51.5c-3.4 4-4.1 9.6-1.8 14.3l32 64c2.1 4.2 6.4 6.8 11.1 6.8h64c5.3 0 10.1-3.3 11.9-8.3l22.9-63.1h64l22.9 63.1c1.8 5 6.6 8.3 11.9 8.3h64c4.7 0 9-2.6 11.1-6.8l32-64c2.3-4.7 1.6-10.3-1.8-14.3l-43.9-51.5v-58.5c0-5.4-2.8-10.3-7.4-13zm-37.4 68.3v45.1l32.2 37.8-16.1 32.2-28.7-10.4c-4.4-1.6-9.2-.9-13.1 1.9l-38.3 27.8V330c0-5.3-3.3-10.1-8.3-11.9l-32.2-11.7 32.2-11.7c5-1.8 8.3-6.6 8.3-11.9v-36.3l38.3-27.8c3.9-2.8 8.7-3.5 13.1-1.9l28.7 10.4 16.1-32.2-32.2 37.8zm-160 0l-32.2-37.8 16.1-32.2 28.7 10.4c4.4 1.6 9.2.9 13.1-1.9l38.3-27.8v36.3c0 5.3 3.3 10.1 8.3 11.9l32.2 11.7-32.2 11.7c-5 1.8-8.3 6.6-8.3 11.9v36.3l-38.3 27.8c-3.9 2.8-8.7 3.5-13.1 1.9l-28.7-10.4-16.1 32.2 32.2-37.8v-45.1z"/>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default WorldCupDecorations;
