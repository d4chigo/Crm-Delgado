import { Request, Response } from 'express';
import cotizacionService from '@/services/cotizacion.service';
import { CrearCotizacionDTO, ActualizarCotizacionDTO } from '@/types/cotizacion.types';

export class CotizacionController {
  /**
   * Crear una nueva cotización
   */
  async crearCotizacion(req: Request, res: Response) {
    try {
      console.log('📥 [Cotizacion Controller] Datos recibidos:', JSON.stringify(req.body, null, 2));
      const datos: CrearCotizacionDTO = req.body;
      const cotizacion = await cotizacionService.crearCotizacion(datos);
      
      res.status(201).json(cotizacion);
    } catch (error: any) {
      console.error('❌ [Cotizacion Controller] Error al crear cotización:', error.message);
      console.error('❌ [Cotizacion Controller] Stack:', error.stack);
      res.status(400).json({ error: error.message, detalles: error.toString() });
    }
  }

  /**
   * Obtener todas las cotizaciones con filtros
   */
  async obtenerCotizaciones(req: Request, res: Response) {
    try {
      const filtros = {
        contactoId: req.query.contactoId as string,
        estado: req.query.estado as any,
        tipoCuota: req.query.tipoCuota as any,
        fechaDesde: req.query.fechaDesde as string,
        fechaHasta: req.query.fechaHasta as string,
        pagina: req.query.pagina ? parseInt(req.query.pagina as string) : undefined,
        limite: req.query.limite ? parseInt(req.query.limite as string) : undefined
      };

      const resultado = await cotizacionService.obtenerCotizaciones(filtros);
      res.json(resultado);
    } catch (error: any) {
      console.error('Error al obtener cotizaciones:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener una cotización por ID
   */
  async obtenerCotizacionPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cotizacion = await cotizacionService.obtenerCotizacionPorId(id);
      
      res.json(cotizacion);
    } catch (error: any) {
      console.error('Error al obtener cotización:', error);
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Obtener cotizaciones de un contacto específico
   */
  async obtenerCotizacionesPorContacto(req: Request, res: Response) {
    try {
      const { contactoId } = req.params;
      const cotizaciones = await cotizacionService.obtenerCotizacionesPorContacto(contactoId);
      
      res.json(cotizaciones);
    } catch (error: any) {
      console.error('Error al obtener cotizaciones del contacto:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Actualizar una cotización
   */
  async actualizarCotizacion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const datos: ActualizarCotizacionDTO = req.body;
      
      const cotizacionActualizada = await cotizacionService.actualizarCotizacion(id, datos);
      res.json(cotizacionActualizada);
    } catch (error: any) {
      console.error('Error al actualizar cotización:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Cambiar estado de una cotización
   */
  async cambiarEstado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      if (!estado) {
        return res.status(400).json({ error: 'El estado es requerido' });
      }
      
      const cotizacionActualizada = await cotizacionService.cambiarEstado(id, estado);
      res.json(cotizacionActualizada);
    } catch (error: any) {
      console.error('Error al cambiar estado de cotización:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Eliminar una cotización
   */
  async eliminarCotizacion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const resultado = await cotizacionService.eliminarCotizacion(id);
      
      res.json(resultado);
    } catch (error: any) {
      console.error('Error al eliminar cotización:', error);
      res.status(404).json({ error: error.message });
    }
  }
}

export default new CotizacionController();
