import { Router } from 'express';
import { videoTestimonialController } from '@/controllers/video-testimonial.controller';
import { autenticar } from '@/middlewares/autenticacion.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(autenticar);

/**
 * POST /api/video-testimonial/procesar
 * Procesa un video desde una URL y crea un testimonio automáticamente
 * 
 * Body:
 * {
 *   "videoUrl": "https://ejemplo.com/video.mp4",
 *   "nombre": "Juan Pérez",
 *   "correo": "juan@ejemplo.com",
 *   "nombreProyecto": "Proyecto Residencial XYZ" (opcional)
 * }
 */
router.post('/procesar', videoTestimonialController.procesarVideo);

/**
 * POST /api/video-testimonial/limpiar
 * Limpia archivos temporales de videos descargados
 */
router.post('/limpiar', videoTestimonialController.limpiarTemporales);

export default router;
