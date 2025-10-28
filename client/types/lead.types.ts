/**
 * Tipos relacionados con leads (prospectos)
 */

export interface Lead {
  id: string
  idContacto?: string
  nombre: string
  email: string
  telefono: string
  idProyecto?: string
  nombreProyecto?: string
  estado: EstadoLead
  puntuacion: number
  temperatura: TemperaturaLead
  fuente: FuenteLead
  presupuesto?: number
  notas?: string
  ultimoContacto?: Date
  proximoSeguimiento?: Date
  asignadoA?: string
  creadoEn: Date
  actualizadoEn?: Date
}

export enum EstadoLead {
  NUEVO = 'nuevo',
  CONTACTADO = 'contactado',
  CALIFICADO = 'calificado',
  PROPUESTA = 'propuesta',
  NEGOCIACION = 'negociacion',
  GANADO = 'ganado',
  PERDIDO = 'perdido'
}

export enum TemperaturaLead {
  FRIO = 'frio',
  TIBIO = 'tibio',
  CALIENTE = 'caliente'
}

export enum FuenteLead {
  SITIO_WEB = 'sitio_web',
  REFERIDO = 'referido',
  REDES_SOCIALES = 'redes_sociales',
  PUBLICIDAD = 'publicidad',
  EVENTO = 'evento',
  LLAMADA_FRIA = 'llamada_fria',
  OTRO = 'otro'
}

export interface DatosFormularioLead {
  nombre: string
  email: string
  telefono: string
  idProyecto?: string
  fuente: FuenteLead
  presupuesto?: number
  notas?: string
}

export interface FiltrosLead {
  busqueda?: string
  estado?: EstadoLead
  temperatura?: TemperaturaLead
  fuente?: FuenteLead
  idProyecto?: string
  asignadoA?: string
  puntuacionMin?: number
  puntuacionMax?: number
  fechaDesde?: Date
  fechaHasta?: Date
}

export interface EstadisticasLead {
  total: number
  porEstado: Record<EstadoLead, number>
  porTemperatura: Record<TemperaturaLead, number>
  tasaConversion: number
  puntuacionPromedio: number
}

export type CampoOrdenLead = 'nombre' | 'puntuacion' | 'creadoEn' | 'ultimoContacto'
