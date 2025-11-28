import prisma from '@/config/database';

export interface CrearOportunidadDTO {
  clienteId: string;
  titulo: string;
  proyecto?: string;
  propiedad?: string;
  etapa?: string;
  valor?: number;
  probabilidad?: number;
  proximaAccion?: string;
  notas?: string;
}

export interface ActualizarOportunidadDTO {
  titulo?: string;
  proyecto?: string;
  propiedad?: string;
  etapa?: string;
  valor?: number;
  probabilidad?: number;
  proximaAccion?: string;
  notas?: string;
}

export interface FiltrosOportunidad {
  clienteId?: string;
  etapa?: string;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}

export class OportunidadService {
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
   * Crear nueva oportunidad para un cliente
   */
  async crearOportunidad(usuarioId: string, datos: CrearOportunidadDTO) {
    // Verificar que el cliente existe
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: datos.clienteId,
        usuarioId
      }
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Usar CONTACTO_INICIAL como etapa por defecto si no se especifica
    const etapa = datos.etapa || 'CONTACTO_INICIAL';
    const probabilidad = datos.probabilidad || this.getProcentajePorEtapa(etapa);

    // Crear la oportunidad
    const oportunidad = await prisma.oportunidadCliente.create({
      data: {
        clienteId: datos.clienteId,
        titulo: datos.titulo,
        proyecto: datos.proyecto,
        propiedad: datos.propiedad,
        etapa: etapa,
        valor: datos.valor,
        probabilidad: probabilidad,
        proximaAccion: datos.proximaAccion,
        notas: datos.notas,
        usuarioId,
        ultimaActividad: new Date()
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            empresa: true,
            etiquetasRel: {
              include: {
                etiqueta: true
              }
            }
          }
        }
      }
    });

    return oportunidad;
  }

  /**
   * Obtener todas las oportunidades con filtros
   */
  async obtenerOportunidades(usuarioId: string, filtros: FiltrosOportunidad = {}) {
    const {
      clienteId,
      etapa,
      busqueda,
      pagina = 1,
      limite = 20
    } = filtros;

    const skip = (pagina - 1) * limite;

    // Construir condiciones de búsqueda
    const where: any = { idUsuario: usuarioId };

    if (clienteId) {
      where.clienteId = clienteId;
    }

    if (etapa) {
      where.etapa = etapa;
    }

    if (busqueda) {
      where.OR = [
        { titulo: { contains: busqueda } },
        { proyecto: { contains: busqueda } },
        { propiedad: { contains: busqueda } },
        {
          cliente: {
            OR: [
              { nombre: { contains: busqueda } },
              { apellido: { contains: busqueda } },
              { correo: { contains: busqueda } }
            ]
          }
        }
      ];
    }

    // Obtener oportunidades y total
    const [oportunidades, total] = await Promise.all([
      prisma.oportunidadCliente.findMany({
        where,
        skip,
        take: limite,
        orderBy: { ultimaActividad: 'desc' },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              telefono: true,
              empresa: true,
              etiquetasRel: {
                include: {
                  etiqueta: true
                }
              }
            }
          },
          lead: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              telefono: true,
              empresa: true,
              etiquetasRel: {
                include: {
                  etiqueta: true
                }
              }
            }
          }
        }
      }),
      prisma.oportunidadCliente.count({ where })
    ]);

    return {
      oportunidades,
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite)
      }
    };
  }

  /**
   * Obtener oportunidad por ID
   */
  async obtenerOportunidadPorId(id: string, usuarioId: string) {
    const oportunidad = await prisma.oportunidadCliente.findFirst({
      where: { id, idUsuario: usuarioId },
      include: {
        cliente: {
          include: {
            etiquetasRel: {
              include: {
                etiqueta: true
              }
            }
          }
        },
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            empresa: true
          }
        }
      }
    });

    if (!oportunidad) {
      throw new Error('Oportunidad no encontrada');
    }

    return oportunidad;
  }

  /**
   * Actualizar oportunidad
   */
  async actualizarOportunidad(
    id: string,
    usuarioId: string,
    datos: ActualizarOportunidadDTO
  ) {
    // Verificar que existe
    const oportunidadExistente = await prisma.oportunidadCliente.findFirst({
      where: { id, idUsuario: usuarioId }
    });

    if (!oportunidadExistente) {
      throw new Error('Oportunidad no encontrada');
    }

    // Actualizar
    const oportunidad = await prisma.oportunidadCliente.update({
      where: { id },
      data: {
        ...datos,
        ultimaActividad: new Date()
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            empresa: true,
            etiquetasRel: {
              include: {
                etiqueta: true
              }
            }
          }
        },
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            empresa: true
          }
        }
      }
    });

    return oportunidad;
  }

  /**
   * Cambiar etapa de la oportunidad con auto-cálculo de probabilidad
   */
  /**
   * Cambiar la etapa de una oportunidad
   * 
   * Comportamiento:
   * - CIERRE_GANADO o FIDELIZACIÓN: Actualiza estado del lead a GANADO
   * - CIERRE_PERDIDO: Actualiza estado del lead a PERDIDO
   * - FIDELIZACIÓN (especial): CONVIERTE el lead a cliente (crea nuevo cliente, desvincula lead)
   * - Otros: Sin cambios en estado del lead
   * 
   * @param id - ID de la oportunidad
   * @param usuarioId - ID del usuario que hace el cambio
   * @param etapa - Nueva etapa del pipeline
   * @param notas - Notas opcionales sobre el cambio
   * @returns Oportunidad actualizada
   */
  async cambiarEtapa(
    id: string,
    usuarioId: string,
    etapa: string,
    notas?: string
  ) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📍 CAMBIAR ETAPA - BEGIN (${new Date().toISOString()})`);
    console.log(`   ID: ${id}, Etapa Nueva: ${etapa}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    const oportunidadExistente = await prisma.oportunidadCliente.findFirst({
      where: { id, idUsuario: usuarioId },
      include: {
        cliente: true,
        lead: true
      }
    });

    if (!oportunidadExistente) {
      throw new Error('Oportunidad no encontrada');
    }

    // Auto-calcular probabilidad según la nueva etapa
    const probabilidad = this.getProcentajePorEtapa(etapa)

    // Determinar el nuevo estado del lead según la etapa del pipeline
    let estadoLead: string | undefined = undefined;
    if (etapa === 'CIERRE_GANADO' || etapa === 'FIDELIZACION' || etapa === 'FIDELIZACIÓN') {
      estadoLead = 'GANADO';
    } else if (etapa === 'CIERRE_PERDIDO') {
      estadoLead = 'PERDIDO';
    }

    // Actualizar etapa
    const oportunidad = await prisma.oportunidadCliente.update({
      where: { id },
      data: {
        etapa,
        probabilidad,
        ultimaActividad: new Date(),
        notas: notas || oportunidadExistente.notas
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            empresa: true
          }
        },
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            empresa: true
          }
        }
      }
    });

    // Actualizar estado del lead si es necesario
    if (estadoLead) {
      try {
        console.log(`📝 Actualizando estado del lead. leadId: ${oportunidadExistente.leadId}, clienteId: ${oportunidadExistente.clienteId}, etapa: ${etapa}`);
        
        // Determinar si es un lead o cliente
        if (oportunidadExistente.leadId) {
          console.log(`🔄 Actualizando estado del lead ${oportunidadExistente.leadId} a ${estadoLead}...`);
          
          await prisma.lead.update({
            where: { id: oportunidadExistente.leadId },
            data: {
              estado: estadoLead,
              actualizadoEn: new Date()
            }
          });
          console.log(`✅ Estado del lead ${oportunidadExistente.leadId} actualizado a ${estadoLead}`);

          // Si llega a FIDELIZACIÓN, convertir lead a cliente
          if (etapa === 'FIDELIZACION' || etapa === 'FIDELIZACIÓN') {
            console.log(`⭐ Verificando si hay que convertir a cliente (etapa: ${etapa})`);
            
            const leadActual = await prisma.lead.findUnique({
              where: { id: oportunidadExistente.leadId },
              include: {
                etiquetasRel: {
                  include: {
                    etiqueta: true
                  }
                }
              }
            });

            if (leadActual) {
              console.log(`🔄 Convirtiendo lead ${oportunidadExistente.leadId} a cliente...`);
              
              // Crear cliente con TODOS los datos del lead (migración completa)
              const nuevoCliente = await prisma.cliente.create({
                data: {
                  nombre: leadActual.nombre,
                  apellido: leadActual.apellido,
                  correo: leadActual.correo,
                  telefono: leadActual.telefono,
                  empresa: leadActual.empresa,
                  prioridad: leadActual.prioridad || 'MEDIA',
                  usuarioId: leadActual.usuarioId,
                  // Copiar campos adicionales del lead
                  cargo: leadActual.cargo,
                  departamento: leadActual.departamento,
                  distrito: leadActual.distrito,
                  ciudad: leadActual.ciudad,
                  provincia: leadActual.provincia,
                  dni: leadActual.dni,
                  sexo: leadActual.sexo as any,
                  fechaNacimiento: leadActual.fechaNacimiento,
                  direccion: leadActual.direccion,
                  presupuesto: leadActual.presupuesto,
                  probabilidad: leadActual.probabilidad,
                  notas: leadActual.notas,
                  fechaConversion: new Date(),
                  creadoEn: leadActual.creadoEn,
                  actualizadoEn: new Date()
                }
              });
              
              console.log(`✅ Cliente creado con ID: ${nuevoCliente.id}`);

              // ⭐ TRANSFERIR ETIQUETAS del lead al cliente
              if (leadActual.etiquetasRel && leadActual.etiquetasRel.length > 0) {
                console.log(`📌 Transfiriendo ${leadActual.etiquetasRel.length} etiqueta(s) al cliente...`);
                
                const etiquetasTransferidas = await prisma.clienteEtiqueta.createMany({
                  data: leadActual.etiquetasRel.map((et: any) => ({
                    clienteId: nuevoCliente.id,
                    etiquetaId: et.etiquetaId
                  })),
                  skipDuplicates: true
                });
                
                console.log(`✅ ${etiquetasTransferidas.count} etiqueta(s) transferida(s)`);
              }

              // Actualizar la oportunidad para usar clienteId en lugar de leadId
              await prisma.oportunidadCliente.update({
                where: { id },
                data: {
                  clienteId: nuevoCliente.id,
                  leadId: null,
                  notas: (oportunidadExistente.notas || '') + `\n[CONVERSIÓN] Lead convertido a Cliente el ${new Date().toLocaleDateString('es-PE')}`
                }
              });

              // ⭐ CRÍTICO: Eliminar el lead original para que NO aparezca en dos lugares
              console.log(`🗑️ Eliminando lead original ${oportunidadExistente.leadId}...`);
              await prisma.lead.delete({
                where: { id: oportunidadExistente.leadId }
              });

              console.log(`✅ Lead ${oportunidadExistente.leadId} convertido y eliminado`);
              console.log(`✅ Cliente ${nuevoCliente.id} creado exitosamente con etiquetas`);
              console.log(`🔄 ACTUALIZADO: clienteId=${nuevoCliente.id}, leadId=null`);
            } else {
              console.warn(`⚠️ No se encontró el lead ${oportunidadExistente.leadId} para convertir`);
            }
          } else {
            console.log(`ℹ️ Etapa actual: ${etapa} (no es FIDELIZACION)`);
          }
        } else if (oportunidadExistente.clienteId) {
          // Los clientes no tienen estado, solo leads
          console.log(`⚠️ No se puede actualizar estado: ${oportunidadExistente.clienteId} es un cliente`);
        }
      } catch (error) {
        console.error('❌ Error al actualizar el estado del lead:', error);
      }
    }

    // Sincronizar estado del lead con la nueva etapa
    try {
      const leadPipelineService = require('./lead-pipeline.service').default;
      const contactoId = oportunidadExistente.leadId || oportunidadExistente.clienteId;
      
      if (oportunidadExistente.leadId) {
        await leadPipelineService.sincronizarEstadoLead(contactoId);
        
        // Registrar el cambio en el historial
        await leadPipelineService.registrarCambioEtapa(
          id,
          contactoId,
          oportunidadExistente.etapa,
          etapa,
          usuarioId,
          {
            probabilidad: oportunidadExistente.probabilidad,
            valor: oportunidadExistente.valor
          },
          {
            probabilidad,
            valor: oportunidadExistente.valor
          },
          undefined,
          notas
        );
      }
    } catch (error) {
      console.warn('⚠️ No se pudo sincronizar el estado del lead:', error);
      // No fallar si la sincronización falla
    }

    // Retornar la oportunidad actualizada (especialmente importante después de conversión)
    const oportunidadFinal = await prisma.oportunidadCliente.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            empresa: true,
            etiquetasRel: {
              include: {
                etiqueta: true
              }
            }
          }
        },
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            empresa: true,
            etiquetasRel: {
              include: {
                etiqueta: true
              }
            }
          }
        }
      }
    });

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Etapa cambiada a ${etapa}. Lead: ${oportunidadFinal?.leadId}, Cliente: ${oportunidadFinal?.clienteId}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    return oportunidadFinal;
  }

  /**
   * Eliminar oportunidad
   */
  async eliminarOportunidad(id: string, usuarioId: string) {
    console.log('🔍 Buscando oportunidad para eliminar:', { id, usuarioId });
    
    const oportunidadExistente = await prisma.oportunidadCliente.findFirst({
      where: { id, usuarioId }
    });

    if (!oportunidadExistente) {
      console.warn('⚠️ Oportunidad no encontrada:', { id, usuarioId });
      throw new Error('Oportunidad no encontrada');
    }

    console.log('🗑️ Eliminando oportunidad:', id);
    await prisma.oportunidadCliente.delete({
      where: { id }
    });

    console.log('✅ Oportunidad eliminada exitosamente:', id);
    return { success: true };
  }

  /**
   * Obtener estadísticas del pipeline
   */
  async obtenerEstadisticas(usuarioId: string) {
    const oportunidades = await prisma.oportunidadCliente.findMany({
      where: { idUsuario: usuarioId }
    });

    type OportunidadValor = { valor: any; etapa: string };

    const estadisticasPorEtapa = await prisma.oportunidadCliente.groupBy({
      by: ['etapa'],
      where: { idUsuario: usuarioId },
      _count: { id: true },
      _sum: { valor: true }
    });

    const totalValor = oportunidades.reduce((acc: number, op: OportunidadValor) => {
      return acc + (op.valor ? Number(op.valor) : 0);
    }, 0);

    const valorGanado = oportunidades
      .filter((op: OportunidadValor) => op.etapa === 'CIERRE_GANADO')
      .reduce((acc: number, op: OportunidadValor) => acc + (op.valor ? Number(op.valor) : 0), 0);

    const etapasExcluidas: string[] = ['CIERRE_GANADO', 'CIERRE_PERDIDO'];
    const valorPipeline = oportunidades
      .filter((op: OportunidadValor) => !etapasExcluidas.includes(op.etapa))
      .reduce((acc: number, op: OportunidadValor) => acc + (op.valor ? Number(op.valor) : 0), 0);

    return {
      total: oportunidades.length,
      totalValor,
      valorGanado,
      valorPipeline,
      porEtapa: estadisticasPorEtapa.map((stat: any) => ({
        etapa: stat.etapa,
        cantidad: stat._count.id,
        valor: stat._sum.valor ? Number(stat._sum.valor) : 0
      }))
    };
  }

  /**
   * Obtener oportunidades de un cliente específico
   */
  async obtenerOportunidadesDeCliente(clienteId: string, usuarioId: string) {
    // Verificar que el cliente pertenece al usuario
    const cliente = await prisma.contacto.findFirst({
      where: { id: clienteId, usuarioId }
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    const oportunidades = await prisma.oportunidadCliente.findMany({
      where: { clienteId, idUsuario: usuarioId },
      orderBy: { ultimaActividad: 'desc' },
      include: {
        cliente: {
          include: {
            proyectos: {
              select: {
                proyecto: {
                  select: {
                    id: true,
                    nombre: true,
                    estado: true
                  }
                }
              }
            }
          }
        },
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            empresa: true
          }
        }
      }
    });

    return oportunidades;
  }

  /**
   * Actualizar oportunidad por leadId (sincronización con estado del lead)
   */
  async actualizarOportunidadPorLead(leadId: string, etapa: string, usuarioId: string) {
    // Buscar la oportunidad asociada a este lead
    const oportunidad = await prisma.oportunidadCliente.findFirst({
      where: {
        leadId: leadId,
        usuarioId
      },
      include: {
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            empresa: true
          }
        }
      }
    });

    if (!oportunidad) {
      return null;
    }

    // Actualizar la etapa
    const oportunidadActualizada = await prisma.oportunidadCliente.update({
      where: { id: oportunidad.id },
      data: {
        etapa,
        ultimaActividad: new Date(),
        notas: (oportunidad.notas || '') + `\n- Sincronizado a ${etapa} el ${new Date().toLocaleDateString('es-PE')}`
      },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            empresa: true
          }
        }
      }
    });

    return oportunidadActualizada;
  }
}

export default new OportunidadService();
