import express from "express";
import fs from "fs";
import path from "path";
import { getAI, SYSTEM_INSTRUCTION } from "./core";

const LOG_FILE = path.join(process.cwd(), "SHADOW_LEDGER_EVIDENCE.txt");
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

router.get("/logs", (req, res) => {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const logs = fs.readFileSync(LOG_FILE, "utf-8");
      const lastLines = logs.split("\n").filter(Boolean).slice(-50);
      res.json({ logs: lastLines });
    } else {
      res.json({ logs: ["AZRAEL: Shadow Ledger is restricted or empty in this sector."] });
    }
  } catch (e) {
    res.status(500).json({ error: "LEDGER_ACCESS_DENIED", details: String(e) });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text;
    res.json({ text });
  } catch (error: any) {
    console.error("API_CHAT_ERR:", error);
    res.status(500).json({ error: error.message || "VOID_CONNECTION_ERROR" });
  }
});

export default router;
