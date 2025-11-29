import { useState, useCallback, useEffect } from 'react';
import { FiltrosAvanzados } from '@/components/features/opportunities/FiltrosPipeline';
import { fetchAPI } from '@/services/api/config';

interface Oportunidad {
  id: string;
  titulo: string;
  etapa: string;
  valor?: number;
  probabilidad: number;
  proyecto?: string;
  proximaAccion?: string;
  creadoEn: string;
  cliente?: {
    nombre: string;
    apellido?: string;
    correo?: string;
    telefono?: string;
    empresa?: string;
    etiquetasRel?: Array<{
      etiqueta: {
        nombre: string;
        color?: string;
      };
    }>;
  };
}

interface ResultadoFiltros {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
  oportunidades: Oportunidad[];
}

interface Estadisticas {
  total: number;
  valorTotal: number;
  probabilidadPromedio: number;
  porEtapa: Array<{
    etapa: string;
    cantidad: number;
  }>;
}

/**
 * Hook personalizado para manejar filtros avanzados del pipeline
 * Gestiona estado, llamadas a API y caché
 */
export const useFiltrosPipeline = () => {
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [filtros, setFiltros] = useState<FiltrosAvanzados>({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  /**
   * Obtener token del localStorage dinámicamente
   */
  const obtenerTokenActual = useCallback(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('crm_token');
      console.log('[obtenerTokenActual] Token en localStorage:', token ? `${token.substring(0, 20)}...` : 'No encontrado');
      return token;
    }
    return null;
  }, []);

  /**
   * Construir query string desde filtros
   */
  const construirQueryString = useCallback((filtrosActuales: FiltrosAvanzados): string => {
    const params = new URLSearchParams();

    if (filtrosActuales.etapas?.length) {
      params.append('etapas', filtrosActuales.etapas.join(','));
    }
    if (filtrosActuales.estados?.length) {
      params.append('estados', filtrosActuales.estados.join(','));
    }
    if (filtrosActuales.etiquetas?.length) {
      params.append('etiquetas', filtrosActuales.etiquetas.join(','));
    }
    if (filtrosActuales.fechaInicio) {
      params.append('fechaInicio', filtrosActuales.fechaInicio);
    }
    if (filtrosActuales.fechaFin) {
      params.append('fechaFin', filtrosActuales.fechaFin);
    }
    if (filtrosActuales.mes) {
      params.append('mes', filtrosActuales.mes.toString());
    }
    if (filtrosActuales.anio) {
      params.append('anio', filtrosActuales.anio.toString());
    }
    if (filtrosActuales.proyecto) {
      params.append('proyecto', filtrosActuales.proyecto);
    }
    if (filtrosActuales.busqueda) {
      params.append('busqueda', filtrosActuales.busqueda);
    }
    if (filtrosActuales.probabilidadMin !== undefined) {
      params.append('probabilidadMin', filtrosActuales.probabilidadMin.toString());
    }
    if (filtrosActuales.probabilidadMax !== undefined) {
      params.append('probabilidadMax', filtrosActuales.probabilidadMax.toString());
    }
    if (filtrosActuales.valorMin !== undefined) {
      params.append('valorMin', filtrosActuales.valorMin.toString());
    }
    if (filtrosActuales.valorMax !== undefined) {
      params.append('valorMax', filtrosActuales.valorMax.toString());
    }
    if (filtrosActuales.pagina) {
      params.append('pagina', filtrosActuales.pagina.toString());
    }
    if (filtrosActuales.limite) {
      params.append('limite', filtrosActuales.limite.toString());
    }

    return params.toString();
  }, []);

  /**
   * Obtener oportunidades con filtros
   */
  const obtenerOportunidades = useCallback(async (filtrosActuales: FiltrosAvanzados) => {
    try {
      setCargando(true);
      setError(null);

      const queryString = construirQueryString(filtrosActuales);
      const endpoint = `/leads/filtros/avanzados${queryString ? `?${queryString}` : ''}`;

      console.log('[useFiltrosPipeline] Obteniendo oportunidades desde:', endpoint);

      const data: ResultadoFiltros = await fetchAPI<ResultadoFiltros>(endpoint);
      
      console.log('[useFiltrosPipeline] ✅ Oportunidades obtenidas:', data.oportunidades.length);
      
      setOportunidades(data.oportunidades);
      setTotal(data.total);
      setTotalPaginas(data.totalPaginas);
      setFiltros(filtrosActuales);

      return data;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al obtener oportunidades';
      console.error('[useFiltrosPipeline] ❌ Error:', mensaje);
      setError(mensaje);
      return null;
    } finally {
      setCargando(false);
    }
  }, [construirQueryString]);

  /**
   * Obtener estadísticas con filtros
   */
  const obtenerEstadisticas = useCallback(async (filtrosActuales: FiltrosAvanzados) => {
    try {
      const params = new URLSearchParams();

      if (filtrosActuales.etapas?.length) {
        params.append('etapas', filtrosActuales.etapas.join(','));
      }
      if (filtrosActuales.mes) {
        params.append('mes', filtrosActuales.mes.toString());
      }
      if (filtrosActuales.anio) {
        params.append('anio', filtrosActuales.anio.toString());
      }
      if (filtrosActuales.fechaInicio) {
        params.append('fechaInicio', filtrosActuales.fechaInicio);
      }
      if (filtrosActuales.fechaFin) {
        params.append('fechaFin', filtrosActuales.fechaFin);
      }

      const queryString = params.toString();
      const endpoint = `/leads/estadisticas/filtros${queryString ? `?${queryString}` : ''}`;

      const data = await fetchAPI<{ estadisticas: Estadisticas }>(endpoint);
      setEstadisticas(data.estadisticas);
      return data.estadisticas;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al obtener estadísticas';
      console.error('[useFiltrosPipeline] Error en obtenerEstadisticas:', mensaje);
      
      // Si es error de token, no mostrar error (el hook useEsperarToken se encarga)
      if (mensaje.includes('token') || mensaje.includes('autenticación')) {
        console.log('[useFiltrosPipeline] Esperando token para estadísticas...');
      }
      
      return null;
    }
  }, []);

  /**
   * Aplicar filtros (obtener datos)
   */
  const aplicarFiltros = useCallback(async (nuevosFiltros: FiltrosAvanzados) => {
    const filtrosConPaginacion = {
      ...nuevosFiltros,
      pagina: 1, // Resetear a página 1 cuando se aplican nuevos filtros
      limite: nuevosFiltros.limite || 20
    };

    await obtenerOportunidades(filtrosConPaginacion);
  }, [obtenerOportunidades]);

  /**
   * Recargar oportunidades con los filtros actuales
   */
  const recargarOportunidades = useCallback(async () => {
    if (Object.keys(filtros).length === 0) {
      // Si no hay filtros aplicados, cargar con valores por defecto
      await obtenerOportunidades({
        pagina: 1,
        limite: 20
      });
    } else {
      // Si hay filtros, recargar con los mismos filtros
      await obtenerOportunidades(filtros);
    }
  }, [filtros, obtenerOportunidades]);

  /**
   * Cambiar página
   */
  const cambiarPagina = useCallback(async (nuevaPagina: number) => {
    const nuevosFiltros = {
      ...filtros,
      pagina: nuevaPagina
    };
    await obtenerOportunidades(nuevosFiltros);
  }, [filtros, obtenerOportunidades]);

  /**
   * Exportar a CSV
   */
  const exportarACSV = useCallback(() => {
    if (oportunidades.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = [
      'ID',
      'Título',
      'Etapa',
      'Valor',
      'Probabilidad',
      'Cliente',
      'Empresa',
      'Correo',
      'Teléfono',
      'Fecha Creación'
    ];

    const rows = oportunidades.map(opp => [
      opp.id,
      opp.titulo,
      opp.etapa,
      opp.valor || '',
      opp.probabilidad,
      `${opp.cliente?.nombre} ${opp.cliente?.apellido || ''}`,
      opp.cliente?.empresa || '',
      opp.cliente?.correo || '',
      opp.cliente?.telefono || '',
      new Date(opp.creadoEn).toLocaleDateString('es-ES')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `pipeline-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [oportunidades]);

  return {
    filtros,
    oportunidades,
    estadisticas,
    cargando,
    error,
    total,
    totalPaginas,
    aplicarFiltros,
    cambiarPagina,
    exportarACSV,
    obtenerOportunidades,
    obtenerEstadisticas,
    recargarOportunidades
  };
};

export default useFiltrosPipeline;
