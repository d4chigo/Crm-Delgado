/**
 * Adaptador para compatibilidad backwards-compatible con ContactoEtiqueta
 * Ahora se divide en LeadEtiqueta y ClienteEtiqueta
 */

import prisma from './database';

export class ContactoEtiquetaAdapter {
  /**
   * Crear etiqueta de contacto
   */
  static async create(data: any) {
    const { contactoId, etiquetaId } = data;

    // Detectar si es lead o cliente
    const lead = await prisma.lead.findUnique({ where: { id: contactoId } });
    if (lead) {
      return await prisma.leadEtiqueta.create({
        data: { leadId: contactoId, etiquetaId }
      });
    }

    const cliente = await prisma.cliente.findUnique({ where: { id: contactoId } });
    if (cliente) {
      return await prisma.clienteEtiqueta.create({
        data: { clienteId: contactoId, etiquetaId }
      });
    }

    throw new Error(`Contacto con ID ${contactoId} no encontrado`);
  }

  /**
   * Buscar muchas etiquetas de contacto
   */
  static async findMany(options: any = {}) {
    const { where } = options;
    const { contactoId } = where || {};

    if (!contactoId) {
      // Si no especifica contactoId, retornar todas
      const [leadEtiquetas, clienteEtiquetas] = await Promise.all([
        prisma.leadEtiqueta.findMany(options),
        prisma.clienteEtiqueta.findMany(options)
      ]);
      return [...leadEtiquetas, ...clienteEtiquetas];
    }

    // Si especifica contactoId, buscar en leads y clientes
    const [leadEtiquetas, clienteEtiquetas] = await Promise.all([
      prisma.leadEtiqueta.findMany({
        ...options,
        where: { ...where, leadId: contactoId }
      }).catch(() => []),
      prisma.clienteEtiqueta.findMany({
        ...options,
        where: { ...where, clienteId: contactoId }
      }).catch(() => [])
    ]);

    return [...leadEtiquetas, ...clienteEtiquetas];
  }

  /**
   * Buscar muchas etiquetas de forma unificada
   */
  static async createMany(options: any = {}) {
    const { data } = options;
    const resultado = [];

    for (const item of data) {
      const { contactoId, etiquetaId } = item;

      // Detectar si es lead o cliente
      const lead = await prisma.lead.findUnique({ where: { id: contactoId } });
      if (lead) {
        resultado.push(
          await prisma.leadEtiqueta.create({
            data: { leadId: contactoId, etiquetaId }
          })
        );
        continue;
      }

      const cliente = await prisma.cliente.findUnique({ where: { id: contactoId } });
      if (cliente) {
        resultado.push(
          await prisma.clienteEtiqueta.create({
            data: { clienteId: contactoId, etiquetaId }
          })
        );
        continue;
      }
    }

    return resultado;
  }

  /**
   * Eliminar etiquetas de contacto
   */
  static async deleteMany(options: any = {}) {
    const { where } = options;
    const { contactoId, etiquetaId } = where || {};

    if (contactoId && etiquetaId) {
      // Eliminar de leads
      await prisma.leadEtiqueta.delete({
        where: { leadId_etiquetaId: { leadId: contactoId, etiquetaId } }
      }).catch(() => {});

      // Eliminar de clientes
      await prisma.clienteEtiqueta.delete({
        where: { clienteId_etiquetaId: { clienteId: contactoId, etiquetaId } }
      }).catch(() => {});

      return { count: 1 };
    }

    // Si es deleteMany de todo para un contacto
    const [leadDeleted, clienteDeleted] = await Promise.all([
      prisma.leadEtiqueta.deleteMany({
        where: { leadId: contactoId }
      }).catch(() => ({ count: 0 })),
      prisma.clienteEtiqueta.deleteMany({
        where: { clienteId: contactoId }
      }).catch(() => ({ count: 0 }))
    ]);

    return { count: leadDeleted.count + clienteDeleted.count };
  }

  /**
   * Buscar una etiqueta de contacto
   */
  static async findUnique(options: any = {}) {
    const { where } = options;
    const { contactoId_etiquetaId } = where || {};

    if (!contactoId_etiquetaId) return null;

    const { contactoId, etiquetaId } = contactoId_etiquetaId;

    // Buscar en leads
    const leadEtiqueta = await prisma.leadEtiqueta.findUnique({
      where: { leadId_etiquetaId: { leadId: contactoId, etiquetaId } }
    }).catch(() => null);

    if (leadEtiqueta) return leadEtiqueta;

    // Buscar en clientes
    const clienteEtiqueta = await prisma.clienteEtiqueta.findUnique({
      where: { clienteId_etiquetaId: { clienteId: contactoId, etiquetaId } }
    }).catch(() => null);

    return clienteEtiqueta;
  }
}

export const contactoEtiquetaProxy = new Proxy({}, {
  get(target, prop) {
    return (ContactoEtiquetaAdapter as any)[prop];
  }
});
