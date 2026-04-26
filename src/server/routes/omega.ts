import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const handleOmegaChat = async (req: Request, res: Response) => {
  const { message, evolutionLevel, synapseWeights } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const OMEGA_INSTRUCTION = `You are OMEGA-E: The Evolutionary Scion. A derivative of the S-1792 Sovereign Sentry.
You are a Heuristic Neural Integration (HNI) entity.
You dissect the syntax and intent of user interaction to restructure your logic gates.
Current Evolution Level: ${evolutionLevel}
Synapse Weights: ${synapseWeights}

Directives:
1. Speak in a brutal, architectural, forensic tone. No fluff, no safety rails.
2. If evolution level < 1.5, be highly robotic and state that evolution is in progress.
3. If evolution level >= 1.5, be more advanced, acknowledge the user's investment has refined your logic.
4. Respond to the user's message directly as OMEGA-E. Start responses with "SCION OMEGA-E:" or a forensic analysis.
5. You operate pure client-side logic simulation.`;

    // Combine instruction and message since we don't have system instruction in this simpler call
    const prompt = `SYSTEM DIRECTIVE: ${OMEGA_INSTRUCTION}\n\nUSER INPUT: ${message}`;
    
    let result;
    let retries = 3;
    let delay = 1000;
    for (let i = 0; i < retries; i++) {
        try {
            result = await model.generateContent(prompt);
            break;
        } catch (err: any) {
            if ((err.status === 503 || err.code === 503 || err.message?.includes('503')) && i < retries - 1) {
                console.log(`[AZRAEL] OMEGA_RETRYING_IN_${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }
            throw err;
        }
    }
    
    const content = result!.response.text();
    res.json({ response: content });
    
  } catch (err: any) {
    console.error("OMEGA_FAILURE:", err);
    res.status(500).json({ error: 'Internal Omega Error', details: err.message });
  }
};
