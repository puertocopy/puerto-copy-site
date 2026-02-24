// lib/printUnits.ts
export const cmToPt = (cm: number) => (cm * 72) / 2.54; // 1in=72pt, 1in=2.54cm

export type ElementType = "text" | "image";

export type DesignElementBase = {
  id: string;
  type: ElementType;
  // posiciones y tamaños en porcentaje (0..1)
  xPct: number;
  yPct: number;
  wPct?: number; // para image
  hPct?: number; // para image
  rotationDeg?: number;
};

export type TextElement = DesignElementBase & {
  type: "text";
  text: string;
  fontSizePct: number; // tamaño de fuente relativo al alto del lienzo (0..1)
  colorHex: string; // "#RRGGBB"
  fontFamily?: "Inter" | "Helvetica"; // simplificado
  align?: "left" | "center" | "right";
};

export type ImageElement = DesignElementBase & {
  type: "image";
  srcDataUrl: string; // data:image/png;base64,...
};

export type DesignElement = TextElement | ImageElement;
