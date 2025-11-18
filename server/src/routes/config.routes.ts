import { Router } from 'express';
import configController from '@/controllers/config.controller';

const router = Router();

/**
 * GET /api/config/google-api-key
 * Obtiene la clave de Google Gemini API
 */
router.get('/google-api-key', configController.getGoogleApiKey.bind(configController));

export default router;
