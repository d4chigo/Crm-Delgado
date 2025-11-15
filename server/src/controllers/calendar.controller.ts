import { Request, Response } from 'express';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALENDAR_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar', // Permiso completo para leer y escribir eventos
  'https://www.googleapis.com/auth/calendar.events' // Permiso específico para eventos
];

export async function getAuthUrl(req: Request, res: Response) {
  try {
    console.log('[Calendar] Generando URL de autenticación');
    console.log('[Calendar] Client ID:', process.env.GOOGLE_CALENDAR_CLIENT_ID?.substring(0, 20) + '...');
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
    
    // Codificar tokens en base64 para pasarlos de forma segura en la URL
    const tokensEncoded = Buffer.from(JSON.stringify(newTokens)).toString('base64');
    console.log('[Calendar] Tokens codificados, longitud:', tokensEncoded.length);

    const redirectUrl = `${process.env.CORS_ORIGIN}/dashboard/actividades?auth=success&tokens=${tokensEncoded}`;
    console.log('[Calendar] Redirigiendo a:', redirectUrl.substring(0, 100) + '...');
    
    // Redirigir al frontend con tokens
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
      console.warn('[Calendar] No hay tokens en la solicitud');
      return res.status(401).json({ exito: false, error: 'No autenticado', requireAuth: true });
    }

    console.log('[Calendar] Configurando credenciales con tokens');
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    console.log('[Calendar] Solicitando eventos del mes:', startOfMonth.toISOString(), '-', endOfMonth.toISOString());
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfMonth.toISOString(),
      timeMax: endOfMonth.toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    console.log('[Calendar] Eventos obtenidos:', response.data.items?.length || 0);

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
    console.error('[Calendar] Error obteniendo eventos:', error.message);
    console.error('[Calendar] Error code:', error.code);
    console.error('[Calendar] Error details:', error.errors?.[0]?.message);
    
    if (error.code === 401 || error.message?.includes('Invalid Credentials')) {
      return res.status(401).json({ exito: false, error: 'Token expirado o inválido', requireAuth: true });
    }
    
    res.status(500).json({ 
      exito: false, 
      error: 'Error obteniendo eventos',
      detalles: error.message 
    });
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
      console.warn('[Calendar] No hay tokens para sincronizar');
      return res.status(401).json({ exito: false, error: 'No autenticado', requireAuth: true });
    }

    console.log('[Calendar] Sincronizando eventos...');
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Obtener eventos del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    console.log('[Calendar] Rango de fechas:', startOfMonth.toISOString(), '-', endOfMonth.toISOString());

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
    console.error('[Calendar] Error sincronizando eventos:', error.message);
    console.error('[Calendar] Error code:', error.code);
    console.error('[Calendar] Error details:', error.errors?.[0]?.message);
    
    if (error.code === 401 || error.message?.includes('Invalid Credentials')) {
      return res.status(401).json({ exito: false, error: 'Token expirado o inválido', requireAuth: true });
    }
    
    res.status(500).json({ 
      exito: false, 
      error: 'Error sincronizando eventos',
      detalles: error.message 
    });
  }
}

export async function crearEvento(req: Request, res: Response) {
  try {
    const { tokens, evento } = req.body;
    
    if (!tokens) {
      console.warn('[Calendar] No hay tokens para crear evento');
      return res.status(401).json({ exito: false, error: 'No autenticado', requireAuth: true });
    }

    if (!evento) {
      return res.status(400).json({ exito: false, error: 'Evento requerido' });
    }

    console.log('[Calendar] Creando evento:', evento.summary);
    console.log('[Calendar] Datos del evento:', {
      summary: evento.summary,
      startDateTime: evento.startDateTime,
      endDateTime: evento.endDateTime,
      attendees: evento.attendees,
      location: evento.location,
    });

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Construir el requestBody con validación
    const requestBody: any = {
      summary: evento.summary,
      start: {
        dateTime: evento.startDateTime,
        timeZone: 'America/Lima', // Zona horaria de Perú
      },
      end: {
        dateTime: evento.endDateTime,
        timeZone: 'America/Lima',
      },
    };

    // Agregar descripción solo si existe
    if (evento.description) {
      requestBody.description = evento.description;
    }

    // Agregar ubicación solo si existe
    if (evento.location) {
      requestBody.location = evento.location;
    }

    // Agregar asistentes solo si existen y son válidos
    if (evento.attendees && evento.attendees.length > 0) {
      const attendeesValidos = evento.attendees.filter((email: string) => {
        // Validar que sea un email real (no local importado)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const esValido = emailRegex.test(email) && !email.includes('.local');
        if (!esValido) {
          console.warn('[Calendar] Email inválido descartado:', email);
        }
        return esValido;
      });
      if (attendeesValidos.length > 0) {
        requestBody.attendees = attendeesValidos.map((email: string) => ({ email }));
      }
    }

    // Agregar recordatorios - Usar métodos válidos de Google Calendar
    requestBody.reminders = {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },  // popup en lugar de notification
        { method: 'email', minutes: 1440 }, // 1 día antes con email
      ],
    };

    console.log('[Calendar] Request body a enviar:', JSON.stringify(requestBody, null, 2));

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody,
    });

    console.log('[Calendar] Evento creado exitosamente:', response.data.id);
    res.json({ 
      exito: true, 
      mensaje: 'Evento creado correctamente',
      datos: {
        id: response.data.id,
        htmlLink: response.data.htmlLink,
      }
    });
  } catch (error: any) {
    console.error('[Calendar] Error creando evento:', error.message);
    console.error('[Calendar] Error code:', error.code);
    console.error('[Calendar] Error details:', error.errors);
    if (error.errors && error.errors.length > 0) {
      console.error('[Calendar] Primer error:', JSON.stringify(error.errors[0], null, 2));
    }
    console.error('[Calendar] Stack completo:', error.stack);
    
    if (error.code === 401 || error.message?.includes('Invalid Credentials')) {
      return res.status(401).json({ exito: false, error: 'Token expirado o inválido', requireAuth: true });
    }
    
    res.status(500).json({ 
      exito: false, 
      error: 'Error creando evento',
      detalles: error.message,
      errorDetails: error.errors?.[0]?.message || error.errors?.[0]?.reason
    });
  }
}

export async function actualizarEvento(req: Request, res: Response) {
  try {
    const { tokens, eventId, evento } = req.body;
    
    if (!tokens) {
      console.warn('[Calendar] No hay tokens para actualizar evento');
      return res.status(401).json({ exito: false, error: 'No autenticado', requireAuth: true });
    }

    if (!eventId || !evento) {
      return res.status(400).json({ exito: false, error: 'Event ID y evento requeridos' });
    }

    console.log('[Calendar] Actualizando evento:', eventId);
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Construir el requestBody
    const requestBody: any = {
      summary: evento.summary,
      start: {
        dateTime: evento.startDateTime,
        timeZone: 'America/Lima',
      },
      end: {
        dateTime: evento.endDateTime,
        timeZone: 'America/Lima',
      },
    };

    if (evento.description) {
      requestBody.description = evento.description;
    }

    if (evento.location) {
      requestBody.location = evento.location;
    }

    if (evento.attendees && evento.attendees.length > 0) {
      const attendeesValidos = evento.attendees.filter((email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const esValido = emailRegex.test(email) && !email.includes('.local');
        return esValido;
      });
      if (attendeesValidos.length > 0) {
        requestBody.attendees = attendeesValidos.map((email: string) => ({ email }));
      }
    }

    requestBody.reminders = {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 1440 },
      ],
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody,
    });

    console.log('[Calendar] Evento actualizado exitosamente:', response.data.id);
    res.json({ 
      exito: true, 
      mensaje: 'Evento actualizado correctamente',
      datos: {
        id: response.data.id,
        htmlLink: response.data.htmlLink,
      }
    });
  } catch (error: any) {
    console.error('[Calendar] Error actualizando evento:', error.message);
    console.error('[Calendar] Error code:', error.code);
    
    if (error.code === 401 || error.message?.includes('Invalid Credentials')) {
      return res.status(401).json({ exito: false, error: 'Token expirado o inválido', requireAuth: true });
    }
    
    res.status(500).json({ 
      exito: false, 
      error: 'Error actualizando evento',
      detalles: error.message
    });
  }
}

export async function eliminarEvento(req: Request, res: Response) {
  try {
    const { tokens, eventId } = req.body;
    
    if (!tokens) {
      console.warn('[Calendar] No hay tokens para eliminar evento');
      return res.status(401).json({ exito: false, error: 'No autenticado', requireAuth: true });
    }

    if (!eventId) {
      return res.status(400).json({ exito: false, error: 'Event ID requerido' });
    }

    console.log('[Calendar] Eliminando evento:', eventId);
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });

    console.log('[Calendar] Evento eliminado exitosamente:', eventId);
    res.json({ 
      exito: true, 
      mensaje: 'Evento eliminado correctamente'
    });
  } catch (error: any) {
    console.error('[Calendar] Error eliminando evento:', error.message);
    console.error('[Calendar] Error code:', error.code);
    
    if (error.code === 401 || error.message?.includes('Invalid Credentials')) {
      return res.status(401).json({ exito: false, error: 'Token expirado o inválido', requireAuth: true });
    }
    
    res.status(500).json({ 
      exito: false, 
      error: 'Error eliminando evento',
      detalles: error.message
    });
  }
}
