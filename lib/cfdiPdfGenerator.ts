import { XMLParser } from 'fast-xml-parser';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

// ==========================================
// CATÁLOGOS SAT COMUNES PARA TEXTO LEGIBLE
// ==========================================
const FORMAS_PAGO: Record<string, string> = {
  '01': '01 - Efectivo',
  '02': '02 - Cheque nominativo',
  '03': '03 - Transferencia electrónica de fondos',
  '04': '04 - Tarjeta de crédito',
  '28': '28 - Tarjeta de débito',
  '99': '99 - Por definir',
};

const METODOS_PAGO: Record<string, string> = {
  PUE: 'PUE - Pago en una sola exhibición',
  PPD: 'PPD - Pago en parcialidades o diferido',
};

const REGIMENES_FISCALES: Record<string, string> = {
  '601': '601 - General de Ley Personas Morales',
  '603': '603 - Personas Morales con Fines no Lucrativos',
  '605': '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios',
  '606': '606 - Arrendamiento',
  '608': '608 - Demás ingresos',
  '612': '612 - Personas Físicas con Actividades Empresariales y Profesionales',
  '614': '614 - Ingresos por intereses',
  '616': '616 - Sin obligaciones fiscales',
  '621': '621 - Incorporación Fiscal',
  '625': '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
  '626': '626 - Régimen Simplificado de Confianza (RESICO)',
};

const USOS_CFDI: Record<string, string> = {
  G01: 'G01 - Adquisición de mercancías',
  G02: 'G02 - Devoluciones, descuentos o bonificaciones',
  G03: 'G03 - Gastos en general',
  I01: 'I01 - Construcciones',
  I02: 'I02 - Mobilario y equipo de oficina por inversiones',
  I04: 'I04 - Equipo de cómputo y accesorios',
  D01: 'D01 - Honorarios médicos, dentales y gastos hospitalarios',
  S01: 'S01 - Sin efectos fiscales',
  CP01: 'CP01 - Pagos',
};

// ==========================================
// CONVERTIDOR DE NÚMEROS A LETRAS
// ==========================================
function unidades(num: number): string {
  switch (num) {
    case 1: return 'UN';
    case 2: return 'DOS';
    case 3: return 'TRES';
    case 4: return 'CUATRO';
    case 5: return 'CINCO';
    case 6: return 'SEIS';
    case 7: return 'SIETE';
    case 8: return 'OCHO';
    case 9: return 'NUEVE';
    default: return '';
  }
}

function decenasY(strSin: string, numUnidades: number): string {
  if (numUnidades > 0) return `${strSin} Y ${unidades(numUnidades)}`;
  return strSin;
}

function decenas(num: number): string {
  const dec = Math.floor(num / 10);
  const uni = num - dec * 10;
  switch (dec) {
    case 1:
      switch (uni) {
        case 0: return 'DIEZ';
        case 1: return 'ONCE';
        case 2: return 'DOCE';
        case 3: return 'TRECE';
        case 4: return 'CATORCE';
        case 5: return 'QUINCE';
        default: return `DIECI${unidades(uni)}`;
      }
    case 2:
      if (uni === 0) return 'VEINTE';
      return `VEINTI${unidades(uni)}`;
    case 3: return decenasY('TREINTA', uni);
    case 4: return decenasY('CUARENTA', uni);
    case 5: return decenasY('CINCUENTA', uni);
    case 6: return decenasY('SESENTA', uni);
    case 7: return decenasY('SETENTA', uni);
    case 8: return decenasY('OCHENTA', uni);
    case 9: return decenasY('NOVENTA', uni);
    case 0: return unidades(uni);
    default: return '';
  }
}

function centenas(num: number): string {
  const cen = Math.floor(num / 100);
  const dec = num - cen * 100;
  switch (cen) {
    case 1:
      if (dec > 0) return `CIENTO ${decenas(dec)}`;
      return 'CIEN';
    case 2: return `DOSCIENTOS ${decenas(dec)}`;
    case 3: return `TRESCIENTOS ${decenas(dec)}`;
    case 4: return `CUATROCIENTOS ${decenas(dec)}`;
    case 5: return `QUINIENTOS ${decenas(dec)}`;
    case 6: return `SEISCIENTOS ${decenas(dec)}`;
    case 7: return `SETECIENTOS ${decenas(dec)}`;
    case 8: return `OCHOCIENTOS ${decenas(dec)}`;
    case 9: return `NOVECIENTOS ${decenas(dec)}`;
    default: return decenas(dec);
  }
}

function seccion(num: number, divisor: number, strSingular: string, strPlural: string): string {
  const cientos = Math.floor(num / divisor);
  const resto = num - cientos * divisor;
  let letras = '';
  if (cientos > 0) {
    if (cientos > 1) {
      letras = `${centenas(cientos)} ${strPlural}`;
    } else {
      letras = `${strSingular}`;
    }
  }
  if (resto > 0) {
    letras = `${letras} ${centenas(resto)}`;
  }
  return letras.trim();
}

function miles(num: number): string {
  const divisor = 1000;
  const cientos = Math.floor(num / divisor);
  const resto = num - cientos * divisor;
  let strMiles = '';
  if (cientos === 1) strMiles = 'MIL';
  else if (cientos > 1) strMiles = `${centenas(cientos)} MIL`;
  const strCentenas = centenas(resto);
  if (strMiles === '') return strCentenas;
  return `${strMiles} ${strCentenas}`.trim();
}

function millones(num: number): string {
  const divisor = 1000000;
  const cientos = Math.floor(num / divisor);
  const resto = num - cientos * divisor;
  let strMillones = '';
  if (cientos === 1) strMillones = 'UN MILLÓN';
  else if (cientos > 1) strMillones = `${centenas(cientos)} MILLONES`;
  const strMiles = miles(resto);
  if (strMillones === '') return strMiles;
  return `${strMillones} ${strMiles}`.trim();
}

export function numeroALetras(monto: number | string, moneda = 'MXN'): string {
  const num = typeof monto === 'number' ? monto : parseFloat(monto) || 0;
  const enteros = Math.floor(num);
  const centavos = Math.round((num - enteros) * 100);
  const centavosStr = String(centavos).padStart(2, '0') + '/100';

  let letrasEnteros = '';
  if (enteros === 0) letrasEnteros = 'CERO';
  else letrasEnteros = millones(enteros);

  const nombreMoneda = moneda === 'USD' ? 'DÓLARES' : 'PESOS';
  const sufijoMoneda = moneda === 'USD' ? 'USD' : 'M.N.';

  return `${letrasEnteros} ${nombreMoneda} ${centavosStr} ${sufijoMoneda}`.toUpperCase().trim();
}

// ==========================================
// PARSEADOR DE CFDI 4.0 DESDE XML
// ==========================================
export interface ParsedCfdi {
  version: string;
  serie: string;
  folio: string;
  fecha: string;
  formaPago: string;
  formaPagoDesc: string;
  metodoPago: string;
  metodoPagoDesc: string;
  lugarExpedicion: string;
  subtotal: number;
  descuento: number;
  total: number;
  moneda: string;
  tipoDeComprobante: string;
  noCertificado: string;
  selloEmisor: string;
  emisor: {
    rfc: string;
    nombre: string;
    regimenFiscal: string;
    regimenFiscalDesc: string;
  };
  receptor: {
    rfc: string;
    nombre: string;
    domicilioFiscalReceptor: string;
    regimenFiscalReceptor: string;
    regimenFiscalReceptorDesc: string;
    usoCfdi: string;
    usoCfdiDesc: string;
  };
  conceptos: Array<{
    claveProdServ: string;
    noIdentificacion: string;
    cantidad: number;
    claveUnidad: string;
    unidad: string;
    descripcion: string;
    valorUnitario: number;
    importe: number;
    descuento: number;
    impuestos: string;
  }>;
  impuestos: {
    totalTrasladados: number;
    totalRetenidos: number;
    traslados: Array<{
      base: number;
      impuesto: string;
      tipoFactor: string;
      tasaOCuota: number;
      importe: number;
    }>;
    retenciones: Array<{
      impuesto: string;
      importe: number;
    }>;
  };
  timbreFiscal: {
    version: string;
    uuid: string;
    fechaTimbrado: string;
    rfcProvCertif: string;
    selloCfd: string;
    noCertificadoSat: string;
    selloSat: string;
  };
  cadenaOriginal: string;
  qrUrl: string;
}

export function parseCfdiXml(xmlContent: string): ParsedCfdi {
  if (!xmlContent || typeof xmlContent !== 'string') {
    throw new Error('El contenido XML está vacío o no es válido');
  }

  // Si viene encapsulado en JSON como { Content: "base64" }
  let cleanXml = xmlContent.trim();
  if (cleanXml.startsWith('{')) {
    try {
      const parsedJson = JSON.parse(cleanXml);
      if (parsedJson.Content || parsedJson.content) {
        cleanXml = Buffer.from(parsedJson.Content || parsedJson.content, 'base64').toString('utf8');
      }
    } catch (_) {}
  } else if (!cleanXml.startsWith('<') && /^[A-Za-z0-9+/=]+$/.test(cleanXml)) {
    // Si viene en base64 puro
    try {
      cleanXml = Buffer.from(cleanXml, 'base64').toString('utf8');
    } catch (_) {}
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
  });

  const parsed = parser.parse(cleanXml);
  const comp = parsed['cfdi:Comprobante'] || parsed['Comprobante'];
  if (!comp) {
    throw new Error('El documento XML no contiene un nodo cfdi:Comprobante válido');
  }

  const emisorNode = comp['cfdi:Emisor'] || comp['Emisor'] || {};
  const receptorNode = comp['cfdi:Receptor'] || comp['Receptor'] || {};
  const complementoNode = comp['cfdi:Complemento'] || comp['Complemento'] || {};
  const tfdNode = complementoNode['tfd:TimbreFiscalDigital'] || complementoNode['TimbreFiscalDigital'] || {};

  // Conceptos
  const conceptosContainer = comp['cfdi:Conceptos'] || comp['Conceptos'] || {};
  const conceptosRaw = conceptosContainer['cfdi:Concepto'] || conceptosContainer['Concepto'] || [];
  const conceptosList = Array.isArray(conceptosRaw) ? conceptosRaw : [conceptosRaw].filter(Boolean);

  const conceptos = conceptosList.map((c: any) => {
    let impDesc = '';
    const impNode = c['cfdi:Impuestos'] || c['Impuestos'];
    if (impNode) {
      const trasladosNode = impNode['cfdi:Traslados'] || impNode['Traslados'];
      const trasladosRaw = trasladosNode ? (trasladosNode['cfdi:Traslado'] || trasladosNode['Traslado']) : null;
      const tList = Array.isArray(trasladosRaw) ? trasladosRaw : [trasladosRaw].filter(Boolean);
      impDesc = tList.map((t: any) => `IVA ${Number(t['@_TasaOCuota'] || 0.16) * 100}%`).join(', ');
    }

    return {
      claveProdServ: String(c['@_ClaveProdServ'] || ''),
      noIdentificacion: String(c['@_NoIdentificacion'] || ''),
      cantidad: parseFloat(c['@_Cantidad'] || '1'),
      claveUnidad: String(c['@_ClaveUnidad'] || 'E48'),
      unidad: String(c['@_Unidad'] || 'Servicio'),
      descripcion: String(c['@_Descripcion'] || ''),
      valorUnitario: parseFloat(c['@_ValorUnitario'] || '0'),
      importe: parseFloat(c['@_Importe'] || '0'),
      descuento: parseFloat(c['@_Descuento'] || '0'),
      impuestos: impDesc,
    };
  });

  // Impuestos globales
  const impuestosNode = comp['cfdi:Impuestos'] || comp['Impuestos'] || {};
  const trasladosContainer = impuestosNode['cfdi:Traslados'] || impuestosNode['Traslados'] || {};
  const trasladosRaw = trasladosContainer['cfdi:Traslado'] || trasladosContainer['Traslado'] || [];
  const trasladosList = Array.isArray(trasladosRaw) ? trasladosRaw : [trasladosRaw].filter(Boolean);

  const traslados = trasladosList.map((t: any) => ({
    base: parseFloat(t['@_Base'] || '0'),
    impuesto: String(t['@_Impuesto'] || '002'),
    tipoFactor: String(t['@_TipoFactor'] || 'Tasa'),
    tasaOCuota: parseFloat(t['@_TasaOCuota'] || '0.16'),
    importe: parseFloat(t['@_Importe'] || '0'),
  }));

  const retencionesContainer = impuestosNode['cfdi:Retenciones'] || impuestosNode['Retenciones'] || {};
  const retencionesRaw = retencionesContainer['cfdi:Retencion'] || retencionesContainer['Retencion'] || [];
  const retencionesList = Array.isArray(retencionesRaw) ? retencionesRaw : [retencionesRaw].filter(Boolean);

  const retenciones = retencionesList.map((r: any) => ({
    impuesto: String(r['@_Impuesto'] || ''),
    importe: parseFloat(r['@_Importe'] || '0'),
  }));

  // Metadatos
  const formaPagoCode = String(comp['@_FormaPago'] || '01');
  const metodoPagoCode = String(comp['@_MetodoPago'] || 'PUE');
  const regimenEmisorCode = String(emisorNode['@_RegimenFiscal'] || '626');
  const regimenReceptorCode = String(receptorNode['@_RegimenFiscalReceptor'] || '616');
  const usoCfdiCode = String(receptorNode['@_UsoCFDI'] || 'G03');

  const timbre = {
    version: String(tfdNode['@_Version'] || '1.1'),
    uuid: String(tfdNode['@_UUID'] || ''),
    fechaTimbrado: String(tfdNode['@_FechaTimbrado'] || ''),
    rfcProvCertif: String(tfdNode['@_RfcProvCertif'] || ''),
    selloCfd: String(tfdNode['@_SelloCFD'] || ''),
    noCertificadoSat: String(tfdNode['@_NoCertificadoSAT'] || ''),
    selloSat: String(tfdNode['@_SelloSAT'] || ''),
  };

  const cadenaOriginal = `||${timbre.version}|${timbre.uuid}|${timbre.fechaTimbrado}|${timbre.rfcProvCertif}|${timbre.selloCfd}|${timbre.noCertificadoSat}||`;

  const totalNum = parseFloat(comp['@_Total'] || '0');
  const totalFormatted = totalNum.toFixed(6);
  const selloCfdShort = timbre.selloCfd.slice(-8);
  const emisorRfc = String(emisorNode['@_Rfc'] || '');
  const receptorRfc = String(receptorNode['@_Rfc'] || '');

  const qrUrl = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${timbre.uuid}&re=${emisorRfc}&rr=${receptorRfc}&tt=${totalFormatted}&fe=${selloCfdShort}`;

  return {
    version: String(comp['@_Version'] || '4.0'),
    serie: String(comp['@_Serie'] || 'A'),
    folio: String(comp['@_Folio'] || ''),
    fecha: String(comp['@_Fecha'] || ''),
    formaPago: formaPagoCode,
    formaPagoDesc: FORMAS_PAGO[formaPagoCode] || formaPagoCode,
    metodoPago: metodoPagoCode,
    metodoPagoDesc: METODOS_PAGO[metodoPagoCode] || metodoPagoCode,
    lugarExpedicion: String(comp['@_LugarExpedicion'] || '48315'),
    subtotal: parseFloat(comp['@_SubTotal'] || '0'),
    descuento: parseFloat(comp['@_Descuento'] || '0'),
    total: totalNum,
    moneda: String(comp['@_Moneda'] || 'MXN'),
    tipoDeComprobante: String(comp['@_TipoDeComprobante'] || 'I (Ingreso)'),
    noCertificado: String(comp['@_NoCertificado'] || ''),
    selloEmisor: String(comp['@_Sello'] || ''),
    emisor: {
      rfc: emisorRfc,
      nombre: String(emisorNode['@_Nombre'] || 'PUERTO COPY'),
      regimenFiscal: regimenEmisorCode,
      regimenFiscalDesc: REGIMENES_FISCALES[regimenEmisorCode] || regimenEmisorCode,
    },
    receptor: {
      rfc: receptorRfc,
      nombre: String(receptorNode['@_Nombre'] || ''),
      domicilioFiscalReceptor: String(receptorNode['@_DomicilioFiscalReceptor'] || ''),
      regimenFiscalReceptor: regimenReceptorCode,
      regimenFiscalReceptorDesc: REGIMENES_FISCALES[regimenReceptorCode] || regimenReceptorCode,
      usoCfdi: usoCfdiCode,
      usoCfdiDesc: USOS_CFDI[usoCfdiCode] || usoCfdiCode,
    },
    conceptos,
    impuestos: {
      totalTrasladados: parseFloat(impuestosNode['@_TotalImpuestosTrasladados'] || '0'),
      totalRetenidos: parseFloat(impuestosNode['@_TotalImpuestosRetenidos'] || '0'),
      traslados,
      retenciones,
    },
    timbreFiscal: timbre,
    cadenaOriginal,
    qrUrl,
  };
}

// ==========================================
// GENERADOR DE REPRESENTACIÓN IMPRESA EN PDF
// ==========================================
export async function generateCfdiPdf(xmlContent: string): Promise<Buffer> {
  const data = parseCfdiXml(xmlContent);

  // Inicialización de jsPDF en formato Carta
  const doc = new jsPDF({
    format: 'letter',
    unit: 'mm',
    compress: true,
  });

  const navy = '#002D56';
  const darkGray = '#1F2937';
  const lightGrayBg = '#F8FAFC';
  const borderCol = '#CBD5E1';
  const accentBlue = '#0B63B2';

  // 1. Cargar Logo de Puerto Copy
  const logoPath = path.join(process.cwd(), 'public/logopngazul.png');
  if (fs.existsSync(logoPath)) {
    try {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      doc.addImage(logoBase64, 'PNG', 14, 10, 26, 26, 'LOGO', 'FAST');
    } catch (_) {}
  }

  // 2. Encabezado Emisor (Izquierda)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(navy);
  doc.text('PUERTO COPY', 44, 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkGray);
  doc.text(`Razón Social: ${data.emisor.nombre}`, 44, 19.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(darkGray);
  doc.text(`RFC: ${data.emisor.rfc}`, 44, 23.5);
  doc.text(`Régimen Fiscal: ${data.emisor.regimenFiscalDesc}`, 44, 27.5);
  doc.text(`Lugar de Expedición: C.P. ${data.lugarExpedicion}`, 44, 31.5);
  doc.text('Centro de Copiado e Impresión Digital | Puerto Vallarta, Jalisco', 44, 35.5);

  // 3. Cuadro de Factura y Folio Fiscal (Derecha)
  doc.setFillColor(navy);
  doc.roundedRect(135, 10, 67, 7, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor('#FFFFFF');
  doc.text(`FACTURA ${data.serie ? data.serie + '-' : ''}${data.folio}`, 168.5, 15, { align: 'center' });

  doc.setDrawColor(borderCol);
  doc.setFillColor(lightGrayBg);
  doc.roundedRect(135, 18, 67, 24, 1, 1, 'FD');

  doc.setFontSize(7);
  doc.setTextColor(navy);
  doc.text('FOLIO FISCAL (UUID):', 137, 22);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray);
  doc.setFontSize(6.5);
  doc.text(data.timbreFiscal.uuid || 'N/A', 137, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(navy);
  doc.text('NO. DE SERIE DEL CSD:', 137, 31);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray);
  doc.text(data.noCertificado, 172, 31);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navy);
  doc.text('FECHA Y HORA DE EMISIÓN:', 137, 35);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray);
  doc.text(data.fecha, 137, 39);

  // 4. Bloques de Información (Receptor y Comprobante)
  let yPos = 46;

  // Receptor
  doc.setFillColor(accentBlue);
  doc.roundedRect(14, yPos, 115, 5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor('#FFFFFF');
  doc.text('DATOS DEL RECEPTOR / CLIENTE', 17, yPos + 3.5);

  doc.setDrawColor(borderCol);
  doc.setFillColor('#FFFFFF');
  doc.roundedRect(14, yPos + 5.5, 115, 23, 1, 1, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(darkGray);
  doc.text('Razón Social:', 16, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(data.receptor.nombre, 85), 36, yPos + 10);

  doc.setFont('helvetica', 'bold');
  doc.text('RFC:', 16, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(data.receptor.rfc, 36, yPos + 15);

  doc.setFont('helvetica', 'bold');
  doc.text('Domicilio / C.P.:', 16, yPos + 19);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.receptor.domicilioFiscalReceptor || 'N/A'}`, 40, yPos + 19);

  doc.setFont('helvetica', 'bold');
  doc.text('Régimen Fiscal:', 16, yPos + 23);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(data.receptor.regimenFiscalReceptorDesc, 75), 40, yPos + 23);

  doc.setFont('helvetica', 'bold');
  doc.text('Uso de CFDI:', 16, yPos + 27);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(data.receptor.usoCfdiDesc, 75), 36, yPos + 27);

  // Comprobante
  doc.setFillColor(accentBlue);
  doc.roundedRect(133, yPos, 69, 5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor('#FFFFFF');
  doc.text('DATOS DEL COMPROBANTE', 136, yPos + 3.5);

  doc.setDrawColor(borderCol);
  doc.roundedRect(133, yPos + 5.5, 69, 23, 1, 1, 'D');

  doc.setFontSize(7);
  doc.setTextColor(darkGray);

  doc.setFont('helvetica', 'bold');
  doc.text('Efecto:', 135, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.tipoDeComprobante, 155, yPos + 10);

  doc.setFont('helvetica', 'bold');
  doc.text('Moneda:', 135, yPos + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.moneda} (Tipo cambio: 1.00)`, 155, yPos + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Forma de Pago:', 135, yPos + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(data.formaPagoDesc, 45), 135, yPos + 22);

  doc.setFont('helvetica', 'bold');
  doc.text('Método de Pago:', 135, yPos + 26);
  doc.setFont('helvetica', 'normal');
  doc.text(data.metodoPagoDesc, 135, yPos + 27.5);

  yPos += 37;

  // 5. Tabla de Conceptos
  const tableData = data.conceptos.map((c) => [
    c.claveProdServ,
    c.noIdentificacion || '-',
    c.cantidad.toFixed(2),
    c.claveUnidad,
    c.descripcion,
    `$${c.valorUnitario.toFixed(2)}`,
    c.impuestos || 'IVA 16%',
    `$${c.importe.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Clave SAT', 'No. Id', 'Cant', 'Unidad', 'Descripción', 'P. Unitario', 'Impuesto', 'Importe']],
    body: tableData,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    headStyles: {
      fillColor: [0, 45, 86],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [31, 41, 55],
    },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 20, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 30;
  yPos = finalY + 4;

  // 6. Totales y Monto con Letra
  doc.setFillColor(lightGrayBg);
  doc.setDrawColor(borderCol);
  doc.roundedRect(14, yPos, 115, 18, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(navy);
  doc.text('IMPORTE CON LETRA:', 16, yPos + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(darkGray);
  const textoLetras = numeroALetras(data.total, data.moneda);
  doc.text(doc.splitTextToSize(textoLetras, 110), 16, yPos + 10);

  // Cuadro de Totales (Derecha)
  let totY = yPos + 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(darkGray);

  doc.text('Subtotal:', 140, totY);
  doc.setFont('helvetica', 'normal');
  doc.text(`$${data.subtotal.toFixed(2)}`, 201, totY, { align: 'right' });

  if (data.descuento > 0) {
    totY += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Descuento:', 140, totY);
    doc.setFont('helvetica', 'normal');
    doc.text(`-$${data.descuento.toFixed(2)}`, 201, totY, { align: 'right' });
  }

  if (data.impuestos.totalTrasladados > 0) {
    totY += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('IVA Trasladado (16%):', 140, totY);
    doc.setFont('helvetica', 'normal');
    doc.text(`$${data.impuestos.totalTrasladados.toFixed(2)}`, 201, totY, { align: 'right' });
  }

  if (data.impuestos.totalRetenidos > 0) {
    totY += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Impuestos Retenidos:', 140, totY);
    doc.setFont('helvetica', 'normal');
    doc.text(`-$${data.impuestos.totalRetenidos.toFixed(2)}`, 201, totY, { align: 'right' });
  }

  totY += 5;
  doc.setFillColor(navy);
  doc.roundedRect(138, totY - 3.5, 64, 6, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor('#FFFFFF');
  doc.text('TOTAL:', 141, totY);
  doc.text(`$${data.total.toFixed(2)} ${data.moneda}`, 200, totY, { align: 'right' });

  yPos = Math.max(yPos + 22, totY + 7);

  // 7. Bloque Fiscal SAT (Anexo 20 con Código QR)
  try {
    const qrDataUrl = await QRCode.toDataURL(data.qrUrl, { margin: 1, width: 250 });
    doc.addImage(qrDataUrl, 'PNG', 14, yPos, 34, 34);
  } catch (qrErr) {
    console.error('Error generando QR code:', qrErr);
  }

  const fiscalX = 52;
  let fiscalY = yPos + 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(navy);
  doc.text('No. Serie Certificado SAT:', fiscalX, fiscalY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray);
  doc.text(data.timbreFiscal.noCertificadoSat || 'N/A', fiscalX + 32, fiscalY);

  fiscalY += 3.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navy);
  doc.text('Fecha y Hora de Certificación:', fiscalX, fiscalY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray);
  doc.text(data.timbreFiscal.fechaTimbrado || 'N/A', fiscalX + 37, fiscalY);

  fiscalY += 3.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navy);
  doc.text('RFC Proveedor de Certificación:', fiscalX, fiscalY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray);
  doc.text(data.timbreFiscal.rfcProvCertif || 'N/A', fiscalX + 38, fiscalY);

  fiscalY += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(navy);
  doc.text('Cadena Original del Complemento de Certificación Digital del SAT:', fiscalX, fiscalY);
  fiscalY += 2.5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(darkGray);
  const cadenaSplit = doc.splitTextToSize(data.cadenaOriginal, 150);
  doc.text(cadenaSplit, fiscalX, fiscalY);
  fiscalY += (cadenaSplit.length * 2) + 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(navy);
  doc.text('Sello Digital del Emisor (CFD):', fiscalX, fiscalY);
  fiscalY += 2.5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(darkGray);
  const selloCfdSplit = doc.splitTextToSize(data.timbreFiscal.selloCfd, 150);
  doc.text(selloCfdSplit, fiscalX, fiscalY);
  fiscalY += (selloCfdSplit.length * 2) + 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(navy);
  doc.text('Sello Digital del SAT:', fiscalX, fiscalY);
  fiscalY += 2.5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(darkGray);
  const selloSatSplit = doc.splitTextToSize(data.timbreFiscal.selloSat, 150);
  doc.text(selloSatSplit, fiscalX, fiscalY);

  // 8. Pie de Página Obligatorio del Anexo 20
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(borderCol);
  doc.line(14, pageHeight - 10, 202, pageHeight - 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(navy);
  doc.text('ESTE DOCUMENTO ES UNA REPRESENTACIÓN IMPRESA DE UN CFDI (VERSIÓN 4.0)', 108, pageHeight - 6.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(darkGray);
  doc.text('Puerto Copy - Centro de Copiado e Impresión Digital | facturacion@puertocopy.com', 108, pageHeight - 3.5, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}

// ==========================================
// GENERADOR DE REPRESENTACIÓN IMPRESA EN HTML
// ==========================================
export async function generateCfdiHtml(xmlContent: string): Promise<string> {
  const data = parseCfdiXml(xmlContent);
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(data.qrUrl, { margin: 1, width: 220 });
  } catch (_) {}

  const logoBase64 = '/logopngazul.png';

  const conceptosHtml = data.conceptos
    .map(
      (c) => `
      <tr>
        <td style="text-align:center; padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">${c.claveProdServ}</td>
        <td style="text-align:center; padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">${c.noIdentificacion || '-'}</td>
        <td style="text-align:center; padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">${c.cantidad.toFixed(2)}</td>
        <td style="text-align:center; padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">${c.claveUnidad}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">${c.descripcion}</td>
        <td style="text-align:right; padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">$${c.valorUnitario.toFixed(2)}</td>
        <td style="text-align:center; padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">${c.impuestos || 'IVA 16%'}</td>
        <td style="text-align:right; font-weight:600; padding: 6px 8px; border-bottom: 1px solid #E2E8F0;">$${c.importe.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${data.serie ? data.serie + '-' : ''}${data.folio}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; color: #1E293B; background: #FFF; font-size: 11px; line-height: 1.4; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 2px solid #002D56; padding-bottom: 12px; }
    .emisor { max-width: 55%; }
    .emisor h1 { font-size: 16px; margin: 0 0 4px 0; color: #002D56; font-weight: 700; }
    .badge-box { background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px 12px; text-align: right; min-width: 240px; }
    .badge-title { background: #002D56; color: #FFF; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 13px; text-align: center; margin-bottom: 6px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .card { border: 1px solid #CBD5E1; border-radius: 6px; overflow: hidden; }
    .card-header { background: #0B63B2; color: #FFF; padding: 4px 10px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
    .card-body { padding: 8px 10px; font-size: 10.5px; }
    .table-container { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .table-container th { background: #002D56; color: #FFF; padding: 6px 8px; font-size: 10px; text-align: left; }
    .totales-grid { display: flex; justify-content: space-between; margin-bottom: 16px; gap: 16px; }
    .letras-box { flex: 1; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px 12px; }
    .totales-box { width: 260px; font-size: 11px; }
    .total-row { display: flex; justify-content: space-between; padding: 3px 0; }
    .total-final { background: #002D56; color: #FFF; padding: 6px 10px; border-radius: 4px; font-weight: bold; font-size: 13px; margin-top: 6px; }
    .sat-block { display: flex; gap: 16px; border: 1px solid #CBD5E1; border-radius: 6px; padding: 10px; background: #F8FAFC; font-size: 9px; }
    .sat-text { flex: 1; word-break: break-all; font-family: monospace; font-size: 8px; }
    .footer { text-align: center; margin-top: 16px; padding-top: 8px; border-top: 1px solid #E2E8F0; font-size: 9px; color: #64748B; font-weight: 600; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; gap: 12px; align-items: center;">
      <img src="${logoBase64}" alt="Puerto Copy" style="height: 60px; width: auto;" onerror="this.style.display='none'">
      <div class="emisor">
        <h1>PUERTO COPY</h1>
        <div><strong>Razón Social:</strong> ${data.emisor.nombre}</div>
        <div><strong>RFC:</strong> ${data.emisor.rfc}</div>
        <div><strong>Régimen Fiscal:</strong> ${data.emisor.regimenFiscalDesc}</div>
        <div><strong>Lugar de Expedición:</strong> C.P. ${data.lugarExpedicion}</div>
      </div>
    </div>
    <div class="badge-box">
      <div class="badge-title">FACTURA ${data.serie ? data.serie + '-' : ''}${data.folio}</div>
      <div><strong>Folio Fiscal:</strong> <span style="font-size: 9.5px;">${data.timbreFiscal.uuid || 'N/A'}</span></div>
      <div><strong>No. Certificado CSD:</strong> ${data.noCertificado}</div>
      <div><strong>Fecha Emisión:</strong> ${data.fecha}</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-header">Receptor / Cliente</div>
      <div class="card-body">
        <div><strong>Razón Social:</strong> ${data.receptor.nombre}</div>
        <div><strong>RFC:</strong> ${data.receptor.rfc}</div>
        <div><strong>Domicilio Fiscal (CP):</strong> ${data.receptor.domicilioFiscalReceptor || 'N/A'}</div>
        <div><strong>Régimen Fiscal:</strong> ${data.receptor.regimenFiscalReceptorDesc}</div>
        <div><strong>Uso de CFDI:</strong> ${data.receptor.usoCfdiDesc}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header">Comprobante</div>
      <div class="card-body">
        <div><strong>Tipo de Comprobante:</strong> ${data.tipoDeComprobante}</div>
        <div><strong>Moneda:</strong> ${data.moneda} (Tipo de cambio: 1.00)</div>
        <div><strong>Forma de Pago:</strong> ${data.formaPagoDesc}</div>
        <div><strong>Método de Pago:</strong> ${data.metodoPagoDesc}</div>
      </div>
    </div>
  </div>

  <table class="table-container">
    <thead>
      <tr>
        <th style="text-align:center;">Clave SAT</th>
        <th style="text-align:center;">No. Id</th>
        <th style="text-align:center;">Cant</th>
        <th style="text-align:center;">Unidad</th>
        <th>Descripción</th>
        <th style="text-align:right;">P. Unitario</th>
        <th style="text-align:center;">Impuesto</th>
        <th style="text-align:right;">Importe</th>
      </tr>
    </thead>
    <tbody>
      ${conceptosHtml}
    </tbody>
  </table>

  <div class="totales-grid">
    <div class="letras-box">
      <div style="font-weight: bold; color: #002D56; margin-bottom: 4px;">IMPORTE CON LETRA</div>
      <div>${numeroALetras(data.total, data.moneda)}</div>
    </div>
    <div class="totales-box">
      <div class="total-row"><span>Subtotal:</span><span>$${data.subtotal.toFixed(2)}</span></div>
      ${data.descuento > 0 ? `<div class="total-row"><span>Descuento:</span><span>-$${data.descuento.toFixed(2)}</span></div>` : ''}
      ${data.impuestos.totalTrasladados > 0 ? `<div class="total-row"><span>IVA 16%:</span><span>$${data.impuestos.totalTrasladados.toFixed(2)}</span></div>` : ''}
      ${data.impuestos.totalRetenidos > 0 ? `<div class="total-row"><span>Retenciones:</span><span>-$${data.impuestos.totalRetenidos.toFixed(2)}</span></div>` : ''}
      <div class="total-row total-final"><span>TOTAL:</span><span>$${data.total.toFixed(2)} ${data.moneda}</span></div>
    </div>
  </div>

  <div class="sat-block">
    ${qrDataUrl ? `<div><img src="${qrDataUrl}" alt="QR SAT" style="width: 120px; height: 120px;"></div>` : ''}
    <div class="sat-text">
      <div><strong>No. Serie Certificado SAT:</strong> ${data.timbreFiscal.noCertificadoSat || 'N/A'}</div>
      <div><strong>Fecha de Certificación:</strong> ${data.timbreFiscal.fechaTimbrado || 'N/A'}</div>
      <div><strong>RFC Prov. Certificación:</strong> ${data.timbreFiscal.rfcProvCertif || 'N/A'}</div>
      <div style="margin-top: 4px;"><strong>Cadena Original del Timbre:</strong><br>${data.cadenaOriginal}</div>
      <div style="margin-top: 4px;"><strong>Sello Digital del Emisor:</strong><br>${data.timbreFiscal.selloCfd}</div>
      <div style="margin-top: 4px;"><strong>Sello Digital del SAT:</strong><br>${data.timbreFiscal.selloSat}</div>
    </div>
  </div>

  <div class="footer">
    ESTE DOCUMENTO ES UNA REPRESENTACIÓN IMPRESA DE UN CFDI (VERSIÓN 4.0)<br>
    Puerto Copy - Centro de Copiado e Impresión Digital | Puerto Vallarta, Jalisco
  </div>
</body>
</html>`;
}

