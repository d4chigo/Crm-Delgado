/**
 * Tipos comunes utilizados en toda la aplicación
 */

// Tipos de respuesta de API
export interface RespuestaApi<T> {
  datos: T
  mensaje?: string
  exitoso: boolean
}

export interface RespuestaPaginada<T> {
  datos: T[]
  total: number
  pagina: number
  tamanioPagina: number
  totalPaginas: number
}

// Tipos de error
export interface ErrorApi {
  mensaje: string
  codigo?: string
  detalles?: Record<string, unknown>
}

// Tipos de estado
export type EstadoCarga = 'inactivo' | 'cargando' | 'exitoso' | 'error'

export interface EstadoAsincrono<T> {
  datos: T | null
  cargando: boolean
  error: string | null
}

// Tipos de filtros
export interface OpcionesFiltro {
  busqueda?: string
  ordenarPor?: string
  ordenDireccion?: 'asc' | 'desc'
  pagina?: number
  tamanioPagina?: number
}

// Tipos de selección
export interface OpcionSeleccion {
  etiqueta: string
  valor: string
}

// Tipos de notificación
export type TipoNotificacion = 'exitoso' | 'error' | 'advertencia' | 'info'

export interface Notificacion {
  id: string
  tipo: TipoNotificacion
  mensaje: string
  titulo?: string
  duracion?: number
}
