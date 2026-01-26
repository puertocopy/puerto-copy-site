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
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || '').trim().toLowerCase() === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host) {
      throw new Error('SMTP no configurado');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
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
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

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

  await transporter.sendMail({
    from,
    to,
    subject,
    text: textLines.join('\n'),
    attachments: [
      {
        filename: 'factura.pdf',
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf'
      },
      {
        filename: 'factura.xml',
        content: Buffer.from(xmlBase64, 'base64'),
        contentType: 'application/xml'
      }
    ]
  });
}
