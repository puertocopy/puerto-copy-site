// lib/exportPdf.ts
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { cmToPt, DesignElement, TextElement, ImageElement } from "./printUnits";

function hexToRgb01(hex: string) {
  const clean = hex.replace("#", "").trim();
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return { r, g, b };
}

async function dataUrlToUint8Array(dataUrl: string) {
  const res = await fetch(dataUrl);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

export async function exportDesignToPdf(params: {
  widthCm: number;
  heightCm: number;
  elements: DesignElement[];
  // opcional: pasa una fuente TTF como ArrayBuffer para que el texto quede más pro
  // ejemplo: /public/fonts/Inter-Regular.ttf
  fontUrl?: string;
}) {
  const { widthCm, heightCm, elements, fontUrl } = params;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const pageW = cmToPt(widthCm);
  const pageH = cmToPt(heightCm);

  const page = pdfDoc.addPage([pageW, pageH]);

  // Fuente: si pasas TTF, mejor. Si no, Standard.
  let customFont: any = null;
  if (fontUrl) {
    const fontBytes = await fetch(fontUrl).then((r) => r.arrayBuffer());
    customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
  }
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Dibuja en orden (el array ya define z-index)
  for (const el of elements) {
    if (el.type === "text") {
      const t = el as TextElement;
      const x = t.xPct * pageW;
      // pdf-lib usa origen abajo-izq; tu editor seguro usa arriba-izq
      const yTop = t.yPct * pageH;
      const fontSize = Math.max(1, t.fontSizePct * pageH);
      const { r, g, b } = hexToRgb01(t.colorHex);

      // Convertimos yPct (top) a y (bottom) para que “caiga” donde lo soltaste
      const y = pageH - yTop - fontSize;

      const font = customFont ?? helvetica;

      page.drawText(t.text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        rotate: degrees(t.rotationDeg ?? 0),
      });
    }

    if (el.type === "image") {
      const im = el as ImageElement;

      const bytes = await dataUrlToUint8Array(im.srcDataUrl);

      // soporte png/jpg
      const isPng = im.srcDataUrl.startsWith("data:image/png");
      const embed = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);

      const x = im.xPct * pageW;
      const yTop = im.yPct * pageH;
      const w = (im.wPct ?? 0.2) * pageW;
      const h = (im.hPct ?? 0.2) * pageH;

      const y = pageH - yTop - h;

      page.drawImage(embed, {
        x,
        y,
        width: w,
        height: h,
        rotate: degrees(im.rotationDeg ?? 0),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}
