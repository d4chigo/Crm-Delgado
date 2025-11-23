import { Router } from 'express';
import {
  reporteLeads,
  reporteConversion,
  reporteActividad,
  reporteVentasCerradas,
  reporteClientesActivos,
  reporteTiempoEficiencia,
  reporteFuenteLeads,
} from '@/controllers/reportes.controller';
import { autenticar } from '@/middlewares/autenticacion.middleware';

const router = Router();

// Todos los reportes requieren autenticación
router.use(autenticar);

/**
 * Reporte de Leads
 * GET /api/reportes/leads?usuarioId=xxx&fechaInicio=xxx&fechaFin=xxx
 */
router.get('/leads', reporteLeads);

/**
 * Reporte de Conversión
 * GET /api/reportes/conversion?fechaInicio=xxx&fechaFin=xxx
 */
router.get('/conversion', reporteConversion);

/**
 * Reporte de Actividad
 * GET /api/reportes/actividad?usuarioId=xxx&fechaInicio=xxx&fechaFin=xxx
 */
router.get('/actividad', reporteActividad);

/**
 * Reporte de Ventas Cerradas
 * GET /api/reportes/ventas-cerradas?fechaInicio=xxx&fechaFin=xxx
 */
router.get('/ventas-cerradas', reporteVentasCerradas);

/**
 * Reporte de Clientes Activos
 * GET /api/reportes/clientes-activos
 */
router.get('/clientes-activos', reporteClientesActivos);

/**
 * Análisis de Tiempo y Eficiencia
 * GET /api/reportes/tiempo-eficiencia?usuarioId=xxx
 */
router.get('/tiempo-eficiencia', reporteTiempoEficiencia);

/**
 * Reporte de Fuente de Leads
 * GET /api/reportes/fuente-leads?fechaInicio=xxx&fechaFin=xxx
 */
router.get('/fuente-leads', reporteFuenteLeads);

export default router;
