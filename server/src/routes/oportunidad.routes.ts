import { Router } from 'express';
import oportunidadController from '@/controllers/oportunidad.controller';
import { autenticar } from '@/middlewares/autenticacion.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(autenticar);

// GET /api/oportunidades/estadisticas - Obtener estadísticas
router.get(
  '/estadisticas',
  oportunidadController.obtenerEstadisticas.bind(oportunidadController)
);

// PATCH /api/oportunidades/por-lead/:leadId - Actualizar oportunidad por leadId
router.patch(
  '/por-lead/:leadId',
  oportunidadController.actualizarOportunidadPorLead.bind(oportunidadController)
);

// GET /api/oportunidades/cliente/:clienteId - Obtener oportunidades de un cliente
router.get(
  '/cliente/:clienteId',
  oportunidadController.obtenerOportunidadesDeCliente.bind(oportunidadController)
);

// PATCH /api/oportunidades/:id/etapa - Cambiar etapa
router.patch(
  '/:id/etapa',
  oportunidadController.cambiarEtapa.bind(oportunidadController)
);

// POST /api/oportunidades - Crear oportunidad
router.post(
  '/',
  oportunidadController.crearOportunidad.bind(oportunidadController)
);

// GET /api/oportunidades - Obtener todas las oportunidades
router.get(
  '/',
  oportunidadController.obtenerOportunidades.bind(oportunidadController)
);

// GET /api/oportunidades/:id - Obtener una oportunidad
router.get(
  '/:id',
  oportunidadController.obtenerOportunidadPorId.bind(oportunidadController)
);

// PUT /api/oportunidades/:id - Actualizar oportunidad
router.put(
  '/:id',
  oportunidadController.actualizarOportunidad.bind(oportunidadController)
);

// DELETE /api/oportunidades/:id - Eliminar oportunidad
router.delete(
  '/:id',
  oportunidadController.eliminarOportunidad.bind(oportunidadController)
);

export default router;
