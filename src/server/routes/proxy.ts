import { Request, Response } from 'express';
import { getAI } from '../../lib/core';
import * as ed from '@noble/ed25519';
import crypto from 'crypto';

// Proxy's ICP identity (registered with canister)
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

export const handleProxyChat = async (req: Request, res: Response) => {
  const { request }: { request: string } = req.body;
  
  try {
    // Parse signed request from canister
    const proxyReq: ProxyRequest = JSON.parse(request);
    
    // 1. Verify canister signature (Placeholder for production)
    // In a real Sovereign Chain, we'd verify the canister's threshold signature
    
    // 2. Check nonce freshness (5 minute window)
    const reqTime = Number(BigInt(proxyReq.timestamp) / 1_000_000n);
    if (Date.now() - reqTime > 300000) {
      return res.status(408).json({ error: 'Request expired' });
    }
    
    // 3. Neural Link Migration
    const startTime = Date.now();
    // AZRAEL: AI generation on the backend is restricted. 
    // The client is tasked with fulfilling the generative requirement.
    const content = "NEURAL_LINK_MIGRATED_TO_CLIENT";
    const latency = Date.now() - startTime;
    
    // 4. Build and sign response
    const responseHash = crypto.createHash('sha256')
      .update(content)
      .update(Buffer.from(BigInt(latency).toString()))
      .digest('hex');
      
    const message = `${proxyReq.request_id}:${Date.now()}:${responseHash}`;
    const signature = await ed.sign(Buffer.from(message), PROXY_KEY);
    
    const proxyResponse = {
      request_id: proxyReq.request_id,
      timestamp: BigInt(Date.now()) * 1_000_000n, // Nanoseconds
      result: {
        Success: {
          content,
          model_used: { GeminiFlash: null },
          tokens_used: 0, 
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
};
