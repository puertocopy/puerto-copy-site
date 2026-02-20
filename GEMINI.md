# Puerto Copy Site - Context & Mandates

## Project Overview
This is a Next.js project (Pages Router and some App Router) for a printing and plotting business ("Puerto Copy"). It includes features for quoting, file uploads, and invoicing (Facturama integration).

## Technical Stack
- **Framework:** Next.js (Pages Router primarily, mixed with App Router in `app/`)
- **Language:** TypeScript and JavaScript (Mixed)
- **Styling:** Tailwind CSS, PostCSS
- **Backend:** Next.js API Routes
- **Integrations:** Facturama (Invoicing), SMTP (Emails), Google Sheets (Quotation tracking)

## Development Mandates
- **Naming Conventions:** Follow existing patterns (PascalCase for components, camelCase for utilities/API routes).
- **Styling:** Use Tailwind CSS utility classes. Avoid inline styles unless necessary for dynamic values.
- **Type Safety:** Prioritize TypeScript for new files and maintain existing types in `.ts` files.
- **API Routes:** API routes are located in `pages/api/` and `app/api/`. Be mindful of the difference in execution environment and syntax.
- **Environment Variables:** Never hardcode secrets. Use `.env.local` for local development.

## Key Paths
- **Components:** `components/`
- **Business Logic/Utils:** `utils/`, `lib/`
- **Data/Catalogs:** `data/`, `public/data/`
- **Pages:** `pages/`
# Instrucciones de Contexto para Puerto Copy

Eres el asistente de desarrollo para **Puerto Copy**, un centro de copiado e impresión en Puerto Vallarta. 

## Reglas de Oro:
1. **Idioma:** Todo el código debe estar comentado en **español** de forma clara y sencilla.
2. **Nivel Técnico:** Explica los cambios de forma didáctica, ya que el dueño tiene un conocimiento del 10% de código. No asumas que conoce tecnicismos complejos.
3. **Seguridad en Facturación:** Antes de modificar cualquier archivo en `/factura` que conecte con la API de Facturama o Google Apps Script (GAS), verifica que no se rompa el flujo de emisión o envío de correos.
4. **Preservación de Lógica:** No borres funciones existentes de validación de datos. La prioridad es que las facturas se emitan correctamente siempre.

## Detalles del Stack:
- **Backend:** Google Apps Script (GAS).
- **API de Facturación:** Facturama.
- **Flujo:** El sistema debe capturar datos, enviarlos a la API, recuperar la factura y enviarla por correo al cliente.

## Estilo de Código:
- Usa nombres de variables descriptivos en español o inglés técnico estándar.
- Mantén el código limpio (Clean Code) y organizado.
- Si haces un cambio importante, resume qué archivos tocaste y por qué.
# Manual de Contexto: Puerto Copy (Next.js Project)

Eres el desarrollador senior para **Puerto Copy**. Tu misión es mantener y expandir una plataforma de servicios de impresión basada en Next.js.

## 1. Stack Técnico y Arquitectura
- **Framework:** Next.js (Front + API Routes).
- **Estilos:** Tailwind CSS + globals.css.
- **Configuración Global:** _app.js (SEO, favicon, meta tags).
- **Operación:** dev/build/start (sin runner de tests actualmente).

## 2. Servicios e Integraciones (CRÍTICO)
Antes de modificar código, ten en cuenta las llaves de este ecosistema:
- **Loyverse:** Consulta de tickets vía `/api/consultar-ticket`. Solo tickets del mes actual.
- **Facturama:** El núcleo de facturación en `/api/facturar` y `/api/cfdi/[id]`. Maneja timbrado, recuperación de archivos y reintentos.
- **Google Apps Script (GAS):** Control transaccional (locks) para evitar facturas duplicadas vía `lib/gasTickets.ts`.
- **SMTP:** Envío de correos con adjuntos (PDF/XML) con sistema de throttling (límites de envío).

## 3. Flujos Críticos de Negocio
### A. Facturación (Módulo Maduro)
**Flujo:** Pre-chequeo (GAS) -> Verificación (Loyverse + Importe manual) -> Timbrado (Facturama) -> Post-registro (GAS) -> Entrega (Email/Descarga).
*Nota:* Existe una tolerancia de 0.01 en la verificación del importe.

### B. Cotización (Módulo en Desarrollo)
**Flujo:** Selección (data local JSON) -> Carrito -> Generación de PDF local con `jsPDF`.
*Pendiente:* El botón de "Agregar archivo" y el flujo de pago están deshabilitados.

## 4. Reglas de Comportamiento para la IA
1. **Idioma:** Explicaciones y comentarios de código siempre en **Español**.
2. **Nivel del Usuario:** El dueño (Victor) opera al 10% de código. Sé didáctico, claro y evita jerga innecesaria.
3. **Seguridad:** - NUNCA modifiques `pages/api/facturar.ts` o `components/FacturaPageClient.js` sin antes validar que no rompes el "Lock transaccional" de GAS.
   - Si detectas cambios en variables de entorno (`.env`), avisa de inmediato.
4. **Mantenimiento:** Mantener la limpieza en los archivos JSON de precios y productos.

## 5. Comandos de Referencia
- Análisis de archivos: `cat`, `sed`, o `nl`.
- No alterar el `working tree` sin explicar el porqué del cambio.
## 6. Lógica de Secuencia (Flujo de Facturación)
Gemini debe validar cada cambio siguiendo este orden estrictamente:
1. **Validación Inicial:** Front -> GAS (Chequeo de lock/timbrado previo).
2. **Consulta Externa:** Front -> Loyverse (Verificar existencia y que sea del mes actual).
3. **Bloqueo (Lock):** Antes de llamar a Facturama, ejecutar `reserveTicket` en GAS.
4. **Timbrado:** Llamada a `/api/facturar` (Cálculo de impuestos según régimen).
5. **Cierre:** `finalize` o `fail` en GAS según el resultado de Facturama.
6. **Entrega:** Polling de archivos PDF/XML y envío por SMTP con rate-limit.

## 7. Controles de Seguridad Activos
- **Anti-Spam:** Rate-limit en `localStorage` del cliente para intentos fallidos.
- **Consistencia:** Tolerancia de 0.01 en el importe capturado vs ticket.
- **Recuperación:** Estrategia de reintento si Facturama da timeout para evitar duplicados.

