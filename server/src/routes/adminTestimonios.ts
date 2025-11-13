import { Router } from 'express'
import { autenticar, esAdmin } from '../middlewares/autenticacion.middleware'
import { testimoniosController } from '../controllers/testimonios.controller'

const router = Router()

// Todas las rutas requieren autenticación y permisos de admin
router.use(autenticar, esAdmin)

router.get('/', testimoniosController.listAll)
router.get('/:id', testimoniosController.get)
router.post('/', testimoniosController.create)
router.patch('/:id', testimoniosController.update)
router.patch('/:id/status', testimoniosController.updateStatus)
router.delete('/:id', testimoniosController.remove)

export default router
