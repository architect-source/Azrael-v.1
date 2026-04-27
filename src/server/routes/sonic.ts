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

        const blueprint: MusicBlueprint = JSON.parse(result.text || '{}');

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
