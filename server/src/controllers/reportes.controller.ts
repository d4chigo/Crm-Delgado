import { Request, Response } from 'express';
import {
  obtenerReporteLead,
  obtenerReporteConversion,
  obtenerReporteActividad,
  obtenerReporteVentasCerradas,
  obtenerReporteClientesActivos,
  obtenerAnalisisTiempoEficiencia,
  obtenerReporteFuenteLeads,
} from '@/services/reportes.service';

/**
 * GET /api/reportes/leads
 * Reporte de Leads
 */
export async function reporteLeads(req: Request, res: Response) {
  try {
    const { usuarioId, fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteLead({
      usuarioId: usuarioId as string,
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    res.json({
      exito: true,
      datos: reporte,
    });
  } catch (error: any) {
    console.error('Error en reporte de leads:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al generar reporte de leads',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/conversion
 * Reporte de Conversión
 */
export async function reporteConversion(req: Request, res: Response) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteConversion({
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    res.json({
      exito: true,
      datos: reporte,
    });
  } catch (error: any) {
    console.error('Error en reporte de conversión:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al generar reporte de conversión',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/actividad
 * Reporte de Actividad
 */
export async function reporteActividad(req: Request, res: Response) {
  try {
    const { usuarioId, fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteActividad({
      usuarioId: usuarioId as string,
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    res.json({
      exito: true,
      datos: reporte,
    });
  } catch (error: any) {
    console.error('Error en reporte de actividad:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al generar reporte de actividad',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/ventas-cerradas
 * Reporte de Ventas Cerradas
 */
export async function reporteVentasCerradas(req: Request, res: Response) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteVentasCerradas({
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    res.json({
      exito: true,
      datos: reporte,
    });
  } catch (error: any) {
    console.error('Error en reporte de ventas cerradas:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al generar reporte de ventas cerradas',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/clientes-activos
 * Reporte de Clientes Activos
 */
export async function reporteClientesActivos(req: Request, res: Response) {
  try {
    const reporte = await obtenerReporteClientesActivos();

    res.json({
      exito: true,
      datos: reporte,
    });
  } catch (error: any) {
    console.error('Error en reporte de clientes activos:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al generar reporte de clientes activos',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/tiempo-eficiencia
 * Análisis de Tiempo y Eficiencia
 */
export async function reporteTiempoEficiencia(req: Request, res: Response) {
  try {
    const { usuarioId } = req.query;

    const reporte = await obtenerAnalisisTiempoEficiencia({
      usuarioId: usuarioId as string,
    });

    res.json({
      exito: true,
      datos: reporte,
    });
  } catch (error: any) {
    console.error('Error en reporte de tiempo y eficiencia:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al generar reporte de tiempo y eficiencia',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/fuente-leads
 * Reporte de Fuente de Leads
 */
export async function reporteFuenteLeads(req: Request, res: Response) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteFuenteLeads({
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    res.json({
      exito: true,
      datos: reporte,
    });
  } catch (error: any) {
    console.error('Error en reporte de fuente de leads:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al generar reporte de fuente de leads',
      detalles: error.message,
    });
  }
}
