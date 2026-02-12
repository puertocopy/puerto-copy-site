import { buildInvoiceEmailHtml } from './invoice-email-template';
import { buildFromAddress, sendMailQueued } from './smtp';

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
  ticket?: string;
  context?: 'original' | 'resend';
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
  date,
  ticket,
  context
}: SendInvoiceEmailInput) {
  const from = buildFromAddress();

  const textLines = [
    `RFC emisor: ${issuerRfc}`,
    `Folio/UUID: ${uuid}`,
    `Total: ${total}`
  ];
  if (receiverRfc) textLines.push(`RFC receptor: ${receiverRfc}`);
  if (date) textLines.push(`Fecha: ${date}`);

  const html = buildInvoiceEmailHtml({
    ticket,
    uuid,
    total,
    issuedAt: date,
    context
  });

  const info = await sendMailQueued({
    from,
    to,
    subject,
    text: textLines.join('\n'),
    html,
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
