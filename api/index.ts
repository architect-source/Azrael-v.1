import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { getAI, SYSTEM_INSTRUCTION } from "../src/lib/core";

const LOG_FILE = path.join(process.cwd(), "SHADOW_LEDGER_EVIDENCE.txt");
const app = express();

// 1. Global Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// 2. Sovereign API Router Logic
const router = express.Router();

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

// Mount the router on both /api and / to handle Vercel's flexible routing
app.use("/api", router);
app.use("/", router); 

// Catch-all for API routes to provide better diagnostics
app.use("/api", (req, res) => {
  res.status(404).json({ 
    error: "API_ROUTE_NOT_FOUND", 
    path: req.path,
    method: req.method,
    suggestion: "Check if the route is defined in api/index.ts"
  });
});

export default app;
export { router }; // Export router for local server use
