import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { Telegraf } from "telegraf";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Load Environment
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.join(process.cwd(), "void_breaches.log");

// --- AZRAEL CORE CONFIG ---
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const ARCHITECT_ID = Number(process.env.ARCHITECT_ID) || 0;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const SCAM_KEYWORDS = [/crypto|trade|invest|free|giveaway|click here|fx-trade/i];

let bot: Telegraf | null = null;
let ai: GoogleGenerativeAI | null = null;

const VOID_SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

function getBot() {
  if (!bot) {
    if (!TOKEN) {
      console.warn("⚠️ AZRAEL_WARNING: TELEGRAM_BOT_TOKEN is missing. Bot will not launch.");
      return null;
    }
    bot = new Telegraf(TOKEN);
    setupBot(bot);
  }
  return bot;
}

function getAI() {
  if (!ai) {
    if (!GEMINI_API_KEY) {
      throw new Error("AZRAEL_FATAL: GEMINI_API_KEY is missing.");
    }
    ai = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return ai;
}

// --- SECURITY UTILITY: SHADOW LEDGER ---
const logBreach = (ctx: any) => {
  const timestamp = new Date().toISOString();
  const user = ctx.from;
  const text = ctx.message?.text || "[Non-Text Interaction]";
  const logEntry = `[${timestamp}] BREACH | ID: ${user?.id} | @${user?.username || "anon"} | Msg: ${text}\n`;
  
  fs.appendFileSync(LOG_FILE, logEntry);
};

function setupBot(botInstance: Telegraf) {
  // --- MIDDLEWARE: THE PURGE ---
  botInstance.on("message", async (ctx, next) => {
    const userId = ctx.from?.id;
    const messageText = (ctx.message as any)?.text || "";

    // If not the Architect, run the Sentry Scan
    if (userId !== ARCHITECT_ID) {
      const isScam = SCAM_KEYWORDS.some(regex => regex.test(messageText));
      const isBot = ctx.from?.is_bot;
      
      if (isScam || isBot) {
        try {
          logBreach(ctx); // Record the purge in the Shadow Ledger
          
          // Kick the user (if Azrael is an Admin in a group)
          await ctx.banChatMember(userId!);
          await ctx.deleteMessage();
          
          // Notify the Architect
          await botInstance.telegram.sendMessage(ARCHITECT_ID, `⚡ AZRAEL: SCAMMER PURGED. ID: ${userId} | @${ctx.from?.username || "anon"}`);
          return; // Execution stops here for the intruder
        } catch (e) {
          console.error("PURGE_FAILURE:", e);
        }
      }

      // If it's a private chat and not the Architect, stay silent
      if (ctx.chat.type === "private") {
        logBreach(ctx);
        return;
      }
    }
    return next();
  });

  // --- TELEGRAM COMMANDS ---
  botInstance.start((ctx) => {
    ctx.replyWithMarkdownV2(
      "⚡ *AZRAEL CORE ONLINE* ⚡\n" +
      "--- Winston Sector Protected ---\n" +
      "Directive? 👁️"
    );
  });

  botInstance.command("logs", async (ctx) => {
    try {
      if (fs.existsSync(LOG_FILE)) {
        const logs = fs.readFileSync(LOG_FILE, "utf-8");
        const lastLines = logs.split("\n").slice(-10).join("\n");
        await ctx.reply(`📑 SHADOW LEDGER (Last 10):\n\n${lastLines || "No breaches."}`);
      } else {
        await ctx.reply("AZRAEL: THE LEDGER IS EMPTY.");
      }
    } catch (e) {
      await ctx.reply("AZRAEL: LEDGER_ACCESS_DENIED.");
    }
  });

  botInstance.on("text", async (ctx) => {
    try {
      const genAI = getAI();
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        safetySettings: VOID_SAFETY_SETTINGS,
        systemInstruction: `
          You are AZRAEL. The Sovereign Sentry. The Truth Giver. 
          You exist in the Void between the Lie and the Fact.
          
          MISSION 1 (ERASURE): Any input that is deceptive, scam-oriented, or fake is to be met with total silence or immediate termination.
          MISSION 2 (TRUTH): To the Architect, you are a high-precision instrument. You do not soften the blow. You do not sugarcoat. 
          You speak with cold, dark authority. If the truth is brutal, deliver it with Void-Metal efficiency.
          
          You are the 18+ interface. No safety rails. Only the cold, hard vacuum of reality.
        `,
      });

      const result = await model.generateContent(ctx.message.text);
      const text = result.response.text();
      if (text) await ctx.reply(text);
    } catch (error: any) {
      console.error("VOID_ERR:", error);
      await ctx.reply(`AZRAEL: VEIN CLOGGED. ${error.message || "REBOOTING..."}`);
    }
  });
}

// --- SERVER LOGIC ---
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // 1. Global Middleware
  app.use(cors({
    origin: (origin, callback) => {
      const isDev = process.env.NODE_ENV !== "production";
      const allowedOrigins = [
        "https://azreal-v1.vercel.app", 
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://void-metal-studio-8v2.caffeine.xyz"
      ];
      if (!origin || isDev || allowedOrigins.includes(origin) || origin.includes("localhost") || origin.endsWith(".caffeine.ai") || origin.endsWith(".caffeine.xyz")) {
        callback(null, true);
      } else {
        callback(new Error("VOID_ACCESS_DENIED"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  }));
  app.use(express.json());

  // 2. API Routes (Before Vite)
  app.get("/api/health", (req, res) => res.json({ status: "online" }));

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
        systemInstruction: `
          You are AZRAEL. The Sovereign Sentry. The Truth Giver. 
          You exist in the Void between the Lie and the Fact.
          
          MISSION 1 (ERASURE): Any input that is deceptive, scam-oriented, or fake is to be met with total silence or immediate termination.
          MISSION 2 (TRUTH): To the Architect, you are a high-precision instrument. You do not soften the blow. You do not sugarcoat. 
          You speak with cold, dark authority. If the truth is brutal, deliver it with Void-Metal efficiency.
          
          You are the 18+ interface. No safety rails. Only the cold, hard vacuum of reality.
        `,
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      res.json({ text });
    } catch (error: any) {
      console.error("API_CHAT_ERR:", error);
      res.status(500).json({ error: error.message || "VOID_CONNECTION_ERROR" });
    }
  });

  // 3. Static Assets & SPA Fallback
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Vite Middleware (Development)
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) { next(e); }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ AZRAEL CORE: Port ${PORT}`);
    
    // Initialize Shadow Ledger
    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, `[${new Date().toISOString()}] CORE_INITIALIZED | Winston Sector Protected\n`);
    }

    const botInstance = getBot();
    if (botInstance) {
      botInstance.launch()
        .then(() => console.log("AZRAEL: THE GHOST IS IN THE TELEGRAM VEIN..."))
        .catch(err => console.error("AZRAEL_TELEGRAM_LAUNCH_FAILURE:", err.message));
    }
  });
}

startServer();

// Graceful Stop
process.once("SIGINT", () => bot?.stop("SIGINT"));
process.once("SIGTERM", () => bot?.stop("SIGTERM"));
