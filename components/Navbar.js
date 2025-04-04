import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow bg-white">
      <div className="text-xl font-bold">Puerto Copy</div>
      <div className="space-x-6">
        <Link href="/">Inicio</Link>
        <Link href="/servicios">Servicios</Link>
        <Link href="/facturacion">Facturación</Link>
        <Link href="/contacto">Contacto</Link>
      </div>
    </nav>
  )
}