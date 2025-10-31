import { Router } from 'express'
import { autenticar, esAdmin } from '../middlewares/autenticacion.middleware'
import { teamController } from '../controllers/team.controller'

const router = Router()
router.use(autenticar, esAdmin)

router.get('/', teamController.list)
router.get('/:id', teamController.get)
router.post('/', teamController.create)
router.put('/:id', teamController.update)
router.delete('/:id', teamController.remove)

export default router
