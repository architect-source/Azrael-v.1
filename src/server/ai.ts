// src/server/ai.ts
import { getAI, SYSTEM_INSTRUCTION } from "../lib/core";

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const genAI = {
  async generate(message: string, options: { context: any }, retries = 3, delay = 1000): Promise<string> {
    console.log(`[AZRAEL] AI_GENERATE_START: Msg=${message.substring(0, 30)}...`);
    
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
          const ai = await getAI();
          
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: message,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION
            }
          });
    
          console.log(`[AZRAEL] AI_GENERATE_SUCCESS: ResponseLength=${response.text?.length}`);
          return response.text;
        } catch (err: any) {
          lastError = err;
          console.error(`[AZRAEL] AI_GENERATE_FAILURE (Attempt ${i + 1}/${retries}):`, err.message);
          
          // Check for 503 (Service Unavailable)
          if (err.status === 503 || err.code === 503 || err.message?.includes('503')) {
            if (i < retries - 1) {
                console.log(`[AZRAEL] RETRYING_IN_${delay}ms...`);
                await wait(delay);
                delay *= 2; // exponential backoff
                continue;
            }
          } else {
            // Don't retry for other errors
            break;
          }
        }
    }
    
    console.error(`[AZRAEL] AI_GENERATE_FATAL_FAILURE:`, lastError?.message);
    // Fallback to a static message if AI is truly dead
    return "AZRAEL: THE VOID IS TURBULENT. I CANNOT ECHO YOUR WHISPER AT THIS MOMENT.";
  }
};
