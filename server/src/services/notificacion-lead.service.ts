/**
 * Servicio para crear notificaciones cuando llega un nuevo lead
 */

import prisma from '@/config/database';

interface DatosNotificacionLead {
  leadId: string;
  nombre: string;
  apellido?: string;
  email: string;
  telefono: string;
  interes?: string;
  origen?: string;
}

/**
 * Crear notificación de nuevo lead para los admins/supervisores
 */
export const crearNotificacionNuevoLead = async (datos: DatosNotificacionLead): Promise<void> => {
  try {
    const nombreCompleto = datos.apellido ? `${datos.nombre} ${datos.apellido}` : datos.nombre;
    
    const titulo = `🔔 Nuevo Lead: ${nombreCompleto}`;
    const descripcion = `
📧 Email: ${datos.email}
📱 Teléfono: ${datos.telefono}
🎯 Interés: ${datos.interes || 'No especificado'}
📍 Origen: ${datos.origen || 'Página Web'}
⏰ Hora: ${new Date().toLocaleString('es-PE')}
    `.trim();

    // Obtener todos los admins y supervisores
    const usuarios = await prisma.usuario.findMany({
      where: {
        OR: [
          { rol: 'ADMIN' },
          { rol: 'SUPERVISOR' }
        ],
        activo: true
      }
    });

    // Crear notificación para cada admin/supervisor
    for (const usuario of usuarios) {
      await prisma.notificacion.create({
        data: {
          titulo,
          descripcion,
          tipo: 'NUEVO_LEAD',
          idUsuario: usuario.id,
          referencia: datos.leadId,
          tipoReferencia: 'LEAD',
          leida: false
        }
      });
    }

    console.log(`✅ Notificaciones creadas para ${usuarios.length} usuarios`);
  } catch (error) {
    console.error('❌ Error al crear notificación de nuevo lead:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};

/**
 * Obtener notificaciones no leídas de un usuario
 */
export const obtenerNotificacionesNoLeidas = async (usuarioId: string): Promise<any[]> => {
  try {
    return await prisma.notificacion.findMany({
      where: {
        idUsuario: usuarioId,
        leida: false
      },
      orderBy: { creadoEn: 'desc' },
      take: 50
    });
  } catch (error) {
    console.error('❌ Error al obtener notificaciones:', error);
    return [];
  }
};

/**
 * Marcar notificación como leída
 */
export const marcarNotificacionComoLeida = async (notificacionId: string): Promise<void> => {
  try {
    await prisma.notificacion.update({
      where: { id: notificacionId },
      data: {
        leida: true,
        leidaEn: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Error al marcar notificación como leída:', error);
  }
};
