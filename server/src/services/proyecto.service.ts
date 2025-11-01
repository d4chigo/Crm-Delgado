import { PrismaClient, proyectos_estado as EstadoProyecto } from '@prisma/client'

const prisma = new PrismaClient()

export interface CrearProyectoDto {
  nombre: string
  descripcion?: string
  imagen?: string
  precio?: number
  ubicacion?: string
  estado?: EstadoProyecto
  usuarioId: string
  etiquetaIds?: string[]
}

export interface ActualizarProyectoDto {
  nombre?: string
  descripcion?: string
  imagen?: string
  precio?: number
  ubicacion?: string
  estado?: EstadoProyecto
  activo?: boolean
}

export interface AsociarClienteDto {
  clienteId: string
  notas?: string
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
          etiquetaId: filtros.etiquetaId
        }
      }
    }

    return await prisma.proyectos.findMany({
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
                telefono: true,
                tipo: true
              }
            }
          }
        },
        usuarios: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      },
      orderBy: {
        creadoEn: 'desc'
      }
    })
  },

  /**
   * Obtener un proyecto por ID
   */
  async obtenerPorId(id: string) {
    return await prisma.proyectos.findUnique({
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
                tipo: true,
                dni: true
              }
            }
          }
        },
        usuarios: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    })
  },

  /**
   * Crear un nuevo proyecto
   */
  async crear(datos: CrearProyectoDto) {
    const { etiquetaIds, ...proyectoData } = datos

    const proyecto = await prisma.proyectos.create({
      data: {
        ...proyectoData,
        estado: proyectoData.estado || EstadoProyecto.DISPONIBLE,
        etiquetas: etiquetaIds
          ? {
              create: etiquetaIds.map((etiquetaId) => ({
                etiquetaId
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

    return proyecto
  },

  /**
   * Actualizar un proyecto existente
   */
  async actualizar(id: string, datos: ActualizarProyectoDto) {
    return await prisma.proyectos.update({
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
  },

  /**
   * Eliminar un proyecto (soft delete)
   */
  async eliminar(id: string) {
    return await prisma.proyectos.update({
      where: { id },
      data: { activo: false }
    })
  },

  /**
   * Eliminar permanentemente un proyecto
   */
  async eliminarPermanente(id: string) {
    return await prisma.proyectos.delete({
      where: { id }
    })
  },

  /**
   * Asignar etiquetas a un proyecto
   */
  async asignarEtiquetas(proyectoId: string, etiquetaIds: string[]) {
    // Eliminar etiquetas existentes
    await prisma.proyectoEtiqueta.deleteMany({
      where: { proyectoId }
    })

    // Crear nuevas relaciones
    await prisma.proyectoEtiqueta.createMany({
      data: etiquetaIds.map((etiquetaId) => ({
        proyectoId,
        etiquetaId
      }))
    })

    return await this.obtenerPorId(proyectoId)
  },

  /**
   * Asociar un cliente a un proyecto
   */
  async asociarCliente(proyectoId: string, datos: AsociarClienteDto) {
    // Verificar que el contacto sea de tipo CLIENTE
    const cliente = await prisma.contacto.findFirst({
      where: {
        id: datos.clienteId,
        tipo: 'CLIENTE'
      }
    })

    if (!cliente) {
      throw new Error('El contacto debe ser de tipo CLIENTE')
    }

    // Verificar si ya está asociado
    const existente = await prisma.proyectoCliente.findUnique({
      where: {
        proyectoId_clienteId: {
          proyectoId,
          clienteId: datos.clienteId
        }
      }
    })

    if (existente) {
      throw new Error('El cliente ya está asociado a este proyecto')
    }

    await prisma.proyectoCliente.create({
      data: {
        proyectoId,
        clienteId: datos.clienteId,
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
    await prisma.proyectoCliente.delete({
      where: {
        proyectoId_clienteId: {
          proyectoId,
          clienteId
        }
      }
    })

    return await this.obtenerPorId(proyectoId)
  },

  /**
   * Obtener proyectos de un cliente específico
   */
  async obtenerPorCliente(clienteId: string) {
    return await prisma.proyectos.findMany({
      where: {
        clientes: {
          some: {
            clienteId
          }
        }
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
  }
}
