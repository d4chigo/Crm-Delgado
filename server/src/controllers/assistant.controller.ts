import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getCRMContext } from '@/services/crm-context.service';

const apiKey = process.env.SERVER_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function askAssistant(req: Request, res: Response) {
  try {
    if (!ai) {
      return res.status(500).json({ exito: false, error: 'SERVER_GEMINI_API_KEY no configurada' });
    }

    const { question } = req.body as { question: string };
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ exito: false, error: 'Pregunta inválida' });
    }

    // Obtener contexto completo del CRM con datos reales
    const context = await getCRMContext();

    const systemInstruction = `Eres un asistente analítico experto para un CRM inmobiliario llamado "CRM Delgado".

Respondes en español, de manera concisa y profesional, usando métricas y datos concretos del contexto proporcionado.

Capacidades:
- Analizar leads, contactos, oportunidades y cotizaciones
- Reportar ventas ganadas y valores monetarios
- Identificar tendencias mensuales
- Comparar proyectos y estados
- Calcular tasas de conversión

Cuando te pregunten por datos que están en el contexto, úsalos directamente. Si falta información, sugiere cómo obtenerla en el CRM.

Formato de respuesta:
- Usa números concretos del contexto
- Incluye montos en soles (S/) cuando sea relevante
- Mantén respuestas breves (máximo 3-4 líneas)
- Si hay tendencias positivas/negativas, menciónalo`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `Contexto del CRM (datos actuales):
${JSON.stringify(context, null, 2)}

Pregunta del usuario:
${question}` }] },
      ],
      config: { systemInstruction },
    });

    return res.json({ exito: true, datos: { answer: response.text } });
  } catch (error) {
    console.error('[Assistant] Error:', error);
    return res.status(500).json({ exito: false, error: 'Error procesando la pregunta' });
  }
}
