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

/**
 * GET /api/leads/:id/historial
 * Obtener historial de cambios de etapa para un lead
 */
router.get('/:id/historial', autenticar, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const historial = await leadPipelineService.obtenerHistorialCambios(id);

    res.json({
      exito: true,
      total: historial.length,
      historial
    });
  } catch (error: any) {
    console.error('Error al obtener historial del lead:', error);
    res.status(500).json({
      exito: false,
      mensaje: error.message || 'Error al obtener historial'
    });
  }
});

/**
 * GET /api/leads/oportunidades/:oportunidadId/historial
 * Obtener historial de cambios para una oportunidad específica
 */
router.get('/oportunidades/:oportunidadId/historial', autenticar, async (req: Request, res: Response) => {
  try {
    const { oportunidadId } = req.params;

    const historial = await leadPipelineService.obtenerHistorialPorOportunidad(oportunidadId);

    res.json({
      exito: true,
      total: historial.length,
      historial
    });
  } catch (error: any) {
    console.error('Error al obtener historial de oportunidad:', error);
    res.status(500).json({
      exito: false,
      mensaje: error.message || 'Error al obtener historial'
    });
  }
});

/**
 * GET /api/leads/filtros/avanzados
 * Obtener oportunidades con filtros avanzados
 * Query params:
 * - etapas: string[] (ej: CONTACTO_INICIAL,AGENDAMIENTO)
 * - estados: string[] (ej: NUEVO,CONTACTADO)
 * - etiquetas: string[] (ej: VIP,URGENTE)
 * - fechaInicio: ISO date string
 * - fechaFin: ISO date string
 * - mes: number (1-12)
 * - anio: number
 * - proyecto: string
 * - busqueda: string
 * - probabilidadMin: number
 * - probabilidadMax: number
 * - valorMin: number
 * - valorMax: number
 * - pagina: number (default: 1)
 * - limite: number (default: 20)
 */
router.get('/filtros/avanzados', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado'
      });
    }

    // Parsear parámetros de query
    const {
      etapas,
      estados,
      etiquetas,
      fechaInicio,
      fechaFin,
      mes,
      anio,
      proyecto,
      busqueda,
      probabilidadMin,
      probabilidadMax,
      valorMin,
      valorMax,
      pagina = '1',
      limite = '20'
    } = req.query;

    // Convertir strings a arrays
    const etapasArray = etapas ? (typeof etapas === 'string' ? etapas.split(',') : Array.isArray(etapas) ? (etapas as string[]) : undefined) : undefined;
    const estadosArray = estados ? (typeof estados === 'string' ? estados.split(',') : Array.isArray(estados) ? (estados as string[]) : undefined) : undefined;
    const etiquetasArray = etiquetas ? (typeof etiquetas === 'string' ? etiquetas.split(',') : Array.isArray(etiquetas) ? (etiquetas as string[]) : undefined) : undefined;

    const resultado = await leadPipelineService.obtenerOportunidadesConFiltros(
      usuarioId,
      {
        etapas: etapasArray as string[] | undefined,
        estados: estadosArray as string[] | undefined,
        etiquetas: etiquetasArray as string[] | undefined,
        fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
        mes: mes ? parseInt(mes as string) : undefined,
        anio: anio ? parseInt(anio as string) : undefined,
        proyecto: proyecto as string,
        busqueda: busqueda as string,
        probabilidadMin: probabilidadMin ? parseInt(probabilidadMin as string) : undefined,
        probabilidadMax: probabilidadMax ? parseInt(probabilidadMax as string) : undefined,
        valorMin: valorMin ? parseFloat(valorMin as string) : undefined,
        valorMax: valorMax ? parseFloat(valorMax as string) : undefined,
        pagina: parseInt(pagina as string),
        limite: parseInt(limite as string)
      }
    );

    res.json({
      exito: true,
      ...resultado
    });
  } catch (error: any) {
    console.error('Error al obtener oportunidades con filtros:', error);
    res.status(500).json({
      exito: false,
      mensaje: error.message || 'Error al obtener oportunidades'
    });
  }
});

/**
 * GET /api/leads/estadisticas/filtros
 * Obtener estadísticas de oportunidades por filtros
 */
router.get('/estadisticas/filtros', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado'
      });
    }

    const { etapas, fechaInicio, fechaFin, mes, anio } = req.query;

    // Convertir strings a arrays
    const etapasArray = etapas ? (typeof etapas === 'string' ? etapas.split(',') : Array.isArray(etapas) ? (etapas as string[]) : undefined) : undefined;

    const estadisticas = await leadPipelineService.obtenerEstadisticasPorFiltros(
      usuarioId,
      {
        etapas: etapasArray as string[] | undefined,
        fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
        mes: mes ? parseInt(mes as string) : undefined,
        anio: anio ? parseInt(anio as string) : undefined
      }
    );

    res.json({
      exito: true,
      estadisticas
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas de filtros:', error);
    res.status(500).json({
      exito: false,
      mensaje: error.message || 'Error al obtener estadísticas'
    });
  }
});

export default router;
