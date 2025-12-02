import { Request, Response } from 'express';
import { z } from 'zod';
import { videoTestimonialService } from '@/services/video-testimonial.service';

const procesarVideoSchema = z.object({
  videoUrl: z.string().url('URL de video inválida'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  correo: z.string().email('Email inválido').optional(),
  nombreProyecto: z.string().optional(),
});

export const videoTestimonialController = {
  /**
   * Procesa un video desde una URL y crea un testimonio
   * POST /api/video-testimonial/procesar
   */
  async procesarVideo(req: Request, res: Response) {
    try {
      const parsed = procesarVideoSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          exito: false,
          error: 'Datos inválidos',
          detalles: parsed.error.issues,
        });
      }

      const { videoUrl, nombre, correo, nombreProyecto } = parsed.data;

      // Procesar el video
      const resultado = await videoTestimonialService.procesarVideoYCrearTestimonio(
        videoUrl,
        nombre,
        correo || 'no-especificado@ejemplo.com',
        nombreProyecto
      );

      return res.status(201).json({
        exito: true,
        mensaje: 'Video procesado y testimonio creado exitosamente',
        datos: resultado,
      });
    } catch (error: any) {
      console.error('Error procesando video:', error);

      // Mensajes de error específicos
      let mensaje = 'Error procesando el video';
      if (error.message.includes('descargar')) {
        mensaje = 'No se pudo descargar el video. Verifica que la URL sea válida y accesible.';
      } else if (error.message.includes('analizar')) {
        mensaje = 'No se pudo analizar el video. Intenta con un video más claro.';
      } else if (error.message.includes('Gemini')) {
        mensaje = 'El servicio de IA no está disponible en este momento.';
      }

      return res.status(500).json({
        exito: false,
        error: mensaje,
        detalles: error.message,
      });
    }
  },

  /**
   * Limpia archivos temporales
   * POST /api/video-testimonial/limpiar
   */
  async limpiarTemporales(req: Request, res: Response) {
    try {
      await videoTestimonialService.limpiarArchivosTemporales();
      return res.json({
        exito: true,
        mensaje: 'Archivos temporales limpiados',
      });
    } catch (error: any) {
      return res.status(500).json({
        exito: false,
        error: 'Error limpiando archivos temporales',
        detalles: error.message,
      });
    }
  },
};
