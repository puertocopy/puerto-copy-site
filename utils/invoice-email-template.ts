type InvoiceEmailTemplateInput = {
  ticket?: string;
  uuid: string;
  total: string;
  issuedAt?: string;
  context?: 'original' | 'resend';
};

const formatIssuedAt = (value?: string) => {
  if (!value) return new Date().toLocaleString('es-MX');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('es-MX');
};

const contextCopy = (context?: 'original' | 'resend') => {
  if (context === 'resend') {
    return {
      badge: 'Reenvio de factura',
      title: 'Hola',
      body: 'Te reenviamos tu factura electronica. En este correo encontraras los archivos fiscales correspondientes.'
    };
  }
  return {
    badge: 'Factura emitida',
    title: 'Hola',
    body: 'Tu factura electronica ha sido emitida correctamente. En este correo encontraras los archivos fiscales correspondientes.'
  };
};

export function buildInvoiceEmailHtml({
  ticket,
  uuid,
  total,
  issuedAt,
  context
}: InvoiceEmailTemplateInput) {
  const copy = contextCopy(context);
  const issuedAtText = formatIssuedAt(issuedAt);
  const ticketRow = ticket
    ? `
                <tr>
                  <td style="padding:6px 0;"><strong>Ticket:</strong></td>
                  <td style="padding:6px 0;">${ticket}</td>
                </tr>
    `.trim()
    : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Factura emitida - Puerto Copy</title>
</head>
<body style="margin:0; padding:0; background-color:#F3F7FC; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background-color:#ffffff; border-radius:28px; overflow:hidden; border:1px solid #E5EEF9;">
          <tr>
            <td style="background:linear-gradient(135deg,#003082,#0B63B2); padding:36px 20px; text-align:center; color:#ffffff;">
              <h1 style="margin:0; font-size:26px; font-weight:bold; letter-spacing:-0.5px;">
                PUERTO COPY
              </h1>
              <p style="margin:6px 0 0; font-size:12px; letter-spacing:2px; opacity:0.85;">
                FACTURACION ELECTRONICA CFDI 4.0
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 34px; color:#1a1a1a;">
              <div style="
                display:inline-block;
                background:#E3F2FD;
                color:#0B63B2;
                padding:8px 16px;
                border-radius:100px;
                font-size:12px;
                font-weight:bold;
                text-transform:uppercase;
                margin-bottom:20px;">
                ${copy.badge}
              </div>
              <h2 style="margin:0 0 14px; font-size:22px; color:#003082;">
                ${copy.title}
              </h2>
              <p style="font-size:15px; color:#555; line-height:1.6; margin-bottom:26px;">
                ${copy.body}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0"
                style="font-size:14px; margin-bottom:28px;">
                ${ticketRow}
                <tr>
                  <td style="padding:6px 0;"><strong>UUID:</strong></td>
                  <td style="padding:6px 0;">${uuid}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><strong>Total:</strong></td>
                  <td style="padding:6px 0;">$ ${total} MXN</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;"><strong>Fecha de emision:</strong></td>
                  <td style="padding:6px 0;">${issuedAtText}</td>
                </tr>
              </table>
              <div style="
                background:#FDFDFD;
                border:1px solid #E5EEF9;
                border-radius:20px;
                padding:20px;
                margin-bottom:30px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px; border:1px solid #E5EEF9; border-radius:14px;">
                      📄 <strong>Factura PDF</strong><br>
                      <span style="font-size:12px; color:#777;">Representacion impresa</span>
                    </td>
                  </tr>
                  <tr><td height="10"></td></tr>
                  <tr>
                    <td style="padding:10px; border:1px solid #E5EEF9; border-radius:14px;">
                      ⚙️ <strong>Factura XML</strong><br>
                      <span style="font-size:12px; color:#777;">Archivo fiscal SAT</span>
                    </td>
                  </tr>
                </table>
              </div>
              <p style="font-size:13px; color:#777; text-align:center; margin-top:8px;">
                Se adjunta su factura en formato PDF y XML.
              </p>
              <p style="font-size:13px; color:#777; text-align:center;">
                Si tienes alguna duda o necesitas correccion, responde este correo.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff; border-top:1px solid #F3F7FC; padding:28px; text-align:center;">
              <p style="margin:4px 0; font-size:13px; color:#003082;">
                <strong>Puerto Copy</strong>
              </p>
              <p style="margin:4px 0; font-size:12px; color:#94A3B8;">
                Villa Colonial 573 · Los Portales · Puerto Vallarta, Jal.
              </p>
              <p style="margin-top:14px; font-size:11px; color:#b0b7c3;">
                Este correo fue generado automaticamente con fines fiscales.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
