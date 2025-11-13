
import { FunctionDeclaration, Type } from '@google/genai';

export const createContactFunction: FunctionDeclaration = {
  name: 'createContact',
  description: 'Crea un nuevo contacto o lead en el CRM.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      nombre: { type: Type.STRING, description: 'Nombre del contacto.' },
      apellido: { type: Type.STRING, description: 'Apellido del contacto.' },
      correo: { type: Type.STRING, description: 'Correo electrónico del contacto.' },
      telefono: { type: Type.STRING, description: 'Número de teléfono del contacto.' },
      tipo: { type: Type.STRING, description: "Tipo de contacto, puede ser 'LEAD', 'CONTACTO' o 'CLIENTE'.", enum: ['LEAD', 'CONTACTO', 'CLIENTE'] },
    },
    required: ['nombre', 'correo', 'tipo'],
  },
};

export const getContactFunction: FunctionDeclaration = {
  name: 'getContact',
  description: 'Busca y obtiene la información de un contacto por su correo electrónico.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      correo: { type: Type.STRING, description: 'Correo electrónico del contacto a buscar.' },
    },
    required: ['correo'],
  },
};

export const updateContactFunction: FunctionDeclaration = {
    name: 'updateContact',
    description: 'Actualiza la información de un contacto existente usando su ID o correo.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            identificador: { type: Type.STRING, description: 'ID o correo electrónico del contacto a actualizar.' },
            datos: {
                type: Type.OBJECT,
                description: 'Los campos a actualizar. Incluye solo los campos que cambian.',
                properties: {
                    nombre: { type: Type.STRING },
                    apellido: { type: Type.STRING },
                    telefono: { type: Type.STRING },
                    estadoLead: { type: Type.STRING, enum: ['NUEVO', 'CONTACTADO', 'CALIFICADO', 'NEGOCIACION', 'PROPUESTA', 'GANADO', 'PERDIDO', 'EN_ESPERA'] },
                    prioridad: { type: Type.STRING, enum: ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'] },
                }
            }
        },
        required: ['identificador', 'datos']
    }
};

export const deleteContactFunction: FunctionDeclaration = {
    name: 'deleteContact',
    description: 'Elimina un contacto del CRM usando su ID o correo electrónico.',
    parameters: {
        type: Type.OBJECT,
        properties: {
             identificador: { type: Type.STRING, description: 'ID o correo electrónico del contacto a eliminar.' },
        },
        required: ['identificador']
    }
};

export const getCRMStatsFunction: FunctionDeclaration = {
    name: 'getCRMStats',
    description: 'Obtiene estadísticas generales del CRM incluyendo total de contactos, proyectos, tasa de conversión e ingresos.',
    parameters: {
        type: Type.OBJECT,
        properties: {},
        required: [],
    }
};

export const getMarketingAnalysisFunction: FunctionDeclaration = {
    name: 'getMarketingAnalysis',
    description: 'Genera un análisis completo de marketing basado en los datos del CRM, incluyendo recomendaciones de dónde enfocar esfuerzos.',
    parameters: {
        type: Type.OBJECT,
        properties: {},
        required: [],
    }
};

export const getRecommendationsFunction: FunctionDeclaration = {
    name: 'getRecommendations',
    description: 'Obtiene recomendaciones personalizadas para mejorar el negocio basadas en los datos actuales del CRM.',
    parameters: {
        type: Type.OBJECT,
        properties: {},
        required: [],
    }
};

export const getContactosByStateFunction: FunctionDeclaration = {
    name: 'getContactosByState',
    description: 'Obtiene contactos filtrados por estado (NUEVO, CONTACTADO, CALIFICADO, etc.)',
    parameters: {
        type: Type.OBJECT,
        properties: {
            estado: { type: Type.STRING, description: 'Estado del lead a filtrar', enum: ['NUEVO', 'CONTACTADO', 'CALIFICADO', 'NEGOCIACION', 'PROPUESTA', 'GANADO', 'PERDIDO', 'EN_ESPERA'] },
            limite: { type: Type.INTEGER, description: 'Número máximo de contactos a retornar (default: 10)' }
        },
        required: ['estado']
    }
};

export const crmTools: FunctionDeclaration[] = [
    createContactFunction,
    getContactFunction,
    updateContactFunction,
    deleteContactFunction,
    getCRMStatsFunction,
    getMarketingAnalysisFunction,
    getRecommendationsFunction,
    getContactosByStateFunction
];
