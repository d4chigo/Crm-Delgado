import { Router, Request, Response } from 'express';
import { autenticar } from '@/middlewares/autenticacion.middleware';
import googleAuthService from '@/services/google-auth.service';
import prisma from '@/config/database';
import cryptoUtil from '@/utils/crypto.util';
import { respuestaError, respuestaExito } from '@/utils/respuesta.util';
import jwt from 'jsonwebtoken';

const router = Router();

// Iniciar conexión con Google Calendar (obtener URL)
router.get('/google/url', autenticar, (req: Request, res: Response) => {
  try {
    const stateToken = jwt.sign({
      sub: req.usuario!.id,
      purpose: 'calendar_oauth',
      exp: Math.floor(Date.now() / 1000) + 10 * 60,
    }, process.env.JWT_SECRET || 'secret-super-secreto-cambiar-en-produccion');
    const url = googleAuthService.getAuthUrl(stateToken);
    respuestaExito(res, { authUrl: url });
  } catch (e: any) {
    respuestaError(res, e.message || 'Error generando URL de Google', 500);
  }
});

// Guardar la conexión en la cuenta del usuario autenticado
router.post('/google/connect', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario!.id;
    const { access_token, refresh_token, expiry_date, scope, email, sub } = req.body || {};
    if (!access_token) return respuestaError(res, 'access_token requerido', 400);
    const accessTokenEnc = cryptoUtil.encrypt(access_token);
    const refreshTokenEnc = refresh_token ? cryptoUtil.encrypt(refresh_token) : null;

    await prisma.calendarioCuenta.upsert({
      where: { usuarioId_proveedor: { usuarioId, proveedor: 'GOOGLE' } },
      create: {
        usuarioId,
        proveedor: 'GOOGLE',
        proveedorUsuarioId: sub || null,
        email: email || null,
        accessTokenEnc,
        refreshTokenEnc,
        tokenExpiraEn: expiry_date ? new Date(expiry_date) : null,
        scope: scope || null,
        calendarioPrimarioId: 'primary',
      },
      update: {
        proveedorUsuarioId: sub || null,
        email: email || null,
        accessTokenEnc,
        refreshTokenEnc,
        tokenExpiraEn: expiry_date ? new Date(expiry_date) : null,
        scope: scope || null,
      }
    });

    respuestaExito(res, { conectado: true });
  } catch (e: any) {
    respuestaError(res, e.message || 'Error guardando cuenta de Google', 500);
  }
});

// Listar eventos sincronizados localmente
router.get('/events', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario!.id;
    const eventos = await prisma.calendarioEvento.findMany({ where: { usuarioId, cancelado: false }, orderBy: { inicio: 'asc' } });
    respuestaExito(res, { eventos });
  } catch (e: any) {
    respuestaError(res, e.message || 'Error listando eventos', 500);
  }
});

// Disparar sincronización con Google Calendar
router.post('/sync', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario!.id;
    const { default: googleCalendarService } = await import('@/services/google-calendar.service');
    await googleCalendarService.sync(usuarioId);
    respuestaExito(res, { sincronizado: true });
  } catch (e: any) {
    respuestaError(res, e.message || 'Error sincronizando calendario', 500);
  }
});

// Iniciar suscripción a cambios (watch)
router.post('/watch', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario!.id;
    const { default: googleCalendarService } = await import('@/services/google-calendar.service');
    await prisma.calendarioCuenta.updateMany({ where: { usuarioId, proveedor: 'GOOGLE' }, data: { webhookSecreto: Math.random().toString(36).slice(2) } });
    await googleCalendarService.watch(usuarioId);
    respuestaExito(res, { watching: true });
  } catch (e: any) {
    respuestaError(res, e.message || 'Error iniciando watch', 500);
  }
});

// Webhook receptor de Google (no autenticado). Google espera 2xx inmediato.
router.post('/webhook/google', async (req: Request, res: Response) => {
  const channelId = req.header('X-Goog-Channel-ID');
  const resourceId = req.header('X-Goog-Resource-ID');
  if (!channelId || !resourceId) return res.status(400).end();
  try {
    const account = await prisma.calendarioCuenta.findFirst({ where: { OR: [{ recursoId: resourceId }, { canalId: channelId }], proveedor: 'GOOGLE' } });
    if (account) {
      const { default: googleCalendarService } = await import('@/services/google-calendar.service');
      // Desacoplar: no await para responder rápido
      googleCalendarService.sync(account.usuarioId).catch(() => {});
    }
  } catch {}
  res.status(200).end();
});

// Crear evento
router.post('/events', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario!.id;
    const { resumen, descripcion, inicio, fin, todoElDia, zonaHoraria } = req.body || {};
    if (!resumen || !inicio || !fin) return respuestaError(res, 'resumen, inicio y fin requeridos', 400);
    const { default: googleCalendarService } = await import('@/services/google-calendar.service');
    const event: any = {
      summary: resumen,
      description: descripcion || undefined,
      start: todoElDia ? { date: String(inicio).slice(0,10) } : { dateTime: new Date(inicio).toISOString(), timeZone: zonaHoraria || 'UTC' },
      end: todoElDia ? { date: String(fin).slice(0,10) } : { dateTime: new Date(fin).toISOString(), timeZone: zonaHoraria || 'UTC' },
    };
    const created = await googleCalendarService.upsertEvent(usuarioId, event);
    await googleCalendarService.sync(usuarioId);
    respuestaExito(res, { evento: created });
  } catch (e: any) {
    respuestaError(res, e.message || 'Error creando evento', 500);
  }
});

// Actualizar evento
router.patch('/events/:eventId', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario!.id;
    const eventId = req.params.eventId;
    const { resumen, descripcion, inicio, fin, todoElDia, zonaHoraria } = req.body || {};
    const { default: googleCalendarService } = await import('@/services/google-calendar.service');
    const event: any = {
      id: eventId,
      summary: resumen,
      description: descripcion,
    };
    if (inicio && fin) {
      event.start = todoElDia ? { date: String(inicio).slice(0,10) } : { dateTime: new Date(inicio).toISOString(), timeZone: zonaHoraria || 'UTC' };
      event.end = todoElDia ? { date: String(fin).slice(0,10) } : { dateTime: new Date(fin).toISOString(), timeZone: zonaHoraria || 'UTC' };
    }
    const updated = await googleCalendarService.upsertEvent(usuarioId, event);
    await googleCalendarService.sync(usuarioId);
    respuestaExito(res, { evento: updated });
  } catch (e: any) {
    respuestaError(res, e.message || 'Error actualizando evento', 500);
  }
});

// Eliminar evento
router.delete('/events/:eventId', autenticar, async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario!.id;
    const eventId = req.params.eventId;
    const { default: googleCalendarService } = await import('@/services/google-calendar.service');
    await googleCalendarService.deleteEvent(usuarioId, eventId);
    respuestaExito(res, { eliminado: true });
  } catch (e: any) {
    respuestaError(res, e.message || 'Error eliminando evento', 500);
  }
});

export default router;
