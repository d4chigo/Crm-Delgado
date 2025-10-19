import prisma from '@/config/database';

export class EtiquetaService {
  /**
   * Obtener todas las etiquetas activas
   */
  async obtenerEtiquetas() {
    return await prisma.etiqueta.findMany({
      where: { activa: true },
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Obtener etiquetas de un contacto específico
   */
  async obtenerEtiquetasDeContacto(contactoId: string) {
    const contactoConEtiquetas = await prisma.contacto.findUnique({
      where: { id: contactoId },
      include: {
        etiquetas: {
          include: {
            etiqueta: true
          }
        }
      }
    });

    return contactoConEtiquetas?.etiquetas.map(ce => ce.etiqueta) || [];
  }

  /**
   * Asignar etiquetas a un contacto
   * Reemplaza todas las etiquetas existentes con las nuevas
   */
  async asignarEtiquetas(contactoId: string, etiquetaIds: string[], usuarioId: string) {
    // Verificar que el contacto existe y pertenece al usuario
    const contacto = await prisma.contacto.findFirst({
      where: { id: contactoId, usuarioId }
    });

    if (!contacto) {
      throw new Error('Contacto no encontrado');
    }

    // Eliminar todas las etiquetas actuales
    await prisma.contactoEtiqueta.deleteMany({
      where: { contactoId }
    });

    // Asignar las nuevas etiquetas
    if (etiquetaIds.length > 0) {
      await prisma.contactoEtiqueta.createMany({
        data: etiquetaIds.map(etiquetaId => ({
          contactoId,
          etiquetaId
        }))
      });
    }

    // Retornar las etiquetas actualizadas
    return await this.obtenerEtiquetasDeContacto(contactoId);
  }

  /**
   * Agregar una etiqueta a un contacto (sin remover las existentes)
   */
  async agregarEtiqueta(contactoId: string, etiquetaId: string, usuarioId: string) {
    // Verificar que el contacto existe y pertenece al usuario
    const contacto = await prisma.contacto.findFirst({
      where: { id: contactoId, usuarioId }
    });

    if (!contacto) {
      throw new Error('Contacto no encontrado');
    }

    // Verificar si la relación ya existe
    const existente = await prisma.contactoEtiqueta.findUnique({
      where: {
        contactoId_etiquetaId: {
          contactoId,
          etiquetaId
        }
      }
    });

    if (existente) {
      return await this.obtenerEtiquetasDeContacto(contactoId);
    }

    // Crear la relación
    await prisma.contactoEtiqueta.create({
      data: {
        contactoId,
        etiquetaId
      }
    });

    return await this.obtenerEtiquetasDeContacto(contactoId);
  }

  /**
   * Remover una etiqueta de un contacto
   */
  async removerEtiqueta(contactoId: string, etiquetaId: string, usuarioId: string) {
    // Verificar que el contacto existe y pertenece al usuario
    const contacto = await prisma.contacto.findFirst({
      where: { id: contactoId, usuarioId }
    });

    if (!contacto) {
      throw new Error('Contacto no encontrado');
    }

    await prisma.contactoEtiqueta.delete({
      where: {
        contactoId_etiquetaId: {
          contactoId,
          etiquetaId
        }
      }
    });

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
