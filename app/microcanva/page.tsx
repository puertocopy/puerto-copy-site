"use client";

import dynamic from "next/dynamic";

// Cargamos el editor de forma dinámica y desactivamos SSR 
// ya que Konva requiere acceso al DOM (window/canvas) que no existe en el servidor.
const MicroCanvaEditor = dynamic(() => import("../../components/MicroCanvaEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    </div>
  ),
});

export default function Page() {
  return (
    <div className="p-4">
      <MicroCanvaEditor />
    </div>
  );
}
