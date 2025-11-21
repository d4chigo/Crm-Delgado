/**
 * Adaptador para compatibilidad backwards-compatible
 * Proporciona una interfaz unificada para acceder a leads y clientes
 * como si fueran una sola tabla "contactos"
 */

import prisma from './database';

export class ContactoAdapter {
  /**
   * Crear un lead (tratado como contacto de tipo LEAD)
   */
  static async create(data: any) {
    if (data.tipo === 'CLIENTE') {
      delete data.tipo;
      return await prisma.cliente.create({ data });
    }
    delete data.tipo;
    return await prisma.lead.create({ data });
  }

  /**
   * Buscar primero un lead, luego un cliente
   */
  static async findFirst(where: any) {
    // Intentar buscar en leads primero
    const lead = await prisma.lead.findFirst({ where });
    if (lead) return { ...lead, tipo: 'LEAD' };

    // Si no encuentra, buscar en clientes
    const cliente = await prisma.cliente.findFirst({ where });
    if (cliente) return { ...cliente, tipo: 'CLIENTE' };

    return null;
  }

  /**
   * Encontrar por ID (en ambas tablas)
   */
  static async findUnique(where: any) {
    const { id } = where;
    
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (lead) return { ...lead, tipo: 'LEAD' };

    const cliente = await prisma.cliente.findUnique({ where: { id } });
    if (cliente) return { ...cliente, tipo: 'CLIENTE' };

    return null;
  }

  /**
   * Buscar muchos (retorna leads y clientes mezclados)
   */
  static async findMany(options: any = {}) {
    const { where = {}, include, select, orderBy, skip, take } = options;

    // Obtener tanto leads como clientes
    const [leads, clientes] = await Promise.all([
      prisma.lead.findMany({ where, include, select, orderBy, skip, take }),
      prisma.cliente.findMany({ where, include, select, orderBy, skip, take })
    ]);

    // Añadir tipo y mezclar
    const resultado: any = [
      ...leads.map((lead: any) => ({ ...lead, tipo: 'LEAD' })),
      ...clientes.map((cliente: any) => ({ ...cliente, tipo: 'CLIENTE' }))
    ];

    return resultado;
  }

  /**
   * Contar contactos (leads + clientes)
   */
  static async count(options: any = {}) {
    const { where = {} } = options;

    const [leadsCount, clientesCount] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.cliente.count({ where })
    ]);

    return leadsCount + clientesCount;
  }

  /**
   * Actualizar (detecta si es lead o cliente por ID)
   */
  static async update(options: any) {
    const { where, data } = options;
    const { id } = where;

    // Detectar si es lead o cliente
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (lead) {
      delete data.tipo;
      return await prisma.lead.update({ where: { id }, data });
    }

    const cliente = await prisma.cliente.findUnique({ where: { id } });
    if (cliente) {
      delete data.tipo;
      return await prisma.cliente.update({ where: { id }, data });
    }

    throw new Error(`Contacto con ID ${id} no encontrado`);
  }

  /**
   * Eliminar (detecta si es lead o cliente por ID)
   */
  static async delete(where: any) {
    const { id } = where;

    // Intentar eliminar como lead
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (lead) {
      return await prisma.lead.delete({ where: { id } });
    }

    // Intentar eliminar como cliente
    const cliente = await prisma.cliente.findUnique({ where: { id } });
    if (cliente) {
      return await prisma.cliente.delete({ where: { id } });
    }

    throw new Error(`Contacto con ID ${id} no encontrado`);
  }

  /**
   * GroupBy para analytics
   */
  static async groupBy(options: any) {
    const { by, where = {}, _count, _sum, _avg } = options;

    // Para groupBy, necesitamos hacerlo por separado
    const leadsGrouped = await prisma.lead.groupBy({
      by,
      where,
      _count,
      _sum,
      _avg
    });

    const clientesGrouped = await prisma.cliente.groupBy({
      by,
      where,
      _count,
      _sum,
      _avg
    });

    // Combinar resultados
    return [...leadsGrouped, ...clientesGrouped];
  }
}

// Crear un proxy para que se acceda como prisma.contacto
export const contactoProxy = new Proxy({}, {
  get(target, prop) {
    return (ContactoAdapter as any)[prop];
  }
});
