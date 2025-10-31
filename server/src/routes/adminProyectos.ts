import { Router } from 'express'
import { proyectoController } from '../controllers/proyecto.controller'
import { autenticar, esAdmin } from '../middlewares/autenticacion.middleware'

const router = Router()

// Rutas de administración para proyectos. Requieren autenticación y rol ADMIN
router.use(autenticar)
router.use(esAdmin)

router.get('/cliente/:clienteId', proyectoController.obtenerPorCliente)
router.get('/', proyectoController.obtenerTodos)
router.get('/:id', proyectoController.obtenerPorId)
router.post('/', proyectoController.crear)
// So HTML forms (POST) can be used for updates from simple admin forms, accept POST on :id
router.post('/:id', proyectoController.actualizar)
router.put('/:id', proyectoController.actualizar)
router.delete('/:id', proyectoController.eliminar)
router.put('/:id/etiquetas', proyectoController.asignarEtiquetas)
router.post('/:id/clientes', proyectoController.asociarCliente)
router.put('/:id/clientes/:clienteId', proyectoController.actualizarNotasCliente)
router.delete('/:id/clientes/:clienteId', proyectoController.desasociarCliente)

export default router
