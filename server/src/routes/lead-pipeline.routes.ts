import { Router, Request, Response } from 'express';
import { autenticar } from '@/middlewares/autenticacion.middleware';
import leadPipelineService from '@/services/lead-pipeline.service';

const router = Router();

/**
 * POST /api/leads/:id/convertir-a-oportunidad
 * Convertir un lead a oportunidad manualmente
 */
router.post('/:id/convertir-a-oportunidad', autenticar, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = (req as any).usuario?.id;
    const { titulo, proyecto, propiedad, valor, probabilidad } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado'
      });
    }

    const oportunidad = await leadPipelineService.convertirLeadAOportunidad(
      id,
      usuarioId,
      {
        titulo,
        proyecto,
        propiedad,
        valor,
        probabilidad
      }
    );

    res.json({
      exito: true,
      mensaje: 'Lead convertido a oportunidad exitosamente',
      oportunidad
    });
  } catch (error: any) {
    console.error('Error al convertir lead a oportunidad:', error);
    res.status(400).json({
      exito: false,
      mensaje: error.message || 'Error al convertir lead'
    });
  }
});

/**
 * GET /api/leads/no-convertidos
 * Obtener leads sin oportunidades activas
 */
router.get('/no-convertidos/lista', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id;
    const { limite = '10' } = req.query;

    if (!usuarioId) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado'
      });
    }

    const leadsNoConvertidos = await leadPipelineService.obtenerLeadsNoConvertidos(
      usuarioId,
      parseInt(limite as string)
    );

    res.json({
      exito: true,
      total: leadsNoConvertidos.length,
      leads: leadsNoConvertidos
    });
  } catch (error: any) {
    console.error('Error al obtener leads no convertidos:', error);
    res.status(500).json({
      exito: false,
      mensaje: error.message || 'Error al obtener leads'
    });
  }
});

/**
 * GET /api/leads/:id/oportunidades
 * Obtener todas las oportunidades de un lead
 */
router.get('/:id/oportunidades', autenticar, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const oportunidades = await leadPipelineService.obtenerOportunidadesDeLead(id);

    res.json({
      exito: true,
      total: oportunidades.length,
      oportunidades
    });
  } catch (error: any) {
    console.error('Error al obtener oportunidades del lead:', error);
    res.status(500).json({
      exito: false,
      mensaje: error.message || 'Error al obtener oportunidades'
    });
  }
});

/**
 * GET /api/leads/estadisticas/conversion
 * Obtener estadísticas de conversión lead → oportunidad
 */
router.get('/estadisticas/conversion', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado'
      });
    }

    const estadisticas = await leadPipelineService.obtenerEstadisticasConversion(usuarioId);

    res.json({
      exito: true,
      estadisticas
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas de conversión:', error);
    res.status(500).json({
      exito: false,
      mensaje: error.message || 'Error al obtener estadísticas'
    });
  }
});

/**
 * POST /api/leads/:id/completar-alerta-y-convertir
 * Completar alerta y convertir lead a oportunidad automáticamente
 */
router.post('/:id/completar-alerta-y-convertir', autenticar, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = (req as any).usuario?.id;
    const { alertaId, notas } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado'
      });
    }

    if (!alertaId) {
      return res.status(400).json({
        exito: false,
        mensaje: 'alertaId es requerido'
      });
    }

    await leadPipelineService.completarAlertaYConverrir(
      alertaId,
      id,
      usuarioId,
      notas
    );

    res.json({
      exito: true,
      mensaje: 'Alerta completada y lead convertido a oportunidad'
    });
  } catch (error: any) {
    console.error('Error en flujo de alerta a oportunidad:', error);
    res.status(400).json({
      exito: false,
      mensaje: error.message || 'Error en el proceso de conversión'
    });
  }
});

export default router;
