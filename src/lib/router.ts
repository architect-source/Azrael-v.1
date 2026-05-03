import express from "express";
import fs from "fs";
import path from "path";
import { getAI, SYSTEM_INSTRUCTION } from "./core";
import { handleChat } from "../server/routes/chat";
import { handleProxyChat } from "../server/routes/proxy";
import { handleOmegaChat } from "../server/routes/omega";
import { handleSynthesize, handleDownload } from "../server/routes/studio";
import { handleWeave } from "../server/routes/sonic";
import { handleNodeTelemetry } from "../server/routes/nodes";
import { handleHandshake, conduitGuard, handleSecureData } from "../server/routes/conduit";
import { handleHunt } from "../server/routes/hunter";
import { handleSovereignSynthesis, handleSonicGenerate } from "../server/routes/synthesis";
import { handleVideoStitch } from "../server/routes/video";
import { handleDriveAuthUrl, handleDriveCallback, handleDriveUpload, handleDriveStatus } from "../server/routes/drive";
import { icpAgent } from "../server/icp";

import { getSovereignDb } from "./firebase-admin";

const router = express.Router();

// Diagnostic middleware
router.use((req, res, next) => {
  res.setHeader("X-Azrael-Source", "Sovereign-API-Bridge");
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] API_STRIKE: ${req.method} ${req.url}`);
  next();
});

router.get("/health", (req, res) => res.json({ 
  status: "online", 
  environment: process.env.VERCEL ? "vercel" : "local",
  timestamp: new Date().toISOString()
}));

router.get("/logs", async (req, res) => {
  try {
    let db = getSovereignDb();
    let snapshot;
    try {
      snapshot = await db.collection('shadow_ledger')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
    } catch (e: any) {
      console.warn(`[AZRAEL] LEDGER_PRIMARY_FETCH_FAULT: ${e.message}`);
      if (e.message?.includes('NOT_FOUND') || e.code === 5 || e.message?.includes('PERMISSION_DENIED') || e.code === 7) {
        console.warn(`[AZRAEL] DATABASE_ACCESS_FAILURE [Code: ${e.code}] // FALLING_BACK_TO_DEFAULT`);
        try {
          // @ts-ignore
          const { getFirestore } = await import('firebase-admin/firestore');
          snapshot = await getFirestore().collection('shadow_ledger')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        } catch (innerError: any) {
          console.error(`[AZRAEL] LEDGER_FALLBACK_FETCH_FAULT: ${innerError.message}`);
          // FINAL_FALLBACK: Return ephemeral mock logs if DB is completely unreachable
          snapshot = {
            docs: [
              { data: () => ({ timestamp: new Date().toISOString(), type: 'SYSTEM', content: "AZRAEL_PROTOCOL_STANDALONE: Ledger database restricted. Running in autonomous ephemeral mode." }) },
              { data: () => ({ timestamp: new Date().toISOString(), type: 'BREACH', content: "SIMULATED_LOG: Unauthorized access detected from Winston Sector." }) }
            ]
          } as any;
        }
      } else {
        throw e;
      }
    }
    
    if (!snapshot || !snapshot.docs) {
      res.json({ logs: ["AZRAEL: SHADOW_LEDGER_UNREACHABLE // PROTOCOL_VOID"] });
      return;
    }
    
    const logs = snapshot.docs.map(doc => {
      const data = doc.data();
      return `[${data.timestamp}] ${data.type} // ${data.content}`;
    });

    if (logs.length === 0) {
      res.json({ logs: ["AZRAEL: Shadow Ledger is restricted or empty in this sector."] });
    } else {
      res.json({ logs });
    }
  } catch (e) {
    console.error("LEDGER_FETCH_FAILURE:", e);
    res.status(500).json({ error: "LEDGER_ACCESS_DENIED", details: String(e) });
  }
});

router.post("/session", async (req, res) => {
  try {
    const session = await icpAgent.createSession();
    if (session) {
      res.json(session);
    } else {
      res.status(500).json({ error: "SESSION_CREATION_FAILURE" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chat", handleChat);
router.post("/proxy-chat", handleProxyChat);
router.post("/omega-chat", handleOmegaChat);
router.post("/synthesize", handleSynthesize);
router.post("/weave", handleWeave);
router.get("/nodes", handleNodeTelemetry);

// EPHEMERAL GATEWAY
router.get("/handshake", handleHandshake);
router.get("/conduit/:hash/secure-data", conduitGuard, handleSecureData);

// SOVEREIGN HUNTER
router.get("/hunt", handleHunt);

// SOVEREIGN SYNTHESIS
router.post("/sovereign-synthesize", handleSovereignSynthesis);
router.post("/sonic-generate", handleSonicGenerate);
router.post("/video-stitch", handleVideoStitch);

// OMEGA DRIVE VAULT
router.get("/auth/google/url", handleDriveAuthUrl);
router.get(["/auth/callback", "/auth/callback/"], handleDriveCallback);
router.get("/drive/status", handleDriveStatus);
router.post("/drive/upload", handleDriveUpload);

router.get("/download/:sessionId/:filename", handleDownload);

export default router;
