import { Router } from 'express';
import cotizacionController from '@/controllers/cotizacion.controller';
import { autenticar } from '@/middlewares/autenticacion.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(autenticar);

// Crear cotización
router.post('/', cotizacionController.crearCotizacion);

// Obtener cotizaciones de un contacto específico - DEBE SER ANTES de /:id
router.get('/contacto/:contactoId', cotizacionController.obtenerCotizacionesPorContacto);

// Obtener todas las cotizaciones (con filtros)
router.get('/', cotizacionController.obtenerCotizaciones);

// Obtener cotización por ID
router.get('/:id', cotizacionController.obtenerCotizacionPorId);

// Actualizar cotización
router.put('/:id', cotizacionController.actualizarCotizacion);

// Cambiar estado de cotización
router.patch('/:id/estado', cotizacionController.cambiarEstado);

// Descargar cotización en PDF - DEBE SER ANTES de DELETE
router.get('/:id/descargar-pdf', cotizacionController.descargarPDF);

// Eliminar cotización
router.delete('/:id', cotizacionController.eliminarCotizacion);

export default router;
