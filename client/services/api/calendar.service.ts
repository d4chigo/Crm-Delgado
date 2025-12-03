import { fetchAPI } from './config';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  location: string;
  attendees: string[];
  htmlLink: string;
  status: string;
  colorId?: string;
  allDay?: boolean;
}

export interface CalendarAuthStatus {
  authenticated: boolean;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
}

const STORAGE_KEY = 'google_calendar_tokens';

export function guardarTokens(tokens: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }
}

export function obtenerTokensGuardados(): any | null {
  if (typeof window !== 'undefined') {
    const tokensStr = localStorage.getItem(STORAGE_KEY);
    return tokensStr ? JSON.parse(tokensStr) : null;
  }
  return null;
}

export function eliminarTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function obtenerUrlAutenticacion(): Promise<{ authUrl: string }> {
  const response = await fetchAPI<{ authUrl: string }>('/calendar/auth-url');
  console.log('[Calendar Service] URL de autenticación obtenida:', response?.authUrl?.substring(0, 50) + '...');
  return response;
}

export async function obtenerEstadoAutenticacion(): Promise<CalendarAuthStatus> {
  const tokens = obtenerTokensGuardados();
  console.log('[Calendar Service] Tokens guardados:', tokens ? 'presente' : 'no presente');
  const response = await fetchAPI<CalendarAuthStatus>('/calendar/auth-status', {
    method: 'POST',
    body: JSON.stringify({ tokens }),
  });
  console.log('[Calendar Service] Estado autenticación recibido:', response);
  return response;
}

export async function obtenerEventos(): Promise<CalendarEventsResponse> {
  const tokens = obtenerTokensGuardados();
  console.log('[Calendar Service] Obteniendo eventos con tokens:', tokens ? 'presente' : 'no presente');
  if (!tokens) {
    throw new Error('No autenticado - tokens no encontrados en localStorage');
  }
  return await fetchAPI<CalendarEventsResponse>('/calendar/events', {
    method: 'POST',
    body: JSON.stringify({ tokens }),
  });
}

export async function cerrarSesionCalendario(): Promise<void> {
  eliminarTokens();
  await fetchAPI<void>('/calendar/logout', { method: 'POST' });
}

// Nuevas funciones para el calendario mejorado
export async function sincronizarEventos(): Promise<void> {
  console.log('[Calendar Service] Sincronizando eventos...');
  const tokens = obtenerTokensGuardados();
  if (!tokens) {
    console.error('[Calendar Service] No hay tokens para sincronizar');
    throw new Error('No autenticado');
  }
  console.log('[Calendar Service] Enviando tokens al backend para sincronizar');
  await fetchAPI<void>('/calendar/sync', {
    method: 'POST',
    body: JSON.stringify({ tokens }),
  });
  console.log('[Calendar Service] Sincronización completada');
}

export async function listarEventos(): Promise<CalendarEvent[]> {
  const tokens = obtenerTokensGuardados();
  if (!tokens) {
    throw new Error('No autenticado');
  }
  console.log('[Calendar Service] Listando eventos...');
  const response = await fetchAPI<CalendarEventsResponse>('/calendar/events', {
    method: 'POST',
    body: JSON.stringify({ tokens }),
  });
  console.log('[Calendar Service] Eventos recibidos:', response?.events?.length || 0);
  return response.events || [];
}

export function getTokenFromCallback(): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const tokensParam = urlParams.get('tokens');
  
  if (tokensParam) {
    try {
      const tokens = JSON.parse(atob(tokensParam));
      guardarTokens(tokens);
      // Limpiar URL
      window.history.replaceState({}, '', window.location.pathname);
      return tokens.access_token;
    } catch (error) {
      console.error('Error decodificando tokens:', error);
    }
  }
  
  return null;
}

export async function crearEventoEnCalendar(evento: {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  attendees?: string[];
}, contacto?: {
  nombre?: string;
  correo?: string;
  telefono?: string;
}): Promise<{ id: string; htmlLink: string }> {
  const tokens = obtenerTokensGuardados();
  if (!tokens) {
    throw new Error('No autenticado - por favor conecta tu Google Calendar');
  }

  const response = await fetchAPI<{
    id: string;
    htmlLink: string;
  }>('/calendar/create-event', {
    method: 'POST',
    body: JSON.stringify({ tokens, evento, contacto }),
  });

  if (!response) {
    throw new Error('Error al crear evento en Google Calendar');
  }

  return response;
}

export async function actualizarEventoEnCalendar(eventId: string, evento: {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  attendees?: string[];
}, contacto?: {
  nombre?: string;
  correo?: string;
  telefono?: string;
}): Promise<{ id: string; htmlLink: string }> {
  const tokens = obtenerTokensGuardados();
  if (!tokens) {
    throw new Error('No autenticado - por favor conecta tu Google Calendar');
  }

  const response = await fetchAPI<{
    id: string;
    htmlLink: string;
  }>('/calendar/update-event', {
    method: 'PUT',
    body: JSON.stringify({ tokens, eventId, evento, contacto }),
  });

  if (!response) {
    throw new Error('Error al actualizar evento en Google Calendar');
  }

  return response;
}

export async function eliminarEventoEnCalendar(eventId: string, contacto?: {
  nombre?: string;
  correo?: string;
  telefono?: string;
}, evento?: {
  summary?: string;
  description?: string;
  location?: string;
  startDateTime?: string;
  endDateTime?: string;
}): Promise<void> {
  const tokens = obtenerTokensGuardados();
  if (!tokens) {
    throw new Error('No autenticado - por favor conecta tu Google Calendar');
  }

  await fetchAPI<void>('/calendar/delete-event', {
    method: 'DELETE',
    body: JSON.stringify({ tokens, eventId, contacto, evento }),
  });
}

export async function generarLinkWhatsApp(contacto: {
  nombre?: string;
  correo?: string;
  telefono?: string;
}, evento: {
  summary?: string;
  description?: string;
  location?: string;
  startDateTime?: string;
  endDateTime?: string;
}, tipo: 'AGENDADA' | 'ACTUALIZADA' | 'CANCELADA' = 'AGENDADA'): Promise<{ urlWame: string; mensaje: string; telefono: string }> {
  const response = await fetchAPI<{
    urlWame: string;
    mensaje: string;
    telefono: string;
    nombre: string;
  }>('/calendar/generar-whatsapp', {
    method: 'POST',
    body: JSON.stringify({ contacto, evento, tipo }),
  });

  if (!response) {
    throw new Error('Error al generar link WhatsApp');
  }

  return {
    urlWame: response.urlWame,
    mensaje: response.mensaje,
    telefono: response.telefono,
  };
}
