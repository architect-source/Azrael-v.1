// src/server/ai.ts
import { getAI, SYSTEM_INSTRUCTION } from "../lib/core";

export const genAI = {
  async generate(message: string, options: { context: any }) {
    console.log(`[AZRAEL] AI_GENERATE_START: Msg=${message.substring(0, 30)}...`);
    try {
      const ai = getAI();
      
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
      console.error(`[AZRAEL] AI_GENERATE_FAILURE:`, err.message);
      // Fallback to a static message if AI is truly dead
      return "AZRAEL: THE VOID IS TURBULENT. I CANNOT ECHO YOUR WHISPER AT THIS MOMENT.";
    }
  }
};
