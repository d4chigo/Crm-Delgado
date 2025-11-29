/**
 * Rutas MCP
 * Endpoints para acceso a datos del CRM desde Gemini
 * NOTA: Estas rutas son públicas (sin autenticación) para que Gemini pueda acceder
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

// Logging middleware para debugging
router.use((req, res, next) => {
  console.log(`[MCP] ${req.method} ${req.path}`, {
    query: req.query,
    timestamp: new Date().toISOString()
  });
  next();
});

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

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'MCP API está funcionando correctamente'
  });
});

// Configuración del chatbot
router.get('/config', (req, res) => {
  res.json({
    apiKey: process.env.VITE_GOOGLE_API_KEY || '',
    apiUrl: process.env.VITE_API_URL || 'http://localhost:5000/api',
    mcpEndpoints: {
      analysis: '/api/mcp/analysis',
      marketingInsights: '/api/mcp/marketing-insights',
      leads: '/api/mcp/leads',
      clientes: '/api/mcp/clientes',
      oportunidades: '/api/mcp/oportunidades',
      actividad: '/api/mcp/actividad',
      contacto: '/api/mcp/contacto/:correo',
      estadisticas: '/api/mcp/estadisticas-agentes'
    }
  });
});

export default router;
