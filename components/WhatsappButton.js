// components/WhatsAppButton.js
import { useEffect, useState } from 'react';

export default function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(true); // puedes cambiar la lógica si quieres mostrar solo en ciertas secciones
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <a
      href="https://wa.me/523223499334" // cambia este número por el tuyo con el código de país
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-3 transition-all duration-300">
      <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 32 32"
  fill="currentColor"
  className="h-6 w-6"
>
  <path d="M16.003 2.003C8.275 2.003 2 8.28 2 16.006c0 2.88.786 5.635 2.278 8.07L2 30l6.12-2.255a13.896 13.896 0 0 0 7.883 2.26c7.728 0 14.003-6.277 14.003-14.003S23.731 2.003 16.003 2.003zm0 25.55c-2.444 0-4.843-.67-6.926-1.94l-.497-.297-3.635 1.34 1.28-3.724-.325-.582a11.496 11.496 0 0 1-1.727-6.03c0-6.36 5.18-11.54 11.54-11.54 6.36 0 11.54 5.18 11.54 11.54 0 6.36-5.18 11.54-11.54 11.54zm6.3-8.64c-.345-.172-2.04-1.007-2.356-1.122-.317-.115-.548-.172-.778.172-.23.345-.89 1.122-1.09 1.35-.2.23-.4.26-.745.086-.344-.173-1.453-.535-2.77-1.71-1.025-.916-1.714-2.048-1.916-2.392-.2-.344-.021-.53.152-.702.155-.155.345-.402.517-.603.172-.2.23-.345.345-.575.115-.23.058-.432-.028-.604-.086-.173-.777-1.87-1.066-2.557-.28-.672-.565-.58-.778-.59l-.662-.01c-.23 0-.604.086-.918.432-.317.345-1.207 1.18-1.207 2.865s1.236 3.322 1.408 3.553c.173.23 2.437 3.72 5.91 5.217 3.472 1.497 3.472.998 4.093.939.63-.058 2.04-.833 2.328-1.64.288-.804.288-1.497.202-1.64-.086-.144-.316-.23-.66-.402z" />
</svg>

      </div>
    </a>
  );
}
