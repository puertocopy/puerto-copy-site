import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ticket } = req.query;

  if (!ticket) {
    return res.status(400).json({ error: 'Ticket number is required' });
  }

  const url = `https://api.loyverse.com/v1.0/receipts?receipt_number=${ticket}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.LOYVERSE_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Loyverse API error:', errorText);
    return res.status(500).json({ error: 'Failed to fetch receipt data' });
  }

  const data = await response.json();
  const receipts = data.receipts;
  const receipt = receipts.find((r: any) => String(r.receipt_number).trim() === String(ticket).trim());

  if (!receipt) {
    return res.status(404).json({ error: 'Receipt not found' });
  }

  return res.status(200).json({ receipt });
}
