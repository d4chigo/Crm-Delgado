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

// GET /api/contactos/:id - Obtener un contacto
router.get(
  '/:id',
  contactoController.obtenerContactoPorId.bind(contactoController)
);

// POST /api/contactos - Crear contacto
router.post(
  '/',
  validar(crearContactoSchema),
  contactoController.crearContacto.bind(contactoController)
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

// POST /api/contactos/:id/convertir-lead - Convertir a lead
router.post(
  '/:id/convertir-lead',
  contactoController.convertirALead.bind(contactoController)
);

// POST /api/contactos/convertir-leads/masivo - Convertir varios a leads
router.post(
  '/convertir-leads/masivo',
  contactoController.convertirVariosALeads.bind(contactoController)
);

export default router;
