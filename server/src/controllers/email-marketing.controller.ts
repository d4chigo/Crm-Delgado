import { Request, Response } from 'express';
import prisma from '@/config/database';
import {
  enviarCampanaEmail,
  filtrarEmailsValidos,
  obtenerEstadisticasEmails,
  validarEmail,
  type ContactoEmail,
} from '@/services/email-marketing.service';

/**
 * GET /api/email-marketing/estadisticas
 * Obtener estadísticas de emails válidos e inválidos en la base de datos
 */
export async function obtenerEstadisticas(req: Request, res: Response) {
  try {
    // Obtener todos los leads y clientes con sus etiquetas
    const [leads, clientes, etiquetas] = await Promise.all([
      prisma.lead.findMany({
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          etiquetasRel: {
            include: { etiqueta: true }
          }
        }
      }),
      prisma.cliente.findMany({
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          etiquetasRel: {
            include: { etiqueta: true }
          }
        }
      }),
      prisma.etiqueta.findMany({
        where: { activa: true },
        orderBy: { orden: 'asc' }
      })
    ]);

    // Convertir a formato de ContactoEmail
    const contactosLead = leads.map((l: any) => ({
      id: l.id,
      nombre: l.nombre,
      apellido: l.apellido,
      correo: l.correo || '',
      tipo: 'lead' as const,
    }));

    const contactosCliente = clientes.map((c: any) => ({
      id: c.id,
      nombre: c.nombre,
      apellido: c.apellido,
      correo: c.correo || '',
      tipo: 'cliente' as const,
    }));

    const todosContactos = [...contactosLead, ...contactosCliente];

    // Obtener estadísticas
    const estadisticas = obtenerEstadisticasEmails(todosContactos);

    res.json({
      exito: true,
      datos: {
        totalContactos: todosContactos.length,
        emailsValidos: estadisticas.validos,
        emailsInvalidos: estadisticas.invalidos,
        porcentajeValido: estadisticas.porcentajeValido,
        leads: {
          total: leads.length,
          validos: leads.filter((l: any) => validarEmail(l.correo || '')).length,
          invalidos: leads.filter((l: any) => !validarEmail(l.correo || '')).length,
        },
        clientes: {
          total: clientes.length,
          validos: clientes.filter((c: any) => validarEmail(c.correo || '')).length,
          invalidos: clientes.filter((c: any) => !validarEmail(c.correo || '')).length,
        },
        contactosInvalidos: estadisticas.contactosInvalidos.map(c => ({
          id: c.id,
          nombre: c.nombre,
          correo: c.correo,
          tipo: c.tipo,
        })),
        contactos: todosContactos.filter(c => validarEmail(c.correo)).map(c => ({
          id: c.id,
          nombre: c.nombre,
          correo: c.correo,
          tipo: c.tipo === 'lead' ? 'LEAD' : 'CLIENTE',
        })),
        etiquetas: etiquetas.map((e: any) => ({
          id: e.id,
          nombre: e.nombre,
          color: e.color,
          icono: e.icono,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      exito: false,
      error: 'Error obteniendo estadísticas de emails',
    });
  }
}

/**
 * POST /api/email-marketing/enviar-campana
 * Enviar campaña de email marketing
 * Body: {
 *   asunto: string,
 *   contenido: string,
 *   contenidoHtml?: string,
 *   destinatarios: 'leads' | 'clientes' | 'todos',
 *   filtros?: { estado?: string, etiquetas?: string[] }
 * }
 */
export async function enviarCampana(req: Request, res: Response) {
  try {
    const { asunto, contenido, contenidoHtml, destinatarios, filtros, urlImagen, etiquetaIds, contactoIds } = req.body;

    // Validar datos requeridos
    if (!asunto || !contenido || !destinatarios) {
      return res.status(400).json({
        exito: false,
        error: 'Faltan datos requeridos: asunto, contenido, destinatarios',
      });
    }

    if (!['leads', 'clientes', 'todos', 'etiquetas', 'individuales'].includes(destinatarios)) {
      return res.status(400).json({
        exito: false,
        error: 'Destinatarios debe ser: leads, clientes, todos, etiquetas o individuales',
      });
    }

    console.log('📧 Preparando campaña de email marketing');
    console.log(`📋 Destinatarios: ${destinatarios}`);
    if (etiquetaIds && etiquetaIds.length > 0) {
      console.log(`🏷️  Etiquetas seleccionadas: ${etiquetaIds.join(', ')}`);
    }
    if (contactoIds && contactoIds.length > 0) {
      console.log(`👥 Contactos individuales: ${contactoIds.length}`);
    }

    // Obtener contactos según el filtro
    let contactos: ContactoEmail[] = [];

    // Construir condición para filtrar por etiquetas si se especifican
    const whereEtiquetas = etiquetaIds && etiquetaIds.length > 0
      ? {
          etiquetasRel: {
            some: {
              etiquetaId: { in: etiquetaIds }
            }
          }
        }
      : {};

    // Si es por contactos individuales
    if (destinatarios === 'individuales' && contactoIds && contactoIds.length > 0) {
      const leads = await prisma.lead.findMany({
        select: { id: true, nombre: true, apellido: true, correo: true },
        where: { id: { in: contactoIds } }
      });
      const clientes = await prisma.cliente.findMany({
        select: { id: true, nombre: true, apellido: true, correo: true },
        where: { id: { in: contactoIds } }
      });
      
      contactos.push(
        ...leads.map((l: any) => ({
          id: l.id,
          nombre: l.nombre,
          apellido: l.apellido,
          correo: l.correo || '',
          tipo: 'lead' as const,
        })),
        ...clientes.map((c: any) => ({
          id: c.id,
          nombre: c.nombre,
          apellido: c.apellido,
          correo: c.correo || '',
          tipo: 'cliente' as const,
        }))
      );
    }
    // Si es por etiquetas
    else if (destinatarios === 'etiquetas' && etiquetaIds && etiquetaIds.length > 0) {
      const leads = await prisma.lead.findMany({
        select: { id: true, nombre: true, apellido: true, correo: true },
        where: whereEtiquetas
      });
      const clientes = await prisma.cliente.findMany({
        select: { id: true, nombre: true, apellido: true, correo: true },
        where: whereEtiquetas
      });
      
      contactos.push(
        ...leads.map((l: any) => ({
          id: l.id,
          nombre: l.nombre,
          apellido: l.apellido,
          correo: l.correo || '',
          tipo: 'lead' as const,
        })),
        ...clientes.map((c: any) => ({
          id: c.id,
          nombre: c.nombre,
          apellido: c.apellido,
          correo: c.correo || '',
          tipo: 'cliente' as const,
        }))
      );
    }
    // Si es por tipo (leads, clientes, todos)
    else if (destinatarios === 'leads' || destinatarios === 'todos') {
      const leadsQuery: any = {
        select: { id: true, nombre: true, apellido: true, correo: true },
        where: { ...whereEtiquetas }
      };
      if (filtros?.estado) {
        leadsQuery.where.estado = filtros.estado;
      }
      const leads = await prisma.lead.findMany(leadsQuery);
      contactos.push(
        ...leads.map((l: any) => ({
          id: l.id,
          nombre: l.nombre,
          apellido: l.apellido,
          correo: l.correo || '',
          tipo: 'lead' as const,
        }))
      );
    }

    if (destinatarios === 'clientes' || destinatarios === 'todos') {
      const clientesQuery: any = {
        select: { id: true, nombre: true, apellido: true, correo: true },
        where: { ...whereEtiquetas }
      };
      const clientes = await prisma.cliente.findMany(clientesQuery);
      contactos.push(
        ...clientes.map((c: any) => ({
          id: c.id,
          nombre: c.nombre,
          apellido: c.apellido,
          correo: c.correo || '',
          tipo: 'cliente' as const,
        }))
      );
    }

    // Filtrar solo emails válidos
    const contactosValidos = filtrarEmailsValidos(contactos);

    if (contactosValidos.length === 0) {
      return res.status(400).json({
        exito: false,
        error: 'No hay contactos con emails válidos para enviar la campaña',
        estadisticas: {
          totalContactos: contactos.length,
          emailsValidos: 0,
          emailsInvalidos: contactos.length,
        },
      });
    }

    console.log(`📧 Enviando a ${contactosValidos.length} contactos válidos`);

    // Enviar campaña
    const resultado = await enviarCampanaEmail(contactosValidos, {
      asunto,
      contenido,
      contenidoHtml,
      urlImagen,
    });

    res.json({
      exito: true,
      datos: {
        mensaje: 'Campaña enviada exitosamente',
        resultado,
        estadisticas: {
          totalContactos: contactos.length,
          contactosValidos: contactosValidos.length,
          contactosInvalidos: contactos.length - contactosValidos.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Error enviando campaña:', error);
    res.status(500).json({
      exito: false,
      error: 'Error enviando campaña de email',
      detalles: error.message,
    });
  }
}

/**
 * POST /api/email-marketing/validar-emails
 * Validar y obtener lista de emails válidos
 * Body: { destinatarios: 'leads' | 'clientes' | 'todos' }
 */
export async function validarEmails(req: Request, res: Response) {
  try {
    const { destinatarios } = req.body;

    if (!destinatarios || !['leads', 'clientes', 'todos'].includes(destinatarios)) {
      return res.status(400).json({
        exito: false,
        error: 'Destinatarios debe ser: leads, clientes o todos',
      });
    }

    let contactos: ContactoEmail[] = [];

    if (destinatarios === 'leads' || destinatarios === 'todos') {
      const leads = await prisma.lead.findMany({
        select: { id: true, nombre: true, apellido: true, correo: true },
      });
      contactos.push(
        ...leads.map((l: any) => ({
          id: l.id,
          nombre: l.nombre,
          apellido: l.apellido,
          correo: l.correo || '',
          tipo: 'lead' as const,
        }))
      );
    }

    if (destinatarios === 'clientes' || destinatarios === 'todos') {
      const clientes = await prisma.cliente.findMany({
        select: { id: true, nombre: true, apellido: true, correo: true },
      });
      contactos.push(
        ...clientes.map((c: any) => ({
          id: c.id,
          nombre: c.nombre,
          apellido: c.apellido,
          correo: c.correo || '',
          tipo: 'cliente' as const,
        }))
      );
    }

    const estadisticas = obtenerEstadisticasEmails(contactos);
    const contactosValidos = filtrarEmailsValidos(contactos);

    res.json({
      exito: true,
      datos: {
        totalContactos: contactos.length,
        emailsValidos: estadisticas.validos,
        emailsInvalidos: estadisticas.invalidos,
        porcentajeValido: estadisticas.porcentajeValido,
        contactosValidos: contactosValidos.map(c => ({
          id: c.id,
          nombre: c.nombre,
          correo: c.correo,
          tipo: c.tipo,
        })),
        contactosInvalidos: estadisticas.contactosInvalidos.map(c => ({
          id: c.id,
          nombre: c.nombre,
          correo: c.correo,
          tipo: c.tipo,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error validando emails:', error);
    res.status(500).json({
      exito: false,
      error: 'Error validando emails',
    });
  }
}
