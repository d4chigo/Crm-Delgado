import { Request, Response } from 'express';
import oportunidadService from '@/services/oportunidad.service';
import { respuestaExito, respuestaError } from '@/utils/respuesta.util';
import { CrearOportunidadDTO, ActualizarOportunidadDTO, FiltrosOportunidad } from '@/services/oportunidad.service';

export class OportunidadController {
  /**
   * POST /api/oportunidades
   */
  async crearOportunidad(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const datos: CrearOportunidadDTO = req.body;

      if (!datos.clienteId || !datos.titulo) {
        respuestaError(res, 'ClienteId y título son requeridos', 400);
        return;
      }

      const oportunidad = await oportunidadService.crearOportunidad(usuarioId, datos);
      respuestaExito(res, oportunidad, 'Oportunidad creada exitosamente', 201);
    } catch (error: any) {
      if (error.message.includes('no encontrado') || error.message.includes('no es un')) {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al crear oportunidad', 500);
    }
  }

  /**
   * GET /api/oportunidades
   */
  async obtenerOportunidades(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const filtros: FiltrosOportunidad = {
        clienteId: req.query.clienteId as string,
        etapa: req.query.etapa as string,
        busqueda: req.query.busqueda as string,
        pagina: req.query.pagina ? Number(req.query.pagina) : undefined,
        limite: req.query.limite ? Number(req.query.limite) : undefined
      };

      const resultado = await oportunidadService.obtenerOportunidades(usuarioId, filtros);
      respuestaExito(res, resultado);
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al obtener oportunidades', 500);
    }
  }

  /**
   * GET /api/oportunidades/estadisticas
   */
  async obtenerEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const estadisticas = await oportunidadService.obtenerEstadisticas(usuarioId);
      respuestaExito(res, estadisticas);
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al obtener estadísticas', 500);
    }
  }

  /**
   * GET /api/oportunidades/:id
   */
  async obtenerOportunidadPorId(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const oportunidad = await oportunidadService.obtenerOportunidadPorId(id, usuarioId);
      respuestaExito(res, oportunidad);
    } catch (error: any) {
      if (error.message.includes('no encontrada')) {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al obtener oportunidad', 500);
    }
  }

  /**
   * PUT /api/oportunidades/:id
   */
  async actualizarOportunidad(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const datos: ActualizarOportunidadDTO = req.body;
      const oportunidad = await oportunidadService.actualizarOportunidad(id, usuarioId, datos);
      respuestaExito(res, oportunidad, 'Oportunidad actualizada exitosamente');
    } catch (error: any) {
      if (error.message.includes('no encontrada')) {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al actualizar oportunidad', 500);
    }
  }

  /**
   * PATCH /api/oportunidades/:id/etapa
   */
  async cambiarEtapa(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;
      const { etapa, notas } = req.body;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      if (!etapa) {
        respuestaError(res, 'La etapa es requerida', 400);
        return;
      }

      const oportunidad = await oportunidadService.cambiarEtapa(id, usuarioId, etapa, notas);
      respuestaExito(res, oportunidad, 'Etapa actualizada exitosamente');
    } catch (error: any) {
      if (error.message.includes('no encontrada')) {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al cambiar etapa', 500);
    }
  }

  /**
   * DELETE /api/oportunidades/:id
   */
  async eliminarOportunidad(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;

      console.log('🗑️ DELETE /oportunidades/:id', { id, usuarioId });

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      await oportunidadService.eliminarOportunidad(id, usuarioId);
      console.log('✅ Oportunidad eliminada:', id);
      respuestaExito(res, null, 'Oportunidad eliminada exitosamente');
    } catch (error: any) {
      console.error('❌ Error al eliminar oportunidad:', error.message);
      if (error.message.includes('no encontrada')) {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al eliminar oportunidad', 500);
    }
  }

  /**
   * GET /api/oportunidades/cliente/:clienteId
   */
  async obtenerOportunidadesDeCliente(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { clienteId } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const oportunidades = await oportunidadService.obtenerOportunidadesDeCliente(clienteId, usuarioId);
      respuestaExito(res, oportunidades);
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al obtener oportunidades del cliente', 500);
    }
  }

  /**
   * PATCH /api/oportunidades/por-lead/:leadId
   * Actualizar oportunidad por leadId (sincronización con estado del lead)
   */
  async actualizarOportunidadPorLead(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { leadId } = req.params;
      const { etapa } = req.body;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      if (!leadId) {
        respuestaError(res, 'ID del lead requerido', 400);
        return;
      }

      if (!etapa) {
        respuestaError(res, 'Etapa es requerida', 400);
        return;
      }

      const oportunidad = await oportunidadService.actualizarOportunidadPorLead(leadId, etapa, usuarioId);
      if (!oportunidad) {
        respuestaError(res, 'Oportunidad no encontrada para este lead', 404);
        return;
      }

      respuestaExito(res, oportunidad, 'Oportunidad actualizada correctamente');
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al actualizar oportunidad', 500);
    }
  }
}

export default new OportunidadController();
