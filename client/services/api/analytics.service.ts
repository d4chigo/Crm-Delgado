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
