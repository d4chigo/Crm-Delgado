/**
 * Servicio para consultar DNI usando APIs.net.pe
 * Documentación: https://apis.net.pe/consulta-dni-api.html
 */

interface RespuestaDNI {
  dni: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  codVerifica: string
}

interface ErrorAPIDNI {
  success: boolean
  message: string
}

export class DNIService {
  private readonly API_URL = 'https://dniruc.apisperu.com/api/v1/dni'
  private readonly API_TOKEN: string

  constructor() {
    this.API_TOKEN = process.env.DNI_API_TOKEN || ''
    
    if (!this.API_TOKEN) {
      console.warn('⚠️ DNI_API_TOKEN no configurado. La consulta de DNI no funcionará.')
    }
  }

  /**
   * Consulta información de un DNI en la API de RENIEC
   * @param dni - Número de DNI (8 dígitos)
   * @returns Datos de la persona o null si no se encuentra
   */
  async consultarDNI(dni: string): Promise<RespuestaDNI | null> {
    try {
      // Validar formato DNI
      if (!this.validarFormatoDNI(dni)) {
        throw new Error('El DNI debe tener 8 dígitos')
      }

      // Verificar que el token esté configurado
      if (!this.API_TOKEN) {
        throw new Error('API Token no configurado. Configure DNI_API_TOKEN en .env')
      }

      // Realizar consulta a la API
      const url = `${this.API_URL}/${dni}?token=${this.API_TOKEN}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      // Verificar respuesta
      if (!response.ok) {
        if (response.status === 404) {
          return null // DNI no encontrado
        }
        throw new Error(`Error en la API: ${response.status} ${response.statusText}`)
      }

      const data: any = await response.json()

      // Verificar si la respuesta tiene error
      if ('success' in data && !data.success) {
        const errorData = data as ErrorAPIDNI
        throw new Error(errorData.message || 'Error al consultar DNI')
      }

      // Retornar datos
      return data as RespuestaDNI

    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido al consultar DNI')
    }
  }

  /**
   * Valida que el DNI tenga el formato correcto
   * @param dni - DNI a validar
   * @returns true si es válido, false si no
   */
  private validarFormatoDNI(dni: string): boolean {
    // DNI debe ser exactamente 8 dígitos numéricos
    const regex = /^\d{8}$/
    return regex.test(dni)
  }

  /**
   * Formatea los datos de la API al formato del CRM
   * @param datos - Datos de la API
   * @returns Objeto con nombre y apellido formateados
   */
  formatearDatos(datos: RespuestaDNI) {
    return {
      dni: datos.dni,
      nombre: datos.nombres.trim(),
      apellido: `${datos.apellidoPaterno.trim()} ${datos.apellidoMaterno.trim()}`.trim(),
      apellidoPaterno: datos.apellidoPaterno.trim(),
      apellidoMaterno: datos.apellidoMaterno.trim(),
    }
  }
}

export const dniService = new DNIService()
