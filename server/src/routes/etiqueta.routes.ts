import { Router } from 'express';
import etiquetaController from '@/controllers/etiqueta.controller';
import { autenticar } from '@/middlewares/autenticacion.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(autenticar);

// GET /api/etiquetas - Obtener todas las etiquetas
router.get(
  '/',
  etiquetaController.obtenerEtiquetas.bind(etiquetaController)
);

// GET /api/etiquetas/contacto/:id - Obtener etiquetas de un contacto
router.get(
  '/contacto/:id',
  etiquetaController.obtenerEtiquetasDeContacto.bind(etiquetaController)
);

// PUT /api/etiquetas/contacto/:id - Asignar etiquetas a un contacto
router.put(
  '/contacto/:id',
  etiquetaController.asignarEtiquetas.bind(etiquetaController)
);

// POST /api/etiquetas/contacto/:contactoId/etiqueta/:etiquetaId - Agregar una etiqueta
router.post(
  '/contacto/:contactoId/etiqueta/:etiquetaId',
  etiquetaController.agregarEtiqueta.bind(etiquetaController)
);

// DELETE /api/etiquetas/contacto/:contactoId/etiqueta/:etiquetaId - Remover una etiqueta
router.delete(
  '/contacto/:contactoId/etiqueta/:etiquetaId',
  etiquetaController.removerEtiqueta.bind(etiquetaController)
);

// POST /api/etiquetas - Crear una nueva etiqueta
router.post(
  '/',
  etiquetaController.crearEtiqueta.bind(etiquetaController)
);

// GET /api/etiquetas/:id/contactos - Obtener contactos con una etiqueta específica
router.get(
  '/:id/contactos',
  etiquetaController.obtenerContactosPorEtiqueta.bind(etiquetaController)
);

export default router;
