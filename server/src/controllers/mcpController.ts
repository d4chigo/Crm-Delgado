/**
 * Controlador MCP
 * Expone funciones del CRM como endpoints para Gemini
 */

import { Request, Response } from 'express';
import {
  getCRMAnalysis,
  generateMarketingInsights,
  getLeadsFiltered,
  getClientesConProyectos,
  getOportunidadesActivas,
  getActividadReciente,
  buscarContacto,
  getEstadisticasPorAgente,
} from '@/services/mcpService';

/**
 * GET /api/mcp/analysis
 * Obtener análisis completo del CRM
 */
export async function getAnalysis(req: Request, res: Response) {
  try {
    const analysis = await getCRMAnalysis();
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error en getAnalysis:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener análisis del CRM',
    });
  }
}

/**
 * GET /api/mcp/marketing-insights
 * Obtener insights de marketing
 */
export async function getMarketingInsights(req: Request, res: Response) {
  try {
    const insights = await generateMarketingInsights();
    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('Error en getMarketingInsights:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar insights de marketing',
    });
  }
}

/**
 * GET /api/mcp/leads
 * Obtener leads con filtros
 * Query params: estado, prioridad, departamento, fuente, limite
 */
export async function getLeads(req: Request, res: Response) {
  try {
    const { estado, prioridad, departamento, fuente, limite } = req.query;

    const leads = await getLeadsFiltered({
      estado: estado as string,
      prioridad: prioridad as string,
      departamento: departamento as string,
      fuente: fuente as string,
      limite: limite ? parseInt(limite as string) : 10,
    });

    res.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error('Error en getLeads:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener leads',
    });
  }
}

/**
 * GET /api/mcp/clientes
 * Obtener clientes con proyectos
 * Query params: limite
 */
export async function getClientes(req: Request, res: Response) {
  try {
    const { limite } = req.query;
    const clientes = await getClientesConProyectos(
      limite ? parseInt(limite as string) : 10
    );

    res.json({
      success: true,
      data: clientes,
    });
  } catch (error) {
    console.error('Error en getClientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener clientes',
    });
  }
}

/**
 * GET /api/mcp/oportunidades
 * Obtener oportunidades activas
 * Query params: limite
 */
export async function getOportunidades(req: Request, res: Response) {
  try {
    const { limite } = req.query;
    const oportunidades = await getOportunidadesActivas(
      limite ? parseInt(limite as string) : 10
    );

    res.json({
      success: true,
      data: oportunidades,
    });
  } catch (error) {
    console.error('Error en getOportunidades:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener oportunidades',
    });
  }
}

/**
 * GET /api/mcp/actividad
 * Obtener actividad reciente
 * Query params: dias
 */
export async function getActividad(req: Request, res: Response) {
  try {
    const { dias } = req.query;
    const actividad = await getActividadReciente(
      dias ? parseInt(dias as string) : 7
    );

    res.json({
      success: true,
      data: actividad,
    });
  } catch (error) {
    console.error('Error en getActividad:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener actividad',
    });
  }
}

/**
 * GET /api/mcp/contacto/:correo
 * Buscar contacto por correo
 */
export async function getContacto(req: Request, res: Response) {
  try {
    const { correo } = req.params;
    const contacto = await buscarContacto(correo);

    if (!contacto) {
      return res.status(404).json({
        success: false,
        error: 'Contacto no encontrado',
      });
    }

    res.json({
      success: true,
      data: contacto,
    });
  } catch (error) {
    console.error('Error en getContacto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar contacto',
    });
  }
}

/**
 * GET /api/mcp/estadisticas-agentes
 * Obtener estadísticas por agente
 */
export async function getEstadisticas(req: Request, res: Response) {
  try {
    const estadisticas = await getEstadisticasPorAgente();

    res.json({
      success: true,
      data: estadisticas,
    });
  } catch (error) {
    console.error('Error en getEstadisticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
    });
  }
}
