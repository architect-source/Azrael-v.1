import { Request, Response } from 'express';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const handleSynthesize = async (req: Request, res: Response) => {
  const { blueprint } = req.body;
  const sessionId = uuidv4();
  const forgeDir = path.join('/tmp', 'forge', sessionId);
  const zipPath = path.join('/tmp', 'forge', `${sessionId}.zip`);
  
  if (!blueprint || !blueprint.content) {
    return res.status(400).json({ error: "ARCHITECTURAL_VOID: Incomplete blueprint." });
  }

  try {
    if (!fs.existsSync('/tmp/forge')) fs.mkdirSync('/tmp/forge', { recursive: true });
    fs.mkdirSync(forgeDir, { recursive: true });

    // Write files
    const type = req.body.type || 'logic';
    let filename = blueprint.filename || 'App.tsx';

    if (type === 'app' && !filename.endsWith('.apk')) {
        filename = filename.split('.')[0] + '.apk';
    }

    const filePath = path.join(forgeDir, filename);
    fs.writeFileSync(filePath, blueprint.content);
    fs.writeFileSync(path.join(forgeDir, 'README.md'), blueprint.readmes || 'Synthesized by AZRAEL.');

    console.log(`[AZRAEL] ASSET_FORGED: ${filePath} | TYPE: ${type}`);

    res.json({ 
        log: `SYNTHESIS COMPLETE. ${type.toUpperCase()} READY.`, 
        status: 'complete',
        downloadUrl: `/api/download/${sessionId}/${filename}` 
    });

  } catch (err: any) {
    console.error("[AZRAEL] FORGE_FAILURE:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: `SYSTEM FAILURE: ${err.message}` });
    }
  }
};

export const handleDownload = (req: Request, res: Response) => {
    const { sessionId, filename } = req.params;
    const filePath = path.join('/tmp', 'forge', sessionId, filename);
    
    console.log(`[AZRAEL] DOWNLOAD_REQUEST: ${sessionId}/${filename} | Path: ${filePath}`);

    if (fs.existsSync(filePath)) {
        // Set content types for special assets
        if (filename.endsWith('.apk')) {
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        } else if (['.jpg', '.png', '.gif', '.webp'].some(ext => filename.toLowerCase().endsWith(ext))) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (filename.endsWith('.mp4')) {
            res.setHeader('Content-Type', 'video/mp4');
        } else {
            res.setHeader('Content-Type', 'application/octet-stream');
        }

        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        console.warn(`[AZRAEL] DOWNLOAD_FAILED: Artifact ${sessionId}/${filename} not found.`);
        res.status(404).send('Artifact not found or expired.');
    }
};
