import { Request, Response } from 'express';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALENDAR_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

export async function getAuthUrl(req: Request, res: Response) {
  try {
    console.log('[Calendar] Generando URL de autenticación');
    console.log('[Calendar] Redirect URI:', process.env.GOOGLE_CALENDAR_REDIRECT_URI);
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });
    
    console.log('[Calendar] URL generada:', authUrl.substring(0, 100) + '...');
    res.json({ exito: true, datos: { authUrl } });
  } catch (error: any) {
    console.error('[Calendar] Error generando URL de autenticación:', error);
    res.status(500).json({ exito: false, error: 'Error generando URL de autenticación' });
  }
}

export async function handleCallback(req: Request, res: Response) {
  try {
    console.log('[Calendar] Callback recibido');
    console.log('[Calendar] Query params:', req.query);
    console.log('[Calendar] Headers:', req.headers);
    
    const { code, error } = req.query as { code?: string; error?: string };
    
    if (error) {
      console.error('[Calendar] ERROR de Google:', error);
      return res.redirect(`${process.env.CORS_ORIGIN}/dashboard/actividades?auth=error&reason=${error}`);
    }
    
    if (!code) {
      console.error('[Calendar] ERROR: No se recibió código de autorización');
      return res.redirect(`${process.env.CORS_ORIGIN}/dashboard/actividades?auth=error&reason=no_code`);
    }

    console.log('[Calendar] Código recibido, intercambiando por tokens...');
    const { tokens: newTokens } = await oauth2Client.getToken(code);
    console.log('[Calendar] Tokens obtenidos exitosamente:', Object.keys(newTokens));
    
    const redirectUrl = `${process.env.CORS_ORIGIN}/dashboard/actividades?auth=success`;
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('[Calendar] Error en callback de OAuth2:', error);
    console.error('[Calendar] Stack trace:', error.stack);
    res.redirect(`${process.env.CORS_ORIGIN}/dashboard/actividades?auth=error&reason=token_exchange_failed`);
  }
}

export async function getEvents(req: Request, res: Response) {
  try {
    const { tokens } = req.body;
    
    if (!tokens) {
      return res.status(401).json({ exito: false, error: 'No autenticado', requireAuth: true });
    }

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfMonth.toISOString(),
      timeMax: endOfMonth.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items?.map((event) => ({
      id: event.id,
      title: event.summary || 'Sin título',
      description: event.description || '',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location || '',
      attendees: event.attendees?.map(a => a.email) || [],
      htmlLink: event.htmlLink,
      status: event.status,
      colorId: event.colorId,
    })) || [];

    res.json({ exito: true, datos: { events } });
  } catch (error: any) {
    console.error('[Calendar] Error obteniendo eventos:', error);
    if (error.code === 401) {
      return res.status(401).json({ exito: false, error: 'Token expirado', requireAuth: true });
    }
    res.status(500).json({ exito: false, error: 'Error obteniendo eventos' });
  }
}

export async function getAuthStatus(req: Request, res: Response) {
  const { tokens } = req.body;
  res.json({ exito: true, datos: { authenticated: !!tokens } });
}

export async function logout(req: Request, res: Response) {
  res.json({ exito: true, mensaje: 'Sesión cerrada' });
}

export async function syncEvents(req: Request, res: Response) {
  try {
    const { tokens } = req.body;
    
    if (!tokens) {
      return res.status(401).json({ exito: false, error: 'No autenticado', requireAuth: true });
    }

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Obtener eventos del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfMonth.toISOString(),
      timeMax: endOfMonth.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    console.log('[Calendar] Eventos sincronizados:', response.data.items?.length || 0);
    res.json({ exito: true, mensaje: 'Eventos sincronizados correctamente' });
  } catch (error: any) {
    console.error('[Calendar] Error sincronizando eventos:', error);
    if (error.code === 401) {
      return res.status(401).json({ exito: false, error: 'Token expirado', requireAuth: true });
    }
    res.status(500).json({ exito: false, error: 'Error sincronizando eventos' });
  }
}
