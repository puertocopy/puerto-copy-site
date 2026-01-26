import nodemailer, { Transporter } from 'nodemailer';

type SendInvoiceEmailInput = {
  to: string;
  subject: string;
  pdfBase64: string;
  xmlBase64: string;
  issuerRfc: string;
  total: string;
  uuid: string;
  receiverRfc?: string;
  date?: string;
};

let verifiedTransporterPromise: Promise<Transporter> | null = null;

const getVerifiedTransporter = async () => {
  if (verifiedTransporterPromise) return verifiedTransporterPromise;
  verifiedTransporterPromise = (async () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port) {
      throw new Error('SMTP no configurado');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      tls: { rejectUnauthorized: false },
      auth: user && pass ? { user, pass } : undefined
    });

    await transporter.verify();
    return transporter;
  })();
  return verifiedTransporterPromise;
};

export async function sendInvoiceEmail({
  to,
  subject,
  pdfBase64,
  xmlBase64,
  issuerRfc,
  total,
  uuid,
  receiverRfc,
  date
}: SendInvoiceEmailInput) {
  const fromName = process.env.SMTP_FROM_NAME;
  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const smtpUser = process.env.SMTP_USER;
  if (smtpUser && fromEmail && smtpUser !== fromEmail) {
    throw new Error('SMTP_USER y SMTP_FROM_EMAIL deben ser el mismo correo');
  }
  const from = fromName && fromEmail ? `"${fromName}" <${fromEmail}>` : '';

  if (!from) {
    throw new Error('SMTP no configurado');
  }

  const transporter = await getVerifiedTransporter();

  const textLines = [
    `RFC emisor: ${issuerRfc}`,
    `Folio/UUID: ${uuid}`,
    `Total: ${total}`
  ];
  if (receiverRfc) textLines.push(`RFC receptor: ${receiverRfc}`);
  if (date) textLines.push(`Fecha: ${date}`);

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: textLines.join('\n'),
    attachments: [
      {
        filename: 'factura.pdf',
        content: pdfBase64,
        encoding: 'base64'
      },
      {
        filename: 'factura.xml',
        content: xmlBase64,
        encoding: 'base64'
      }
    ]
  });
  console.log('invoiceEmailSendResult', {
    messageId: info?.messageId,
    response: info?.response
  });
}
