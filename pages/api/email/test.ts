import type { NextApiRequest, NextApiResponse } from 'next';
import { buildFromAddress, sendMailQueued } from '../../../utils/smtp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const info = await sendMailQueued({
      from: buildFromAddress(),
      to: req.body.to,
      subject: 'Prueba SMTP Hostinger',
      html: '<h1>SMTP OK</h1><p>Si ves esto, ya quedó</p>'
    });

    console.log('MAIL SENT', {
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
