import prisma from '@/config/database';

/**
 * Servicio para integrar Leads con el Pipeline de Oportunidades
 * 
 * Pipeline propuesto:
 * CONTACTO_INICIAL (25%) → AGENDAMIENTO (40%) → SEPARACION (60%) → CIERRE_GANADO (100%) / CIERRE_PERDIDO (0%)
 * FIDELIZACION (100%) → Conversión a Cliente
 */
export class LeadPipelineService {

  /**
   * Obtener el porcentaje de probabilidad según la etapa
   */
  private getProcentajePorEtapa(etapa: string): number {
    const mapeoProcentajes: Record<string, number> = {
      'CONTACTO_INICIAL': 25,
      'AGENDAMIENTO': 40,
      'SEPARACION': 60,
      'CIERRE_GANADO': 100,
      'CIERRE_PERDIDO': 0,
      'FIDELIZACION': 100
    };
    return mapeoProcentajes[etapa] || 25;
  }
  
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
            notIn: ['CIERRE_GANADO', 'CIERRE_PERDIDO']
          }
        }
      });

      if (oportunidadExistente) {
        console.log(`✅ Oportunidad ya existe para lead ${leadId}`);
        return oportunidadExistente;
      }

      // Crear oportunidad en etapa CONTACTO_INICIAL
      const etapaInicial = 'CONTACTO_INICIAL';
      const probab = datosOportunidad?.probabilidad || this.getProcentajePorEtapa(etapaInicial);
      
      const oportunidad = await prisma.oportunidadCliente.create({
        data: {
          clienteId: leadId,
          usuarioId,
          titulo: datosOportunidad?.titulo || `Oportunidad - ${lead.nombre} ${lead.apellido || ''}`,
          proyecto: datosOportunidad?.proyecto,
          propiedad: datosOportunidad?.propiedad,
          etapa: etapaInicial,
          valor: datosOportunidad?.valor,
          probabilidad: probab,
          proximaAccion: 'Completar información de contacto',
          notas: `Convertido automáticamente desde lead`
        }
      });

      console.log(`✅ Oportunidad creada: ${oportunidad.id} en etapa ${etapaInicial} con ${probab}% de probabilidad`);
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
            notIn: ['CIERRE_GANADO', 'CIERRE_PERDIDO']
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
      const mapeoEstados: Record<string, string> = {
        'CONTACTO_INICIAL': 'NUEVO',
        'AGENDAMIENTO': 'CONTACTADO',
        'SEPARACION': 'CONTACTADO',
        'CIERRE_GANADO': 'CONVERTIDO',
        'CIERRE_PERDIDO': 'DESCALIFICADO',
        'FIDELIZACION': 'CONVERTIDO'
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
   * Registrar un cambio de etapa en el historial
   */
  async registrarCambioEtapa(
    oportunidadId: string,
    leadId: string,
    etapaAnterior: string,
    etapaNueva: string,
    cambiadoPor: string,
    datosAnteriores: { probabilidad?: number; valor?: number },
    datosNuevos: { probabilidad?: number; valor?: number },
    razon?: string,
    notas?: string
  ) {
    try {
      const historial = await prisma.historialPipelineLead.create({
        data: {
          oportunidadId,
          leadId,
          etapaAnterior,
          etapaNueva,
          probabilidadAnterior: datosAnteriores.probabilidad,
          probabilidadNueva: datosNuevos.probabilidad,
          valorAnterior: datosAnteriores.valor,
          valorNuevo: datosNuevos.valor,
          cambiadoPor,
          razon,
          notas,
          cambiadoEn: new Date()
        }
      });

      console.log(`📝 Cambio de etapa registrado en historial: ${etapaAnterior} → ${etapaNueva}`);
      return historial;
    } catch (error: any) {
      console.error(`❌ Error al registrar cambio de etapa:`, error.message);
      // No lanzar error para no interrumpir el flujo principal
      return null;
    }
  }

  /**
   * Cuando una oportunidad cambia de etapa, actualizar el estado del lead
   */
  async actualizarEtapaOportunidad(
    oportunidadId: string,
    nuevaEtapa: string,
    usuarioId?: string,
    razon?: string,
    notas?: string
  ) {
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

      // Registrar en historial
      await this.registrarCambioEtapa(
        oportunidadId,
        oportunidad.clienteId,
        oportunidad.etapa,
        nuevaEtapa,
        usuarioId || 'SISTEMA',
        {
          probabilidad: oportunidad.probabilidad,
          valor: oportunidad.valor
        },
        {
          probabilidad: oportunidadActualizada.probabilidad,
          valor: oportunidadActualizada.valor
        },
        razon,
        notas
      );

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
   * Obtener historial de cambios de etapa para un lead/oportunidad
   */
  async obtenerHistorialCambios(leadId: string) {
    try {
      const historial = await prisma.historialPipelineLead.findMany({
        where: {
          leadId
        },
        orderBy: {
          cambiadoEn: 'desc'
        }
      });

      return historial;
    } catch (error: any) {
      console.error(`❌ Error al obtener historial de cambios:`, error.message);
      throw error;
    }
  }

  /**
   * Obtener historial por oportunidad
   */
  async obtenerHistorialPorOportunidad(oportunidadId: string) {
    try {
      const historial = await prisma.historialPipelineLead.findMany({
        where: {
          oportunidadId
        },
        orderBy: {
          cambiadoEn: 'desc'
        }
      });

      return historial;
    } catch (error: any) {
      console.error(`❌ Error al obtener historial de oportunidad:`, error.message);
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

      // Leads convertidos (con oportunidad)
      const leadsConOportunidad = await prisma.contacto.count({
        where: {
          usuarioId,
          tipo: 'LEAD',
          oportunidades: {
            some: {
              etapa: {
                notIn: ['CIERRE_GANADO', 'CIERRE_PERDIDO']
              }
            }
          }
        }
      });

      // Oportunidades ganadas desde leads
      const oportunidadesGanadasDesdeLead = await prisma.oportunidadCliente.count({
        where: {
          usuarioId,
          etapa: 'CIERRE_GANADO',
          cliente: {
            tipo: 'LEAD'
          }
        }
      });

      // Valor total ganado desde leads
      const valorGanado = await prisma.oportunidadCliente.aggregate({
        where: {
          usuarioId,
          etapa: 'CIERRE_GANADO',
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
                notIn: ['CIERRE_GANADO', 'CIERRE_PERDIDO']
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

  /**
   * Obtener oportunidades con filtros avanzados
   */
  async obtenerOportunidadesConFiltros(
    usuarioId: string,
    filtros: {
      etapas?: string[];
      estados?: string[];
      etiquetas?: string[];
      fechaInicio?: Date;
      fechaFin?: Date;
      mes?: number;
      anio?: number;
      proyecto?: string;
      busqueda?: string;
      probabilidadMin?: number;
      probabilidadMax?: number;
      valorMin?: number;
      valorMax?: number;
      pagina?: number;
      limite?: number;
    }
  ) {
    try {
      const {
        etapas,
        estados,
        etiquetas,
        fechaInicio,
        fechaFin,
        mes,
        anio,
        proyecto,
        busqueda,
        probabilidadMin,
        probabilidadMax,
        valorMin,
        valorMax,
        pagina = 1,
        limite = 20
      } = filtros;

      // Construir where clause dinámicamente
      const where: any = { usuarioId };

      // Filtro por etapas
      if (etapas && etapas.length > 0) {
        where.etapa = { in: etapas };
      }

      // Filtro por proyecto
      if (proyecto) {
        where.proyecto = { contains: proyecto };
      }

      // Filtro por búsqueda (título o notas)
      if (busqueda) {
        where.OR = [
          { titulo: { contains: busqueda } },
          { notas: { contains: busqueda } }
        ];
      }

      // Filtro por probabilidad
      if (probabilidadMin !== undefined || probabilidadMax !== undefined) {
        where.probabilidad = {};
        if (probabilidadMin !== undefined) where.probabilidad.gte = probabilidadMin;
        if (probabilidadMax !== undefined) where.probabilidad.lte = probabilidadMax;
      }

      // Filtro por valor
      if (valorMin !== undefined || valorMax !== undefined) {
        where.valor = {};
        if (valorMin !== undefined) where.valor.gte = valorMin;
        if (valorMax !== undefined) where.valor.lte = valorMax;
      }

      // Filtro por rango de fechas
      if (fechaInicio || fechaFin || mes || anio) {
        where.creadoEn = {};
        
        if (mes && anio) {
          // Filtro por mes y año específico
          const primerDia = new Date(anio, mes - 1, 1);
          const ultimoDia = new Date(anio, mes, 0);
          where.creadoEn.gte = primerDia;
          where.creadoEn.lte = ultimoDia;
        } else if (anio) {
          // Filtro por año completo
          const primerDia = new Date(anio, 0, 1);
          const ultimoDia = new Date(anio, 11, 31);
          where.creadoEn.gte = primerDia;
          where.creadoEn.lte = ultimoDia;
        } else {
          // Filtro por rango de fechas
          if (fechaInicio) where.creadoEn.gte = fechaInicio;
          if (fechaFin) where.creadoEn.lte = fechaFin;
        }
      }

      // Filtro por estados del lead (si se proporciona)
      if (estados && estados.length > 0) {
        where.cliente = {
          estadoLead: { in: estados }
        };
      }

      // Filtro por etiquetas
      if (etiquetas && etiquetas.length > 0) {
        where.cliente = {
          ...where.cliente,
          etiquetasRel: {
            some: {
              etiqueta: {
                nombre: { in: etiquetas }
              }
            }
          }
        };
      }

      // Calcular skip para paginación
      const skip = (pagina - 1) * limite;

      // Obtener total de registros
      const total = await prisma.oportunidadCliente.count({ where });

      // Obtener oportunidades
      const oportunidades = await prisma.oportunidadCliente.findMany({
        where,
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              telefono: true,
              empresa: true,
              estadoLead: true,
              etiquetasRel: {
                select: {
                  etiqueta: {
                    select: {
                      id: true,
                      nombre: true,
                      color: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          creadoEn: 'desc'
        },
        skip,
        take: limite
      });

      return {
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
        oportunidades
      };
    } catch (error: any) {
      console.error(`❌ Error al obtener oportunidades con filtros:`, error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de oportunidades por filtros
   */
  async obtenerEstadisticasPorFiltros(
    usuarioId: string,
    filtros: {
      etapas?: string[];
      fechaInicio?: Date;
      fechaFin?: Date;
      mes?: number;
      anio?: number;
    }
  ) {
    try {
      const { etapas, fechaInicio, fechaFin, mes, anio } = filtros;

      // Construir where clause
      const where: any = { usuarioId };

      if (etapas && etapas.length > 0) {
        where.etapa = { in: etapas };
      }

      if (fechaInicio || fechaFin || mes || anio) {
        where.creadoEn = {};
        
        if (mes && anio) {
          const primerDia = new Date(anio, mes - 1, 1);
          const ultimoDia = new Date(anio, mes, 0);
          where.creadoEn.gte = primerDia;
          where.creadoEn.lte = ultimoDia;
        } else if (anio) {
          const primerDia = new Date(anio, 0, 1);
          const ultimoDia = new Date(anio, 11, 31);
          where.creadoEn.gte = primerDia;
          where.creadoEn.lte = ultimoDia;
        } else {
          if (fechaInicio) where.creadoEn.gte = fechaInicio;
          if (fechaFin) where.creadoEn.lte = fechaFin;
        }
      }

      // Obtener estadísticas
      const total = await prisma.oportunidadCliente.count({ where });
      
      const valorTotal = await prisma.oportunidadCliente.aggregate({
        where,
        _sum: { valor: true }
      });

      const probabilidadPromedio = await prisma.oportunidadCliente.aggregate({
        where,
        _avg: { probabilidad: true }
      });

      // Contar por etapa
      const porEtapa = await prisma.oportunidadCliente.groupBy({
        by: ['etapa'],
        where,
        _count: true
      });

      return {
        total,
        valorTotal: valorTotal._sum.valor || 0,
        probabilidadPromedio: probabilidadPromedio._avg.probabilidad || 0,
        porEtapa: porEtapa.map((item: any) => ({
          etapa: item.etapa,
          cantidad: item._count
        }))
      };
    } catch (error: any) {
      console.error(`❌ Error al obtener estadísticas por filtros:`, error.message);
      throw error;
    }
  }
}

export default new LeadPipelineService();
