import { Router } from 'express'
import { autenticar } from '../middlewares/autenticacion.middleware'
import { testimonialController } from '../controllers/testimonial.controller'

const router = Router()

// Todas las rutas requieren cliente autenticado
router.use(autenticar)

// Listar testimonios (por ahora todos; en UI se puede filtrar si se requiere)
router.get('/', testimonialController.list)

// Crear un testimonio
router.post('/', testimonialController.create)

export default router
