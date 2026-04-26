import express from 'express';
import { getAI } from '../lib/core';
import * as ed from '@noble/ed25519';
import { Principal } from '@dfinity/principal';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Proxy's ICP identity (registered with canister)
const PROXY_PRINCIPAL = process.env.PROXY_PRINCIPAL || "anonymous";
const PROXY_KEY = process.env.PROXY_KEY ? Uint8Array.from(Buffer.from(process.env.PROXY_KEY, 'hex')) : new Uint8Array(32);

interface ProxyRequest {
  request_id: string;
  session_id: string;
  timestamp: string; // BigInt as string
  nonce: string; // BigInt as string
  encrypted_payload_hash: number[];
  context_summary: string;
  preferred_model: any;
  canister_signature: number[];
}

app.post('/api/proxy-chat', async (req, res) => {
  const { request, session_id }: { request: string; session_id: string } = req.body;
  
  try {
    // Parse signed request from canister
    const proxyReq: ProxyRequest = JSON.parse(request);
    
    // 1. Verify canister signature (Placeholder for production)
    const valid = await verifyCanisterSignature(
      proxyReq.request_id + proxyReq.timestamp + Buffer.from(proxyReq.encrypted_payload_hash).toString('hex'),
      Uint8Array.from(proxyReq.canister_signature),
      process.env.VITE_IC_CANISTER_ID || "uxrrr-q7777-77774-qaaaq-cai"
    );
    
    if (!valid) {
      return res.status(403).json({ error: 'Invalid canister signature' });
    }
    
    // 2. Check nonce freshness (5 minute window)
    const reqTime = Number(BigInt(proxyReq.timestamp) / 1_000_000n);
    if (Date.now() - reqTime > 300000) {
      return res.status(408).json({ error: 'Request expired' });
    }
    
    // 3. Call Gemini
    const startTime = Date.now();
    const ai = getAI();
    
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: proxyReq.context_summary
    });
    const content = result.text || "VOID_METAL_SILENCE";
    const latency = Date.now() - startTime;
    
    // 4. Build and sign response
    const responseHash = hashResponse(content, latency);
    const message = `${proxyReq.request_id}:${Date.now()}:${responseHash}`;
    const signature = await ed.sign(Buffer.from(message), PROXY_KEY);
    
    const proxyResponse = {
      request_id: proxyReq.request_id,
      timestamp: BigInt(Date.now()) * 1_000_000n, // Nanoseconds
      result: {
        Success: {
          content,
          model_used: { GeminiFlash: null },
          tokens_used: 0, // Placeholder
          finish_reason: "stop",
          latency_ms: latency,
        }
      },
      proxy_signature: Array.from(signature),
      response_hash: Array.from(Buffer.from(responseHash, 'hex')),
    };
    
    // BigInt serialization
    const jsonResponse = JSON.stringify(proxyResponse, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
    
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonResponse);
    
  } catch (err: any) {
    console.error("PROXY_FAILURE:", err);
    res.status(500).json({ error: 'Internal Proxy Error', details: err.message });
  }
});

function hashResponse(content: string, latency: number): string {
  return crypto.createHash('sha256')
    .update(content)
    .update(Buffer.from(BigInt(latency).toString()))
    .digest('hex');
}

async function verifyCanisterSignature(message: string, signature: Uint8Array, canisterId: string): Promise<boolean> {
  // In production, this would verify the canister's threshold signature
  return true; 
}

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ AZRAEL Proxy running on :${PORT}`);
});
