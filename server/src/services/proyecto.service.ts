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

    return await prisma.proyecto.findMany({
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
  },

  /**
   * Obtener un proyecto por ID
   */
  async obtenerPorId(id: string) {
    return await prisma.proyecto.findUnique({
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
        usuarioId: proyectoData.usuarioId,
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
    return await prisma.proyecto.update({
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
        proyectoId_contactoId: {
          proyectoId,
          contactoId: datos.clienteId
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
        proyectoId,
        contactoId: datos.clienteId,
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
        proyectoId_contactoId: {
          proyectoId,
          contactoId: clienteId
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
    return await prisma.proyecto.findMany({
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
  }
}
