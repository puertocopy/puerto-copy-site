"use client";

import React, { useMemo, useRef, useState } from "react";
import { Stage, Layer, Text as KText, Rect, Image as KImage } from "react-konva";
import type Konva from "konva";
import { DesignElement, TextElement, ImageElement } from "../lib/printUnits";
import { exportDesignToPdf } from "../lib/exportPdf";

function useHtmlImage(dataUrl?: string) {
  const [img, setImg] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    if (!dataUrl) return;
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => setImg(i);
    i.src = dataUrl;
  }, [dataUrl]);

  return img;
}

const uid = () => Math.random().toString(36).slice(2, 10);

/**
 * Puerto Copy UI tokens
 * - Azul principal (como pediste)
 * - Rojo queda como acento secundario por si lo quieres en botones/etiquetas
 */
const PC = {
  blue: "#1D4ED8",
  blueSel: "#2563eb",
  blueSoft: "rgba(29,78,216,0.10)",
  blueBorder: "rgba(29,78,216,0.22)",

  red: "#E10600",
  black: "#0B0F19",
  ink: "#111827",
  slate: "#64748b",
  border: "rgba(2, 6, 23, 0.10)",
  bg: "#F6F7FB",
  card: "#FFFFFF",
};

/**
 * IMPORTANTE:
 * - Quité minHeight: 100dvh para que el editor NO se pelee con Navbar/Footer.
 * - En su lugar: height: 100% y flex: 1 / minHeight: 0 donde toca.
 * - Header sticky se queda, pero con top:0 dentro del contenedor del editor.
 *   (Si lo envuelves bien, no se encima del Navbar.)
 */
const styles: Record<string, React.CSSProperties> = {
  page: {
    height: "100%", // <-- clave para embed
    background: PC.bg,
    color: PC.ink,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    display: "flex",
    flexDirection: "column",
    minHeight: 0, // <-- clave para layouts flex
  },

  header: {
    height: 56,
    background: PC.card,
    borderBottom: `1px solid ${PC.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px",
    position: "sticky",
    top: 0, // sticky dentro del editor
    zIndex: 50,
    boxShadow: "0 1px 0 rgba(15, 23, 42, 0.04)",
  },

  brandLeft: { display: "flex", alignItems: "center", gap: 12, minWidth: 260 },

  logoMark: {
    width: 10,
    height: 10,
    background: PC.blue, // <-- azul
    borderRadius: 999,
    boxShadow: "0 0 0 4px rgba(29, 78, 216, 0.12)",
  },

  brandTitle: { display: "flex", flexDirection: "column", lineHeight: 1.05 },

  h1: { margin: 0, fontSize: 12, fontWeight: 900, letterSpacing: 0.6, textTransform: "uppercase" as const },
  h2: { margin: 0, marginTop: 2, fontSize: 11, color: PC.slate },

  headerRight: { display: "flex", alignItems: "center", gap: 10 },

  pill: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(15, 23, 42, 0.04)",
    border: `1px solid ${PC.border}`,
    borderRadius: 999,
    padding: "6px 10px",
  },

  inputMiniWrap: { display: "flex", alignItems: "baseline", gap: 6 },

  inputMiniLabel: { fontSize: 10, fontWeight: 900, letterSpacing: 0.6, textTransform: "uppercase" as const, color: PC.slate },

  inputMini: {
    width: 78,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: 12,
    fontWeight: 800,
    color: PC.ink,
    padding: "2px 4px",
    borderRadius: 8,
  },

  unit: { fontSize: 10, color: PC.slate, fontWeight: 700 },

  btnPrimary: {
    background: PC.blue, // <-- azul principal
    color: "#fff",
    border: "1px solid rgba(29,78,216,0.25)",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(29, 78, 216, 0.18)",
    transition: "transform 120ms ease, box-shadow 120ms ease, filter 120ms ease",
    userSelect: "none",
  },

  // Body ahora ocupa el espacio disponible del contenedor
  body: {
    flex: 1,
    minHeight: 0, // <-- CLAVE para scroll interno correcto
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: 16,
    padding: 16,
    alignItems: "start",
  },

  panel: {
    background: PC.card,
    border: `1px solid ${PC.border}`,
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
    position: "sticky",
    top: 72, // debajo del header del editor
    alignSelf: "start",
  },

  panelHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },

  panelTitle: { margin: 0, fontSize: 13, fontWeight: 950, letterSpacing: 0.3 },

  panelHint: { margin: 0, marginTop: 6, fontSize: 12, color: PC.slate, lineHeight: 1.35 },

  section: { marginTop: 12, paddingTop: 12, borderTop: `1px solid ${PC.border}` },

  sectionTitle: {
    margin: 0,
    marginBottom: 10,
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    color: PC.slate,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },

  label: { display: "grid", gap: 6, fontSize: 12, fontWeight: 800, color: PC.ink },

  input: {
    width: "100%",
    border: `1px solid ${PC.border}`,
    borderRadius: 12,
    padding: "10px 10px",
    fontSize: 13,
    outline: "none",
    background: "#fff",
  },

  row: { display: "flex", gap: 10, alignItems: "center" },

  btn: {
    border: `1px solid ${PC.border}`,
    background: "rgba(15, 23, 42, 0.02)",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
    transition: "transform 120ms ease, background 120ms ease",
    userSelect: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  btnGhost: {
    border: `1px solid ${PC.border}`,
    background: "#fff",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
    userSelect: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  canvasCard: {
    background: PC.card,
    border: `1px solid ${PC.border}`,
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
    minHeight: 0,
  },

  canvasTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },

  badge: {
    fontSize: 11,
    fontWeight: 900,
    color: PC.slate,
    background: "rgba(15, 23, 42, 0.04)",
    border: `1px solid ${PC.border}`,
    padding: "6px 10px",
    borderRadius: 999,
  },

  stageWrap: {
    borderRadius: 14,
    border: `1px solid ${PC.border}`,
    overflow: "hidden",
    background: "#fff",
    position: "relative",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.65)",
  },

  footerNote: {
    marginTop: 10,
    fontSize: 12,
    color: PC.slate,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },

  kbd: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
    fontSize: 11,
    fontWeight: 800,
    color: PC.ink,
    background: "rgba(15, 23, 42, 0.04)",
    border: `1px solid ${PC.border}`,
    borderBottomWidth: 2,
    padding: "4px 8px",
    borderRadius: 10,
  },

  // pequeño “callout” azul para propiedades (solo UI)
  calloutBlue: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    background: PC.blueSoft,
    border: `1px solid ${PC.blueBorder}`,
    color: PC.ink,
  },
};

function Icon({
  name,
  size = 16,
  color = PC.ink,
}: {
  name: "text" | "image" | "export" | "info" | "bolt";
  size?: number;
  color?: string;
}) {
  const common: React.CSSProperties = { display: "inline-block", width: size, height: size, color };
  if (name === "text") {
    return (
      <svg style={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h16M9 6v14m6-14v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "image") {
    return (
      <svg style={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M8 14l2-2 3 3 3-4 2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 10h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "export") {
    return (
      <svg style={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 9l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 17v3h16v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "bolt") {
    return (
      <svg style={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg style={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 17h.01M12 7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function MicroCanvaEditor() {
  const [widthCm, setWidthCm] = useState(200);
  const [heightCm, setHeightCm] = useState(100);

  const previewW = 900;
  const previewH = Math.round((previewW * heightCm) / widthCm);

  const stageRef = useRef<Konva.Stage>(null);

  const [elements, setElements] = useState<DesignElement[]>(() => {
    const base: TextElement = {
      id: uid(),
      type: "text",
      text: "SE VENDE",
      xPct: 0.1,
      yPct: 0.15,
      fontSizePct: 0.12,
      colorHex: PC.blue, // <-- azul por defecto
      rotationDeg: 0,
    };
    const phone: TextElement = {
      id: uid(),
      type: "text",
      text: "WhatsApp: 322 000 0000",
      xPct: 0.1,
      yPct: 0.35,
      fontSizePct: 0.06,
      colorHex: PC.black,
      rotationDeg: 0,
    };
    return [base, phone];
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => elements.find((e) => e.id === selectedId) ?? null,
    [elements, selectedId]
  );

  function updateEl(id: string, patch: Partial<DesignElement>) {
    setElements((prev) => prev.map((e) => (e.id === id ? ({ ...e, ...patch } as any) : e)));
  }

  function addText() {
    const t: TextElement = {
      id: uid(),
      type: "text",
      text: "Texto nuevo",
      xPct: 0.2,
      yPct: 0.6,
      fontSizePct: 0.06,
      colorHex: PC.black,
      rotationDeg: 0,
    };
    setElements((p) => [...p, t]);
    setSelectedId(t.id);
  }

  async function addImageFromFile(file: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

    const im: ImageElement = {
      id: uid(),
      type: "image",
      srcDataUrl: dataUrl,
      xPct: 0.75,
      yPct: 0.1,
      wPct: 0.15,
      hPct: 0.15,
      rotationDeg: 0,
    };
    setElements((p) => [...p, im]);
    setSelectedId(im.id);
  }

  async function onExportPdf() {
    const blob = await exportDesignToPdf({
      widthCm,
      heightCm,
      elements,
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PuertoCopy_${widthCm}x${heightCm}cm.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={styles.page}>
      {/* Topbar */}
      <header style={styles.header}>
        <div style={styles.brandLeft}>
          <div style={styles.logoMark} />
          <div style={styles.brandTitle}>
            <h1 style={styles.h1}>Puerto Copy · Micro-Canva</h1>
            <p style={styles.h2}>Editor técnico para lonas, letreros y formatos reales.</p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.pill} aria-label="Medidas">
            <div style={styles.inputMiniWrap}>
              <span style={styles.inputMiniLabel}>Ancho</span>
              <input
                type="number"
                value={widthCm}
                onChange={(e) => setWidthCm(Number(e.target.value))}
                style={styles.inputMini}
                min={1}
              />
              <span style={styles.unit}>cm</span>
            </div>
            <span style={{ width: 1, height: 18, background: PC.border }} />
            <div style={styles.inputMiniWrap}>
              <span style={styles.inputMiniLabel}>Alto</span>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                style={styles.inputMini}
                min={1}
              />
              <span style={styles.unit}>cm</span>
            </div>
          </div>

          <button
            onClick={onExportPdf}
            style={styles.btnPrimary}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            title="Exporta el PDF a tamaño real"
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon name="export" color="#fff" />
              Exportar PDF (tamaño real)
            </span>
          </button>
        </div>
      </header>

      <div style={styles.body}>
        {/* Panel */}
        <aside style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Herramientas</h3>
              <p style={styles.panelHint}>
                Arrastra y suelta. Lo que ves aquí se traduce a un PDF listo para plotter.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <span style={styles.badge}>
                <Icon name="bolt" /> Precisión real
              </span>
            </div>
          </div>

          <div style={styles.grid2}>
            <button
              onClick={addText}
              style={styles.btn}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              title="Agregar texto"
            >
              <Icon name="text" color={PC.blue} />
              + Texto
            </button>

            <label style={{ ...styles.btnGhost, cursor: "pointer" }} title="Agregar imagen">
              <Icon name="image" color={PC.ink} />
              + Imagen
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) addImageFromFile(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>
              <Icon name="info" color={PC.slate} /> Propiedades
            </h4>

            {selected?.type === "text" ? (
              <>
                <label style={styles.label}>
                  Contenido
                  <input
                    value={(selected as TextElement).text}
                    onChange={(e) => updateEl(selected.id, { text: e.target.value } as any)}
                    style={styles.input}
                  />
                </label>

                <div style={styles.row}>
                  <label style={{ ...styles.label, margin: 0, flex: 1 }}>
                    Color
                    <input
                      type="color"
                      value={(selected as TextElement).colorHex}
                      onChange={(e) => updateEl(selected.id, { colorHex: e.target.value } as any)}
                      style={{
                        width: "100%",
                        height: 44,
                        padding: 6,
                        borderRadius: 12,
                        border: `1px solid ${PC.border}`,
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    />
                  </label>
                </div>

                <label style={styles.label}>
                  Tamaño (relativo)
                  <input
                    type="range"
                    min={0.02}
                    max={0.25}
                    step={0.005}
                    value={(selected as TextElement).fontSizePct}
                    onChange={(e) => updateEl(selected.id, { fontSizePct: Number(e.target.value) } as any)}
                    style={{ width: "100%", accentColor: PC.blue }}
                  />
                </label>

                <div style={styles.calloutBlue}>
                  <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6, color: PC.blue }}>
                    Selección azul = impresión feliz
                  </div>
                  <div style={{ fontSize: 12, color: PC.slate, lineHeight: 1.35 }}>
                    Tip: click vacío = deseleccionar. (Doble click mental para editar… todavía no 😄)
                  </div>
                </div>

                <div style={styles.footerNote}>
                  <span style={styles.kbd}>Click vacío = deseleccionar</span>
                </div>
              </>
            ) : selected?.type === "image" ? (
              <>
                <label style={styles.label}>
                  Ancho (%)
                  <input
                    type="range"
                    min={0.05}
                    max={0.6}
                    step={0.01}
                    value={(selected as ImageElement).wPct ?? 0.2}
                    onChange={(e) => updateEl(selected.id, { wPct: Number(e.target.value) } as any)}
                    style={{ width: "100%", accentColor: PC.blue }}
                  />
                </label>
                <label style={styles.label}>
                  Alto (%)
                  <input
                    type="range"
                    min={0.05}
                    max={0.6}
                    step={0.01}
                    value={(selected as ImageElement).hPct ?? 0.2}
                    onChange={(e) => updateEl(selected.id, { hPct: Number(e.target.value) } as any)}
                    style={{ width: "100%", accentColor: PC.blue }}
                  />
                </label>

                <div style={styles.calloutBlue}>
                  <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6, color: PC.blue }}>
                    Imagen seleccionada
                  </div>
                  <div style={{ fontSize: 12, color: PC.slate, lineHeight: 1.35 }}>
                    Tip: si luego quieres “logo fijo”, se bloquea. Hoy todavía anda de turista 😅
                  </div>
                </div>

                <div style={styles.footerNote}>
                  <span style={styles.kbd}>Arrastra para mover</span>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: PC.slate, lineHeight: 1.35 }}>
                Selecciona un elemento en el lienzo para editarlo.
              </div>
            )}
          </div>

          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Info rápida</h4>
            <div style={{ fontSize: 12, color: PC.slate, lineHeight: 1.45 }}>
              <div>
                <b>Precisión:</b> posiciones en % (independiente del dispositivo).
              </div>
              <div>
                <b>Salida:</b> PDF a tamaño real en cm.
              </div>
              <div>
                <b>Meta:</b> que tu plotter no adivine, solo imprima.
              </div>
            </div>
          </div>
        </aside>

        {/* Lienzo */}
        <main style={styles.canvasCard}>
          <div style={styles.canvasTop}>
            <span style={styles.badge}>
              Preview: <b style={{ color: PC.ink }}>{previewW}px</b> × <b style={{ color: PC.ink }}>{previewH}px</b>
            </span>
            <span style={styles.badge}>
              Escala: <b style={{ color: PC.ink }}>{widthCm}</b>×<b style={{ color: PC.ink }}>{heightCm}</b> cm
            </span>
          </div>

          <div style={styles.stageWrap}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                opacity: 0.06,
                backgroundImage:
                  "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <Stage
              width={previewW}
              height={previewH}
              ref={stageRef}
              onMouseDown={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) setSelectedId(null);
              }}
              style={{ background: "#fff" }}
            >
              <Layer>
                <Rect x={0} y={0} width={previewW} height={previewH} fill="#ffffff" />

                {elements.map((el) => {
                  if (el.type === "text") {
                    const t = el as TextElement;
                    return (
                      <KText
                        key={t.id}
                        text={t.text}
                        x={t.xPct * previewW}
                        y={t.yPct * previewH}
                        fontSize={Math.max(10, t.fontSizePct * previewH)}
                        fill={t.colorHex}
                        draggable
                        onClick={() => setSelectedId(t.id)}
                        onTap={() => setSelectedId(t.id)}
                        onDragEnd={(ev) => {
                          updateEl(t.id, {
                            xPct: ev.target.x() / previewW,
                            yPct: ev.target.y() / previewH,
                          } as any);
                        }}
                        stroke={selectedId === t.id ? PC.blueSel : undefined}
                        strokeWidth={selectedId === t.id ? 1.25 : 0}
                      />
                    );
                  }

                  if (el.type === "image") {
                    const im = el as ImageElement;
                    return (
                      <KonvaImageComponent
                        key={im.id}
                        im={im}
                        previewW={previewW}
                        previewH={previewH}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        updateEl={updateEl}
                      />
                    );
                  }

                  return null;
                })}
              </Layer>
            </Stage>
          </div>

          <div style={styles.footerNote}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={styles.kbd}>Tip</span>
              Usa textos grandes y contraste alto. Tu lona se lee a 10 metros, no a 10 cm 😉
            </span>
            <span style={{ fontSize: 12, color: PC.slate }}>
              Selección: <b style={{ color: PC.ink }}>{selected ? selected.type : "—"}</b>
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}

function KonvaImageComponent({
  im,
  previewW,
  previewH,
  selectedId,
  setSelectedId,
  updateEl,
}: {
  im: ImageElement;
  previewW: number;
  previewH: number;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  updateEl: (id: string, patch: Partial<DesignElement>) => void;
}) {
  const imgObj = useHtmlImage(im.srcDataUrl);
  const w = (im.wPct ?? 0.2) * previewW;
  const h = (im.hPct ?? 0.2) * previewH;

  if (!imgObj) return null;

  return (
    <KImage
      image={imgObj}
      x={im.xPct * previewW}
      y={im.yPct * previewH}
      width={w}
      height={h}
      draggable
      onClick={() => setSelectedId(im.id)}
      onTap={() => setSelectedId(im.id)}
      onDragEnd={(ev) => {
        updateEl(im.id, {
          xPct: ev.target.x() / previewW,
          yPct: ev.target.y() / previewH,
        } as any);
      }}
      stroke={selectedId === im.id ? PC.blueSel : undefined}
      strokeWidth={selectedId === im.id ? 1.25 : 0}
    />
  );
}