import nodemailer from 'nodemailer';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpFromEmail = process.env.SMTP_FROM_EMAIL;
    if (smtpUser && smtpFromEmail && smtpUser !== smtpFromEmail) {
      throw new Error('SMTP_USER y SMTP_FROM_EMAIL deben ser el mismo correo');
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT || 465) === 465,
      tls: { rejectUnauthorized: false },
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: req.body.to,
      subject: 'Prueba SMTP Puerto Copy',
      html: '<b>SMTP funcionando correctamente</b>'
    });

    console.log('smtpTestSendResult', {
      messageId: info?.messageId,
      response: info?.response
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: e.message,
      code: e.code
    });
  }
}
