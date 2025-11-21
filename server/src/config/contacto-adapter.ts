/**
 * Adaptador para compatibilidad backwards-compatible
 * Proporciona una interfaz unificada para acceder a leads y clientes
 * como si fueran una sola tabla "contactos"
 */

import prisma from './database';

export class ContactoAdapter {
  /**
   * Transformar include/select para que sea compatible con Lead/Cliente
   */
  private static transformInclude(include: any): { leadInclude: any; clienteInclude: any } {
    const leadInclude = { ...include };
    const clienteInclude = { ...include };

    // Cambiar 'etiquetas' por 'etiquetasRel' en ambos
    if (leadInclude.etiquetas) {
      leadInclude.etiquetasRel = leadInclude.etiquetas;
      delete leadInclude.etiquetas;
    }
    if (clienteInclude.etiquetas) {
      clienteInclude.etiquetasRel = clienteInclude.etiquetas;
      delete clienteInclude.etiquetas;
    }

    return { leadInclude, clienteInclude };
  }

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

    // Transformar includes si existen
    const { leadInclude, clienteInclude } = this.transformInclude(include || {});

    // Si especifica tipo, buscar solo en esa tabla
    if (where.tipo === 'LEAD') {
      const leadWhere = { ...where };
      delete leadWhere.tipo;
      const leads = await prisma.lead.findMany({ 
        where: leadWhere, 
        include: Object.keys(leadInclude).length > 0 ? leadInclude : undefined, 
        select, 
        orderBy, 
        skip, 
        take 
      });
      return leads.map((lead: any) => ({ ...lead, tipo: 'LEAD' }));
    }

    if (where.tipo === 'CLIENTE') {
      const clienteWhere = { ...where };
      delete clienteWhere.tipo;
      const clientes = await prisma.cliente.findMany({ 
        where: clienteWhere, 
        include: Object.keys(clienteInclude).length > 0 ? clienteInclude : undefined, 
        select, 
        orderBy, 
        skip, 
        take 
      });
      return clientes.map((cliente: any) => ({ ...cliente, tipo: 'CLIENTE' }));
    }

    // Si no especifica tipo, obtener de ambas tablas
    const baseWhere = { ...where };
    delete baseWhere.tipo;
    
    const [leads, clientes] = await Promise.all([
      prisma.lead.findMany({ 
        where: baseWhere, 
        include: Object.keys(leadInclude).length > 0 ? leadInclude : undefined, 
        select, 
        orderBy, 
        skip, 
        take 
      }).catch(() => []),
      prisma.cliente.findMany({ 
        where: baseWhere, 
        include: Object.keys(clienteInclude).length > 0 ? clienteInclude : undefined, 
        select, 
        orderBy, 
        skip, 
        take 
      }).catch(() => [])
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

    // Si especifica tipo, contar solo en esa tabla
    if (where.tipo === 'LEAD') {
      const leadWhere = { ...where };
      delete leadWhere.tipo;
      return await prisma.lead.count({ where: leadWhere });
    }

    if (where.tipo === 'CLIENTE') {
      const clienteWhere = { ...where };
      delete clienteWhere.tipo;
      return await prisma.cliente.count({ where: clienteWhere });
    }

    // Si no especifica tipo, contar en ambas
    const baseWhere = { ...where };
    delete baseWhere.tipo;

    const [leadsCount, clientesCount] = await Promise.all([
      prisma.lead.count({ where: baseWhere }),
      prisma.cliente.count({ where: baseWhere })
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
    }).catch(() => []);

    const clientesGrouped = await prisma.cliente.groupBy({
      by,
      where,
      _count,
      _sum,
      _avg
    }).catch(() => []);

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
