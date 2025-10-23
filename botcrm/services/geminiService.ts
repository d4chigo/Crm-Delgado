
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Message, Role } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getChatResponse(history: Message[], newMessage: string): Promise<string> {
    try {
        const chatContents = history.map(msg => ({
            role: msg.role === Role.User ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        chatContents.push({
            role: 'user',
            parts: [{ text: newMessage }],
        });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: chatContents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error fetching Gemini response:", error);
        return "Lo siento, ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.";
    }
}
