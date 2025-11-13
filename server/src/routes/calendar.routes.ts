import { Router } from 'express';
import {
  getAuthUrl,
  handleCallback,
  getEvents,
  getAuthStatus,
  logout,
  syncEvents,
} from '@/controllers/calendar.controller';

const router = Router();

// Obtener URL de autenticación de Google
router.get('/auth-url', getAuthUrl);

// Callback de OAuth2
router.get('/callback', handleCallback);

// Obtener eventos del calendario
router.post('/events', getEvents);

// Verificar estado de autenticación
router.post('/auth-status', getAuthStatus);

// Cerrar sesión de Google Calendar
router.post('/logout', logout);

// Sincronizar eventos
router.post('/sync', syncEvents);

export default router;
