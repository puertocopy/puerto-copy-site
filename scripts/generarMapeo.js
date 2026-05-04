const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const csvFilePath = path.join(process.cwd(), 'export_items.csv');
const jsonOutputPath = path.join(process.cwd(), 'data', 'loyverse_mapping.json');

const mapping = {};

// Asegurarse de que el directorio data existe
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    const handle = row.Handle;
    const ref = row.REF;
    const opcion1 = row['Opción 1 valor'];

    // 1. Mapeo para Carta (Usamos el variant de la primera escala 1-50 como base)
    if (handle === 'imp-t/carta-b/n' && opcion1 === '1-50') {
      mapping['Carta B/N'] = ref;
    }
    if (handle === 'imp-t/carta-a-color' && opcion1 === '1-50') {
      mapping['Carta Color'] = ref;
    }

    // 2. Mapeo para Planos (Impresión)
    if (handle.startsWith('imp-plano-')) {
      const esColor = handle.includes('color');
      const esFondo = handle.includes('img/fondo');
      
      const colorTag = esColor ? 'Color' : 'B/N';
      const coberturaTag = esFondo ? 'Fondo' : 'Lineas';
      
      // La opción 1 en planos es el tamaño (ej. 90x120)
      if (opcion1 && opcion1.includes('X')) {
        const key = `Plano ${colorTag} ${opcion1.toLowerCase()} ${coberturaTag}`;
        mapping[key] = ref;
      }
    }
    
    // 3. Otros servicios comunes
    if (handle === 'escaneo-t/estandar' && opcion1 === '1-30') {
      mapping['Escaneo Carta'] = ref;
    }
    if (handle === 'enmicado-t/carta') {
      mapping['Enmicado Carta'] = ref;
    }
  })
  .on('end', () => {
    fs.writeFileSync(jsonOutputPath, JSON.stringify(mapping, null, 2));
    console.log(`✅ Mapeo generado con éxito en: ${jsonOutputPath}`);
    console.log(`📊 Total de productos mapeados: ${Object.keys(mapping).length}`);
  });
