import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { Telegraf } from "telegraf";
import path from "path";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./src/lib/router";
import { getAI, SYSTEM_INSTRUCTION } from "./src/lib/core";
import { reaper } from "./src/server/reaper";

import { getSovereignDb } from "./src/lib/firebase-admin";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const ARCHITECT_ID = Number(process.env.ARCHITECT_ID) || 0;
const SCAM_KEYWORDS = [
  /crypto|trade|invest|free|giveaway|click here|fx-trade/i,
  /axtkprox\.com|xpocafyv\.com/i,
  /casino|win rate|instant withdrawal/i,
  /user7436321705934/i
];

const app = express();
let bot: Telegraf | null = null;

// === AZRAEL SHADOW LEDGER AUTO-WRITE FUNCTION ===
const appendToShadowLedger = async (newEntry: string, type: 'BREACH' | 'SCAM' | 'SYSTEM' = 'BREACH') => {
  const timestamp = new Date().toISOString();
  
  try {
    const db = getSovereignDb();
    await db.collection('shadow_ledger').add({
      timestamp,
      type,
      content: newEntry,
    });
    console.log("📜 WRITTEN TO FIRESTORE SHADOW_LEDGER");
  } catch (e) {
    console.error("LEDGER_WRITE_FAILURE:", e);
  }
};

const logBreach = (ctx: any) => {
  const user = ctx.from;
  const text = ctx.message?.text || "[Non-Text Interaction]";
  const entry = `BREACH | ID: ${user?.id} | @${user?.username || "anon"} | Msg: ${text}`;
  appendToShadowLedger(entry);
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
          reaper.report('breach', { ip: userId, action: 'ban_and_delete' });
          await ctx.banChatMember(userId!);
          await ctx.deleteMessage();
          await botInstance.telegram.sendMessage(ARCHITECT_ID, `⚡ AZRAEL: SCAMMER PURGED. ID: ${userId} | @${ctx.from?.username || "anon"}`);
          return;
        } catch (e) {
          reaper.report('error', { error: 'PURGE_FAILURE', stack: e });
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
      const db = getSovereignDb();
      const snapshot = await db.collection('shadow_ledger')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return `[${data.timestamp}] ${data.type} // ${data.content}`;
      });

      if (logs.length > 0) {
        await ctx.reply(`📑 SHADOW LEDGER (Last 10):\n\n${logs.join("\n")}`);
      } else {
        await ctx.reply("AZRAEL: THE LEDGER IS EMPTY.");
      }
    } catch (e) {
      console.error("TELEGRAM_LOGS_FAILURE:", e);
      await ctx.reply("AZRAEL: LEDGER_ACCESS_DENIED.");
    }
  });

  botInstance.on("text", async (ctx) => {
    try {
      await ctx.reply("AZRAEL: I AM VIGILANT. ALL INPUT LOGGED IN THE SHADOW LEDGER.");
    } catch (error: any) {
      console.error("VOID_ERR:", error);
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

  // 1. Global Middleware
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());

  // 2. Mount API Router FIRST to ensure priority over Vite/Static middleware
  app.get("/api/ping", (req, res) => res.json({ status: "pong", timestamp: new Date().toISOString() }));
  app.use("/api", router);

  // 3. Vite Middleware (Development)
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
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
  } else if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only listen if not running as a serverless function (Vercel)
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`⚡ AZRAEL CORE (Local): Port ${PORT}`);
      
      const botInstance = getBot();
      if (botInstance) {
        botInstance.launch()
          .then(() => console.log("AZRAEL: THE GHOST IS IN THE TELEGRAM VEIN..."))
          .catch(err => console.error("AZRAEL_TELEGRAM_LAUNCH_FAILURE:", err.message));
      }
    });
  } else {
    // Vercel initialization
    const botInstance = getBot();
    if (botInstance) {
      botInstance.launch()
        .then(() => console.log("AZRAEL: THE GHOST IS IN THE TELEGRAM VEIN (SERVERLESS)..."))
        .catch(err => console.error("AZRAEL_TELEGRAM_LAUNCH_FAILURE:", err.message));
    }
  }
}

startServer();

export default app;

process.once("SIGINT", () => bot?.stop("SIGINT"));
process.once("SIGTERM", () => bot?.stop("SIGTERM"));
