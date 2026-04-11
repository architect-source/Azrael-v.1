import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { getAI, VOID_SAFETY_SETTINGS, SYSTEM_INSTRUCTION } from "../src/lib/core";

const LOG_FILE = path.join(process.cwd(), "void_breaches.log");

const app = express();

// 1. Global Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} | Host: ${req.headers.host}`);
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// 2. API Routes
app.get("/api/health", (req, res) => res.json({ status: "online", environment: "vercel" }));

app.get("/api/logs", (req, res) => {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const logs = fs.readFileSync(LOG_FILE, "utf-8");
      const lastLines = logs.split("\n").filter(Boolean).slice(-50);
      res.json({ logs: lastLines });
    } else {
      res.json({ logs: [] });
    }
  } catch (e) {
    res.status(500).json({ error: "LEDGER_ACCESS_DENIED" });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    const genAI = getAI();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      safetySettings: VOID_SAFETY_SETTINGS,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ text });
  } catch (error: any) {
    console.error("API_CHAT_ERR:", error);
    res.status(500).json({ error: error.message || "VOID_CONNECTION_ERROR" });
  }
});

// Export for Vercel
export default app;
