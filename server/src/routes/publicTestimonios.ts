import { Router } from 'express'
import { testimoniosController } from '../controllers/testimonios.controller'

const router = Router()

// Rutas públicas (sin autenticación)
router.get('/', testimoniosController.listPublic)
router.get('/:id', testimoniosController.get)
router.post('/', testimoniosController.createPublic)

export default router
