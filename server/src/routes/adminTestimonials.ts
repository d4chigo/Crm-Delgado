import { Router } from 'express'
import { autenticar, esAdmin } from '../middlewares/autenticacion.middleware'
import { testimonialController } from '../controllers/testimonial.controller'

const router = Router()

router.use(autenticar, esAdmin)

router.get('/', testimonialController.list)
router.get('/:id', testimonialController.get)
router.post('/', testimonialController.create)
router.put('/:id', testimonialController.update)
router.patch('/:id', testimonialController.update) // Permitir PATCH también
router.delete('/:id', testimonialController.remove)

export default router
