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
import { generarPDFReporte, generarExcelReporte } from '@/services/exportar-reportes.service';

/**
 * GET /api/reportes/leads
 * Reporte de Leads
 */
export async function reporteLeads(req: Request, res: Response) {
  try {
    const { usuarioId, fechaInicio, fechaFin } = req.query;

    console.log('[CONTROLLER] reporteLeads - Query params:', { usuarioId, fechaInicio, fechaFin });

    const reporte = await obtenerReporteLead({
      usuarioId: usuarioId as string,
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    console.log('[CONTROLLER] reporteLeads - Reporte obtenido:', reporte);

    // Desabilitar caché
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

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

/**
 * GET /api/reportes/leads/exportar/pdf
 * Exportar Reporte de Leads a PDF
 */
export async function exportarReporteLeadsPDF(req: Request, res: Response) {
  try {
    const { usuarioId, fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteLead({
      usuarioId: usuarioId as string,
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    const pdfBuffer = await generarPDFReporte('Reporte de Leads', reporte);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-leads.pdf"');
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Error exportando reporte de leads a PDF:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar reporte de leads',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/leads/exportar/excel
 * Exportar Reporte de Leads a Excel
 */
export async function exportarReporteLeadsExcel(req: Request, res: Response) {
  try {
    const { usuarioId, fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteLead({
      usuarioId: usuarioId as string,
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    const excelBuffer = await generarExcelReporte('Reporte de Leads', reporte);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-leads.xlsx"');
    res.send(excelBuffer);
  } catch (error: any) {
    console.error('Error exportando reporte de leads a Excel:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar reporte de leads',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/conversion/exportar/pdf
 * Exportar Reporte de Conversión a PDF
 */
export async function exportarReporteConversionPDF(req: Request, res: Response) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteConversion({
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    const pdfBuffer = await generarPDFReporte('Reporte de Conversión', reporte);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-conversion.pdf"');
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Error exportando reporte de conversión a PDF:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar reporte de conversión',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/conversion/exportar/excel
 * Exportar Reporte de Conversión a Excel
 */
export async function exportarReporteConversionExcel(req: Request, res: Response) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteConversion({
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    const excelBuffer = await generarExcelReporte('Reporte de Conversión', reporte);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-conversion.xlsx"');
    res.send(excelBuffer);
  } catch (error: any) {
    console.error('Error exportando reporte de conversión a Excel:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar reporte de conversión',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/actividad/exportar/pdf
 * Exportar Reporte de Actividad a PDF
 */
export async function exportarReporteActividadPDF(req: Request, res: Response) {
  try {
    const { usuarioId, fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteActividad({
      usuarioId: usuarioId as string,
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    const pdfBuffer = await generarPDFReporte('Reporte de Actividad', reporte);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-actividad.pdf"');
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Error exportando reporte de actividad a PDF:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar reporte de actividad',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/actividad/exportar/excel
 * Exportar Reporte de Actividad a Excel
 */
export async function exportarReporteActividadExcel(req: Request, res: Response) {
  try {
    const { usuarioId, fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteActividad({
      usuarioId: usuarioId as string,
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    const excelBuffer = await generarExcelReporte('Reporte de Actividad', reporte);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-actividad.xlsx"');
    res.send(excelBuffer);
  } catch (error: any) {
    console.error('Error exportando reporte de actividad a Excel:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar reporte de actividad',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/ventas-cerradas/exportar/pdf
 * Exportar Reporte de Ventas Cerradas a PDF
 */
export async function exportarReporteVentasCerradasPDF(req: Request, res: Response) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteVentasCerradas({
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    const pdfBuffer = await generarPDFReporte('Reporte de Ventas Cerradas', reporte);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-ventas-cerradas.pdf"');
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Error exportando reporte de ventas cerradas a PDF:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar reporte de ventas cerradas',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/ventas-cerradas/exportar/excel
 * Exportar Reporte de Ventas Cerradas a Excel
 */
export async function exportarReporteVentasCerradasExcel(req: Request, res: Response) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteVentasCerradas({
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    const excelBuffer = await generarExcelReporte('Reporte de Ventas Cerradas', reporte);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-ventas-cerradas.xlsx"');
    res.send(excelBuffer);
  } catch (error: any) {
    console.error('Error exportando reporte de ventas cerradas a Excel:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar reporte de ventas cerradas',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/clientes-activos/exportar/pdf
 * Exportar Reporte de Clientes Activos a PDF
 */
export async function exportarReporteClientesActivosPDF(req: Request, res: Response) {
  try {
    const reporte = await obtenerReporteClientesActivos();

    const pdfBuffer = await generarPDFReporte('Reporte de Clientes Activos', reporte);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-clientes-activos.pdf"');
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Error exportando reporte de clientes activos a PDF:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar reporte de clientes activos',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/clientes-activos/exportar/excel
 * Exportar Reporte de Clientes Activos a Excel
 */
export async function exportarReporteClientesActivosExcel(req: Request, res: Response) {
  try {
    const reporte = await obtenerReporteClientesActivos();

    const excelBuffer = await generarExcelReporte('Reporte de Clientes Activos', reporte);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-clientes-activos.xlsx"');
    res.send(excelBuffer);
  } catch (error: any) {
    console.error('Error exportando reporte de clientes activos a Excel:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar reporte de clientes activos',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/tiempo-eficiencia/exportar/pdf
 * Exportar Análisis de Tiempo y Eficiencia a PDF
 */
export async function exportarReporteTiempoEficienciaPDF(req: Request, res: Response) {
  try {
    const { usuarioId } = req.query;

    const reporte = await obtenerAnalisisTiempoEficiencia({
      usuarioId: usuarioId as string,
    });

    const pdfBuffer = await generarPDFReporte('Análisis de Tiempo y Eficiencia', reporte);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-tiempo-eficiencia.pdf"');
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Error exportando análisis de tiempo y eficiencia a PDF:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar análisis de tiempo y eficiencia',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/tiempo-eficiencia/exportar/excel
 * Exportar Análisis de Tiempo y Eficiencia a Excel
 */
export async function exportarReporteTiempoEficienciaExcel(req: Request, res: Response) {
  try {
    const { usuarioId } = req.query;

    const reporte = await obtenerAnalisisTiempoEficiencia({
      usuarioId: usuarioId as string,
    });

    const excelBuffer = await generarExcelReporte('Análisis de Tiempo y Eficiencia', reporte);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-tiempo-eficiencia.xlsx"');
    res.send(excelBuffer);
  } catch (error: any) {
    console.error('Error exportando análisis de tiempo y eficiencia a Excel:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar análisis de tiempo y eficiencia',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/fuente-leads/exportar/pdf
 * Exportar Reporte de Fuente de Leads a PDF
 */
export async function exportarReporteFuenteLeadsPDF(req: Request, res: Response) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteFuenteLeads({
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    const pdfBuffer = await generarPDFReporte('Reporte de Fuente de Leads', reporte);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-fuente-leads.pdf"');
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Error exportando reporte de fuente de leads a PDF:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar reporte de fuente de leads',
      detalles: error.message,
    });
  }
}

/**
 * GET /api/reportes/fuente-leads/exportar/excel
 * Exportar Reporte de Fuente de Leads a Excel
 */
export async function exportarReporteFuenteLeadsExcel(req: Request, res: Response) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const reporte = await obtenerReporteFuenteLeads({
      fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
    });

    const excelBuffer = await generarExcelReporte('Reporte de Fuente de Leads', reporte);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-fuente-leads.xlsx"');
    res.send(excelBuffer);
  } catch (error: any) {
    console.error('Error exportando reporte de fuente de leads a Excel:', error);
    res.status(500).json({
      exito: false,
      error: 'Error al exportar reporte de fuente de leads',
      detalles: error.message,
    });
  }
}
