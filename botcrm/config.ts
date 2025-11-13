/**
 * Configuración del Bot CRM
 * Ajusta estos valores según tu entorno
 */

// URL base de tu API del CRM
// En desarrollo: http://localhost:3001/api
// En producción: https://tu-dominio.com/api
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

// Modelo de IA a usar
// Opciones: 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'
export const AI_MODEL = 'gemini-2.0-flash';

// Configuración de Gemini
export const GEMINI_CONFIG = {
    model: AI_MODEL,
    temperature: 0.7,
    maxTokens: 2048,
};

// Límites de paginación
export const PAGINATION = {
    defaultLimit: 10,
    maxLimit: 100,
};

// Estados de lead disponibles
export const LEAD_STATES = [
    'NUEVO',
    'CONTACTADO',
    'CALIFICADO',
    'NEGOCIACION',
    'PROPUESTA',
    'GANADO',
    'PERDIDO',
    'EN_ESPERA'
];

// Tipos de contacto
export const CONTACT_TYPES = [
    'LEAD',
    'CONTACTO',
    'CLIENTE'
];

// Prioridades
export const PRIORITIES = [
    'BAJA',
    'MEDIA',
    'ALTA',
    'URGENTE'
];
