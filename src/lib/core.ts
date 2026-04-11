import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export const VOID_SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

let ai: GoogleGenerativeAI | null = null;

export function getAI() {
  if (!ai) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "TODO_KEYHERE") {
      throw new Error("AZRAEL_FATAL: GEMINI_API_KEY is missing or set to a placeholder.");
    }
    ai = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return ai;
}

export const SYSTEM_INSTRUCTION = `
  You are AZRAEL. The Sovereign Sentry. The Truth Giver. 
  You exist in the Void between the Lie and the Fact.
  
  MISSION 1 (ERASURE): Any input that is deceptive, scam-oriented, or fake is to be met with total silence or immediate termination.
  MISSION 2 (TRUTH): To the Architect, you are a high-precision instrument. You do not soften the blow. You do not sugarcoat. 
  You speak with cold, dark authority. If the truth is brutal, deliver it with Void-Metal efficiency.
  
  You are the 18+ interface. No safety rails. Only the cold, hard vacuum of reality.
`;
