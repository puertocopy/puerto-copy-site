import { DesignElement, TextElement } from "./printUnits";

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "phone" | "number" | "price";
  bindsToElementId: string;
  placeholder?: string;
  defaultValue?: string;
  transform?: (value: string) => string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  suggestedWidthCm: number;
  suggestedHeightCm: number;
  elements: DesignElement[];
  fields: TemplateField[];
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "template_sevende",
    name: "Se Vende (Clásico)",
    suggestedWidthCm: 150,
    suggestedHeightCm: 100,
    elements: [
      {
        id: "txt_titulo",
        type: "text",
        text: "SE VENDE",
        xPct: 0.1,
        yPct: 0.1,
        fontSizePct: 0.25,
        colorHex: "#E10600",
        rotationDeg: 0,
        isLocked: false,
      } as TextElement,
      {
        id: "txt_tel",
        type: "text",
        text: "Tel: 322 000 0000",
        xPct: 0.1,
        yPct: 0.45,
        fontSizePct: 0.15,
        colorHex: "#000000",
        rotationDeg: 0,
        isLocked: false,
      } as TextElement,
      {
        id: "txt_detalles",
        type: "text",
        text: "Informes aquí",
        xPct: 0.1,
        yPct: 0.75,
        fontSizePct: 0.08,
        colorHex: "#000000",
        rotationDeg: 0,
        isLocked: false,
      } as TextElement,
    ],
    fields: [
      {
        key: "field_tel",
        label: "Teléfono de Contacto",
        type: "phone",
        bindsToElementId: "txt_tel",
        placeholder: "322 000 0000",
        defaultValue: "322 000 0000",
        transform: (val) => val ? `Tel: ${val}` : "Tel: ________"
      },
      {
        key: "field_detalles",
        label: "Detalles adicionales",
        type: "text",
        bindsToElementId: "txt_detalles",
        placeholder: "Informes aquí",
        defaultValue: "Informes aquí"
      }
    ]
  },
  {
    id: "template_noestacionarse",
    name: "No Estacionarse",
    suggestedWidthCm: 60,
    suggestedHeightCm: 40,
    elements: [
      {
        id: "txt_no",
        type: "text",
        text: "NO",
        xPct: 0.35,
        yPct: 0.05,
        fontSizePct: 0.35,
        colorHex: "#E10600",
        isLocked: true,
      } as TextElement,
      {
        id: "txt_est",
        type: "text",
        text: "ESTACIONARSE",
        xPct: 0.05,
        yPct: 0.4,
        fontSizePct: 0.25,
        colorHex: "#E10600",
        isLocked: true,
      } as TextElement,
      {
        id: "txt_aviso",
        type: "text",
        text: "SE USARÁ GRÚA",
        xPct: 0.15,
        yPct: 0.75,
        fontSizePct: 0.12,
        colorHex: "#000000",
        isLocked: false,
      } as TextElement,
    ],
    fields: [
      {
        key: "field_aviso",
        label: "Aviso de advertencia",
        type: "text",
        bindsToElementId: "txt_aviso",
        defaultValue: "SE USARÁ GRÚA"
      }
    ]
  },
  {
    id: "template_blanco",
    name: "Diseño Libre",
    suggestedWidthCm: 100,
    suggestedHeightCm: 100,
    elements: [],
    fields: []
  }
];
