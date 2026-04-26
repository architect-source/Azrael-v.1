// src/server/routes/chat.ts
import { Request, Response } from 'express';
import { icpAgent } from '../icp';
import { genAI } from '../ai';
import { validateConstraints, nullAction } from '../safety';
import { getSovereignDb } from '../../lib/firebase-admin';

const SCAM_KEYWORDS = [
  /crypto|trade|invest|free|giveaway|click here|fx-trade/i,
  /casino|win rate|instant withdrawal/i,
  /user7436321705934/i
];

export async function handleChat(req: Request, res: Response) {
  const { message, sessionId, userPrincipal, payload, identityProof } = req.body;
  console.log(`[AZRAEL] CHAT_STRIKE: Session=${sessionId} Msg=${message?.substring(0, 50)}...`);
  
  // SCAMMER_DETECTION_PROTOCOL
  const isScam = SCAM_KEYWORDS.some(regex => regex.test(message));
  if (isScam) {
    console.warn(`[AZRAEL] SCAM_DETECTED: Session=${sessionId}`);
    try {
      let db = getSovereignDb();
      const entry = {
        timestamp: new Date().toISOString(),
        type: 'SCAM',
        content: `BREACH_DETECTED // SCAMMER_ATTEMPT: ${message.substring(0, 100)}...`,
        sessionId: sessionId || 'unknown',
        principal: userPrincipal || 'anonymous'
      };
      
      try {
        await db.collection('shadow_ledger').add(entry);
      } catch (e: any) {
        if (e.message?.includes('NOT_FOUND') || e.code === 5) {
          console.warn("AZRAEL // NAMED_DATABASE_NOT_FOUND // FALLING_BACK_TO_DEFAULT");
          const { getFirestore } = await import('firebase-admin/firestore');
          await getFirestore().collection('shadow_ledger').add(entry);
        } else {
          throw e;
        }
      }
    } catch (e) {
      console.error("FIRESTORE_LEDGER_WRITE_FAILURE:", e);
    }
    
    return res.json({
      response: "AZRAEL // BREACH_DETECTED // ACCESS_TERMINATED. Your attempt to pollute the void has been logged in the Shadow Ledger.",
      sessionId,
      state: 'guarding',
      msgId: Date.now().toString()
    });
  }

  try {
    console.log(`[AZRAEL] FETCHING_SESSION: Session=${sessionId}`);
    // Drift check via canister state
    const session = await icpAgent.getSession(sessionId);
    console.log(`[AZRAEL] SESSION_RETRIEVED: Session=${sessionId} Found=${!!session}`);
    
    if (!session || !validateConstraints(session)) {
      console.warn(`[AZRAEL] SESSION_DRIFT: Session=${sessionId}`);
      return res.json(nullAction(sessionId));
    }
    
    console.log(`[AZRAEL] PROCESSING_MESSAGE: Session=${sessionId}`);
    // Sovereign Strike: Process through the canister's state machine
    let result = await icpAgent.processMessage(sessionId, payload || {
      ciphertext: Array.from(Buffer.from(message || "")),
      nonce: Array.from(Buffer.from([])),
      version: "xchacha20poly1305-v1"
    }, identityProof);
    console.log(`[AZRAEL] MESSAGE_PROCESSED: Session=${sessionId} State=${Object.keys(result.state)[0]}`);
    
    const stateMap: Record<string, string> = {
      active: 'vigilant',
      degraded: 'dimmed',
      survival: 'guarding',
      recovery: 'reforming'
    };

    const rawState = Object.keys(result.state)[0].toLowerCase();
    const mappedState = stateMap[rawState] || 'vigilant';

    // If canister requires proxy for AI inference, we tell the client to do it.
    const requiresAI = result.requires_proxy || !result.content;

    res.json({ 
      response: result.content || "",
      sessionId,
      state: mappedState,
      requiresAI,
      msgId: result.msg_id.toString(),
      integrity: 100,
      activeSessions: 1
    });
    
  } catch (err: any) {
    console.error("[AZRAEL] CHAT_HANDLER_FAILURE:", err);
    
    // Tell client to fallback to local AI
    res.json({ 
      response: "",
      sessionId,
      state: 'dimmed',
      requiresAI: true,
      integrity: 80,
      activeSessions: 1
    });
  }
}
