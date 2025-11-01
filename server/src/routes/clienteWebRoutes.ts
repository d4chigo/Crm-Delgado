import { Router } from 'express';
import {
  crearAccesoWeb,
  resetearPasswordCliente,
  verificarAccesoWeb,
  eliminarAccesoWeb,
} from '../controllers/clienteWebController';
import { autenticar } from '../middlewares/autenticacion.middleware';

const router = Router();

// Todas las rutas requieren autenticación del CRM
router.use(autenticar);

/**
 * @route   POST /api/clientes/:id/crear-acceso-web
 * @desc    Crear acceso web para un cliente desde el CRM
 * @access  Private (Agentes, Admin)
 */
router.post('/:id/crear-acceso-web', crearAccesoWeb);

/**
 * @route   POST /api/clientes/:id/resetear-password
 * @desc    Resetear contraseña de acceso web
 * @access  Private (Agentes, Admin)
 */
router.post('/:id/resetear-password', resetearPasswordCliente);

/**
 * @route   GET /api/clientes/:id/acceso-web
 * @desc    Verificar si un cliente tiene acceso web
 * @access  Private (Agentes, Admin)
 */
router.get('/:id/acceso-web', verificarAccesoWeb);

/**
 * @route   DELETE /api/clientes/:id/acceso-web
 * @desc    Eliminar acceso web de un cliente
 * @access  Private (Agentes, Admin)
 */
router.delete('/:id/acceso-web', eliminarAccesoWeb);

export default router;
