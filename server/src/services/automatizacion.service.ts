import prisma from '@/config/database';

/**
 * Servicio de Automatización de Estados
 * Ejecuta cambios automáticos de estado según reglas de negocio
 */
export class AutomatizacionService {
  /**
   * Cambiar leads a "EN_ESPERA" si no han tenido contacto en 7 días
   */
  async inactivarLeadsSinContacto(diasSinContacto: number = 7) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasSinContacto);

      const leadsActualizados = await prisma.lead.updateMany({
        where: {
          AND: [
            { estado: { notIn: ['EN_ESPERA', 'GANADO', 'PERDIDO'] } }, // No actualizar si ya está en espera, ganado o perdido
            {
              OR: [
                { fechaSeguimiento: { lt: fechaLimite } },
                { fechaSeguimiento: null }
              ]
            }
          ]
        },
        data: {
          estado: 'EN_ESPERA',
          actualizadoEn: new Date()
        }
      });

      if (leadsActualizados.count > 0) {
        console.log(
          `✅ ${leadsActualizados.count} leads marcados como EN_ESPERA por falta de contacto (>${diasSinContacto} días)`
        );
      }

      return leadsActualizados.count;
    } catch (error: any) {
      console.error('❌ Error al marcar leads sin contacto:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar leads a "CALIFICADO" si tienen 3+ oportunidades activas
   */
  async calificarLeadsConActividades(minActividades: number = 3) {
    try {
      // Obtener leads con 3+ oportunidades que no estén calificados
      const leadsConActividades = await prisma.lead.findMany({
        where: {
          estado: { in: ['NUEVO', 'CONTACTADO'] } // Solo leads nuevos o contactados
        },
        include: {
          oportunidades: {
            where: {
              etapa: { notIn: ['CIERRE_GANADO', 'CIERRE_PERDIDO', 'INACTIVA'] }
            }
          }
        }
      });

      let leadsCalificados = 0;

      for (const lead of leadsConActividades) {
        // Contar oportunidades activas
        if (lead.oportunidades.length >= minActividades) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              estado: 'CALIFICADO',
              actualizadoEn: new Date()
            }
          });
          leadsCalificados++;
        }
      }

      if (leadsCalificados > 0) {
        console.log(
          `✅ ${leadsCalificados} leads calificados por tener ${minActividades}+ oportunidades activas`
        );
      }

      return leadsCalificados;
    } catch (error: any) {
      console.error('❌ Error al calificar leads:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar oportunidades a "Inactiva" si no tienen actividad en 30 días
   */
  async inactivarOportunidadesSinActividad(diasSinActividad: number = 30) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasSinActividad);

      const oportunidadesActualizadas = await prisma.oportunidadCliente.updateMany({
        where: {
          AND: [
            { etapa: { notIn: ['CIERRE_GANADO', 'CIERRE_PERDIDO', 'INACTIVA'] } },
            { ultimaActividad: { lt: fechaLimite } }
          ]
        },
        data: {
          etapa: 'INACTIVA',
          actualizadoEn: new Date()
        }
      });

      if (oportunidadesActualizadas.count > 0) {
        console.log(
          `✅ ${oportunidadesActualizadas.count} oportunidades inactivadas por falta de actividad (>${diasSinActividad} días)`
        );
      }

      return oportunidadesActualizadas.count;
    } catch (error: any) {
      console.error('❌ Error al inactivar oportunidades:', error.message);
      throw error;
    }
  }

  /**
   * Cambiar leads ganados a "GANADO" si tienen oportunidades cerradas
   */
  async marcarLeadsGanados() {
    try {
      // Obtener leads con oportunidades en CIERRE_GANADO
      const leadsConOportunidadesGanadas = await prisma.lead.findMany({
        where: {
          estado: { notIn: ['GANADO', 'PERDIDO'] }
        },
        include: {
          oportunidades: {
            where: {
              etapa: 'CIERRE_GANADO'
            }
          }
        }
      });

      let leadsGanados = 0;

      for (const lead of leadsConOportunidadesGanadas) {
        if (lead.oportunidades.length > 0) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              estado: 'GANADO',
              actualizadoEn: new Date()
            }
          });
          leadsGanados++;
        }
      }

      if (leadsGanados > 0) {
        console.log(
          `✅ ${leadsGanados} leads marcados como GANADO (tienen oportunidades cerradas)`
        );
      }

      return leadsGanados;
    } catch (error: any) {
      console.error('❌ Error al marcar leads ganados:', error.message);
      throw error;
    }
  }

  /**
   * Ejecutar todas las automatizaciones
   */
  async ejecutarTodasLasAutomatizaciones() {
    console.log('🤖 Iniciando automatizaciones de estado...');

    try {
      const resultados = {
        leadsEnEspera: await this.inactivarLeadsSinContacto(7),
        leadsCalificados: await this.calificarLeadsConActividades(3),
        oportunidadesInactivadas: await this.inactivarOportunidadesSinActividad(30),
        leadsGanados: await this.marcarLeadsGanados()
      };

      console.log('✅ Automatizaciones completadas:', resultados);
      return resultados;
    } catch (error: any) {
      console.error('❌ Error en automatizaciones:', error.message);
      throw error;
    }
  }
}

export const automatizacionService = new AutomatizacionService();
