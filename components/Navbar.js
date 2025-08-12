import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(null); // 'herramientas' | 'ayuda' | null
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const ayudaRef = useRef(null);
  const herramientasRef = useRef(null);
  const navRef = useRef(null);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/#${id}`);
    }
    setMenuOpen(false);
    setSubmenuOpen(null);
  };

  // Fondo sólido al hacer scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerrar submenús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        navRef.current &&
        !navRef.current.contains(e.target)
      ) {
        setSubmenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar submenús con Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSubmenuOpen(null);
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const baseNav =
    'fixed top-0 w-full z-50 text-white transition-colors duration-300';
  const bg =
    scrolled || menuOpen
      ? 'bg-[#003082]/95 shadow-lg backdrop-blur'
      : 'bg-[#003082]/75 backdrop-blur-md shadow';

  const linkBase =
    'cursor-pointer hover:text-[#A7C9F2] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30 rounded-lg px-1 py-1';

  return (
    <nav ref={navRef} className={`${baseNav} ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <img
            src="/logoweb.png"
            alt="Puerto Copy Logo"
            className="h-10 w-auto drop-shadow-sm"
          />
          <span className="sr-only">Puerto Copy</span>
        </a>

        {/* Menú Desktop */}
        <ul className="hidden md:flex gap-6 text-sm font-medium items-center relative">
          <li onClick={() => scrollToSection('inicio')} className={linkBase}>
            Inicio
          </li>
          <li onClick={() => scrollToSection('servicios')} className={linkBase}>
            Servicios
          </li>
          <li onClick={() => router.push('/factura')} className={linkBase}>
            Facturación
          </li>
          <li onClick={() => scrollToSection('contacto')} className={linkBase}>
            Contacto
          </li>

          {/* Herramientas */}
          <li className="relative" ref={herramientasRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={submenuOpen === 'herramientas'}
              onClick={() =>
                setSubmenuOpen(
                  submenuOpen === 'herramientas' ? null : 'herramientas'
                )
              }
              className={`${linkBase} flex items-center gap-1`}
            >
              Herramientas
              <ChevronDown open={submenuOpen === 'herramientas'} />
            </button>

            {submenuOpen === 'herramientas' && (
              <Dropdown align="right">
                <DropdownItem
                  onClick={() => {
                    setSubmenuOpen(null);
                    router.push('/cotizar');
                  }}
                >
                  Realizar cotización
                </DropdownItem>
              </Dropdown>
            )}
          </li>

          {/* Ayuda */}
          <li className="relative" ref={ayudaRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={submenuOpen === 'ayuda'}
              onClick={() =>
                setSubmenuOpen(submenuOpen === 'ayuda' ? null : 'ayuda')
              }
              className={`${linkBase} flex items-center gap-1`}
            >
              Ayuda
              <ChevronDown open={submenuOpen === 'ayuda'} />
            </button>

            {submenuOpen === 'ayuda' && (
              <Dropdown align="right" width="w-64">
                <DropdownItem
                  onClick={() => {
                    setSubmenuOpen(null);
                    router.push('/ayuda/como-preparar-archivos');
                  }}
                >
                  Cómo entregar archivos
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    setSubmenuOpen(null);
                    router.push('/ayuda/formatos-aceptados');
                  }}
                >
                  Formatos aceptados
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    setSubmenuOpen(null);
                    router.push('/ayuda/tiempo-entrega');
                  }}
                >
                  Tiempo de entrega
                </DropdownItem>
              </Dropdown>
            )}
          </li>
        </ul>

        {/* Menú Mobile Icono */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
            className="p-2 rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
          >
            <Hamburger open={menuOpen} />
          </button>
        </div>
      </div>

      {/* Menú Mobile */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
          menuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="px-4 pb-4 pt-1 flex flex-col gap-2 text-[15px] font-medium">
          <li
            onClick={() => scrollToSection('inicio')}
            className="px-3 py-2 rounded-lg hover:bg-white/10 active:bg-white/15"
          >
            Inicio
          </li>
          <li
            onClick={() => scrollToSection('servicios')}
            className="px-3 py-2 rounded-lg hover:bg-white/10 active:bg-white/15"
          >
            Servicios
          </li>
          <li
            onClick={() => router.push('/factura')}
            className="px-3 py-2 rounded-lg hover:bg-white/10 active:bg-white/15"
          >
            Facturación
          </li>
          <li
            onClick={() => scrollToSection('contacto')}
            className="px-3 py-2 rounded-lg hover:bg-white/10 active:bg-white/15"
          >
            Contacto
          </li>

          {/* Herramientas (mobile) */}
          <MobileAccordion
            label="Herramientas"
            open={submenuOpen === 'herramientas'}
            onToggle={() =>
              setSubmenuOpen(
                submenuOpen === 'herramientas' ? null : 'herramientas'
              )
            }
          >
            <li
              onClick={() => {
                setMenuOpen(false);
                setSubmenuOpen(null);
                router.push('/cotizar');
              }}
              className="px-3 py-2 rounded-md hover:bg-white/10 active:bg-white/15"
            >
              Realizar cotización
            </li>
          </MobileAccordion>

          {/* Ayuda (mobile) */}
          <MobileAccordion
            label="Ayuda"
            open={submenuOpen === 'ayuda'}
            onToggle={() =>
              setSubmenuOpen(submenuOpen === 'ayuda' ? null : 'ayuda')
            }
          >
            <li
              onClick={() => {
                setMenuOpen(false);
                setSubmenuOpen(null);
                router.push('/ayuda/como-preparar-archivos');
              }}
              className="px-3 py-2 rounded-md hover:bg-white/10 active:bg-white/15"
            >
              Cómo entregar archivos
            </li>
            <li
              onClick={() => {
                setMenuOpen(false);
                setSubmenuOpen(null);
                router.push('/ayuda/formatos-aceptados');
              }}
              className="px-3 py-2 rounded-md hover:bg-white/10 active:bg-white/15"
            >
              Formatos aceptados
            </li>
            <li
              onClick={() => {
                setMenuOpen(false);
                setSubmenuOpen(null);
                router.push('/ayuda/tiempo-entrega');
              }}
              className="px-3 py-2 rounded-md hover:bg-white/10 active:bg-white/15"
            >
              Tiempo de entrega
            </li>
          </MobileAccordion>
        </ul>
      </div>
    </nav>
  );
}

/* ====== Subcomponentes ====== */

function Dropdown({ children, align = 'left', width = 'w-48' }) {
  const alignment = align === 'right' ? 'right-0' : 'left-0';
  return (
    <ul
      role="menu"
      className={`absolute ${alignment} mt-2 ${width} bg-white text-[#0B63B2] rounded-xl shadow-lg py-2 z-50 border border-[#D8E6F6]`}
    >
      {children}
    </ul>
  );
}

function DropdownItem({ children, onClick }) {
  return (
    <li
      role="menuitem"
      onClick={onClick}
      className="px-4 py-2 hover:bg-[#F3F7FC] cursor-pointer text-[15px]"
    >
      {children}
    </li>
  );
}

function ChevronDown({ open }) {
  return (
    <svg
      className={`w-4 h-4 mt-[1px] transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function Hamburger({ open }) {
  return (
    <svg
      className="w-7 h-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

function MobileAccordion({ label, children, open, onToggle }) {
  return (
    <li className="rounded-lg">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 active:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
        aria-expanded={open}
      >
        <span>{label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
          open ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="pl-2 pt-1 flex flex-col gap-1">{children}</ul>
      </div>
    </li>
  );
}
