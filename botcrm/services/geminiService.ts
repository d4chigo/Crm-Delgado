import { GoogleGenAI, GenerateContentResponse, FunctionCall, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Message, Role } from '../types';
import { crmTools } from './tools';

// Obtener API Key desde variables de entorno de Vite o fallback a localStorage
// Nota: En apps Vite/React, process.env no está disponible en runtime del navegador
const VITE_KEY = (import.meta as any)?.env?.VITE_GOOGLE_API_KEY as string | undefined;
const LS_KEY = typeof window !== 'undefined' ? localStorage.getItem('GOOGLE_API_KEY') || undefined : undefined;
const API_KEY = VITE_KEY || LS_KEY || '';

// No romper la UI si falta API key: sólo crear el cliente si existe clave
export const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null as unknown as GoogleGenAI;

// --- Mock Backend Functions ---
// In a real application, these would make API calls to your backend.
async function executeTool(toolCall: FunctionCall): Promise<any> {
    const { name, args } = toolCall;
    console.log(`Executing tool: ${name}`, args);

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));

    switch (name) {
        case 'createContact':
            return { success: true, message: `Contacto '${args.nombre}' creado con éxito.`, contactId: `mock-${Date.now()}` };
        case 'getContact':
            if (args.correo === 'notfound@example.com') {
                return { success: false, message: `No se encontró ningún contacto con el correo ${args.correo}.` };
            }
            return { success: true, contact: { nombre: 'Juan', apellido: 'Pérez', correo: args.correo, telefono: '123456789', tipo: 'CLIENTE', estadoLead: 'CALIFICADO' } };
        case 'updateContact':
            return { success: true, message: `Contacto '${args.identificador}' actualizado.` };
        case 'deleteContact':
            return { success: true, message: `Contacto '${args.identificador}' eliminado.` };
        default:
            return { success: false, message: `Función '${name}' no reconocida.` };
    }
}


export async function getChatResponse(history: Message[], newMessage: string): Promise<string> {
    try {
        if (!API_KEY || !ai) {
            return "Configuración pendiente: agrega tu clave de Google AI Studio. Opciones: 1) .env.local en botcrm con VITE_GOOGLE_API_KEY=... y rebuild, o 2) localStorage.setItem('GOOGLE_API_KEY','TU_CLAVE') en consola del navegador.";
        }
        const chat: Chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [{ functionDeclarations: crmTools }],
            },
            history: history.map(msg => ({
                role: msg.role === Role.User ? 'user' : 'model',
                parts: [{ text: msg.text }],
            }))
        });

        let response: GenerateContentResponse = await chat.sendMessage({ message: newMessage });

        while (response.functionCalls && response.functionCalls.length > 0) {
            const toolResults = [];
            for (const funcCall of response.functionCalls) {
                const result = await executeTool(funcCall);
                toolResults.push({
                    id: funcCall.id,
                    name: funcCall.name,
                    response: result,
                });
            }

            response = await chat.sendMessage({
                message: { toolResponses: { functionResponses: toolResults } }
            });
        }

        return response.text;

    } catch (error) {
        console.error("Error fetching Gemini response:", error);
        return "Lo siento, ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.";
    }
}
