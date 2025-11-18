import { fetchAPI } from './config';

export interface MetricasResponse {
  metricas: Array<{ title: string; value: string; change: string; trend: 'up' | 'down'; icon: string; color: string; bgColor: string }>;
  ventasPorProyecto: Array<{ project: string; sales: number; value: number; percentage: number }>;
  ventasPorPrograma: Array<{ program: string; count: number; percentage: number }>;
  mejoresAgentes: Array<{ name: string; sales: number; value: number; conversion: number }>;
  ventasMensuales: Array<{ month: number; count: number; value: number }>;
}

export interface EstadisticasResponse {
  estadisticasGenerales: Array<{ titulo: string; valor: string; cambio: string; tendencia: 'up' | 'down' }>;
  actividadesRecientes: Array<{ fecha: string; actividad: string; usuario: string; tipo: string }>;
  gruposEdad: Array<{ rango: string; cantidad: number }>;
  departamentos: Array<{ departamento: string; cantidad: number }>;
}

export async function obtenerMetricas(params?: { period?: string; year?: string | number }): Promise<MetricasResponse> {
  const qs = new URLSearchParams();
  if (params?.period) qs.set('period', params.period);
  if (params?.year) qs.set('year', String(params.year));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return await fetchAPI<MetricasResponse>(`/analytics/metrics${query}`);
}

export async function obtenerEstadisticas(params?: { period?: string; year?: string | number }): Promise<EstadisticasResponse> {
  const qs = new URLSearchParams();
  if (params?.period) qs.set('period', params.period);
  if (params?.year) qs.set('year', String(params.year));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return await fetchAPI<EstadisticasResponse>(`/analytics/estadisticas${query}`);
}

// -------------------- Reportes Esenciales --------------------
export interface ReporteConversionOrigenItem {
  origen: string;
  leads: number;
  ganadas: number;
  conversion: number; // %
  valorGanado: number;
}

export interface ReporteVelocidadCicloItem {
  etapa: string;
  tiempoPromedioDias: number;
  oportunidades: number;
}

export interface ReporteDesempenoAsesorItem {
  asesor: string;
  leadsAsignados: number;
  oportunidadesActivas: number;
  valorPipeline: number;
}

export interface ReporteForecastResponse {
  totalEsperado: number;
  mensual: Array<{ mes: number; valor: number }>;
}

export async function obtenerReporteConversionPorOrigen(params?: { period?: string; year?: string | number }): Promise<ReporteConversionOrigenItem[]> {
  const qs = new URLSearchParams();
  if (params?.period) qs.set('period', params.period);
  if (params?.year) qs.set('year', String(params.year));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return await fetchAPI<ReporteConversionOrigenItem[]>(`/analytics/reports/conversion-origen${query}`);
}

export async function obtenerReporteVelocidadCiclo(params?: { period?: string; year?: string | number }): Promise<ReporteVelocidadCicloItem[]> {
  const qs = new URLSearchParams();
  if (params?.period) qs.set('period', params.period);
  if (params?.year) qs.set('year', String(params.year));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return await fetchAPI<ReporteVelocidadCicloItem[]>(`/analytics/reports/velocidad-ciclo${query}`);
}

export async function obtenerReporteDesempenoAsesor(params?: { period?: string; year?: string | number }): Promise<ReporteDesempenoAsesorItem[]> {
  const qs = new URLSearchParams();
  if (params?.period) qs.set('period', params.period);
  if (params?.year) qs.set('year', String(params.year));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return await fetchAPI<ReporteDesempenoAsesorItem[]>(`/analytics/reports/desempeno-asesor${query}`);
}

export async function obtenerReporteForecast(params?: { period?: string; year?: string | number }): Promise<ReporteForecastResponse> {
  const qs = new URLSearchParams();
  if (params?.period) qs.set('period', params.period);
  if (params?.year) qs.set('year', String(params.year));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return await fetchAPI<ReporteForecastResponse>(`/analytics/reports/forecast${query}`);
}

export interface ClientesPorEtapaItem {
  etapa: string;
  cantidad: number;
}

export async function obtenerClientesPorEtapa(params?: { period?: string; year?: string | number }): Promise<ClientesPorEtapaItem[]> {
  const qs = new URLSearchParams();
  if (params?.period) qs.set('period', params.period);
  if (params?.year) qs.set('year', String(params.year));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return await fetchAPI<ClientesPorEtapaItem[]>(`/analytics/reports/clientes-por-etapa${query}`);
}
