import { useState, useCallback } from 'react';
import { fetchAPI } from '@/services/api/config';

interface EstadisticasConversion {
  totalLeads: number;
  leadsConOportunidad: number;
  leadsSinOportunidad: number;
  oportunidadesGanadasDesdeLead: number;
  valorGanado: number;
  tazaConversion: number;
}

interface LeadNoConvertido {
  id: string;
  nombre: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  empresa?: string;
  estadoLead: string;
  creadoEn: string;
  alertas: any[];
}

/**
 * Hook para manejar la integración de leads con pipeline de oportunidades
 */
export function useLeadPipeline() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadsNoConvertidos, setLeadsNoConvertidos] = useState<LeadNoConvertido[]>([]);
  const [estadisticasConversion, setEstadisticasConversion] = useState<EstadisticasConversion | null>(null);

  /**
   * Obtener leads no convertidos
   */
  const obtenerLeadsNoConvertidos = useCallback(async (limite = 10) => {
    try {
      setCargando(true);
      setError(null);

      const response = await fetchAPI<{ leads: LeadNoConvertido[] }>(
        `/leads/no-convertidos/lista?limite=${limite}`
      );

      if (response?.leads) {
        setLeadsNoConvertidos(response.leads);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error obteniendo leads no convertidos:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Convertir lead a oportunidad
   */
  const convertirLeadAOportunidad = useCallback(
    async (
      leadId: string,
      datosOportunidad?: {
        titulo?: string;
        proyecto?: string;
        propiedad?: string;
        valor?: number;
        probabilidad?: number;
      }
    ) => {
      try {
        setCargando(true);
        setError(null);

        const response = await fetchAPI(
          `/leads/${leadId}/convertir-a-oportunidad`,
          {
            method: 'POST',
            body: JSON.stringify(datosOportunidad || {})
          }
        ) as any;

        if (response?.oportunidad) {
          // Actualizar lista de leads no convertidos
          setLeadsNoConvertidos(prev => prev.filter(l => l.id !== leadId));
          return response.oportunidad;
        }
      } catch (err: any) {
        setError(err.message);
        console.error('❌ Error convirtiendo lead a oportunidad:', err);
        throw err;
      } finally {
        setCargando(false);
      }
    },
    []
  );

  /**
   * Obtener estadísticas de conversión
   */
  const obtenerEstadisticasConversion = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const response = await fetchAPI<{ estadisticas: EstadisticasConversion }>(
        `/leads/estadisticas/conversion`
      );

      if (response?.estadisticas) {
        setEstadisticasConversion(response.estadisticas);
        return response.estadisticas;
      }
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error obteniendo estadísticas:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Obtener oportunidades de un lead
   */
  const obtenerOportunidadesDeLead = useCallback(async (leadId: string) => {
    try {
      setCargando(true);
      setError(null);

      const response = await fetchAPI(
        `/leads/${leadId}/oportunidades`
      ) as any;

      if (response?.oportunidades) {
        return response.oportunidades;
      }
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error obteniendo oportunidades del lead:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Completar alerta y convertir lead automáticamente
   */
  const completarAlertaYConvertir = useCallback(
    async (leadId: string, alertaId: string, notas?: string) => {
      try {
        setCargando(true);
        setError(null);

        const response = await fetchAPI(
          `/leads/${leadId}/completar-alerta-y-convertir`,
          {
            method: 'POST',
            body: JSON.stringify({ alertaId, notas })
          }
        ) as any;

        if (response?.exito) {
          // Actualizar lista de leads
          setLeadsNoConvertidos(prev => prev.filter(l => l.id !== leadId));
          return response;
        }
      } catch (err: any) {
        setError(err.message);
        console.error('❌ Error en flujo de alerta a oportunidad:', err);
        throw err;
      } finally {
        setCargando(false);
      }
    },
    []
  );

  return {
    // Estado
    cargando,
    error,
    leadsNoConvertidos,
    estadisticasConversion,

    // Métodos
    obtenerLeadsNoConvertidos,
    convertirLeadAOportunidad,
    obtenerEstadisticasConversion,
    obtenerOportunidadesDeLead,
    completarAlertaYConvertir
  };
}

export default useLeadPipeline;
