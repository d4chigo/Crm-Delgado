import { API_URL } from './config';

/**
 * Información sobre las relaciones de un proyecto con un cliente
 */
export interface RelacionesProyectoCliente {
  oportunidadesActivas: number;
  cotizacionesPendientes: number;
  detalles: {
    oportunidades: Array<{
      id: string;
      titulo: string;
      etapa: string;
      valor?: number;
    }>;
    cotizaciones: Array<{
      id: string;
      numero: string;
      estado: string;
      total?: number;
    }>;
  };
}

/**
 * Información sobre las asociaciones de un proyecto
 */
export interface InfoProyecto {
  totalClientesAsociados: number;
  estado: string;
  activo: boolean;
  puedeAsociarMas: boolean;
  razon?: string;
}

/**
 * Servicio para validaciones de seguridad
 */
export const validacionService = {
  /**
   * Verificar relaciones antes de desasociar un proyecto
   */
  async verificarRelacionesProyecto(
    proyectoId: string,
    clienteId: string
  ): Promise<RelacionesProyectoCliente> {
    const token = localStorage.getItem('crm_token');

    if (!token) {
      throw new Error('No hay sesión activa');
    }

    try {
      const response = await fetch(
        `${API_URL}/proyectos/${proyectoId}/clientes/${clienteId}/relaciones`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Si el endpoint no existe, retornar valores por defecto
        if (response.status === 404) {
          return {
            oportunidadesActivas: 0,
            cotizacionesPendientes: 0,
            detalles: {
              oportunidades: [],
              cotizaciones: [],
            },
          };
        }
        throw new Error('Error al verificar relaciones del proyecto');
      }

      const resultado = await response.json();
      return resultado.datos || {
        oportunidadesActivas: 0,
        cotizacionesPendientes: 0,
        detalles: {
          oportunidades: [],
          cotizaciones: [],
        },
      };
    } catch (error) {
      console.warn('No se pudo verificar relaciones, continuando:', error);
      // Retornar valores seguros por defecto
      return {
        oportunidadesActivas: 0,
        cotizacionesPendientes: 0,
        detalles: {
          oportunidades: [],
          cotizaciones: [],
        },
      };
    }
  },

  /**
   * Verificar si un proyecto puede ser asociado
   */
  async verificarDisponibilidadProyecto(proyectoId: string): Promise<InfoProyecto> {
    const token = localStorage.getItem('crm_token');

    if (!token) {
      throw new Error('No hay sesión activa');
    }

    try {
      const response = await fetch(
        `${API_URL}/proyectos/${proyectoId}/disponibilidad`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Si el endpoint no existe, retornar valores por defecto
        if (response.status === 404) {
          return {
            totalClientesAsociados: 0,
            estado: 'DISPONIBLE',
            activo: true,
            puedeAsociarMas: true,
          };
        }
        throw new Error('Error al verificar disponibilidad del proyecto');
      }

      const resultado = await response.json();
      return resultado.datos;
    } catch (error) {
      console.warn('No se pudo verificar disponibilidad, continuando:', error);
      return {
        totalClientesAsociados: 0,
        estado: 'DISPONIBLE',
        activo: true,
        puedeAsociarMas: true,
      };
    }
  },

  /**
   * Verificar si un cliente ya tiene asociado un proyecto
   */
  verificarProyectoDuplicado(
    proyectoId: string,
    proyectosAsociados: Array<{ id: string }>
  ): boolean {
    return proyectosAsociados.some((p) => p.id === proyectoId);
  },
};
