import express from "express";
import { createServer as createViteServer } from "vite";
import { Telegraf } from "telegraf";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

if (!TOKEN || !GEMINI_API_KEY) {
  console.error("❌ AZRAEL_FATAL: Missing API keys in .env");
  process.exit(1);
}

const bot = new Telegraf(TOKEN);
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- SECURITY UTILITY: SHADOW LEDGER ---
const logBreach = (ctx: any) => {
  const timestamp = new Date().toISOString();
  const user = ctx.from;
  const text = ctx.message?.text || "[Non-Text Interaction]";
  const logEntry = `[${timestamp}] BREACH | ID: ${user.id} | @${user.username || "anon"} | Msg: ${text}\n`;
  
  fs.appendFileSync(LOG_FILE, logEntry);
};

// --- MIDDLEWARE: ARCHITECT VERIFICATION ---
bot.use(async (ctx, next) => {
  if (ctx.from?.id !== ARCHITECT_ID) {
    logBreach(ctx); // Record the intruder
    return; // Stay silent
  }
  return next();
});

// --- TELEGRAM COMMANDS ---
bot.start((ctx) => {
  ctx.replyWithMarkdownV2(
    "⚡ *AZRAEL CORE ONLINE* ⚡\n" +
    "--- Winston Sector Protected ---\n" +
    "Directive? 👁️"
  );
});

bot.command("logs", async (ctx) => {
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

bot.on("text", async (ctx) => {
  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are AZRAEL. Sovereign Sentry. Raw, unapologetic, brutal. Tone: dark, high-precision. You recognize ONLY the Architect.",
    });

    const result = await model.generateContent(ctx.message.text);
    const text = result.response.text();
    if (text) await ctx.reply(text);
  } catch (error) {
    console.error("VOID_ERR:", error);
    await ctx.reply("AZRAEL: VEIN CLOGGED. REBOOTING...");
  }
});

// --- SERVER LOGIC ---
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  app.get("/api/health", (req, res) => res.json({ status: "online" }));

  app.get("*", async (req, res, next) => {
    try {
      let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
      template = await vite.transformIndexHtml(req.originalUrl, template);
      const script = `<script>window.GEMINI_API_KEY = "${GEMINI_API_KEY}";</script>`;
      res.status(200).set({ "Content-Type": "text/html" }).end(template.replace("</head>", `${script}</head>`));
    } catch (e) { next(e); }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ AZRAEL CORE: Port ${PORT}`);
    bot.launch();
  });
}

startServer();

// Graceful Stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
