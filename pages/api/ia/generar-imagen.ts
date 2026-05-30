import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    // Aquí se integraría la API de OpenAI o similar.
    // Por ahora, simularemos la respuesta para que el usuario vea la estructura.
    // Nota: El usuario deberá configurar su API KEY en las variables de entorno.
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        message: 'Configuración de IA incompleta (Falta API Key).',
        simulated: true,
        url: `https://placehold.co/1024x1024/003399/white?text=${encodeURIComponent(prompt)}`
      });
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error generating image');
    }

    return res.status(200).json({ url: data.data[0].url });

  } catch (error: any) {
    console.error('Error en API IA:', error);
    return res.status(500).json({ message: error.message || 'Error interno del servidor' });
  }
}
