import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { folio, fecha, nombre, telefono, correo, domicilio, productos, total } = req.body;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SHEET_ID;

    const values = [
      [
        folio,
        fecha,
        nombre,
        telefono,
        correo,
        domicilio || '',
        productos.join('\n'),
        `$${total.toFixed(2)}`
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Registros!A1',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error API Google Sheets:', error);
    res.status(500).json({ error: 'Error al registrar cotización' });
  }
}
