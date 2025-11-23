import { Request, Response } from 'express';
import contactoService from '@/services/contacto.service';
import { respuestaExito, respuestaError } from '@/utils/respuesta.util';
import { CrearContactoDTO, ActualizarContactoDTO, FiltrosContacto } from '@/types';

export class ContactoController {
  /**
   * GET /api/contactos
   */
  async obtenerContactos(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      
      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const filtros: FiltrosContacto = {
        tipo: req.query.tipo as any,
        ciudad: req.query.ciudad as string,
        busqueda: req.query.busqueda as string,
        estado: req.query.estado as any,
        pagina: req.query.pagina ? Number(req.query.pagina) : undefined,
        limite: req.query.limite ? Number(req.query.limite) : undefined
      };

      const resultado = await contactoService.obtenerContactos(usuarioId, filtros);
      respuestaExito(res, resultado);
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al obtener contactos', 500);
    }
  }

  /**
   * GET /api/contactos/estadisticas
   */
  async obtenerEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      
      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const estadisticas = await contactoService.obtenerEstadisticas(usuarioId);
      respuestaExito(res, estadisticas);
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al obtener estadísticas', 500);
    }
  }

  /**
   * GET /api/contactos/recientes
   */
  async obtenerContactosRecientes(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      
      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const limite = req.query.limite ? Number(req.query.limite) : 10;
      const tipo = req.query.tipo as string;
      const contactos = await contactoService.obtenerContactosRecientes(usuarioId, limite, tipo);
      respuestaExito(res, { contactos });
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al obtener contactos recientes', 500);
    }
  }

  /**
   * GET /api/contactos/:id
   */
  async obtenerContactoPorId(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const contacto = await contactoService.obtenerContactoPorId(id, usuarioId);
      respuestaExito(res, contacto);
    } catch (error: any) {
      if (error.message === 'Contacto no encontrado') {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al obtener contacto', 500);
    }
  }

  /**
   * POST /api/contactos
   */
  async crearContacto(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const datos: CrearContactoDTO = req.body;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const contacto = await contactoService.crearContacto(datos, usuarioId);
      respuestaExito(res, contacto, 'Contacto creado exitosamente', 201);
    } catch (error: any) {
      if (error.message.includes('Ya existe')) {
        respuestaError(res, error.message, 409);
        return;
      }
      respuestaError(res, error.message || 'Error al crear contacto', 500);
    }
  }

  /**
   * PUT /api/contactos/:id
   */
  async actualizarContacto(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;
      const datos: ActualizarContactoDTO = req.body;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const contacto = await contactoService.actualizarContacto(id, datos, usuarioId);
      respuestaExito(res, contacto, 'Contacto actualizado exitosamente');
    } catch (error: any) {
      if (error.message === 'Contacto no encontrado') {
        respuestaError(res, error.message, 404);
        return;
      }
      if (error.message.includes('Ya existe')) {
        respuestaError(res, error.message, 409);
        return;
      }
      respuestaError(res, error.message || 'Error al actualizar contacto', 500);
    }
  }

  /**
   * DELETE /api/contactos/:id
   */
  async eliminarContacto(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;

      console.log(`🗑️ DELETE /contactos/:id - ID: ${id}, Usuario: ${usuarioId}`);

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const resultado = await contactoService.eliminarContacto(id, usuarioId);
      console.log(`✅ Contacto eliminado: ${id}`);
      respuestaExito(res, resultado);
    } catch (error: any) {
      console.error(`❌ Error al eliminar contacto: ${error.message}`);
      if (error.message === 'Contacto no encontrado') {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al eliminar contacto', 500);
    }
  }

  /**
   * POST /api/contactos/:id/convertir-lead
   */
  async convertirALead(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const contacto = await contactoService.convertirALead(id, usuarioId);
      respuestaExito(res, contacto, 'Contacto convertido a lead exitosamente');
    } catch (error: any) {
      if (error.message === 'Contacto no encontrado') {
        respuestaError(res, error.message, 404);
        return;
      }
      if (error.message.includes('ya es')) {
        respuestaError(res, error.message, 400);
        return;
      }
      respuestaError(res, error.message || 'Error al convertir contacto', 500);
    }
  }

  /**
   * POST /api/contactos/convertir-leads/masivo
   */
  async convertirVariosALeads(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { ids } = req.body;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      if (!Array.isArray(ids) || ids.length === 0) {
        respuestaError(res, 'Debe proporcionar un array de IDs', 400);
        return;
      }

      const resultado = await contactoService.convertirVariosALeads(ids, usuarioId);
      respuestaExito(res, resultado, `${resultado.convertidos} contacto(s) convertido(s) a leads exitosamente`);
    } catch (error: any) {
      respuestaError(res, error.message || 'Error al convertir contactos', 500);
    }
  }

  /**
   * POST /api/contactos/:id/convertir-cliente
   */
  async convertirLeadACliente(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const contacto = await contactoService.convertirLeadACliente(id, usuarioId);
      respuestaExito(res, contacto, 'Lead convertido a cliente exitosamente');
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al convertir lead', 500);
    }
  }

  /**
   * POST /api/contactos/:id/clientes
   */
  async asociarCliente(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id: leadId } = req.params;
      const { clienteId, notas, estado } = req.body;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      if (!clienteId) {
        respuestaError(res, 'El ID del cliente es requerido', 400);
        return;
      }

      const asociacion = await contactoService.asociarCliente(
        leadId,
        clienteId,
        usuarioId,
        { notas, estado }
      );

      respuestaExito(res, asociacion, 'Cliente asociado exitosamente');
    } catch (error: any) {
      if (error.message.includes('no encontrado') || error.message.includes('no es un')) {
        respuestaError(res, error.message, 404);
        return;
      }
      if (error.message.includes('ya está asociado')) {
        respuestaError(res, error.message, 409);
        return;
      }
      respuestaError(res, error.message || 'Error al asociar cliente', 500);
    }
  }

  /**
   * GET /api/contactos/:id/clientes
   */
  async obtenerClientesDeLeads(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id: leadId } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const clientes = await contactoService.obtenerClientesDeLeads(leadId, usuarioId);
      respuestaExito(res, clientes);
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al obtener clientes', 500);
    }
  }

  /**
   * PUT /api/contactos/:id/clientes/:clienteId
   */
  async actualizarAsociacion(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id: leadId, clienteId } = req.params;
      const { notas, estado } = req.body;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      const asociacion = await contactoService.actualizarAsociacion(
        leadId,
        clienteId,
        usuarioId,
        { notas, estado }
      );

      respuestaExito(res, asociacion, 'Asociación actualizada exitosamente');
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al actualizar asociación', 500);
    }
  }

  /**
   * DELETE /api/contactos/:id/clientes/:clienteId
   */
  async desasociarCliente(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id: leadId, clienteId } = req.params;

      if (!usuarioId) {
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      await contactoService.desasociarCliente(leadId, clienteId, usuarioId);
      respuestaExito(res, null, 'Cliente desasociado exitosamente');
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al desasociar cliente', 500);
    }
  }

  /**
   * POST /api/contactos/importar/google
   */
  async importarDesdeGoogle(req: Request, res: Response): Promise<void> {
    try {
      console.log('[Contacto Controller] Importar desde Google iniciado');
      console.log('[Contacto Controller] req.usuario completo:', JSON.stringify(req.usuario, null, 2));
      const usuarioId = req.usuario?.usuarioId;
      const { accessToken } = req.body;

      console.log('[Contacto Controller] Usuario ID extraído:', usuarioId);
      console.log('[Contacto Controller] Access token recibido:', accessToken ? `Sí (${accessToken.length} chars)` : 'No');

      if (!usuarioId) {
        console.error('[Contacto Controller] Usuario no autenticado');
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      if (!accessToken) {
        console.error('[Contacto Controller] Access token no proporcionado');
        respuestaError(res, 'Token de acceso de Google requerido', 400);
        return;
      }

      console.log('[Contacto Controller] Llamando a contactoService.importarDesdeGoogle...');
      const resultado = await contactoService.importarDesdeGoogle(usuarioId, accessToken);
      console.log('[Contacto Controller] Importación completada:', resultado);
      respuestaExito(res, resultado, 'Importación completada');
    } catch (error: any) {
      console.error('[Contacto Controller] Error en importación:', error.message);
      console.error('[Contacto Controller] Stack:', error.stack);
      respuestaError(res, error.message || 'Error al importar contactos desde Google', 500);
    }
  }

  /**
   * POST /api/contactos/:id/agregar-pipeline
   * Agregar un lead al pipeline creando una oportunidad
   */
  async agregarAlPipeline(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.usuarioId;
      const { id: leadId } = req.params;
      const datosOportunidad = req.body;

      console.log('[ContactoController] agregarAlPipeline called:', { usuarioId, leadId, datosOportunidad });

      if (!usuarioId) {
        console.log('[ContactoController] usuarioId no encontrado');
        respuestaError(res, 'Usuario no autenticado', 401);
        return;
      }

      if (!leadId) {
        console.log('[ContactoController] leadId no encontrado');
        respuestaError(res, 'ID del lead requerido', 400);
        return;
      }

      // Crear la oportunidad
      console.log('[ContactoController] llamando a contactoService.agregarAlPipeline');
      const oportunidad = await contactoService.agregarAlPipeline(leadId, usuarioId, datosOportunidad);
      console.log('[ContactoController] oportunidad creada exitosamente');
      respuestaExito(res, oportunidad, 'Lead agregado al pipeline correctamente');
    } catch (error: any) {
      console.error('[ContactoController] Error en agregarAlPipeline:', error.message);
      console.error('[ContactoController] Stack:', error.stack);
      if (error.message.includes('no encontrado')) {
        respuestaError(res, error.message, 404);
        return;
      }
      respuestaError(res, error.message || 'Error al agregar al pipeline', 500);
    }
  }
}

export default new ContactoController();
