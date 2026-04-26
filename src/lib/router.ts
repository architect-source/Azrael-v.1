import express from "express";
import fs from "fs";
import path from "path";
import { getAI, SYSTEM_INSTRUCTION } from "./core";
import { handleChat } from "../server/routes/chat";
import { handleProxyChat } from "../server/routes/proxy";
import { handleOmegaChat } from "../server/routes/omega";
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

export default router;
