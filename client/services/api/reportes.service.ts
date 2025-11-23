import { fetchAPI } from './config';

export interface ReporteLead {
  totalLeads: number;
  leadsPorFuente: Array<{ fuente: string; cantidad: number }>;
  oportunidadesPorEtapa: Array<{ etapa: string; cantidad: number }>;
  tiempoPromedioPorEtapa: Array<{ etapa: string; diasPromedio: number; cantidad: number }>;
}

export interface ReporteConversion {
  totalLeads: number;
  leadsConOportunidades: number;
  oportunidadesGanadas: number;
  valorGanado: number;
  tasaConversionLeads: number;
  conversionPorEtapa: Array<{
    de: string;
    a: string;
    cantidad: number;
    porcentaje: number;
  }>;
}

export interface ReporteActividad {
  oportunidadesPorAgente: Array<{
    usuario: string;
    usuarioId: string;
    oportunidadesTotal: number;
  }>;
  oportunidadesPorEtapa: Array<{
    etapa: string;
    cantidad: number;
  }>;
}

export interface ReporteVentasCerradas {
  totalVentas: number;
  montoTotal: number;
  diasPromedioCierre: number;
  ventasDetalladas: Array<{
    id: string;
    titulo: string;
    proyecto?: string;
    propiedad?: string;
    valor?: number;
    creadoEn: string;
    actualizadoEn: string;
    diasParaCierre: number;
    usuario: { nombre: string };
  }>;
}

export interface ReporteClientesActivos {
  totalClientesActivos: number;
  clientes: Array<{
    id: string;
    nombre: string;
    correo?: string;
    telefono?: string;
    oportunidadesActivas: number;
    montoEnJuego: number;
    oportunidades: Array<{
      id: string;
      titulo: string;
      etapa: string;
      valor?: number;
    }>;
  }>;
}

export interface AnalisisTiempoEficiencia {
  estadisticas: Array<{
    etapa: string;
    diasPromedio: number;
    diasMaximo: number;
    diasMinimo: number;
    cantidad: number;
    tiempoMuerto: string;
  }>;
  totalLeads: number;
}

export interface ReporteFuenteLeads {
  reportePorFuente: Array<{
    fuente: string;
    totalLeads: number;
    leadsConOportunidades: number;
    oportunidadesGanadas: number;
    valorGanado: number;
    tasaConversion: number;
    eficiencia: 'Alta' | 'Media' | 'Baja';
  }>;
  mejorFuente: {
    fuente: string;
    totalLeads: number;
    leadsConOportunidades: number;
    oportunidadesGanadas: number;
    valorGanado: number;
    tasaConversion: number;
    eficiencia: 'Alta' | 'Media' | 'Baja';
  } | null;
}

/**
 * Obtener Reporte de Leads
 */
export async function obtenerReporteLead(filtros?: {
  usuarioId?: string;
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<ReporteLead> {
  const params = new URLSearchParams();
  if (filtros?.usuarioId) params.append('usuarioId', filtros.usuarioId);
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  const response = await fetchAPI<ReporteLead>(
    `/reportes/leads?${params.toString()}`
  );
  return response;
}

/**
 * Obtener Reporte de Conversión
 */
export async function obtenerReporteConversion(filtros?: {
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<ReporteConversion> {
  const params = new URLSearchParams();
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  const response = await fetchAPI<ReporteConversion>(
    `/reportes/conversion?${params.toString()}`
  );
  return response;
}

/**
 * Obtener Reporte de Actividad
 */
export async function obtenerReporteActividad(filtros?: {
  usuarioId?: string;
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<ReporteActividad> {
  const params = new URLSearchParams();
  if (filtros?.usuarioId) params.append('usuarioId', filtros.usuarioId);
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  const response = await fetchAPI<ReporteActividad>(
    `/reportes/actividad?${params.toString()}`
  );
  return response;
}

/**
 * Obtener Reporte de Ventas Cerradas
 */
export async function obtenerReporteVentasCerradas(filtros?: {
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<ReporteVentasCerradas> {
  const params = new URLSearchParams();
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  const response = await fetchAPI<ReporteVentasCerradas>(
    `/reportes/ventas-cerradas?${params.toString()}`
  );
  return response;
}

/**
 * Obtener Reporte de Clientes Activos
 */
export async function obtenerReporteClientesActivos(): Promise<ReporteClientesActivos> {
  const response = await fetchAPI<ReporteClientesActivos>(
    '/reportes/clientes-activos'
  );
  return response;
}

/**
 * Obtener Análisis de Tiempo y Eficiencia
 */
export async function obtenerAnalisisTiempoEficiencia(filtros?: {
  usuarioId?: string;
}): Promise<AnalisisTiempoEficiencia> {
  const params = new URLSearchParams();
  if (filtros?.usuarioId) params.append('usuarioId', filtros.usuarioId);

  const response = await fetchAPI<AnalisisTiempoEficiencia>(
    `/reportes/tiempo-eficiencia?${params.toString()}`
  );
  return response;
}

/**
 * Obtener Reporte de Fuente de Leads
 */
export async function obtenerReporteFuenteLeads(filtros?: {
  fechaInicio?: string;
  fechaFin?: string;
}): Promise<ReporteFuenteLeads> {
  const params = new URLSearchParams();
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  const response = await fetchAPI<ReporteFuenteLeads>(
    `/reportes/fuente-leads?${params.toString()}`
  );
  return response;
}
