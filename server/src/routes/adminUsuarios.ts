import { Router } from 'express'
import { autenticar, esAdmin } from '../middlewares/autenticacion.middleware'
import { usuariosController } from '../controllers/usuarios.controller'

const router = Router()
router.use(autenticar, esAdmin)

router.get('/', usuariosController.list)
router.get('/:id', usuariosController.get)
router.post('/', usuariosController.create)
router.put('/:id', usuariosController.update)
router.delete('/:id', usuariosController.remove)

export default router
