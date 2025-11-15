import prisma from '@/config/database';

export interface CrearNotificacionDTO {
  usuarioId: string;
  tipo: string; // 'NUEVO_LEAD', 'OPORTUNIDAD_GANADA', 'SEGUIMIENTO_VENCIDO', 'CAMBIO_ETAPA'
  titulo: string;
  mensaje: string;
  referencia?: string; // ID del contacto/oportunidad
}

export class NotificacionService {
  /**
   * Crear una nueva notificación
   */
  async crearNotificacion(datos: CrearNotificacionDTO) {
    const notificacion = await prisma.notificacion.create({
      data: {
        usuarioId: datos.usuarioId,
        tipo: datos.tipo,
        titulo: datos.titulo,
        mensaje: datos.mensaje,
        referencia: datos.referencia,
      },
    });

    return notificacion;
  }

  /**
   * Obtener todas las notificaciones de un usuario
   */
  async obtenerNotificaciones(usuarioId: string, soloNoLeidas: boolean = false) {
    const notificaciones = await prisma.notificacion.findMany({
      where: {
        usuarioId,
        ...(soloNoLeidas && { leida: false }),
      },
      orderBy: {
        creadoEn: 'desc',
      },
      take: 50, // Últimas 50
    });

    return notificaciones;
  }

  /**
   * Obtener notificaciones no leídas de un usuario
   */
  async obtenerNoLeidas(usuarioId: string) {
    const notificaciones = await prisma.notificacion.findMany({
      where: {
        usuarioId,
        leida: false,
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });

    return notificaciones;
  }

  /**
   * Contar notificaciones no leídas
   */
  async contarNoLeidas(usuarioId: string): Promise<number> {
    const count = await prisma.notificacion.count({
      where: {
        usuarioId,
        leida: false,
      },
    });

    return count;
  }

  /**
   * Marcar notificación como leída
   */
  async marcarComoLeida(notificacionId: string) {
    const notificacion = await prisma.notificacion.update({
      where: { id: notificacionId },
      data: { leida: true },
    });

    return notificacion;
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas(usuarioId: string) {
    const resultado = await prisma.notificacion.updateMany({
      where: {
        usuarioId,
        leida: false,
      },
      data: { leida: true },
    });

    return resultado;
  }

  /**
   * Eliminar una notificación
   */
  async eliminarNotificacion(notificacionId: string) {
    await prisma.notificacion.delete({
      where: { id: notificacionId },
    });

    return { exito: true };
  }

  /**
   * Eliminar todas las notificaciones leídas de un usuario
   */
  async eliminarLeidas(usuarioId: string) {
    const resultado = await prisma.notificacion.deleteMany({
      where: {
        usuarioId,
        leida: true,
      },
    });

    return resultado;
  }
}

export default new NotificacionService();
