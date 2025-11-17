import { Router } from 'express';
import contactoController from '@/controllers/contacto.controller';
import { validar } from '@/middlewares/validacion.middleware';
import { autenticar } from '@/middlewares/autenticacion.middleware';
import {
  crearContactoSchema,
  actualizarContactoSchema,
  filtrosContactoSchema
} from '@/validators/contacto.validator';

const router = Router();

// Todas las rutas requieren autenticación
router.use(autenticar);

// GET /api/contactos - Obtener todos los contactos
router.get(
  '/',
  validar(filtrosContactoSchema),
  contactoController.obtenerContactos.bind(contactoController)
);

// GET /api/contactos/estadisticas - Obtener estadísticas
router.get(
  '/estadisticas',
  contactoController.obtenerEstadisticas.bind(contactoController)
);

// GET /api/contactos/recientes - Obtener contactos recientes
router.get(
  '/recientes',
  contactoController.obtenerContactosRecientes.bind(contactoController)
);

// POST /api/contactos - Crear contacto
router.post(
  '/',
  validar(crearContactoSchema),
  contactoController.crearContacto.bind(contactoController)
);

// POST /api/contactos/importar/google - Importar contactos desde Google
router.post(
  '/importar/google',
  contactoController.importarDesdeGoogle.bind(contactoController)
);

// POST /api/contactos/convertir-leads/masivo - Convertir varios a leads
router.post(
  '/convertir-leads/masivo',
  contactoController.convertirVariosALeads.bind(contactoController)
);

// ==================== RUTAS ESPECÍFICAS CON :id ==================
// DEBEN IR ANTES DE LAS RUTAS GENÉRICAS /:id

// POST /api/contactos/:id/agregar-pipeline - Agregar lead al pipeline
router.post(
  '/:id/agregar-pipeline',
  contactoController.agregarAlPipeline.bind(contactoController)
);

// POST /api/contactos/:id/convertir-lead - Convertir a lead
router.post(
  '/:id/convertir-lead',
  contactoController.convertirALead.bind(contactoController)
);

// POST /api/contactos/:id/convertir-cliente - Convertir lead a cliente
router.post(
  '/:id/convertir-cliente',
  contactoController.convertirLeadACliente.bind(contactoController)
);

// POST /api/contactos/:id/clientes - Asociar cliente a lead
router.post(
  '/:id/clientes',
  contactoController.asociarCliente.bind(contactoController)
);

// GET /api/contactos/:id/clientes - Obtener clientes de un lead
router.get(
  '/:id/clientes',
  contactoController.obtenerClientesDeLeads.bind(contactoController)
);

// PUT /api/contactos/:id/clientes/:clienteId - Actualizar asociación
router.put(
  '/:id/clientes/:clienteId',
  contactoController.actualizarAsociacion.bind(contactoController)
);

// DELETE /api/contactos/:id/clientes/:clienteId - Desasociar cliente
router.delete(
  '/:id/clientes/:clienteId',
  contactoController.desasociarCliente.bind(contactoController)
);

// ==================== RUTAS GENÉRICAS /:id ==================
// Ir al final para no interferir con rutas específicas

// GET /api/contactos/:id - Obtener un contacto
router.get(
  '/:id',
  contactoController.obtenerContactoPorId.bind(contactoController)
);

// PUT /api/contactos/:id - Actualizar contacto
router.put(
  '/:id',
  validar(actualizarContactoSchema),
  contactoController.actualizarContacto.bind(contactoController)
);

// DELETE /api/contactos/:id - Eliminar contacto
router.delete(
  '/:id',
  contactoController.eliminarContacto.bind(contactoController)
);

export default router;
