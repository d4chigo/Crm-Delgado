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
  return null;
}
