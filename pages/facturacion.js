// pages/facturacion.js
import Navbar from "../components/Navbar";
import FloatingBubbles from "../components/FloatingBubbles";
export default function Facturacion() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <section className="py-16 px-6 bg-gray-100">
        <h2 className="text-3xl font-semibold mb-6 text-center">Generar Factura</h2>
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
      </section>
      <FloatingBubbles />
    </div>
    
  );
}
