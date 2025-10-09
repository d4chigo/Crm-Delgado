import { API_URL } from './config'

export interface Etiqueta {
  id: string
  nombre: string
  color: string
  descripcion?: string
  icono?: string
  creadoEn: string
  actualizadoEn: string
}

/**
 * Servicio para gestionar etiquetas
 */
export const etiquetaService = {
  /**
   * Obtener todas las etiquetas disponibles
   */
  async obtenerTodas(): Promise<Etiqueta[]> {
    const token = localStorage.getItem('crm_token')
    
    if (!token) {
      throw new Error('No hay sesión activa')
    }
    
    const response = await fetch(`${API_URL}/etiquetas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Error al obtener las etiquetas')
    }

    const resultado = await response.json()
    // El backend retorna { exito: true, datos: [...] }
    return resultado.datos || []
  },

  /**
   * Obtener etiquetas de un contacto específico
   */
  async obtenerDeContacto(contactoId: string): Promise<Etiqueta[]> {
    const token = localStorage.getItem('crm_token')
    
    if (!token) {
      throw new Error('No hay sesión activa')
    }
    
    const response = await fetch(`${API_URL}/etiquetas/contacto/${contactoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Error al obtener las etiquetas del contacto')
    }

    const resultado = await response.json()
    // El backend retorna { exito: true, datos: [...] }
    return resultado.datos || []
  },

  /**
   * Asignar etiquetas a un contacto
   */
  async asignarAContacto(contactoId: string, etiquetasIds: string[]): Promise<void> {
    const token = localStorage.getItem('crm_token')
    
    if (!token) {
      throw new Error('No hay sesión activa')
    }
    
    const response = await fetch(`${API_URL}/etiquetas/contacto/${contactoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ etiquetasIds }),
    })

    if (!response.ok) {
      throw new Error('Error al asignar etiquetas al contacto')
    }
  },
}
