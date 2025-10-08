import { Request, Response } from 'express';
import etiquetaService from '@/services/etiqueta.service';
import { respuestaExito, respuestaError } from '@/utils/respuesta.util';

export class EtiquetaController {
  /**
   * GET /api/etiquetas
   */
  async obtenerEtiquetas(req: Request, res: Response): Promise<void> {
    try {
      const etiquetas = await etiquetaService.obtenerEtiquetas();
      respuestaExito(res, etiquetas);
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al obtener etiquetas', 500);
    }
  }

  /**
   * GET /api/etiquetas/contacto/:id
   */
  async obtenerEtiquetasDeContacto(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const etiquetas = await etiquetaService.obtenerEtiquetasDeContacto(id);
      respuestaExito(res, etiquetas);
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al obtener etiquetas del contacto', 500);
    }
  }

  /**
   * PUT /api/etiquetas/contacto/:id
   * Body: { etiquetaIds: string[] }
   */
  async asignarEtiquetas(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;
      const { etiquetaIds } = req.body;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      if (!Array.isArray(etiquetaIds)) {
        respuestaError(res, 'etiquetaIds debe ser un array', 400);
        return;
      }

      const etiquetas = await etiquetaService.asignarEtiquetas(id, etiquetaIds, usuarioId);
      respuestaExito(res, etiquetas, 'Etiquetas asignadas exitosamente');
    } catch (error: any) {
      if (error.message === 'Contacto no encontrado') {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al asignar etiquetas', 500);
    }
  }

  /**
   * POST /api/etiquetas/contacto/:contactoId/etiqueta/:etiquetaId
   */
  async agregarEtiqueta(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { contactoId, etiquetaId } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const etiquetas = await etiquetaService.agregarEtiqueta(contactoId, etiquetaId, usuarioId);
      respuestaExito(res, etiquetas, 'Etiqueta agregada exitosamente');
    } catch (error: any) {
      if (error.message === 'Contacto no encontrado') {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al agregar etiqueta', 500);
    }
  }

  /**
   * DELETE /api/etiquetas/contacto/:contactoId/etiqueta/:etiquetaId
   */
  async removerEtiqueta(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { contactoId, etiquetaId } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const etiquetas = await etiquetaService.removerEtiqueta(contactoId, etiquetaId, usuarioId);
      respuestaExito(res, etiquetas, 'Etiqueta removida exitosamente');
    } catch (error: any) {
      if (error.message === 'Contacto no encontrado') {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al remover etiqueta', 500);
    }
  }

  /**
   * POST /api/etiquetas
   * Body: { nombre, color, descripcion?, icono? }
   */
  async crearEtiqueta(req: Request, res: Response): Promise<void> {
    try {
      const datos = req.body;
      const etiqueta = await etiquetaService.crearEtiqueta(datos);
      respuestaExito(res, etiqueta, 'Etiqueta creada exitosamente', 201);
    } catch (error: any) {
      if (error.message.includes('Ya existe')) {
        respuestaError(res, error.message, 409);
        return;
      }
      respuestaError(res, error.message || 'Error al crear etiqueta', 500);
    }
  }

  /**
   * GET /api/etiquetas/:id/contactos
   */
  async obtenerContactosPorEtiqueta(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const contactos = await etiquetaService.obtenerContactosPorEtiqueta(id, usuarioId);
      respuestaExito(res, contactos);
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al obtener contactos', 500);
    }
  }
}

export default new EtiquetaController();
