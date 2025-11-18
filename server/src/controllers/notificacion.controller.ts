import { Request, Response } from 'express';
import notificacionService from '@/services/notificacion.service';
import { respuestaExito, respuestaError } from '@/utils/respuesta.util';

export class NotificacionController {
  /**
   * GET /api/notificaciones
   */
  async obtenerNotificaciones(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const soloNoLeidas = req.query.noLeidas === 'true';
      const notificaciones = await notificacionService.obtenerNotificaciones(usuarioId, soloNoLeidas);
      respuestaExito(res, notificaciones);
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al obtener notificaciones', 500);
    }
  }

  /**
   * GET /api/notificaciones/no-leidas
   */
  async obtenerNoLeidas(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const notificaciones = await notificacionService.obtenerNoLeidas(usuarioId);
      const count = notificaciones.length;
      respuestaExito(res, { notificaciones, count });
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al obtener notificaciones no leídas', 500);
    }
  }

  /**
   * GET /api/notificaciones/contar-no-leidas
   */
  async contarNoLeidas(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const count = await notificacionService.contarNoLeidas(usuarioId);
      respuestaExito(res, { count });
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al contar notificaciones', 500);
    }
  }

  /**
   * PATCH /api/notificaciones/:id/leer
   */
  async marcarComoLeida(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const notificacion = await notificacionService.marcarComoLeida(id);
      respuestaExito(res, notificacion, 'Notificación marcada como leída');
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al marcar notificación como leída', 500);
    }
  }

  /**
   * PATCH /api/notificaciones/leer-todas
   */
  async marcarTodasComoLeidas(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const resultado = await notificacionService.marcarTodasComoLeidas(usuarioId);
      respuestaExito(res, resultado, 'Todas las notificaciones marcadas como leídas');
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al marcar notificaciones como leídas', 500);
    }
  }

  /**
   * DELETE /api/notificaciones/:id
   */
  async eliminarNotificacion(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const resultado = await notificacionService.eliminarNotificacion(id);
      respuestaExito(res, resultado, 'Notificación eliminada');
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al eliminar notificación', 500);
    }
  }

  /**
   * DELETE /api/notificaciones/limpiar-leidas
   */
  async eliminarLeidas(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const resultado = await notificacionService.eliminarLeidas(usuarioId);
      respuestaExito(res, resultado, 'Notificaciones leídas eliminadas');
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al eliminar notificaciones leídas', 500);
    }
  }
}

export default new NotificacionController();
