/**
 * Tipos relacionados con el dashboard y métricas
 */

import type { LucideIcon } from 'lucide-react'

export interface ElementoNavegacion {
  nombre: string
  href: string
  icono: LucideIcon
}

export interface KPI {
  id: string
  titulo: string
  valor: string | number
  cambio: string
  tendencia: 'arriba' | 'abajo'
  icono: LucideIcon
  color: string
  colorFondo: string
  descripcion?: string
}

export interface DatosGrafico {
  etiqueta: string
  valor: number
  porcentaje?: number
  color?: string
}

export interface DatosSerieTemporal {
  fecha: string
  valor: number
  etiqueta?: string
}

export interface EstadisticasDashboard {
  leadsActivos: number
  propiedadesDisponibles: number
  ventasDelMes: number
  tasaConversion: number
  leadsPorEstado: Record<string, number>
  ventasPorProyecto: DatosGrafico[]
  ventasPorMes: DatosSerieTemporal[]
}

export interface Actividad {
  id: string
  tipo: TipoActividad
  titulo: string
  descripcion: string
  usuario: string
  marcaTiempo: Date
  metadatos?: Record<string, unknown>
}

export enum TipoActividad {
  LEAD_CREADO = 'lead_creado',
  LEAD_ACTUALIZADO = 'lead_actualizado',
  CONTACTO_AGREGADO = 'contacto_agregado',
  COTIZACION_ENVIADA = 'cotizacion_enviada',
  VENTA_COMPLETADA = 'venta_completada',
  REUNION_PROGRAMADA = 'reunion_programada'
}

export interface ElementoNotificacion {
  id: string
  tipo: 'info' | 'exitoso' | 'advertencia' | 'error'
  titulo: string
  mensaje: string
  leido: boolean
  creadoEn: Date
  urlAccion?: string
}

export type TipoPeriodo = 'dia' | 'semana' | 'mes' | 'trimestre' | 'anio'
