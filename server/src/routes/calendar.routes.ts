import { Router } from 'express';
import {
  getAuthUrl,
  handleCallback,
  getEvents,
  getAuthStatus,
  logout,
  syncEvents,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
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

// Crear evento en Google Calendar
router.post('/create-event', crearEvento);

// Actualizar evento en Google Calendar
router.put('/update-event', actualizarEvento);

// Eliminar evento en Google Calendar
router.delete('/delete-event', eliminarEvento);

export default router;
