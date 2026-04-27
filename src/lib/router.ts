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
import { handleSovereignSynthesis } from "../server/routes/synthesis";
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
      if (e.message?.includes('NOT_FOUND') || e.code === 5) {
        console.warn("AZRAEL // NAMED_DATABASE_NOT_FOUND // FALLING_BACK_TO_DEFAULT");
        // @ts-ignore
        const { getFirestore } = await import('firebase-admin/firestore');
        snapshot = await getFirestore().collection('shadow_ledger')
          .orderBy('timestamp', 'desc')
          .limit(50)
          .get();
      } else {
        throw e;
      }
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

// OMEGA DRIVE VAULT
router.get("/auth/google/url", handleDriveAuthUrl);
router.get(["/auth/callback", "/auth/callback/"], handleDriveCallback);
router.get("/drive/status", handleDriveStatus);
router.post("/drive/upload", handleDriveUpload);

router.get("/download/:sessionId/:filename", handleDownload);

export default router;
