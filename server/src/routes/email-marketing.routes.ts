import { Router } from 'express';
import {
  obtenerEstadisticas,
  enviarCampana,
  validarEmails,
} from '@/controllers/email-marketing.controller';

const router = Router();

/**
 * GET /api/email-marketing/estadisticas
 * Obtener estadísticas de emails válidos e inválidos
 */
router.get('/estadisticas', obtenerEstadisticas);

/**
 * POST /api/email-marketing/validar-emails
 * Validar y obtener lista de emails válidos
 */
router.post('/validar-emails', validarEmails);

/**
 * POST /api/email-marketing/enviar-campana
 * Enviar campaña de email marketing
 */
router.post('/enviar-campana', enviarCampana);

export default router;
