import { Router, Request, Response } from 'express';
import { autenticar } from '@/middlewares/autenticacion.middleware';
import {
  generarAlertasLeadsNoContactados,
  obtenerAlertasActivas,
  obtenerEstadisticasAlertas,
  completarAlerta,
  obtenerTodasAlertas,
} from '@/services/alerta.service';

const router = Router();

/**
 * POST /api/alertas/generar
 * Generar alertas automáticamente para leads no contactados
 * DEBE ESTAR ANTES que GET /:id para evitar conflictos con parámetros
 */
router.post('/generar', autenticar, async (req: Request, res: Response) => {
  try {
    // Verificar permisos (solo admin o supervisor)
    const rolUsuario = (req as any).usuario?.rol;
    if (!['ADMIN', 'SUPERVISOR'].includes(rolUsuario)) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tienes permiso para generar alertas',
      });
    }

    const alertasCreadas = await generarAlertasLeadsNoContactados();

    res.json({
      exito: true,
      mensaje: `${alertasCreadas.length} alertas generadas exitosamente`,
      alertas: alertasCreadas,
      total: alertasCreadas.length,
    });
  } catch (error: any) {
    console.error('Error al generar alertas:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al generar alertas',
      error: error.message,
    });
  }
});

/**
 * GET /api/alertas/todas
 * Obtener todas las alertas (solo admin)
 * DEBE ESTAR ANTES que GET /estadisticas/:usuarioId
 */
router.get('/todas', autenticar, async (req: Request, res: Response) => {
  try {
    const rolUsuario = (req as any).usuario?.rol;

    if (rolUsuario !== 'ADMIN') {
      return res.status(403).json({
        exito: false,
        mensaje: 'Solo administradores pueden ver todas las alertas',
      });
    }

    const { completada, usuarioId, contactoId } = req.query;

    const filtro = {
      ...(completada !== undefined && { completada: completada === 'true' }),
      ...(usuarioId && { usuarioId: String(usuarioId) }),
      ...(contactoId && { contactoId: String(contactoId) }),
    };

    const alertas = await obtenerTodasAlertas(filtro);

    res.json({
      exito: true,
      alertas,
      total: alertas.length,
    });
  } catch (error: any) {
    console.error('Error al obtener todas las alertas:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener alertas',
      error: error.message,
    });
  }
});

/**
 * GET /api/alertas/estadisticas/:usuarioId
 * Obtener estadísticas de alertas del usuario
 */
router.get('/estadisticas/:usuarioId', autenticar, async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;
    const usuarioAutenticado = (req as any).usuario?.id;
    const rolUsuario = (req as any).usuario?.rol;

    console.log('📊 Estadísticas:', { usuarioId, usuarioAutenticado, rolUsuario });

    // Solo puede ver las estadísticas propias o ser admin
    if (usuarioId !== usuarioAutenticado && rolUsuario !== 'ADMIN') {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tienes permiso para ver estas estadísticas',
      });
    }

    const estadisticas = await obtenerEstadisticasAlertas(usuarioId);

    res.json({
      exito: true,
      estadisticas,
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener estadísticas',
      error: error.message,
    });
  }
});

/**
 * PUT /api/alertas/:id/completar
 * Marcar alerta como completada cuando se contacte al lead
 */
router.put('/:id/completar', autenticar, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notas } = req.body;
    const usuarioId = (req as any).usuario?.id;
    const rolUsuario = (req as any).usuario?.rol;

    // Verificar que la alerta pertenece al usuario
    const prisma = require('@/config/database').default;
    const alerta = await prisma.alertaLead.findUnique({
      where: { id },
      select: { usuarioId: true, contactoId: true },
    });

    if (!alerta) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Alerta no encontrada',
      });
    }

    if (alerta.usuarioId !== usuarioId && rolUsuario !== 'ADMIN') {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tienes permiso para completar esta alerta',
      });
    }

    // Completar alerta
    const alertaCompletada = await completarAlerta(id, notas);

    // Actualizar estado del lead a CONTACTADO si no estaba
    await prisma.contacto.update({
      where: { id: alerta.contactoId },
      data: {
        estadoLead: 'CONTACTADO',
        fechaSeguimiento: new Date(),
      },
    });

    res.json({
      exito: true,
      mensaje: 'Alerta completada exitosamente',
      alerta: alertaCompletada,
    });
  } catch (error: any) {
    console.error('Error al completar alerta:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al completar alerta',
      error: error.message,
    });
  }
});

/**
 * GET /api/alertas
 * Obtener alertas activas del usuario autenticado
 */
router.get('/', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado',
      });
    }

    const alertas = await obtenerAlertasActivas(usuarioId);

    res.json({
      exito: true,
      alertas,
      total: alertas.length,
    });
  } catch (error: any) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener alertas',
      error: error.message,
    });
  }
});

export default router;
