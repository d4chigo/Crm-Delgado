import { GoogleGenAI, GenerateContentResponse, FunctionCall, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Message, Role } from '../types';
import { crmTools } from './tools';
import { AI_MODEL } from '../config';
import { 
    getCRMStats, 
    generateMarketingAnalysis, 
    getPersonalizedRecommendations, 
    getContactos 
} from './crmDataService';

// Obtener API Key desde variables de entorno de Vite o fallback a localStorage
// Nota: En apps Vite/React, process.env no está disponible en runtime del navegador
const VITE_KEY = (import.meta as any)?.env?.VITE_GOOGLE_API_KEY as string | undefined;
const LS_KEY = typeof window !== 'undefined' ? localStorage.getItem('GOOGLE_API_KEY') || undefined : undefined;
const API_KEY = VITE_KEY || LS_KEY || '';

// No romper la UI si falta API key: sólo crear el cliente si existe clave
export const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null as unknown as GoogleGenAI;

// --- Backend Functions ---
// Ejecutar herramientas del CRM
async function executeTool(toolCall: FunctionCall): Promise<any> {
    const { name, args } = toolCall;
    console.log(`Executing tool: ${name}`, args);

    try {
        switch (name) {
            // Herramientas de contactos
            case 'createContact':
                return { success: true, message: `Contacto '${args.nombre}' creado con éxito.`, contactId: `contact-${Date.now()}` };
            
            case 'getContact':
                const contactos = await getContactos();
                const contacto = contactos.find(c => c.correo === args.correo);
                if (!contacto) {
                    return { success: false, message: `No se encontró ningún contacto con el correo ${args.correo}.` };
                }
                return { success: true, contact: contacto };
            
            case 'updateContact':
                return { success: true, message: `Contacto '${args.identificador}' actualizado.` };
            
            case 'deleteContact':
                return { success: true, message: `Contacto '${args.identificador}' eliminado.` };
            
            // Herramientas de análisis
            case 'getCRMStats':
                const stats = await getCRMStats();
                if (!stats) {
                    return { success: false, message: 'No se pudieron obtener las estadísticas del CRM.' };
                }
                return { success: true, stats };
            
            case 'getMarketingAnalysis':
                const analysis = await generateMarketingAnalysis();
                return { success: true, analysis };
            
            case 'getRecommendations':
                const recommendations = await getPersonalizedRecommendations();
                return { success: true, recommendations };
            
            case 'getContactosByState':
                const contactosByState = await getContactos({ 
                    estadoLead: args.estado,
                    limite: args.limite || 10 
                });
                return { success: true, contactos: contactosByState };
            
            default:
                return { success: false, message: `Función '${name}' no reconocida.` };
        }
    } catch (error) {
        console.error(`Error executing tool ${name}:`, error);
        return { success: false, message: `Error al ejecutar la función '${name}': ${error}` };
    }
}


export async function getChatResponse(history: Message[], newMessage: string): Promise<string> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (!API_KEY || !ai) {
                return "Configuración pendiente: agrega tu clave de Google AI Studio. Opciones: 1) .env.local en botcrm con VITE_GOOGLE_API_KEY=... y rebuild, o 2) localStorage.setItem('GOOGLE_API_KEY','TU_CLAVE') en consola del navegador.";
            }

            const chat: Chat = ai.chats.create({
                model: AI_MODEL,
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

        } catch (error: any) {
            lastError = error;
            const errorMessage = error?.message || String(error);
            const isRetryable = errorMessage.includes('503') || 
                               errorMessage.includes('overloaded') || 
                               errorMessage.includes('UNAVAILABLE') ||
                               errorMessage.includes('429');

            console.error(`Intento ${attempt}/${maxRetries} - Error:`, errorMessage);

            if (!isRetryable || attempt === maxRetries) {
                break;
            }

            // Esperar antes de reintentar (backoff exponencial)
            const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    // Si llegamos aquí, todos los intentos fallaron
    console.error("Error final después de reintentos:", lastError);
    
    const errorMessage = lastError?.message || String(lastError);
    if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        return "El servicio de IA está temporalmente sobrecargado. Por favor, intenta de nuevo en unos momentos.";
    }
    
    return "Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.";
}
