import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Type, Maximize, Palette, Image as ImageIcon, 
  PlusCircle, Trash2, ArrowLeft, ZoomIn, ZoomOut, Maximize2, Move 
} from 'lucide-react';

/**
 * EDITOR DE LONAS PROFESIONAL V29 - PUERTO COPY
 * Solución Definitiva: Coordenadas Absolutas Top-Left (Sin Transforms).
 * Exportación Escalada 2x con Fidelidad Matemática Paralela.
 */
export default function EditorDisenoV29() {
  // --- 1. DECLARACIONES OBLIGATORIAS (REFERENCIAS Y ESTADOS BASE) ---
  const canvasRef = useRef(null);
  const exportRef = useRef(null);
  const fileInputRef = useRef(null);

  const [anchoCm, setAnchoCm] = useState(150);
  const [altoCm, setAltoCm] = useState(50);
  
  // Base lógica fija: 1000px de ancho
  const BASE_WIDTH = 1000; 
  const ratio = anchoCm / altoCm;
  const canvasHeight = BASE_WIDTH / ratio;

  // --- 2. ESTADOS DE DISEÑO (COORDENADAS TOP-LEFT) ---
  const [elementos, setElementos] = useState([
    { 
      id: '1', type: 'text', content: 'PRECISIÓN ABSOLUTA 1:1', color: '#003399', 
      x: 50, y: 50, size: 60, bold: true, italic: false, font: 'Impact', rotation: 0 
    }
  ]);
  
  const [selectedId, setSelectedId] = useState('1');
  const [colorFondo, setColorFondo] = useState('#ffffff');
  const [zoom, setZoom] = useState(0.7);
  const [exporting, setExporting] = useState(false);

  // --- 3. DEFINICIÓN DE ELEMENTO ACTIVO (REPARADO) ---
  const activeElement = elementos.find(el => el.id === selectedId);

  const fuentes = [
    { name: 'Impact', family: 'Impact, Charcoal, sans-serif' },
    { name: 'Arial', family: 'Arial, sans-serif' },
    { name: 'Times New Roman', family: '"Times New Roman", Times, serif' },
    { name: 'Courier', family: '"Courier New", Courier, monospace' }
  ];

  // --- 4. FUNCIONES DE EDICIÓN ---
  const updateElement = (id, changes) => {
    setElementos(prev => prev.map(el => el.id === id ? { ...el, ...changes } : el));
  };

  const addText = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setElementos([...elementos, { 
      id: newId, type: 'text', content: 'Nuevo Texto', color: '#000000', 
      x: 100, y: 100, size: 40, bold: false, italic: false, font: 'Arial', rotation: 0
    }]);
    setSelectedId(newId);
  };

  const addImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newId = Math.random().toString(36).substr(2, 9);
        setElementos([...elementos, { 
          id: newId, type: 'image', src: ev.target.result, 
          x: 100, y: 100, width: 300, rotation: 0
        }]);
        setSelectedId(newId);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 5. MOTOR DE EXPORTACIÓN (ESCALADO PARALELO 2X) ---
  const exportarPDF = async () => {
    if (exporting) return;
    setExporting(true);
    setSelectedId(null); 

    window.scrollTo(0, 0);

    setTimeout(async () => {
      try {
        const element = exportRef.current;
        const mirrorWidth = 2000;
        const mirrorHeight = (altoCm / anchoCm) * 2000;

        const canvas = await html2canvas(element, {
          scale: 1, 
          useCORS: true,
          logging: true, 
          backgroundColor: colorFondo,
          windowWidth: mirrorWidth,
          windowHeight: mirrorHeight,
          width: mirrorWidth,
          height: mirrorHeight,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const doc = new jsPDF({
          orientation: anchoCm > altoCm ? 'landscape' : 'portrait',
          unit: 'cm',
          format: [anchoCm, altoCm],
          compress: true
        });

        doc.addImage(imgData, 'JPEG', 0, 0, anchoCm, altoCm);
        doc.save(`PuertoCopy_Precision_Export_${anchoCm}x${altoCm}cm.pdf`);
      } catch (err) {
        console.error("Export Error:", err);
        alert("Error al generar el PDF.");
      } finally {
        setExporting(false);
      }
    }, 600);
  };

  return (
    <div className="h-screen w-full bg-[#f8fafc] text-slate-800 font-brand flex flex-col overflow-hidden select-none">
      <Head>
        <title>Plotter Pro V29 | Puerto Copy</title>
      </Head>

      {/* NAVBAR */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <a href="/" className="text-slate-400 hover:text-blue-600 transition-colors"><ArrowLeft size={18} /></a>
          <img src="/logopngazul.png" alt="Logo" className="h-5" />
          <h1 className="text-[10px] font-black uppercase tracking-widest text-blue-700 border-l border-slate-200 pl-4">Exportación Absoluta 1:1</h1>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-1.5 hover:text-blue-600 transition-colors"><ZoomOut size={16}/></button>
              <span className="text-[10px] font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1.5 hover:text-blue-600 transition-colors"><ZoomIn size={16}/></button>
           </div>
           <button 
            onClick={exportarPDF}
            disabled={exporting}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-bold text-xs shadow-lg active:scale-95 transition-all"
           >
             {exporting ? 'Generando...' : 'Descargar para Plotter'}
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR IZQUIERDO */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 p-5 space-y-6 z-40 overflow-y-auto scrollbar-hide">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Maximize size={12}/> Medidas (cm)</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <label className="text-[7px] font-bold text-slate-400 block mb-1 uppercase">Ancho</label>
                <input type="number" value={anchoCm} onChange={(e) => setAnchoCm(Number(e.target.value))} className="bg-transparent w-full text-xs font-bold outline-none"/>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <label className="text-[7px] font-bold text-slate-400 block mb-1 uppercase">Alto</label>
                <input type="number" value={altoCm} onChange={(e) => setAltoCm(Number(e.target.value))} className="bg-transparent w-full text-xs font-bold outline-none"/>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 text-center">
            <button onClick={addText} className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 p-3 rounded-xl transition-all">
              <Type size={18} className="text-blue-700" />
              <span className="text-[9px] font-bold uppercase text-slate-500 tracking-tighter">Texto</span>
            </button>
            <label className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3 rounded-xl cursor-pointer">
              <ImageIcon size={18} className="text-slate-800" />
              <span className="text-[9px] font-bold uppercase text-slate-500 tracking-tighter">Imagen</span>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={addImage} className="hidden" />
            </label>
          </section>

          {/* PANEL DE AJUSTES (REPARADO) */}
          {activeElement && (
            <motion.section initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
              <div className="flex justify-between items-center mb-2 border-b border-slate-200 pb-2">
                <span className="text-[9px] font-black text-blue-700 uppercase">Propiedades</span>
                <button onClick={() => setElementos(elementos.filter(el => el.id !== activeElement.id))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
              </div>
              {activeElement.type === 'text' && (
                <>
                  <textarea 
                    value={activeElement.content}
                    onChange={(e) => updateElement(activeElement.id, { content: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none h-16 font-medium"
                  />
                  <div className="flex gap-2">
                    <select value={activeElement.font} onChange={(e) => updateElement(activeElement.id, { font: e.target.value })} className="flex-1 bg-white border border-slate-200 rounded p-1 text-[9px] font-bold">
                      {fuentes.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                    </select>
                    <input type="color" value={activeElement.color} onChange={(e) => updateElement(activeElement.id, { color: e.target.value })} className="w-8 h-8 p-1 bg-white border border-slate-200 rounded cursor-pointer" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateElement(activeElement.id, { bold: !activeElement.bold })} className={`flex-1 p-1 rounded border text-[10px] font-bold ${activeElement.bold ? 'bg-blue-700 text-white' : 'bg-white'}`}>B</button>
                    <button onClick={() => updateElement(activeElement.id, { italic: !activeElement.italic })} className={`flex-1 p-1 rounded border text-[10px] italic ${activeElement.italic ? 'bg-blue-700 text-white' : 'bg-white'}`}>I</button>
                  </div>
                </>
              )}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase"><span>ROTACIÓN</span> <span>{activeElement.rotation}°</span></div>
                <input type="range" min="0" max="360" value={activeElement.rotation} onChange={(e) => updateElement(activeElement.id, { rotation: Number(e.target.value) })} className="w-full accent-slate-400" />
              </div>
            </motion.section>
          )}

          <section className="pt-6 border-t border-slate-100 space-y-3">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Palette size={12}/> Color de Lona</h3>
             <div className="flex flex-wrap gap-2 justify-center">
               {['#ffffff', '#003399', '#fde047', '#ef4444', '#000000'].map(c => (
                 <button key={c} onClick={() => setColorFondo(c)} style={{ backgroundColor: c }} className={`w-7 h-7 rounded border-2 transition-all ${colorFondo === c ? 'border-blue-700 scale-110 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}/>
               ))}
             </div>
          </section>
        </aside>

        {/* --- 6. LIENZO DE VISTA PREVIA (ABS 0,0) --- */}
        <main className="flex-1 relative bg-slate-100 flex items-center justify-center overflow-auto p-40 scrollbar-hide cursor-default" onClick={() => setSelectedId(null)}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.1s ease-out' }}>
            <div 
              ref={canvasRef}
              className="relative shadow-2xl bg-white"
              style={{ width: `${BASE_WIDTH}px`, height: `${canvasHeight}px`, backgroundColor: colorFondo, overflow: 'visible' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

              {elementos.map((el) => (
                <motion.div
                  key={el.id}
                  drag
                  dragMomentum={false}
                  dragElastic={0}
                  onDragStart={() => setSelectedId(el.id)}
                  onDragEnd={(e, info) => {
                    // Actualizamos x e y sumando el desplazamiento absoluto al origen top-left
                    const deltaX = info.offset.x / zoom;
                    const deltaY = info.offset.y / zoom;
                    updateElement(el.id, { x: el.x + deltaX, y: el.y + deltaY });
                  }}
                  style={{ 
                    position: 'absolute', 
                    // COORDENADAS ABSOLUTAS TOP-LEFT (SIN TRANSFORMS)
                    left: `${el.x}px`, 
                    top: `${el.y}px`, 
                    rotate: el.rotation,
                    zIndex: selectedId === el.id ? 100 : 10,
                    cursor: 'move'
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                >
                  <div className={`p-4 relative group transition-all ${selectedId === el.id ? 'ring-2 ring-blue-500 rounded-sm' : 'hover:ring-1 hover:ring-slate-300'}`}>
                    {selectedId === el.id && (
                      <motion.div 
                        drag
                        dragMomentum={false}
                        onDrag={(e, info) => {
                          const delta = (info.delta.x + info.delta.y) / 2;
                          const scaledDelta = delta / zoom;
                          if (el.type === 'text') {
                             updateElement(el.id, { size: Math.max(10, el.size + scaledDelta) });
                          } else {
                             updateElement(el.id, { width: Math.max(50, el.width + scaledDelta) });
                          }
                        }}
                        className="absolute bottom-[-8px] right-[-8px] w-6 h-6 bg-blue-700 rounded-full border-2 border-white shadow-xl cursor-nwse-resize z-[110] flex items-center justify-center pointer-events-auto"
                      >
                         <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </motion.div>
                    )}

                    {el.type === 'text' ? (
                      <div style={{ 
                        color: el.color, fontSize: `${el.size}px`, 
                        fontWeight: el.bold ? 'bold' : 'normal', fontStyle: el.italic ? 'italic' : 'normal',
                        fontFamily: fuentes.find(f => f.name === el.font)?.family || 'Arial',
                        whiteSpace: 'pre', lineHeight: 1, pointerEvents: 'none', textAlign: 'left'
                      }}>
                        {el.content}
                      </div>
                    ) : (
                      <img src={el.src} style={{ width: `${el.width}px`, height: 'auto', pointerEvents: 'none', display: 'block' }} alt="Img" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* --- 7. LIENZO ESPEJO GHOST (REGLAS MATEMÁTICAS ESCALADO 2X SIN TRANSFORMS) --- */}
      <div style={{ position: 'fixed', top: 0, left: 0, opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
        <div 
          ref={exportRef}
          style={{ 
            width: '2000px', 
            height: `${(altoCm / anchoCm) * 2000}px`, 
            backgroundColor: colorFondo, 
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {elementos.map((el) => {
            const f = 2; // Factor de Escala Constante 2000/1000
            
            return (
              <div
                key={`export-${el.id}`}
                style={{ 
                  position: 'absolute', 
                  // REGLA DE ORO: Posición y Tamaño multiplicados por f, sin translate
                  left: `${el.x * f}px`, 
                  top: `${el.y * f}px`, 
                  zIndex: 10,
                  transform: `rotate(${el.rotation}deg)`,
                  transformOrigin: '0 0' // Rotación desde la esquina superior izquierda
                }}
              >
                {el.type === 'text' ? (
                  <div style={{ 
                    color: el.color, 
                    fontSize: `${el.size * f}px`, 
                    fontWeight: el.bold ? 'bold' : 'normal', 
                    fontStyle: el.italic ? 'italic' : 'normal',
                    fontFamily: fuentes.find(f => f.name === el.font)?.family || 'Arial',
                    whiteSpace: 'pre', 
                    lineHeight: '1.2', 
                    textAlign: 'left'
                  }}>
                    {el.content}
                  </div>
                ) : (
                  <img 
                    src={el.src} 
                    style={{ width: `${el.width * f}px`, height: 'auto', display: 'block' }} 
                    alt="Export" 
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @font-face { font-family: 'Product Sans'; src: url('/Product Sans Regular.ttf') format('truetype'); }
        .font-brand { font-family: 'Product Sans', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        input[type="range"] { -webkit-appearance: none; height: 3px; background: #e2e8f0; border-radius: 10px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: #1d4ed8; border-radius: 50%; cursor: pointer; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
}
