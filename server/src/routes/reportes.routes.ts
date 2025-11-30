import { Router } from 'express';
import {
  reporteLeads,
  reporteConversion,
  reporteActividad,
  reporteVentasCerradas,
  reporteClientesActivos,
  reporteTiempoEficiencia,
  reporteFuenteLeads,
  exportarReporteLeadsPDF,
  exportarReporteLeadsExcel,
  exportarReporteConversionPDF,
  exportarReporteConversionExcel,
  exportarReporteActividadPDF,
  exportarReporteActividadExcel,
  exportarReporteVentasCerradasPDF,
  exportarReporteVentasCerradasExcel,
  exportarReporteClientesActivosPDF,
  exportarReporteClientesActivosExcel,
  exportarReporteTiempoEficienciaPDF,
  exportarReporteTiempoEficienciaExcel,
  exportarReporteFuenteLeadsPDF,
  exportarReporteFuenteLeadsExcel,
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
 * Exportar Reporte de Leads a PDF
 * GET /api/reportes/leads/exportar/pdf?usuarioId=xxx&fechaInicio=xxx&fechaFin=xxx
 */
router.get('/leads/exportar/pdf', exportarReporteLeadsPDF);

/**
 * Exportar Reporte de Leads a Excel
 * GET /api/reportes/leads/exportar/excel?usuarioId=xxx&fechaInicio=xxx&fechaFin=xxx
 */
router.get('/leads/exportar/excel', exportarReporteLeadsExcel);

/**
 * Reporte de Conversión
 * GET /api/reportes/conversion?fechaInicio=xxx&fechaFin=xxx
 */
router.get('/conversion', reporteConversion);

/**
 * Exportar Reporte de Conversión a PDF
 * GET /api/reportes/conversion/exportar/pdf?fechaInicio=xxx&fechaFin=xxx
 */
router.get('/conversion/exportar/pdf', exportarReporteConversionPDF);

/**
 * Exportar Reporte de Conversión a Excel
 * GET /api/reportes/conversion/exportar/excel?fechaInicio=xxx&fechaFin=xxx
 */
router.get('/conversion/exportar/excel', exportarReporteConversionExcel);

/**
 * Reporte de Actividad
 * GET /api/reportes/actividad?usuarioId=xxx&fechaInicio=xxx&fechaFin=xxx
 */
router.get('/actividad', reporteActividad);

/**
 * Exportar Reporte de Actividad a PDF
 * GET /api/reportes/actividad/exportar/pdf?usuarioId=xxx&fechaInicio=xxx&fechaFin=xxx
 */
router.get('/actividad/exportar/pdf', exportarReporteActividadPDF);

/**
 * Exportar Reporte de Actividad a Excel
 * GET /api/reportes/actividad/exportar/excel?usuarioId=xxx&fechaInicio=xxx&fechaFin=xxx
 */
router.get('/actividad/exportar/excel', exportarReporteActividadExcel);

/**
 * Reporte de Ventas Cerradas
 * GET /api/reportes/ventas-cerradas?fechaInicio=xxx&fechaFin=xxx
 */
router.get('/ventas-cerradas', reporteVentasCerradas);

/**
 * Exportar Reporte de Ventas Cerradas a PDF
 * GET /api/reportes/ventas-cerradas/exportar/pdf?fechaInicio=xxx&fechaFin=xxx
 */
router.get('/ventas-cerradas/exportar/pdf', exportarReporteVentasCerradasPDF);

/**
 * Exportar Reporte de Ventas Cerradas a Excel
 * GET /api/reportes/ventas-cerradas/exportar/excel?fechaInicio=xxx&fechaFin=xxx
 */
router.get('/ventas-cerradas/exportar/excel', exportarReporteVentasCerradasExcel);

/**
 * Reporte de Clientes Activos
 * GET /api/reportes/clientes-activos
 */
router.get('/clientes-activos', reporteClientesActivos);

/**
 * Exportar Reporte de Clientes Activos a PDF
 * GET /api/reportes/clientes-activos/exportar/pdf
 */
router.get('/clientes-activos/exportar/pdf', exportarReporteClientesActivosPDF);

/**
 * Exportar Reporte de Clientes Activos a Excel
 * GET /api/reportes/clientes-activos/exportar/excel
 */
router.get('/clientes-activos/exportar/excel', exportarReporteClientesActivosExcel);

/**
 * Análisis de Tiempo y Eficiencia
 * GET /api/reportes/tiempo-eficiencia?usuarioId=xxx
 */
router.get('/tiempo-eficiencia', reporteTiempoEficiencia);

/**
 * Exportar Análisis de Tiempo y Eficiencia a PDF
 * GET /api/reportes/tiempo-eficiencia/exportar/pdf?usuarioId=xxx
 */
router.get('/tiempo-eficiencia/exportar/pdf', exportarReporteTiempoEficienciaPDF);

/**
 * Exportar Análisis de Tiempo y Eficiencia a Excel
 * GET /api/reportes/tiempo-eficiencia/exportar/excel?usuarioId=xxx
 */
router.get('/tiempo-eficiencia/exportar/excel', exportarReporteTiempoEficienciaExcel);

/**
 * Reporte de Fuente de Leads
 * GET /api/reportes/fuente-leads?fechaInicio=xxx&fechaFin=xxx
 */
router.get('/fuente-leads', reporteFuenteLeads);

/**
 * Exportar Reporte de Fuente de Leads a PDF
 * GET /api/reportes/fuente-leads/exportar/pdf?fechaInicio=xxx&fechaFin=xxx
 */
router.get('/fuente-leads/exportar/pdf', exportarReporteFuenteLeadsPDF);

/**
 * Exportar Reporte de Fuente de Leads a Excel
 * GET /api/reportes/fuente-leads/exportar/excel?fechaInicio=xxx&fechaFin=xxx
 */
router.get('/fuente-leads/exportar/excel', exportarReporteFuenteLeadsExcel);

export default router;
