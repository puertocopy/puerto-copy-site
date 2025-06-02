import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import FloatingBubbles from "../components/FloatingBubbles";

export default function Facturacion() {
  const [estado, setEstado] = useState("activo"); // activo | cerrado
  const [tiempoRestante, setTiempoRestante] = useState("");

  useEffect(() => {
    const actualizarEstado = () => {
      const ahora = new Date();
      const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 18, 0, 0); // Último día del mes a las 18:00
      const reinicio = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1, 8, 0, 0); // Día 1 del siguiente mes a las 08:00

      if (ahora >= finMes && ahora < reinicio) {
        setEstado("cerrado");
      } else {
        setEstado("activo");
        const diferencia = finMes - ahora;
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
        const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
        setTiempoRestante(`${dias}d ${horas}h ${minutos}m`);
      }
    };

    actualizarEstado();
    const intervalo = setInterval(actualizarEstado, 60000); // Actualiza cada minuto
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <section className="py-16 px-6 bg-gray-100 text-center">
        <h2 className="text-3xl font-semibold mb-6">Generar Factura</h2>

        {estado === "activo" && (
          <>
            <p className="text-lg text-blue-700 mb-4">
              Tiempo restante para facturar este mes: <strong>{tiempoRestante}</strong>
            </p>
            <div className="max-w-4xl mx-auto shadow-lg p-4 bg-white rounded-lg">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSclHDoFDAUl--M53kvbbqQqkt8QOhqcpTl7rTrPSCHr7uI_yA/viewform?embedded=true"
                width="100%"
                height="2858"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                title="Formulario de facturación"
              >
                Cargando…
              </iframe>
            </div>
          </>
        )}

        {estado === "cerrado" && (
          <div className="text-xl text-gray-700 bg-white p-6 rounded shadow max-w-xl mx-auto">
            <p className="mb-2 font-semibold text-red-600">🚫 Las facturas para este mes se han cerrado.</p>
            <p>Te esperamos el próximo mes. ¡No olvides registrar tu ticket desde el primer día!</p>
          </div>
        )}
      </section>
      <FloatingBubbles />
    </div>
  );
}
