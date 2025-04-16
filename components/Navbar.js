// components/Navbar.tsx
import Link from 'next/link';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slides = [
  { image: "/slide1.jpg", alt: "Servicio de calidad", title: "Impresión profesional" },
  { image: "/slide2.jpg", alt: "Entrega rápida", title: "Tu trabajo en tiempo récord" },
  { image: "/slide3.jpg", alt: "Atención personalizada", title: "Estamos para ayudarte" },
];

export default function Navbar() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white bg-opacity-90 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/">
            <img src="/logoweb.png" alt="Puerto Copy Logo" className="h-10 w-auto cursor-pointer" />
          </Link>
          <ul className="flex gap-6 text-sm font-medium text-gray-800">
            <li><Link href="/" className="hover:text-blue-700 transition-colors">Inicio</Link></li>
            <li><Link href="/#servicios" className="hover:text-blue-700 transition-colors">Servicios</Link></li>
            <li><Link href="/facturar" className="hover:text-blue-700 transition-colors">Facturación</Link></li>
            <li><Link href="/#contacto" className="hover:text-blue-700 transition-colors">Contacto</Link></li>
          </ul>
        </div>
      </nav>

      {/* HERO SLIDER */}
      <div className="pt-20">
        <Slider {...settings}>
          {slides.map((slide, index) => (
            <div key={index} className="relative h-[80vh] w-full overflow-hidden">
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover brightness-75"
              />
              <div className="absolute inset-0 flex items-center justify-center text-white text-center px-4">
                <div>
                  <h2 className="text-3xl md:text-5xl font-bold">{slide.title}</h2>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </>
  );
}
