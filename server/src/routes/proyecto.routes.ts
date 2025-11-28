import { Router } from 'express'
import { proyectoController } from '../controllers/proyecto.controller'
import { autenticar } from '../middlewares/autenticacion.middleware'

const router = Router()

// Todas las rutas requieren autenticación
router.use(autenticar)

// Obtener proyectos de un contacto (lead o cliente)
router.get('/contacto/:contactoId', proyectoController.obtenerPorContacto)

// Obtener proyectos de un cliente específico
router.get('/cliente/:clienteId', proyectoController.obtenerPorCliente)

// Obtener todos los proyectos
router.get('/', proyectoController.obtenerTodos)

// Obtener un proyecto por ID
router.get('/:id', proyectoController.obtenerPorId)

// Crear un nuevo proyecto
router.post('/', proyectoController.crear)

// Actualizar un proyecto
router.put('/:id', proyectoController.actualizar)

// Eliminar un proyecto (soft delete)
router.delete('/:id', proyectoController.eliminar)

// Asignar etiquetas a un proyecto
router.put('/:id/etiquetas', proyectoController.asignarEtiquetas)

// Asociar un cliente a un proyecto
router.post('/:id/clientes', proyectoController.asociarCliente)

// Actualizar notas de un cliente asociado
router.put('/:id/clientes/:clienteId', proyectoController.actualizarNotasCliente)

// Desasociar un cliente de un proyecto
router.delete('/:id/clientes/:clienteId', proyectoController.desasociarCliente)

export default router
