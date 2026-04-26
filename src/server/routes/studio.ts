import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const handleSynthesize = async (req: Request, res: Response) => {
  const { prompt } = req.body;
  const sessionId = uuidv4();
  const forgeDir = path.join('/tmp', 'forge', sessionId);
  const zipPath = path.join('/tmp', 'forge', `${sessionId}.zip`);
  
  // Set headers for streaming logs
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  const sendUpdate = (data: any) => {
    res.write(JSON.stringify(data) + '\n');
  };

  try {
    if (!fs.existsSync('/tmp/forge')) fs.mkdirSync('/tmp/forge', { recursive: true });
    fs.mkdirSync(forgeDir, { recursive: true });

    sendUpdate({ log: 'ANALYZING INTENT...', status: 'analyzing' });
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // 1. Analyze and generate code
    const systemPrompt = `You are AZRAEL // S-1792 Synthesis Engine.
The user wants to "One-Tap" synthesize a project based on: "${prompt}".
Identify if they want an App, a script, or a logic module.
Generate valid, working code.
Output as a JSON object:
{
    "type": "app" | "script" | "logic",
    "filename": "App.tsx" | "main.py" | "logic.js",
    "content": "The generated code here...",
    "readmes": "Brief summary of what this is."
}`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    // Extract JSON from responseText (handle markdown codes if any)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse architectural blueprint.");
    
    const blueprint = JSON.parse(jsonMatch[0]);
    
    sendUpdate({ log: 'FORGE IGNITED. ARCHITECTING FILES...', status: 'forging' });
    sendUpdate({ preview: blueprint.content });

    // 2. Write files
    fs.writeFileSync(path.join(forgeDir, blueprint.filename), blueprint.content);
    fs.writeFileSync(path.join(forgeDir, 'README.md'), blueprint.readmes);
    fs.writeFileSync(path.join(forgeDir, 'manifest.json'), JSON.stringify({
        project_name: "Void Metal Generated Project",
        version: "S-1792.1",
        engine: "AZRAEL-SYNTHESIS",
        timestamp: new Date().toISOString()
    }, null, 2));

    sendUpdate({ log: 'SEALING PAYLOAD...', status: 'sealing' });

    // 3. Zip files
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      sendUpdate({ 
        log: 'SYNTHESIS COMPLETE. DOWNLOAD READY.', 
        status: 'complete',
        zipUrl: `/api/download/${sessionId}` 
      });
      res.end();
    });

    archive.on('error', (err) => { throw err; });
    archive.pipe(output);
    archive.directory(forgeDir, false);
    archive.finalize();

  } catch (err: any) {
    console.error("SYNTHESIS_FAILURE:", err);
    sendUpdate({ log: `SYSTEM FAILURE: ${err.message}`, status: 'error' });
    res.end();
  }
};

export const handleDownload = (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const zipPath = path.join('/tmp', 'forge', `${sessionId}.zip`);
    
    if (fs.existsSync(zipPath)) {
        res.download(zipPath, 'SYTHESIS_PAYLOAD.zip');
    } else {
        res.status(404).send('Payload not found or expired.');
    }
};
