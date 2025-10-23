import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.SERVER_GEMINI_API_KEY || '';

if (!apiKey) {
  // No lanzamos excepción aquí para no tumbar el server; los controladores pueden validar y responder mejor
  console.warn('SERVER_GEMINI_API_KEY no configurado. Las funciones de voz/AI fallarán.');
}

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
