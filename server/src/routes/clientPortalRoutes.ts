import { Router } from 'express';
import clientPortalController from '@/controllers/clientPortal.controller';
import { autenticar } from '@/middlewares/autenticacion.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.get('/perfil', autenticar, clientPortalController.obtenerPerfil.bind(clientPortalController));
router.get('/resumen', autenticar, clientPortalController.obtenerResumen.bind(clientPortalController));
router.get('/oportunidades', autenticar, clientPortalController.obtenerOportunidades.bind(clientPortalController));
router.get('/oportunidades/:id', autenticar, clientPortalController.obtenerOportunidadDetalle.bind(clientPortalController));
router.get('/cotizaciones', autenticar, clientPortalController.obtenerCotizaciones.bind(clientPortalController));
router.get('/documentos', autenticar, clientPortalController.obtenerDocumentos.bind(clientPortalController));
router.get('/asesor', autenticar, clientPortalController.obtenerAsesor.bind(clientPortalController));
router.get('/actividades', autenticar, clientPortalController.obtenerActividades.bind(clientPortalController));

export default router;
