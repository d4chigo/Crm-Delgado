/**
 * Tipos relacionados con contactos
 */

export interface Contacto {
  id: string
  nombre: string
  email: string
  telefono: string
  empresa?: string
  puesto?: string
  ubicacion?: string
  fuente: FuenteContacto
  etiquetas?: string[]
  notas?: string
  creadoEn: Date
  actualizadoEn?: Date
  creadoPor?: string
}

export enum FuenteContacto {
  MANUAL = 'manual',
  GOOGLE = 'google',
  IMPORT = 'import',
  FORM = 'form',
  REFERRAL = 'referral',
  SOCIAL = 'social'
}

export interface DatosFormularioContacto {
  nombre: string
  email: string
  telefono: string
  empresa?: string
  puesto?: string
  ubicacion?: string
  notas?: string
  etiquetas?: string[]
}

export interface FiltrosContacto {
  busqueda?: string
  fuente?: FuenteContacto
  etiquetas?: string[]
  ubicacion?: string
  fechaDesde?: Date
  fechaHasta?: Date
}

export interface EstadisticasContacto {
  total: number
  porFuente: Record<FuenteContacto, number>
  agregadosRecientemente: number
  convertidos: number
}

export type CampoOrdenContacto = 'nombre' | 'email' | 'creadoEn' | 'empresa'
