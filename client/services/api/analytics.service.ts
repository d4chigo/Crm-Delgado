import { fetchAPI } from './config';

export interface MetricasResponse {
  metricas: Array<{ title: string; value: string; change: string; trend: 'up' | 'down'; icon: string; color: string; bgColor: string }>;
  ventasPorProyecto: Array<{ project: string; sales: number; value: number; percentage: number }>;
  ventasPorPrograma: Array<{ program: string; count: number; percentage: number }>;
  mejoresAgentes: Array<{ name: string; sales: number; value: number; conversion: number }>;
  ventasMensuales: Array<{ month: number; count: number; value: number }>;
}

export async function obtenerMetricas(params?: { period?: string; year?: string | number }): Promise<MetricasResponse> {
  const qs = new URLSearchParams();
  if (params?.period) qs.set('period', params.period);
  if (params?.year) qs.set('year', String(params.year));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return await fetchAPI<MetricasResponse>(`/analytics/metrics${query}`);
}
