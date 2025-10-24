import { google, calendar_v3 } from 'googleapis';
import prisma from '@/config/database';
import cryptoUtil from '@/utils/crypto.util';

type OAuthTokens = {
  access_token?: string;
  refresh_token?: string;
  expiry_date?: number;
  scope?: string;
};

class GoogleCalendarService {
  private newOAuthClient() {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    return client;
  }

  private async withAccount(userId: string) {
    const account = await prisma.calendarioCuenta.findFirst({
      where: { usuarioId: userId, proveedor: 'GOOGLE' },
    });
    if (!account) throw new Error('Cuenta de calendario no conectada');

    const client = this.newOAuthClient();
    const accessToken = cryptoUtil.decrypt(account.accessTokenEnc);
    const tokens: OAuthTokens = { access_token: accessToken };
    if (account.refreshTokenEnc) {
      tokens.refresh_token = cryptoUtil.decrypt(account.refreshTokenEnc);
    }
    if (account.tokenExpiraEn) {
      tokens.expiry_date = account.tokenExpiraEn.getTime();
    }
    client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: client });
    return { account, client, calendar };
  }

  async connectAccount(userId: string, tokens: OAuthTokens) {
    const accessTokenEnc = tokens.access_token ? cryptoUtil.encrypt(tokens.access_token) : undefined;
    const refreshTokenEnc = tokens.refresh_token ? cryptoUtil.encrypt(tokens.refresh_token) : undefined;
    const tokenExpiraEn = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

    // obtener perfil de usuario de Google para email e id
    const oauth2 = google.oauth2('v2');
    const client = this.newOAuthClient();
    client.setCredentials(tokens);
    oauth2.options({ auth: client });
    const me = await oauth2.userinfo.get();

    await prisma.calendarioCuenta.upsert({
      where: { usuarioId_proveedor: { usuarioId: userId, proveedor: 'GOOGLE' } },
      create: {
        usuarioId: userId,
        proveedor: 'GOOGLE',
        proveedorUsuarioId: me.data.id || null,
        email: me.data.email || null,
        accessTokenEnc: accessTokenEnc!,
        refreshTokenEnc: refreshTokenEnc || null,
        tokenExpiraEn: tokenExpiraEn,
        scope: tokens.scope || null,
        calendarioPrimarioId: 'primary',
      },
      update: {
        proveedorUsuarioId: me.data.id || null,
        email: me.data.email || null,
        accessTokenEnc: accessTokenEnc!,
        refreshTokenEnc: refreshTokenEnc || null,
        tokenExpiraEn: tokenExpiraEn,
        scope: tokens.scope || null,
      }
    });
  }

  async listEvents(userId: string, timeMin?: string, timeMax?: string) {
    const { account, calendar } = await this.withAccount(userId);
    const params: calendar_v3.Params$Resource$Events$List = {
      calendarId: account.calendarioPrimarioId || 'primary',
      showDeleted: false,
      singleEvents: true,
      maxResults: 2500,
      orderBy: 'startTime',
      timeMin: timeMin || new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      timeMax: timeMax || new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
    };
    const res = await calendar.events.list(params);
    return res.data.items || [];
  }

  async upsertEvent(userId: string, payload: calendar_v3.Schema$Event) {
    const { account, calendar } = await this.withAccount(userId);
    const calendarId = account.calendarioPrimarioId || 'primary';
    if (payload.id) {
      const res = await calendar.events.update({ calendarId, eventId: payload.id, requestBody: payload });
      return res.data;
    } else {
      const res = await calendar.events.insert({ calendarId, requestBody: payload });
      return res.data;
    }
  }

  async deleteEvent(userId: string, eventId: string) {
    const { account, calendar } = await this.withAccount(userId);
    const calendarId = account.calendarioPrimarioId || 'primary';
    await calendar.events.delete({ calendarId, eventId });
    await prisma.calendarioEvento.updateMany({ where: { usuarioId: userId, proveedor: 'GOOGLE', proveedorEventoId: eventId }, data: { cancelado: true, estado: 'CANCELADO' } });
  }

  async sync(userId: string) {
    const { account, calendar } = await this.withAccount(userId);
    const calendarId = account.calendarioPrimarioId || 'primary';
    const items: calendar_v3.Schema$Event[] = [];

    if (account.syncToken) {
      // incremental
      try {
        const res = await calendar.events.list({ calendarId, syncToken: account.syncToken });
        items.push(...(res.data.items || []));
        if (res.data.nextSyncToken) {
          await prisma.calendarioCuenta.update({ where: { id: account.id }, data: { syncToken: res.data.nextSyncToken, ultimaSincronizacion: new Date() } });
        }
      } catch (e: any) {
        if (e?.code === 410) {
          // token inválido -> resync completo
          await prisma.calendarioCuenta.update({ where: { id: account.id }, data: { syncToken: null } });
          return this.sync(userId);
        }
        throw e;
      }
    } else {
      // primer sync: obtener un rango razonable y singleEvents para expandir recurrencias
      const timeMin = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();
      const timeMax = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
      const res = await calendar.events.list({
        calendarId,
        showDeleted: true,
        singleEvents: true,
        maxResults: 2500,
        timeMin,
        timeMax,
        orderBy: 'startTime',
      });
      items.push(...(res.data.items || []));
      if (res.data.nextSyncToken) {
        await prisma.calendarioCuenta.update({ where: { id: account.id }, data: { syncToken: res.data.nextSyncToken, ultimaSincronizacion: new Date() } });
      }
    }

    // Reflejar en base local
    for (const ev of items) {
      const summary = ev.summary || '';
      const allDay = !!ev.start?.date;
      const startIso = ev.start?.dateTime || (ev.start?.date ? `${ev.start.date}T00:00:00.000Z` : undefined);
      const endIso = ev.end?.dateTime || (ev.end?.date ? `${ev.end.date}T00:00:00.000Z` : undefined);
      const status = (ev.status || 'confirmed').toUpperCase() as any;
      const cancelled = status === 'CANCELLED' || status === 'CANCELED';

      if (!ev.id || !startIso || !endIso) continue;
      await prisma.calendarioEvento.upsert({
        where: { proveedorEventoId: ev.id },
        create: {
          usuarioId: userId,
          cuentaId: account.id,
          proveedor: 'GOOGLE',
          proveedorEventoId: ev.id,
          iCalUid: ev.iCalUID || null,
          etag: ev.etag || null,
          htmlLink: ev.htmlLink || null,
          estado: cancelled ? 'CANCELADO' : status === 'TENTATIVE' ? 'TENTATIVO' : 'CONFIRMADO',
          cancelado: cancelled,
          resumen: summary,
          descripcion: ev.description || null,
          ubicacion: ev.location || null,
          todoElDia: allDay,
          zonaHoraria: ev.start?.timeZone || ev.end?.timeZone || null,
          inicio: new Date(startIso),
          fin: new Date(endIso),
          recurrenciaRRule: (ev.recurrence || [])[0] || null,
          asistentes: (ev.attendees as any) ? (ev.attendees as any) : undefined,
          recordatoriosMinutos: (ev.reminders?.overrides?.[0]?.minutes as number) || null,
          remotoCreadoEn: ev.created ? new Date(ev.created) : null,
          remotoActualizadoEn: ev.updated ? new Date(ev.updated) : null,
          ultimaSincronizacion: new Date(),
        },
        update: {
          iCalUid: ev.iCalUID || null,
          etag: ev.etag || null,
          htmlLink: ev.htmlLink || null,
          estado: cancelled ? 'CANCELADO' : status === 'TENTATIVO' ? 'TENTATIVO' : 'CONFIRMADO',
          cancelado: cancelled,
          resumen: summary,
          descripcion: ev.description || null,
          ubicacion: ev.location || null,
          todoElDia: allDay,
          zonaHoraria: ev.start?.timeZone || ev.end?.timeZone || null,
          inicio: new Date(startIso),
          fin: new Date(endIso),
          recurrenciaRRule: (ev.recurrence || [])[0] || null,
          asistentes: (ev.attendees as any) ? (ev.attendees as any) : undefined,
          recordatoriosMinutos: (ev.reminders?.overrides?.[0]?.minutes as number) || null,
          remotoCreadoEn: ev.created ? new Date(ev.created) : null,
          remotoActualizadoEn: ev.updated ? new Date(ev.updated) : null,
          ultimaSincronizacion: new Date(),
        }
      });
    }
  }

  async watch(userId: string) {
    const { account, calendar } = await this.withAccount(userId);
    const calendarId = account.calendarioPrimarioId || 'primary';
    const channelId = `${userId}-${Date.now()}`;
    const address = `${process.env.API_BASE_URL}/api/calendar/webhook/google`;
    const res = await calendar.events.watch({
      calendarId,
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address,
        token: account.webhookSecreto || undefined,
      }
    });
    await prisma.calendarioCuenta.update({
      where: { id: account.id },
      data: {
        canalId: res.data.id || channelId,
        recursoId: res.data.resourceId || null,
        canalExpiraEn: res.data.expiration ? new Date(Number(res.data.expiration)) : null,
      }
    });
  }
}

export default new GoogleCalendarService();
