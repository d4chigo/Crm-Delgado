/**
 * Rutas MCP
 * Endpoints para acceso a datos del CRM desde Gemini
 */

import { Router } from 'express';
import {
  getAnalysis,
  getMarketingInsights,
  getLeads,
  getClientes,
  getOportunidades,
  getActividad,
  getContacto,
  getEstadisticas,
} from '@/controllers/mcpController';

const router = Router();

// Análisis y datos generales
router.get('/analysis', getAnalysis);
router.get('/marketing-insights', getMarketingInsights);

// Leads
router.get('/leads', getLeads);

// Clientes
router.get('/clientes', getClientes);

// Oportunidades
router.get('/oportunidades', getOportunidades);

// Actividad
router.get('/actividad', getActividad);

// Contacto
router.get('/contacto/:correo', getContacto);

// Estadísticas
router.get('/estadisticas-agentes', getEstadisticas);

// Configuración del chatbot
router.get('/config', (req, res) => {
  res.json({
    apiKey: process.env.VITE_GOOGLE_API_KEY || '',
    apiUrl: process.env.VITE_API_URL || 'http://localhost:5000/api'
  });
});

export default router;
