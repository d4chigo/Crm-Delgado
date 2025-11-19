import { Router, Request, Response } from 'express';
import { autenticar } from '@/middlewares/autenticacion.middleware';
import { obtenerNotificacionesNoLeidas, marcarNotificacionComoLeida } from '@/services/notificacion-lead.service';
import prisma from '@/config/database';

const router = Router();

/**
 * GET /api/notificaciones
 * Obtener notificaciones no leídas del usuario autenticado
 */
router.get('/', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuarioId;
    
    if (!usuarioId) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado'
      });
    }

    const notificaciones = await obtenerNotificacionesNoLeidas(usuarioId);

    res.json({
      exito: true,
      notificaciones,
      total: notificaciones.length
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener notificaciones'
    });
  }
});

/**
 * PUT /api/notificaciones/:id/leer
 * Marcar notificación como leída
 */
router.put('/:id/leer', autenticar, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = (req as any).usuarioId;

    // Verificar que la notificación pertenece al usuario
    const notificacion = await prisma.notificacion.findUnique({
      where: { id }
    });

    if (!notificacion || notificacion.usuarioId !== usuarioId) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tienes permiso para acceder a esta notificación'
      });
    }

    await marcarNotificacionComoLeida(id);

    res.json({
      exito: true,
      mensaje: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al marcar notificación como leída'
    });
  }
});

/**
 * GET /api/notificaciones/contar
 * Contar notificaciones no leídas
 */
router.get('/contar', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuarioId;

    const total = await prisma.notificacion.count({
      where: {
        usuarioId,
        leida: false
      }
    });

    res.json({
      exito: true,
      total
    });
  } catch (error) {
    console.error('Error al contar notificaciones:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al contar notificaciones'
    });
  }
});

export default router;
