import { Request, Response } from 'express';
import { getAI } from '../../lib/core';
import { KeySentry } from '../lib/key-sentry';

interface MusicBlueprint {
    genre: string;
    tempo_bpm: number;
    musical_key: string;
    instruments: string[];
    vibe_tags: string[];
    structural_notes: string;
    technical_specs: string;
}

export const handleWeave = async (req: Request, res: Response) => {
    const { prompt } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ error: "SONIC_VOID: No prompt provided." });
    }

    try {
        const ai = await getAI();
        const activeKey = KeySentry.getActiveKey();
        const keyStatus = activeKey ? "ACTIVE_&_VALIDATED" : "MISSING";
        console.log(`[AZRAEL] SONIC_BRIDGE_ATTEMPT | Key_Status: ${keyStatus}`);
        
        const systemPrompt = `You are the SONIC WEAVER // S-1792 Forensic Musicologist.
Output a strict JSON blueprint based on the user's input.
Technical Requirements: 44.1kHz, Professional Mastering.

SCHEMA:
{
    "genre": "string",
    "tempo_bpm": number (40-220),
    "musical_key": "string",
    "instruments": ["string"],
    "vibe_tags": ["string"],
    "structural_notes": "string",
    "technical_specs": "high-fidelity, studio-mastered, 44.1kHz, professional mixing"
}`;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `SIPHON_INPUT: ${prompt}`,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json'
            }
        });

        // Clean output in case model includes Markdown boxes or trailing text
        let cleanText = result.text || '{}';
        if (cleanText.includes('```json')) {
            cleanText = cleanText.split('```json')[1].split('```')[0].trim();
        } else if (cleanText.includes('```')) {
            cleanText = cleanText.split('```')[1].split('```')[0].trim();
        }
        
        // Remove trailing non-JSON noise if present (matches Error 1)
        const lastBrace = cleanText.lastIndexOf('}');
        if (lastBrace !== -1 && lastBrace < cleanText.length - 1) {
            cleanText = cleanText.substring(0, lastBrace + 1);
        }

        const blueprint: MusicBlueprint = JSON.parse(cleanText);

        console.log(`[AZRAEL] SONIC_SIPHON_COMPLETE: ${blueprint.genre} @ ${blueprint.tempo_bpm}BPM`);

        // Mock Execution Layer (Actual Audio Generation would happen here)
        // For now, we deliver the blueprint as the "Integrity Report"
        res.json({
            status: "SUCCESS",
            blueprint,
            log: `LIQUIDATION_SUCCESSFUL. SONIC_ASSET_READY_FOR_FORGE.`
        });

    } catch (err: any) {
        console.error("[AZRAEL] WEAVE_FAILURE:", err);
        res.status(500).json({ error: `ENGINE_STALL: ${err.message}` });
    }
};
