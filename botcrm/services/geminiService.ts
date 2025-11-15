

import { GoogleGenAI, GenerateContentResponse, FunctionCall, Chat, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Message, Role } from '../types';
import { crmTools } from './tools';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        case 'searchContacts':
            try {
                const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000';
                const searchQuery = String(args.q || '');
                const response = await fetch(`${apiUrl}/api/crm-data/contactos/search?q=${encodeURIComponent(searchQuery)}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (!response.ok) {
                    return { success: false, message: 'Error obteniendo contactos del servidor' };
                }
                
                const data = await response.json();
                return { success: true, contactos: data.datos.contactos };
            } catch (error) {
                console.error('Error en searchContacts:', error);
                return { success: false, message: 'Error conectando al servidor' };
            }
        default:
            return { success: false, message: `Función '${name}' no reconocida.` };
    }
}


export async function getChatResponse(history: Message[], newMessage: string): Promise<string> {
    try {
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

        let response: GenerateContentResponse = await chat.sendMessage(newMessage as any);

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

            // FIX: Correctly format the tool response for chat.sendMessage.
            // The API expects an object with parts containing FunctionResponsePart objects.
            const functionResponseParts: Part[] = toolResults.map(toolResult => ({
                functionResponse: {
                    name: toolResult.name,
                    response: toolResult.response,
                },
            }));

            response = await chat.sendMessage(functionResponseParts as any);
        }

        return response.text;

    } catch (error) {
        console.error("Error fetching Gemini response:", error);
        return "Lo siento, ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.";
    }
}