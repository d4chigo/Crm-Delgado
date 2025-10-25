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
  return await fetchAPI<{ authUrl: string }>('/calendar/auth-url');
}

export async function obtenerEstadoAutenticacion(): Promise<CalendarAuthStatus> {
  const tokens = obtenerTokensGuardados();
  console.log('[Calendar Service] Tokens guardados:', tokens ? 'presente' : 'no presente');
  return await fetchAPI<CalendarAuthStatus>('/calendar/auth-status', {
    method: 'POST',
    body: JSON.stringify({ tokens }),
  });
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
  const tokens = obtenerTokensGuardados();
  if (!tokens) {
    throw new Error('No autenticado');
  }
  await fetchAPI<void>('/calendar/sync', {
    method: 'POST',
    body: JSON.stringify({ tokens }),
  });
}

export async function listarEventos(): Promise<CalendarEvent[]> {
  const tokens = obtenerTokensGuardados();
  if (!tokens) {
    throw new Error('No autenticado');
  }
  const response = await fetchAPI<CalendarEventsResponse>('/calendar/events', {
    method: 'POST',
    body: JSON.stringify({ tokens }),
  });
  return response.events;
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
