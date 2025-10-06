/**
 * Rutas para consulta de DNI
 */

import { Router } from 'express'
import { dniController } from '../controllers/dni.controller'
import { autenticar } from '../middlewares/autenticacion.middleware'

const router = Router()

/**
 * @route   GET /api/dni/:numero
 * @desc    Consultar DNI en RENIEC
 * @access  Privado (requiere autenticación)
 */
router.get('/:numero', autenticar, (req, res) => dniController.consultarDNI(req, res))

export default router
