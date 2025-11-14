import { api } from '@/lib/api';

export interface OtroServicio {
  id: number;
  titulo: string;
  descripcion?: string;
  caracteristicas?: string[]; // Lista de características con checkmarks
  imagenes?: string[]; // URLs de imágenes para la galería
  enlaceVideo?: string;
  creadoEn?: Date;
  actualizadoEn?: Date;
}

export const otrosServiciosService = {
  async obtenerTodos(): Promise<OtroServicio[]> {
    try {
      const token = localStorage.getItem('crm_token');
      const url = api('/admin/otros-servicios');
      
      console.log('Obteniendo servicios desde:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Error al obtener los servicios: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Error en otrosServiciosService.obtenerTodos:', error);
      throw error;
    }
  },

  async crear(datos: Omit<OtroServicio, 'id'>): Promise<OtroServicio> {
    const token = localStorage.getItem('crm_token');
    const url = api('/admin/otros-servicios');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al crear el servicio');
    }

    return response.json();
  },

  async actualizar(id: number, datos: Partial<OtroServicio>): Promise<OtroServicio> {
    const token = localStorage.getItem('crm_token');
    const url = api(`/admin/otros-servicios/${id}`);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar el servicio');
    }

    return response.json();
  },

  async eliminar(id: number): Promise<void> {
    const token = localStorage.getItem('crm_token');
    const url = api(`/admin/otros-servicios/${id}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al eliminar el servicio');
    }
  },
};
