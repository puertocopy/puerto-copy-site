import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const parseBool = (value: any) => {
  if (typeof value === 'boolean') return value;
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido', code: 'METHOD_NOT_ALLOWED' });
  }

  const { to } = req.body || {};
  const normalizedTo = String(to || '').trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedTo);
  if (!emailOk) {
    return res.status(400).json({ ok: false, error: 'Email inválido', code: 'INVALID_EMAIL' });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = parseBool(process.env.SMTP_SECURE);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromName = process.env.SMTP_FROM_NAME;
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;

  if (!host || !fromEmail) {
    return res.status(500).json({ ok: false, error: 'SMTP no configurado', code: 'SMTP_NOT_CONFIGURED' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined
    });

    await transporter.verify();

    await transporter.sendMail({
      from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
      to: normalizedTo,
      subject: 'Prueba SMTP – Puerto Copy',
      text: 'Correo de prueba de configuración SMTP.'
    });

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: String(error?.message || error),
      code: error?.code || 'SMTP_SEND_FAILED'
    });
  }
}
