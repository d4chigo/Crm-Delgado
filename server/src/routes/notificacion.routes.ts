import { Router } from 'express';
import notificacionController from '@/controllers/notificacion.controller';
import { autenticar } from '@/middlewares/autenticacion.middleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(autenticar);

// GET /api/notificaciones - Obtener todas las notificaciones
router.get('/', notificacionController.obtenerNotificaciones.bind(notificacionController));

// GET /api/notificaciones/no-leidas - Obtener notificaciones no leídas
router.get('/no-leidas', notificacionController.obtenerNoLeidas.bind(notificacionController));

// GET /api/notificaciones/contar-no-leidas - Contar notificaciones no leídas
router.get('/contar-no-leidas', notificacionController.contarNoLeidas.bind(notificacionController));

// PATCH /api/notificaciones/:id/leer - Marcar como leída
router.patch('/:id/leer', notificacionController.marcarComoLeida.bind(notificacionController));

// PATCH /api/notificaciones/leer-todas - Marcar todas como leídas
router.patch('/leer-todas', notificacionController.marcarTodasComoLeidas.bind(notificacionController));

// DELETE /api/notificaciones/:id - Eliminar notificación
router.delete('/:id', notificacionController.eliminarNotificacion.bind(notificacionController));

// DELETE /api/notificaciones/limpiar-leidas - Eliminar todas las leídas
router.delete('/limpiar-leidas', notificacionController.eliminarLeidas.bind(notificacionController));

export default router;
