/**
 * Servicio para consultar DNI
 */

import authService from './auth.service'

interface RespuestaDNI {
  dni: string
  nombre: string
  apellido: string
  apellidoPaterno: string
  apellidoMaterno: string
}

interface RespuestaAPI {
  exito: boolean
  mensaje: string
  datos?: RespuestaDNI
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const dniService = {
  /**
   * Consulta un DNI en RENIEC
   * @param dni - Número de DNI (8 dígitos)
   * @returns Datos de la persona
   */
  async consultarDNI(dni: string): Promise<RespuestaDNI> {
    const token = authService.obtenerToken()
    
    if (!token) {
      throw new Error('No hay sesión activa')
    }

    const response = await fetch(`${API_URL}/dni/${dni}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data: RespuestaAPI = await response.json()

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al consultar DNI')
    }

    if (!data.exito || !data.datos) {
      throw new Error('DNI no encontrado')
    }

    return data.datos
  },

  /**
   * Valida el formato de un DNI
   * @param dni - DNI a validar
   * @returns true si es válido
   */
  validarFormato(dni: string): boolean {
    return /^\d{8}$/.test(dni)
  },
}
