import { Router } from 'express';
import {
  obtenerPaginasServicios,
  obtenerPaginaPorTipo,
  crearActualizarPagina,
  eliminarPagina,
  obtenerProyectosPorTipo,
} from '../controllers/webContentController';

const router = Router();

/**
 * @route   GET /api/web/servicios
 * @desc    Obtener todas las páginas de servicios
 * @access  Public (para la web)
 */
router.get('/servicios', obtenerPaginasServicios);

/**
 * @route   GET /api/web/servicios/:tipo
 * @desc    Obtener página de servicio por tipo
 * @access  Public
 */
router.get('/servicios/:tipo', obtenerPaginaPorTipo);

/**
 * @route   POST /api/web/servicios
 * @desc    Crear o actualizar página de servicio
 * @access  Private (requiere autenticación - agregar middleware)
 */
router.post('/servicios', crearActualizarPagina);

/**
 * @route   DELETE /api/web/servicios/:tipo
 * @desc    Eliminar página de servicio
 * @access  Private
 */
router.delete('/servicios/:tipo', eliminarPagina);

/**
 * @route   GET /api/web/proyectos-por-tipo/:tipo
 * @desc    Obtener proyectos filtrados por tipo de servicio
 * @access  Public
 */
router.get('/proyectos-por-tipo/:tipo', obtenerProyectosPorTipo);

export default router;
