import prisma from '@/config/database';
import { EtapaPipeline, EstadoLead } from '@prisma/client';

/**
 * Servicio para integrar Leads con el Pipeline de Oportunidades
 * 
 * Lógica de conversión:
 * NUEVO (Lead) → CONTACTADO (Lead) → CONTACTO (Oportunidad) → VISITA → NEGOCIACIÓN → CIERRE → GANADO/PERDIDO
 */
export class LeadPipelineService {
  
  /**
   * Cuando un lead se marca como CONTACTADO, crear una oportunidad automáticamente
   */
  async convertirLeadAOportunidad(leadId: string, usuarioId: string, datosOportunidad?: {
    titulo?: string;
    proyecto?: string;
    propiedad?: string;
    valor?: number;
    probabilidad?: number;
  }) {
    try {
      console.log(`🔄 Convirtiendo lead ${leadId} a oportunidad...`);

      // Obtener datos del lead
      const lead = await prisma.contacto.findUnique({
        where: { id: leadId }
      });

      if (!lead) {
        throw new Error(`Lead ${leadId} no encontrado`);
      }

      if (lead.tipo !== 'LEAD') {
        throw new Error(`Contacto ${leadId} no es un lead`);
      }

      // Verificar si ya existe una oportunidad activa para este lead
      const oportunidadExistente = await prisma.oportunidadCliente.findFirst({
        where: {
          clienteId: leadId,
          usuarioId,
          etapa: {
            notIn: ['GANADO', 'PERDIDO']
          }
        }
      });

      if (oportunidadExistente) {
        console.log(`✅ Oportunidad ya existe para lead ${leadId}`);
        return oportunidadExistente;
      }

      // Crear oportunidad en etapa CONTACTO (siguiente a LEAD)
      const oportunidad = await prisma.oportunidadCliente.create({
        data: {
          clienteId: leadId,
          usuarioId,
          titulo: datosOportunidad?.titulo || `Oportunidad - ${lead.nombre} ${lead.apellido || ''}`,
          proyecto: datosOportunidad?.proyecto,
          propiedad: datosOportunidad?.propiedad,
          etapa: 'CONTACTO',
          valor: datosOportunidad?.valor,
          probabilidad: datosOportunidad?.probabilidad || 25,
          proximaAccion: 'Completar información de contacto',
          notas: `Convertido automáticamente desde lead`
        }
      });

      console.log(`✅ Oportunidad creada: ${oportunidad.id}`);
      return oportunidad;
    } catch (error: any) {
      console.error(`❌ Error al convertir lead a oportunidad:`, error.message);
      throw error;
    }
  }

  /**
   * Sincronizar el estado del lead con la etapa de su oportunidad
   * Mapeo: LEAD → CONTACTO, VISITA → VISITA, NEGOCIACIÓN → NEGOCIACIÓN, etc.
   */
  async sincronizarEstadoLead(leadId: string) {
    try {
      // Obtener la oportunidad activa más reciente
      const oportunidad = await prisma.oportunidadCliente.findFirst({
        where: {
          clienteId: leadId,
          etapa: {
            notIn: ['GANADO', 'PERDIDO']
          }
        },
        orderBy: {
          creadoEn: 'desc'
        }
      });

      if (!oportunidad) {
        // Si no hay oportunidad, el lead sigue siendo NUEVO o ABIERTO
        return;
      }

      // Mapear etapa de oportunidad a estado de lead
      const mapeoEstados: Record<EtapaPipeline, EstadoLead> = {
        'LEAD': 'NUEVO',
        'CONTACTO': 'CONTACTADO',
        'VISITA': 'CONTACTADO',
        'NEGOCIACION': 'CONTACTADO',
        'CIERRE': 'CONTACTADO',
        'GANADO': 'CONVERTIDO',
        'PERDIDO': 'DESCALIFICADO'
      };

      const nuevoEstado = mapeoEstados[oportunidad.etapa];

      // Actualizar estado del lead
      await prisma.contacto.update({
        where: { id: leadId },
        data: {
          estadoLead: nuevoEstado,
          fechaSeguimiento: new Date(),
          ...(nuevoEstado === 'CONVERTIDO' && { fechaConversion: new Date() })
        }
      });

      console.log(`✅ Estado del lead actualizado a: ${nuevoEstado}`);
    } catch (error: any) {
      console.error(`❌ Error al sincronizar estado del lead:`, error.message);
      throw error;
    }
  }

  /**
   * Cuando una oportunidad cambia de etapa, actualizar el estado del lead
   */
  async actualizarEtapaOportunidad(oportunidadId: string, nuevaEtapa: EtapaPipeline) {
    try {
      // Obtener la oportunidad
      const oportunidad = await prisma.oportunidadCliente.findUnique({
        where: { id: oportunidadId }
      });

      if (!oportunidad) {
        throw new Error(`Oportunidad ${oportunidadId} no encontrada`);
      }

      // Actualizar la oportunidad
      const oportunidadActualizada = await prisma.oportunidadCliente.update({
        where: { id: oportunidadId },
        data: {
          etapa: nuevaEtapa,
          ultimaActividad: new Date()
        }
      });

      // Sincronizar el estado del lead con la nueva etapa
      await this.sincronizarEstadoLead(oportunidad.clienteId);

      console.log(`✅ Oportunidad actualizada a etapa: ${nuevaEtapa}`);
      return oportunidadActualizada;
    } catch (error: any) {
      console.error(`❌ Error al actualizar etapa de oportunidad:`, error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de conversión lead → oportunidad
   */
  async obtenerEstadisticasConversion(usuarioId: string) {
    try {
      // Total de leads
      const totalLeads = await prisma.contacto.count({
        where: {
          usuarioId,
          tipo: 'LEAD'
        }
      });

      // Leads convertidos (con oportunidades)
      const leadsConOportunidad = await prisma.contacto.count({
        where: {
          usuarioId,
          tipo: 'LEAD',
          oportunidades: {
            some: {
              etapa: {
                notIn: ['GANADO', 'PERDIDO']
              }
            }
          }
        }
      });

      // Oportunidades ganadas desde leads
      const oportunidadesGanadasDesdeLead = await prisma.oportunidadCliente.count({
        where: {
          usuarioId,
          etapa: 'GANADO',
          cliente: {
            tipo: 'LEAD'
          }
        }
      });

      // Valor total ganado desde leads
      const valorGanado = await prisma.oportunidadCliente.aggregate({
        where: {
          usuarioId,
          etapa: 'GANADO',
          cliente: {
            tipo: 'LEAD'
          }
        },
        _sum: {
          valor: true
        }
      });

      const tazaConversion = totalLeads > 0 ? (leadsConOportunidad / totalLeads) * 100 : 0;

      return {
        totalLeads,
        leadsConOportunidad,
        leadsSinOportunidad: totalLeads - leadsConOportunidad,
        oportunidadesGanadasDesdeLead,
        valorGanado: valorGanado._sum.valor || 0,
        tazaConversion: parseFloat(tazaConversion.toFixed(2))
      };
    } catch (error: any) {
      console.error(`❌ Error al obtener estadísticas de conversión:`, error.message);
      throw error;
    }
  }

  /**
   * Obtener leads no convertidos (sin oportunidades activas)
   */
  async obtenerLeadsNoConvertidos(usuarioId: string, limite = 10) {
    try {
      const leadsNoConvertidos = await prisma.contacto.findMany({
        where: {
          usuarioId,
          tipo: 'LEAD',
          oportunidades: {
            none: {
              etapa: {
                notIn: ['GANADO', 'PERDIDO']
              }
            }
          }
        },
        include: {
          alertas: {
            where: { completada: false },
            take: 1
          }
        },
        orderBy: {
          creadoEn: 'desc'
        },
        take: limite
      });

      return leadsNoConvertidos;
    } catch (error: any) {
      console.error(`❌ Error al obtener leads no convertidos:`, error.message);
      throw error;
    }
  }

  /**
   * Obtener oportunidades de leads específicos
   */
  async obtenerOportunidadesDeLead(leadId: string) {
    try {
      const oportunidades = await prisma.oportunidadCliente.findMany({
        where: {
          clienteId: leadId
        },
        orderBy: {
          creadoEn: 'desc'
        }
      });

      return oportunidades;
    } catch (error: any) {
      console.error(`❌ Error al obtener oportunidades del lead:`, error.message);
      throw error;
    }
  }

  /**
   * Completar alerta de lead y crear oportunidad automáticamente
   */
  async completarAlertaYConverrir(
    alertaId: string,
    leadId: string,
    usuarioId: string,
    notas?: string
  ) {
    try {
      // Completar alerta
      await prisma.alertaLead.update({
        where: { id: alertaId },
        data: {
          completada: true,
          completadaEn: new Date(),
          notas
        }
      });

      // Marcar lead como CONTACTADO
      await prisma.contacto.update({
        where: { id: leadId },
        data: {
          estadoLead: 'CONTACTADO',
          fechaSeguimiento: new Date()
        }
      });

      // Crear oportunidad si no existe
      await this.convertirLeadAOportunidad(leadId, usuarioId, {
        titulo: `Oportunidad - ${new Date().toLocaleDateString('es-PE')}`
      });

      console.log(`✅ Alerta completada y lead convertido a oportunidad`);
    } catch (error: any) {
      console.error(`❌ Error en flujo de alerta a oportunidad:`, error.message);
      throw error;
    }
  }
}

export default new LeadPipelineService();
