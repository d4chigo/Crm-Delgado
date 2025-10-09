/**
 * Servicio para consultar DNI usando decolecta.com
 * Documentación: https://api.decolecta.com/
 */

interface RespuestaDNI {
  dni: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  codVerifica?: string
}

interface ErrorAPIDNI {
  success: boolean
  message: string
}

export class DNIService {
  // URL para decolecta.com
  private readonly API_URL = 'https://api.decolecta.com/v1'
  private readonly API_TOKEN: string

  constructor() {
    this.API_TOKEN = process.env.DNI_API_TOKEN || ''
    
    if (!this.API_TOKEN) {
      console.warn('⚠️ DNI_API_TOKEN no configurado. La consulta de DNI no funcionará.')
    } else {
      console.log('✅ DNI_API_TOKEN configurado correctamente')
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

      // Consulta a decolecta.com (formato: /v1/reniec/dni?numero=DNI)
      const url = `${this.API_URL}/reniec/dni?numero=${dni}`
      console.log('🔍 Consultando DNI:', dni)
      console.log('📡 URL:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.API_TOKEN}`,
        },
      })

      console.log('📊 Status:', response.status)

      // Verificar respuesta
      if (!response.ok) {
        if (response.status === 404) {
          return null // DNI no encontrado
        }
        const errorText = await response.text()
        console.log('❌ Error response:', errorText)
        throw new Error(`Error en la API: ${response.status} ${response.statusText}`)
      }

      const data: any = await response.json()
      console.log('📊 Respuesta de API DNI:', JSON.stringify(data, null, 2))

      // decolecta.com retorna: { first_name, first_last_name, second_last_name, document_number }
      if (!data.document_number) {
        throw new Error('Respuesta inválida de la API')
      }

      // Retornar datos en el formato esperado por nuestro sistema
      return {
        dni: data.document_number,
        nombres: data.first_name,
        apellidoPaterno: data.first_last_name,
        apellidoMaterno: data.second_last_name,
      } as RespuestaDNI

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
