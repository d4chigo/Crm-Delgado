/**
 * Tipos para el sistema de filtros acumulables
 */

export interface FiltroActivo {
  id: string;
  tipo: 'mes' | 'año' | 'dni' | 'estado' | 'prioridad' | 'etiqueta' | 'ciudad' | 'empresa' | 'etapa';
  label: string;
  valor: string;
}

export interface ConfiguracionFiltro {
  tipo: 'mes' | 'año' | 'dni' | 'estado' | 'prioridad' | 'etiqueta' | 'ciudad' | 'empresa' | 'etapa';
  label: string;
  placeholder: string;
  opciones?: Array<{ valor: string; label: string }>;
  esInput?: boolean;
}

export interface EstadoFiltros {
  filtrosActivos: FiltroActivo[];
  busqueda: string;
}
