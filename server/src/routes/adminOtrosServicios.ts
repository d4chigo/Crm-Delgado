import { Router } from 'express'
import { autenticar, esAdmin } from '../middlewares/autenticacion.middleware'
import { otrosServiciosController } from '../controllers/otrosServicios.controller'

const router = Router()
router.use(autenticar, esAdmin)

router.get('/', otrosServiciosController.list)
router.get('/:id', otrosServiciosController.get)
router.post('/', otrosServiciosController.create)
router.put('/:id', otrosServiciosController.update)
router.delete('/:id', otrosServiciosController.remove)

export default router
