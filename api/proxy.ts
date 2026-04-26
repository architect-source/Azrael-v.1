// api/proxy.ts
// Vercel Serverless Function - 10s timeout limit on Hobby tier

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // WARNING: 10 second timeout on Vercel free tier
  // Gemini calls often exceed this
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { request } = req.body;
    
    // Quick validation
    if (!request) {
      return res.status(400).json({ error: 'Missing request' });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }
    
    // Direct Gemini call (no TEE, no advanced security)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: request }] }],
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return res.status(200).json({
      content: text,
      timestamp: Date.now(),
      status: 'proxied'
    });
    
  } catch (err: any) {
    console.error("VERCEL_PROXY_FAILURE:", err);
    return res.status(504).json({ 
      error: 'Timeout or failure - AZRAEL dims',
      details: err.message,
      degraded: true 
    });
  }
}
