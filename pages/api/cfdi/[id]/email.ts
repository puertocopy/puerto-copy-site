import type { NextApiRequest, NextApiResponse } from 'next';
import { sendInvoiceEmail } from '../../../../utils/send-invoice-email';

const SANDBOX_BASE_URL = 'https://apisandbox.facturama.mx';
const PROD_BASE_URL = 'https://api.facturama.mx';

function getBaseUrl() {
  if (process.env.FACTURAMA_API_BASE_URL) {
    return process.env.FACTURAMA_API_BASE_URL;
  }
  return process.env.FACTURAMA_SANDBOX === 'true' ? SANDBOX_BASE_URL : PROD_BASE_URL;
}

function getAuthHeader() {
  const user = process.env.FACTURAMA_USER;
  const pass = process.env.FACTURAMA_PASSWORD;
  if (!user || !pass) return null;
  const base64 = Buffer.from(`${user}:${pass}`).toString('base64');
  return `Basic ${base64}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const cfdiId = String(req.query.id || '').trim();
  if (!cfdiId) {
    return res.status(400).json({ message: 'Falta cfdiId' });
  }

  const { to, issuerRfc, receiverRfc, total, date, uuid } = req.body || {};
  const normalizedTo = String(to || '').trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedTo);
  if (!emailOk) {
    return res.status(400).json({ message: 'Email inválido', invalidFields: { to: normalizedTo } });
  }

  const authHeader = getAuthHeader();
  if (!authHeader) {
    return res.status(500).json({ message: 'Faltan credenciales de Facturama (usuario y password)' });
  }

  const baseUrl = getBaseUrl();
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const fetchWithRetry = async (url: string) => {
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      const response = await fetch(url, { headers: { Authorization: authHeader } });
      const body = await response.text().catch(() => '');
      const hasBody = body && body.trim().length > 0;
      if (response.ok && hasBody) {
        return { ok: true, body, status: response.status };
      }
      if (response.status !== 404 && response.ok) {
        return { ok: false, body, status: response.status };
      }
      if (attempt < 6) {
        await sleep(1000);
      }
    }
    return { ok: false, body: '', status: 404 };
  };

  const [pdfResult, xmlResult] = await Promise.all([
    fetchWithRetry(`${baseUrl}/cfdi/pdf/issued/${cfdiId}`),
    fetchWithRetry(`${baseUrl}/cfdi/xml/issued/${cfdiId}`)
  ]);

  if (!pdfResult.ok || !xmlResult.ok) {
    return res.status(502).json({
      message: 'No se pudieron obtener PDF/XML',
      cfdiId,
      pdfStatus: pdfResult.status,
      xmlStatus: xmlResult.status
    });
  }

  let emailSent = false;
  try {
    await sendInvoiceEmail({
      to: normalizedTo,
      subject: `CFDI ${uuid || cfdiId} – Puerto Copy`,
      pdfBase64: pdfResult.body,
      xmlBase64: xmlResult.body,
      issuerRfc: String(issuerRfc || process.env.FACTURAMA_ISSUER_RFC || ''),
      receiverRfc: String(receiverRfc || ''),
      total: String(total || ''),
      date: String(date || new Date().toISOString()),
      uuid: String(uuid || cfdiId),
      context: 'resend'
    });
    emailSent = true;
    if (process.env.NODE_ENV !== 'production') {
      console.log('invoiceEmailSuccess', { cfdiId, to: normalizedTo });
    }
  } catch (emailErr: any) {
    emailSent = false;
    if (process.env.NODE_ENV !== 'production') {
      console.log('invoiceEmailError', {
        cfdiId,
        error: String(emailErr?.message || emailErr)
      });
    }
  }

  return res.status(200).json({
    message: emailSent ? 'Correo enviado' : 'Correo falló',
    cfdiId,
    emailSent,
    status: emailSent ? 'emailed:true' : 'emailed:false'
  });
}
