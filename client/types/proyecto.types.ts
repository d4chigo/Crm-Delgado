/**
 * Tipos relacionados con proyectos inmobiliarios
 */

export interface Proyecto {
  id: string
  nombre: string
  descripcion?: string
  ubicacion: string
  estado: EstadoProyecto
  tipo: TipoProyecto
  totalUnidades: number
  unidadesDisponibles: number
  unidadesVendidas: number
  precioDesde: number
  precioHasta: number
  moneda: Moneda
  amenidades?: string[]
  imagenes?: string[]
  fechaInicio?: Date
  fechaFin?: Date
  creadoEn: Date
  actualizadoEn?: Date
}

export enum EstadoProyecto {
  PLANIFICACION = 'planificacion',
  CONSTRUCCION = 'construccion',
  LISTO = 'listo',
  VENDIENDO = 'vendiendo',
  AGOTADO = 'agotado',
  COMPLETADO = 'completado'
}

export enum TipoProyecto {
  DEPARTAMENTO = 'departamento',
  CASA = 'casa',
  COMERCIAL = 'comercial',
  TERRENO = 'terreno',
  OFICINA = 'oficina',
  MIXTO = 'mixto'
}

export enum Moneda {
  USD = 'USD',
  PEN = 'PEN',
  EUR = 'EUR'
}

export interface DatosFormularioProyecto {
  nombre: string
  descripcion?: string
  ubicacion: string
  estado: EstadoProyecto
  tipo: TipoProyecto
  totalUnidades: number
  precioDesde: number
  precioHasta: number
  moneda: Moneda
  amenidades?: string[]
  fechaInicio?: Date
  fechaFin?: Date
}

export interface FiltrosProyecto {
  busqueda?: string
  estado?: EstadoProyecto
  tipo?: TipoProyecto
  ubicacion?: string
  precioMin?: number
  precioMax?: number
}

export interface EstadisticasProyecto {
  total: number
  porEstado: Record<EstadoProyecto, number>
  porTipo: Record<TipoProyecto, number>
  totalUnidades: number
  unidadesDisponibles: number
  tasaOcupacion: number
}

export type CampoOrdenProyecto = 'nombre' | 'ubicacion' | 'precioDesde' | 'creadoEn'
