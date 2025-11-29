import prisma from '@/config/database';

export class EtiquetaService {
  /**
   * Obtener todas las etiquetas activas
   */
  async obtenerEtiquetas() {
    return await prisma.etiqueta.findMany({
      where: {
        activa: true,
        nombre: { not: 'Fuente: Google Contacts' }
      },
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Obtener etiquetas de un contacto específico
   */
  async obtenerEtiquetasDeContacto(contactoId: string) {
    try {
      // Intentar obtener del modelo Lead
      const leadConEtiquetas = await prisma.lead.findUnique({
        where: { id: contactoId },
        include: {
          etiquetasRel: {
            select: {
              etiqueta: true
            }
          }
        }
      });

      if (leadConEtiquetas) {
        return leadConEtiquetas.etiquetasRel?.map((ce: any) => ce.etiqueta) || [];
      }

      // Si no es un lead, intentar con Cliente
      const clienteConEtiquetas = await prisma.cliente.findUnique({
        where: { id: contactoId },
        include: {
          etiquetasRel: {
            select: {
              etiqueta: true
            }
          }
        }
      });

      if (clienteConEtiquetas) {
        return clienteConEtiquetas.etiquetasRel?.map((ce: any) => ce.etiqueta) || [];
      }

      // Si no encuentra en ninguna tabla, retornar array vacío
      return [];
    } catch (error: any) {
      console.error(`Error obteniendo etiquetas del contacto ${contactoId}:`, error);
      // Retornar array vacío en caso de error para no bloquear la creación
      return [];
    }
  }

  /**
   * Asignar etiquetas a un contacto
   * Reemplaza todas las etiquetas existentes con las nuevas
   */
  async asignarEtiquetas(contactoId: string, etiquetaIds: string[], usuarioId: string) {
    try {
      // Verificar que el contacto existe y pertenece al usuario (puede ser lead o cliente)
      const lead = await prisma.lead.findFirst({
        where: { id: contactoId, idUsuario: usuarioId }
      });

      const cliente = !lead ? await prisma.cliente.findFirst({
        where: { id: contactoId, idUsuario: usuarioId }
      }) : null;

      if (!lead && !cliente) {
        throw new Error('Contacto no encontrado');
      }

      // Eliminar todas las etiquetas actuales
      if (lead) {
        await prisma.leadEtiqueta.deleteMany({
          where: { idLead: contactoId }
        });

        // Asignar las nuevas etiquetas
        if (etiquetaIds.length > 0) {
          await prisma.leadEtiqueta.createMany({
            data: etiquetaIds.map(etiquetaId => ({
              idLead: contactoId,
              idEtiqueta: etiquetaId
            }))
          });
        }
      } else {
        await prisma.clienteEtiqueta.deleteMany({
          where: { idCliente: contactoId }
        });

        // Asignar las nuevas etiquetas
        if (etiquetaIds.length > 0) {
          await prisma.clienteEtiqueta.createMany({
            data: etiquetaIds.map(etiquetaId => ({
              idCliente: contactoId,
              idEtiqueta: etiquetaId
            }))
          });
        }
      }

      // Retornar las etiquetas actualizadas
      return await this.obtenerEtiquetasDeContacto(contactoId);
    } catch (error: any) {
      console.error(`Error asignando etiquetas al contacto ${contactoId}:`, error);
      throw error;
    }
  }

  /**
   * Agregar una etiqueta a un contacto (sin remover las existentes)
   */
  async agregarEtiqueta(contactoId: string, etiquetaId: string, usuarioId: string) {
    // Verificar que el contacto existe y pertenece al usuario (puede ser lead o cliente)
    const lead = await prisma.lead.findFirst({
      where: { id: contactoId, idUsuario: usuarioId }
    });

    const cliente = !lead ? await prisma.cliente.findFirst({
      where: { id: contactoId, idUsuario: usuarioId }
    }) : null;

    if (!lead && !cliente) {
      throw new Error('Contacto no encontrado');
    }

    if (lead) {
      // Verificar si la relación ya existe
      const existente = await prisma.leadEtiqueta.findUnique({
        where: {
          idLead_idEtiqueta: {
            idLead: contactoId,
            idEtiqueta: etiquetaId
          }
        }
      });

      if (existente) {
        return await this.obtenerEtiquetasDeContacto(contactoId);
      }

      // Crear la relación
      await prisma.leadEtiqueta.create({
        data: {
          idLead: contactoId,
          idEtiqueta: etiquetaId
        }
      });
    } else {
      // Verificar si la relación ya existe
      const existente = await prisma.clienteEtiqueta.findUnique({
        where: {
          idCliente_idEtiqueta: {
            idCliente: contactoId,
            idEtiqueta: etiquetaId
          }
        }
      });

      if (existente) {
        return await this.obtenerEtiquetasDeContacto(contactoId);
      }

      // Crear la relación
      await prisma.clienteEtiqueta.create({
        data: {
          idCliente: contactoId,
          idEtiqueta: etiquetaId
        }
      });
    }

    return await this.obtenerEtiquetasDeContacto(contactoId);
  }

  /**
   * Remover una etiqueta de un contacto
   */
  async removerEtiqueta(contactoId: string, etiquetaId: string, usuarioId: string) {
    // Verificar que el contacto existe y pertenece al usuario (puede ser lead o cliente)
    const lead = await prisma.lead.findFirst({
      where: { id: contactoId, idUsuario: usuarioId }
    });

    const cliente = !lead ? await prisma.cliente.findFirst({
      where: { id: contactoId, idUsuario: usuarioId }
    }) : null;

    if (!lead && !cliente) {
      throw new Error('Contacto no encontrado');
    }

    if (lead) {
      await prisma.leadEtiqueta.delete({
        where: {
          idLead_idEtiqueta: {
            idLead: contactoId,
            idEtiqueta: etiquetaId
          }
        }
      });
    } else {
      await prisma.clienteEtiqueta.delete({
        where: {
          idCliente_idEtiqueta: {
            idCliente: contactoId,
            idEtiqueta: etiquetaId
          }
        }
      });
    }

    return await this.obtenerEtiquetasDeContacto(contactoId);
  }

  /**
   * Crear una nueva etiqueta personalizada
   */
  async crearEtiqueta(datos: { nombre: string; color: string; descripcion?: string; icono?: string }) {
    // Verificar que no exista una etiqueta con el mismo nombre
    const existente = await prisma.etiqueta.findUnique({
      where: { nombre: datos.nombre }
    });

    if (existente) {
      throw new Error('Ya existe una etiqueta con ese nombre');
    }

    // Obtener el próximo orden
    const ultimaEtiqueta = await prisma.etiqueta.findFirst({
      orderBy: { orden: 'desc' }
    });

    const nuevoOrden = (ultimaEtiqueta?.orden || 0) + 1;

    return await prisma.etiqueta.create({
      data: {
        ...datos,
        orden: nuevoOrden
      }
    });
  }

  /**
   * Obtener contactos por etiqueta
   */
  async obtenerContactosPorEtiqueta(etiquetaId: string, usuarioId: string) {
    const contactos = await prisma.contacto.findMany({
      where: {
        usuarioId,
        etiquetas: {
          some: {
            etiquetaId
          }
        }
      },
      include: {
        etiquetas: {
          include: {
            etiqueta: true
          }
        }
      }
    });

    return contactos;
  }
}

export default new EtiquetaService();
