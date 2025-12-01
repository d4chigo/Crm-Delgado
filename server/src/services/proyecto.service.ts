import prisma from '@/config/database';
import { EstadoProyecto } from '@prisma/client'

export interface CrearProyectoDto {
  nombre: string
  descripcion?: string
  imagen?: string
  precio?: number
  ubicacion?: string
  latitud?: number
  longitud?: number
  estado?: EstadoProyecto
  tipoProyecto?: string
  categoria?: string
  mostrarEnWeb?: boolean
  ordenWeb?: number
  usuarioId: string
  etiquetaIds?: string[]
}

export interface ActualizarProyectoDto {
  nombre?: string
  descripcion?: string
  imagen?: string
  precio?: number
  ubicacion?: string
  latitud?: number
  longitud?: number
  estado?: EstadoProyecto
  tipoProyecto?: string
  categoria?: string
  mostrarEnWeb?: boolean
  ordenWeb?: number
  activo?: boolean
}

export interface AsociarClienteDto {
  clienteId: string
  notas?: string
}

/**
 * Mapear datos de Prisma al formato esperado por el frontend
 */
function mapearProyecto(proyecto: any) {
  if (!proyecto) return null
  
  return {
    ...proyecto,
    etiquetas: proyecto.etiquetas?.map((pe: any) => ({
      ...pe,
      etiquetaId: pe.idEtiqueta,
      proyectoId: pe.idProyecto
    })) || [],
    clientes: proyecto.clientes?.map((pc: any) => ({
      ...pc,
      clienteId: pc.idCliente,
      proyectoId: pc.idProyecto
    })) || []
  }
}

export const proyectoService = {
  /**
   * Obtener todos los proyectos con sus relaciones
   */
  async obtenerProyectos(filtros?: { etiquetaId?: string; estado?: EstadoProyecto; activo?: boolean }) {
    const where: any = {}

    if (filtros?.activo !== undefined) {
      where.activo = filtros.activo
    }

    if (filtros?.estado) {
      where.estado = filtros.estado
    }

    if (filtros?.etiquetaId) {
      where.etiquetas = {
        some: {
          idEtiqueta: filtros.etiquetaId
        }
      }
    }

    const proyectos = await prisma.proyecto.findMany({
      where,
      include: {
        etiquetas: {
          include: {
            etiqueta: true
          }
        },
        clientes: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                correo: true,
                telefono: true
              }
            }
          }
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            correo: true
          }
        }
      },
      orderBy: {
        creadoEn: 'desc'
      }
    })
    
    return proyectos.map(mapearProyecto)
  },

  /**
   * Obtener un proyecto por ID
   */
  async obtenerPorId(id: string) {
    const proyecto = await prisma.proyecto.findUnique({
      where: { id },
      include: {
        etiquetas: {
          include: {
            etiqueta: true
          }
        },
        clientes: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                correo: true,
                telefono: true,
                dni: true
              }
            }
          }
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            correo: true
          }
        }
      }
    })
    
    return mapearProyecto(proyecto)
  },

  /**
   * Crear un nuevo proyecto
   */
  async crear(datos: CrearProyectoDto) {
    const { etiquetaIds, ...proyectoData } = datos

    const proyecto = await prisma.proyecto.create({
      data: {
        nombre: proyectoData.nombre,
        descripcion: proyectoData.descripcion,
        imagen: proyectoData.imagen,
        precio: proyectoData.precio,
        ubicacion: proyectoData.ubicacion,
        estado: proyectoData.estado || EstadoProyecto.DISPONIBLE,
        tipoProyecto: proyectoData.tipoProyecto,
        categoria: proyectoData.categoria,
        mostrarEnWeb: proyectoData.mostrarEnWeb !== undefined ? proyectoData.mostrarEnWeb : true,
        ordenWeb: proyectoData.ordenWeb || 0,
        usuario: {
          connect: {
            id: proyectoData.usuarioId
          }
        },
        etiquetas: etiquetaIds && etiquetaIds.length > 0
          ? {
              create: etiquetaIds.map((etiquetaId) => ({
                idEtiqueta: etiquetaId
              }))
            }
          : undefined
      },
      include: {
        etiquetas: {
          include: {
            etiqueta: true
          }
        },
        clientes: {
          include: {
            cliente: true
          }
        }
      }
    })

    return mapearProyecto(proyecto)
  },

  /**
   * Actualizar un proyecto existente
   */
  async actualizar(id: string, datos: ActualizarProyectoDto) {
    const proyecto = await prisma.proyecto.update({
      where: { id },
      data: datos,
      include: {
        etiquetas: {
          include: {
            etiqueta: true
          }
        },
        clientes: {
          include: {
            cliente: true
          }
        }
      }
    })
    
    return mapearProyecto(proyecto)
  },

  /**
   * Eliminar un proyecto (soft delete)
   */
  async eliminar(id: string) {
    return await prisma.proyecto.update({
      where: { id },
      data: { activo: false }
    })
  },

  /**
   * Eliminar permanentemente un proyecto
   */
  async eliminarPermanente(id: string) {
    return await prisma.proyecto.delete({
      where: { id }
    })
  },

  /**
   * Asignar etiquetas a un proyecto
   */
  async asignarEtiquetas(proyectoId: string, etiquetaIds: string[]) {
    // Eliminar etiquetas existentes
    await prisma.proyectoEtiqueta.deleteMany({
      where: { idProyecto: proyectoId }
    })

    // Crear nuevas relaciones si hay etiquetas
    if (etiquetaIds.length > 0) {
      await prisma.proyectoEtiqueta.createMany({
        data: etiquetaIds.map((etiquetaId) => ({
          idProyecto: proyectoId,
          idEtiqueta: etiquetaId
        }))
      })
    }

    return await this.obtenerPorId(proyectoId)
  },

  /**
   * Asociar un cliente a un proyecto
   */
  async asociarCliente(proyectoId: string, datos: AsociarClienteDto) {
    // Verificar que el contacto exista (puede ser CLIENTE o LEAD)
    const cliente = await prisma.cliente.findUnique({
      where: {
        id: datos.clienteId
      }
    })

    const lead = !cliente ? await prisma.lead.findUnique({
      where: {
        id: datos.clienteId
      }
    }) : null

    if (!cliente && !lead) {
      throw new Error('El contacto no existe')
    }

    const tipoContacto = cliente ? 'CLIENTE' : 'LEAD'

    // Verificar si ya está asociado en ProyectoContacto
    const existente = await prisma.proyectoContacto.findUnique({
      where: {
        idProyecto_idContacto: {
          idProyecto: proyectoId,
          idContacto: datos.clienteId
        }
      }
    })

    if (existente) {
      throw new Error('El contacto ya está asociado a este proyecto')
    }

    // Si es un cliente, también asociar en ProyectoCliente para compatibilidad
    if (cliente) {
      const existenteCliente = await prisma.proyectoCliente.findUnique({
        where: {
          proyectoId_clienteId: {
            proyectoId,
            clienteId: datos.clienteId
          }
        }
      })

      if (!existenteCliente) {
        await prisma.proyectoCliente.create({
          data: {
            proyectoId,
            clienteId: datos.clienteId,
            notas: datos.notas
          }
        })
      }
    }

    // Crear registro en ProyectoContacto
    await prisma.proyectoContacto.create({
      data: {
        idProyecto: proyectoId,
        idContacto: datos.clienteId,
        tipoContacto,
        notas: datos.notas
      }
    })

    return await this.obtenerPorId(proyectoId)
  },

  /**
   * Actualizar notas de un cliente asociado
   */
  async actualizarNotasCliente(proyectoId: string, clienteId: string, notas: string) {
    await prisma.proyectoCliente.update({
      where: {
        proyectoId_clienteId: {
          proyectoId,
          clienteId
        }
      },
      data: { notas }
    })

    return await this.obtenerPorId(proyectoId)
  },

  /**
   * Desasociar un cliente de un proyecto
   */
  async desasociarCliente(proyectoId: string, clienteId: string) {
    // Eliminar de ProyectoContacto
    await prisma.proyectoContacto.delete({
      where: {
        idProyecto_idContacto: {
          idProyecto: proyectoId,
          idContacto: clienteId
        }
      }
    }).catch(() => {
      // Si no existe en ProyectoContacto, continuar
    })

    // Eliminar de ProyectoCliente si existe (para compatibilidad)
    await prisma.proyectoCliente.delete({
      where: {
        proyectoId_clienteId: {
          proyectoId,
          clienteId
        }
      }
    }).catch(() => {
      // Si no existe en ProyectoCliente, continuar
    })

    return await this.obtenerPorId(proyectoId)
  },

  /**
   * Obtener proyectos de un cliente específico
   */
  async obtenerPorCliente(clienteId: string) {
    const proyectos = await prisma.proyecto.findMany({
      where: {
        OR: [
          {
            clientes: {
              some: {
                clienteId
              }
            }
          },
          {
            contactos: {
              some: {
                contactoId: clienteId
              }
            }
          }
        ]
      },
      include: {
        etiquetas: {
          include: {
            etiqueta: true
          }
        },
        clientes: {
          include: {
            cliente: true
          }
        }
      },
      orderBy: {
        creadoEn: 'desc'
      }
    })
    
    return proyectos.map(mapearProyecto)
  },

  /**
   * Obtener proyectos de un contacto (lead o cliente)
   */
  async obtenerPorContacto(contactoId: string) {
    try {
      console.log('[ProyectoService] obtenerPorContacto - contactoId:', contactoId)
      
      const proyectos = await prisma.proyecto.findMany({
        where: {
          OR: [
            {
              clientes: {
                some: {
                  cliente: {
                    id: contactoId
                  }
                }
              }
            },
            {
              contactos: {
                some: {
                  idContacto: contactoId
                }
              }
            }
          ]
        },
        include: {
          etiquetas: {
            include: {
              etiqueta: true
            }
          },
          clientes: {
            include: {
              cliente: true
            }
          },
          contactos: {
            select: {
              idProyecto: true,
              idContacto: true,
              tipoContacto: true,
              asociadoEn: true,
              notas: true
            }
          }
        },
        orderBy: {
          creadoEn: 'desc'
        }
      })
      
      console.log('[ProyectoService] obtenerPorContacto - proyectos encontrados:', proyectos.length)
      return proyectos.map(mapearProyecto)
    } catch (error: any) {
      console.error('[ProyectoService] Error en obtenerPorContacto:', {
        mensaje: error.message,
        stack: error.stack,
        codigo: error.code
      })
      throw error
    }
  }
}
