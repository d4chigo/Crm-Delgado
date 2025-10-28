import { fetchAPI } from './config';
import type { Etiqueta } from '@/types/etiqueta.types';

/**
 * Servicio para gestionar etiquetas
 */
export const etiquetaService = {
  /**
   * Obtener todas las etiquetas disponibles
   */
  async obtenerTodas(): Promise<Etiqueta[]> {
    return fetchAPI<Etiqueta[]>('/etiquetas');
  },

  /**
   * Obtener etiquetas de un contacto específico
   */
  async obtenerDeContacto(contactoId: string): Promise<Etiqueta[]> {
    return fetchAPI<Etiqueta[]>(`/etiquetas/contacto/${contactoId}`);
  },

  /**
   * Asignar etiquetas a un contacto
   */
  async asignarAContacto(contactoId: string, etiquetasIds: string[]): Promise<void> {
    try {
      const token = localStorage.getItem('crm_token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }
      
      await fetchAPI<void>(`/etiquetas/contacto/${contactoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ etiquetaIds: etiquetasIds }),
      });
    } catch (error: any) {
      // El error ya debería venir procesado por fetchAPI, pero en caso de que no, lo relanzamos
      throw new Error(error.message || 'Error al asignar etiquetas');
    }
  },
};

