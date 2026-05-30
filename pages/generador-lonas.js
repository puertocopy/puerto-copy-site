import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ArrowLeft, Download, Type, Maximize, Phone, MapPin, Tag } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function GeneradorLonasExpress() {
  const [ancho, setAncho] = useState(200);
  const [alto, setAlto] = useState(100);
  const [titulo, setTitulo] = useState('SE VENDE');
  const [subtitulo, setSubtitulo] = useState('322 191 6038');
  const [colorFondo, setColorFondo] = useState('#ffffff');
  const [colorTexto, setColorTexto] = useState('#003082');
  const [isExporting, setIsExporting] = useState(false);
  
  const lonaRef = useRef(null);

  const exportarPDF = async () => {
    setIsExporting(true);
    try {
      const element = lonaRef.current;
      
      // Capturamos el estilo original
      const originalStyle = element.style.cssText;
      
      // Calculamos dimensiones para una exportación nítida (10px por cm)
      const targetWidthPx = ancho * 10;
      const targetHeightPx = alto * 10;
      
      // Aplicamos dimensiones temporales para la captura
      element.style.width = `${targetWidthPx}px`;
      element.style.height = `${targetHeightPx}px`;
      element.style.aspectRatio = 'auto';

      const canvas = await html2canvas(element, {
        scale: 2, // 2x sobre los 10px/cm da una resolución excelente
        useCORS: true,
        backgroundColor: colorFondo,
        logging: false,
        width: targetWidthPx,
        height: targetHeightPx
      });

      // Restauramos el estilo original
      element.style.cssText = originalStyle;

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const doc = new jsPDF({
        orientation: ancho > alto ? 'landscape' : 'portrait',
        unit: 'cm',
        format: [ancho, alto]
      });

      doc.addImage(imgData, 'JPEG', 0, 0, ancho, alto);
      doc.save(`Lona_PuertoCopy_${ancho}x${alto}cm.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error al generar el PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Cálculo de escala para la vista previa basado en el tamaño real
  const factorEscala = Math.min(ancho, alto) * 0.45;
  const fontSizeTitulo = `${factorEscala}px`;
  const fontSizeSubtitulo = `${factorEscala * 0.4}px`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Head>
        <title>Generador de Lonas Rápido | Puerto Copy</title>
      </Head>
      
      <Navbar forceWhite={true} />

      <main className="flex-grow pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <a href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </a>
          <div>
            <h1 className="text-3xl font-bold text-[#003082]">Generador de Lonas Express</h1>
            <p className="text-gray-500">Crea tu lona en segundos, lista para imprimir.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Panel de Control */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-100 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Maximize size={14} /> Ancho (cm)
                </label>
                <input 
                  type="number" 
                  value={ancho} 
                  onChange={(e) => setAncho(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Maximize size={14} /> Alto (cm)
                </label>
                <input 
                  type="number" 
                  value={alto} 
                  onChange={(e) => setAlto(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Tag size={14} /> Texto Principal
                </label>
                <input 
                  type="text" 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value.toUpperCase())}
                  placeholder="Ej: SE VENDE"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Phone size={14} /> Datos de Contacto
                </label>
                <input 
                  type="text" 
                  value={subtitulo} 
                  onChange={(e) => setSubtitulo(e.target.value)}
                  placeholder="Ej: Tel o Dirección"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Color Fondo</label>
                <input 
                  type="color" 
                  value={colorFondo} 
                  onChange={(e) => setColorFondo(e.target.value)}
                  className="w-full h-12 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Color Texto</label>
                <input 
                  type="color" 
                  value={colorTexto} 
                  onChange={(e) => setColorTexto(e.target.value)}
                  className="w-full h-12 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
                />
              </div>
            </div>

            <button 
              onClick={exportarPDF}
              disabled={isExporting}
              className="w-full bg-[#003082] hover:bg-blue-800 text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Download size={24} />
              {isExporting ? 'Generando PDF...' : 'Descargar PDF Listo'}
            </button>
          </div>

          {/* Vista Previa */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Vista Previa Real</h3>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-inner border border-gray-200 flex items-center justify-center min-h-[500px] overflow-hidden">
              <div 
                ref={lonaRef}
                style={{ 
                  width: '100%', 
                  aspectRatio: `${ancho} / ${alto}`,
                  backgroundColor: colorFondo,
                  color: colorTexto,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '5%',
                  textAlign: 'center',
                  lineHeight: '1.1',
                  boxSizing: 'border-box'
                }}
                className="shadow-2xl border"
              >
                <div style={{ fontSize: fontSizeTitulo, fontWeight: '900', wordBreak: 'break-word', width: '100%' }}>
                  {titulo || 'SE VENDE'}
                </div>
                <div style={{ fontSize: fontSizeSubtitulo, fontWeight: '700', marginTop: '2%', opacity: 0.9 }}>
                  {subtitulo}
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
              <div className="bg-blue-500 text-white p-1 rounded-full shadow-sm"><Tag size={12}/></div>
              <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                <strong>Sincronización Total:</strong> El tamaño del texto se ajusta matemáticamente según los {ancho}x{alto}cm. Lo que ves aquí es exactamente lo que se imprimirá.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
