import { fetchAPI } from './config';

export type EventoCalendario = {
  id: string;
  resumen: string;
  descripcion?: string | null;
  ubicacion?: string | null;
  inicio: string; // ISO
  fin: string; // ISO
  todoElDia: boolean;
};

class CalendarService {
  async getAuthUrl(): Promise<string> {
    const data = await fetchAPI<{ authUrl: string }>(`/calendar/google/url`);
    return data.authUrl;
  }

  async sync(): Promise<void> {
    await fetchAPI(`/calendar/sync`, { method: 'POST' });
  }

  async list(): Promise<EventoCalendario[]> {
    const data = await fetchAPI<{ eventos: EventoCalendario[] }>(`/calendar/events`);
    return data.eventos || [];
  }
}

export const calendarService = new CalendarService();
