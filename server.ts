import express from "express";
import { createServer as createViteServer } from "vite";
import { Telegraf } from "telegraf";
import path from "path";
import fs from "fs";
import app from "./api/index"; // Import the Express app from the Vercel API entry
import { getAI, SYSTEM_INSTRUCTION } from "./src/lib/core";

const LOG_FILE = path.join(process.cwd(), "void_breaches.log");
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const ARCHITECT_ID = Number(process.env.ARCHITECT_ID) || 0;
const SCAM_KEYWORDS = [/crypto|trade|invest|free|giveaway|click here|fx-trade/i];

let bot: Telegraf | null = null;

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

    if (userId !== ARCHITECT_ID) {
      const isScam = SCAM_KEYWORDS.some(regex => regex.test(messageText));
      const isBot = ctx.from?.is_bot;
      
      if (isScam || isBot) {
        try {
          logBreach(ctx);
          await ctx.banChatMember(userId!);
          await ctx.deleteMessage();
          await botInstance.telegram.sendMessage(ARCHITECT_ID, `⚡ AZRAEL: SCAMMER PURGED. ID: ${userId} | @${ctx.from?.username || "anon"}`);
          return;
        } catch (e) {
          console.error("PURGE_FAILURE:", e);
        }
      }

      if (ctx.chat.type === "private") {
        logBreach(ctx);
        return;
      }
    }
    return next();
  });

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
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: ctx.message.text,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const text = response.text;
      if (text) await ctx.reply(text);
    } catch (error: any) {
      console.error("VOID_ERR:", error);
      await ctx.reply(`AZRAEL: VEIN CLOGGED. ${error.message || "REBOOTING..."}`);
    }
  });
}

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

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  // Vite Middleware (Development)
  if (process.env.NODE_ENV !== "production") {
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
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ AZRAEL CORE (Local): Port ${PORT}`);
    
    try {
      if (!fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, `[${new Date().toISOString()}] CORE_INITIALIZED | Winston Sector Protected\n`);
      }
    } catch (e) {
      console.warn("AZRAEL_LOG_INIT_FAILURE: Shadow Ledger restricted in this sector.");
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

process.once("SIGINT", () => bot?.stop("SIGINT"));
process.once("SIGTERM", () => bot?.stop("SIGTERM"));
