import prisma from '@/config/database';
import { TipoContacto, EtapaPipeline } from '@prisma/client';

export interface CrearOportunidadDTO {
  clienteId: string;
  titulo: string;
  proyecto?: string;
  propiedad?: string;
  etapa?: EtapaPipeline;
  valor?: number;
  probabilidad?: number;
  proximaAccion?: string;
  notas?: string;
}

export interface ActualizarOportunidadDTO {
  titulo?: string;
  proyecto?: string;
  propiedad?: string;
  etapa?: EtapaPipeline;
  valor?: number;
  probabilidad?: number;
  proximaAccion?: string;
  notas?: string;
}

export interface FiltrosOportunidad {
  clienteId?: string;
  etapa?: EtapaPipeline;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}

export class OportunidadService {
  /**
   * Crear nueva oportunidad para un cliente
   */
  async crearOportunidad(usuarioId: string, datos: CrearOportunidadDTO) {
    // Verificar que el cliente existe y es de tipo CLIENTE
    const cliente = await prisma.contacto.findFirst({
      where: {
        id: datos.clienteId,
        usuarioId,
        tipo: TipoContacto.CLIENTE
      }
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado o no es un cliente válido');
    }

    // Crear la oportunidad
    const oportunidad = await prisma.oportunidadCliente.create({
      data: {
        clienteId: datos.clienteId,
        titulo: datos.titulo,
        proyecto: datos.proyecto,
        propiedad: datos.propiedad,
        etapa: datos.etapa || EtapaPipeline.LEAD,
        valor: datos.valor,
        probabilidad: datos.probabilidad || 25,
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
            empresa: true
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
    const where: any = { usuarioId };

    if (clienteId) {
      where.clienteId = clienteId;
    }

    if (etapa) {
      where.etapa = etapa;
    }

    if (busqueda) {
      where.OR = [
        { titulo: { contains: busqueda, mode: 'insensitive' } },
        { proyecto: { contains: busqueda, mode: 'insensitive' } },
        { propiedad: { contains: busqueda, mode: 'insensitive' } },
        {
          cliente: {
            OR: [
              { nombre: { contains: busqueda, mode: 'insensitive' } },
              { apellido: { contains: busqueda, mode: 'insensitive' } },
              { correo: { contains: busqueda, mode: 'insensitive' } }
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
              empresa: true
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
      where: { id, usuarioId },
      include: {
        cliente: {
          include: {
            etiquetas: {
              include: {
                etiqueta: true
              }
            }
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
      where: { id, usuarioId }
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
            empresa: true
          }
        }
      }
    });

    return oportunidad;
  }

  /**
   * Cambiar etapa de la oportunidad
   */
  async cambiarEtapa(
    id: string,
    usuarioId: string,
    etapa: EtapaPipeline,
    notas?: string
  ) {
    const oportunidadExistente = await prisma.oportunidadCliente.findFirst({
      where: { id, usuarioId }
    });

    if (!oportunidadExistente) {
      throw new Error('Oportunidad no encontrada');
    }

    // Ajustar probabilidad según la etapa
    let probabilidad = oportunidadExistente.probabilidad;
    if (etapa === EtapaPipeline.GANADO) {
      probabilidad = 100;
    } else if (etapa === EtapaPipeline.PERDIDO) {
      probabilidad = 0;
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
        }
      }
    });

    return oportunidad;
  }

  /**
   * Eliminar oportunidad
   */
  async eliminarOportunidad(id: string, usuarioId: string) {
    const oportunidadExistente = await prisma.oportunidadCliente.findFirst({
      where: { id, usuarioId }
    });

    if (!oportunidadExistente) {
      throw new Error('Oportunidad no encontrada');
    }

    await prisma.oportunidadCliente.delete({
      where: { id }
    });

    return { success: true };
  }

  /**
   * Obtener estadísticas del pipeline
   */
  async obtenerEstadisticas(usuarioId: string) {
    const oportunidades = await prisma.oportunidadCliente.findMany({
      where: { usuarioId }
    });

    type OportunidadValor = { valor: any; etapa: EtapaPipeline };

    const estadisticasPorEtapa = await prisma.oportunidadCliente.groupBy({
      by: ['etapa'],
      where: { usuarioId },
      _count: { id: true },
      _sum: { valor: true }
    });

    const totalValor = oportunidades.reduce((acc: number, op: OportunidadValor) => {
      return acc + (op.valor ? Number(op.valor) : 0);
    }, 0);

    const valorGanado = oportunidades
      .filter((op: OportunidadValor) => op.etapa === EtapaPipeline.GANADO)
      .reduce((acc: number, op: OportunidadValor) => acc + (op.valor ? Number(op.valor) : 0), 0);

    const etapasExcluidas: EtapaPipeline[] = [EtapaPipeline.GANADO, EtapaPipeline.PERDIDO];
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
      where: { clienteId, usuarioId },
      orderBy: { ultimaActividad: 'desc' }
    });

    return oportunidades;
  }
}

export default new OportunidadService();
