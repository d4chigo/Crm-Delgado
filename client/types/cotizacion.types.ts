/**
 * Tipos relacionados con cotizaciones
 */

import type { Moneda } from './proyecto.types'

export interface Cotizacion {
  id: string
  numeroCotizacion: string
  idLead: string
  nombreLead: string
  idProyecto: string
  nombreProyecto: string
  tipoUnidad?: string
  numeroUnidad?: string
  precioBase: number
  descuento?: number
  tipoDescuento?: TipoDescuento
  precioFinal: number
  moneda: Moneda
  planPago?: PlanPago
  estado: EstadoCotizacion
  validoHasta: Date
  notas?: string
  elementos?: ElementoCotizacion[]
  creadoPor: string
  creadoEn: Date
  actualizadoEn?: Date
}

export interface ElementoCotizacion {
  id: string
  descripcion: string
  cantidad: number
  precioUnitario: number
  total: number
}

export enum EstadoCotizacion {
  BORRADOR = 'borrador',
  ENVIADO = 'enviado',
  VISTO = 'visto',
  ACEPTADO = 'aceptado',
  RECHAZADO = 'rechazado',
  EXPIRADO = 'expirado'
}

export enum TipoDescuento {
  PORCENTAJE = 'porcentaje',
  FIJO = 'fijo'
}

export interface PlanPago {
  tipo: TipoPlanPago
  pagoInicial: number
  cuotas?: number
  montoCuota?: number
  descripcion?: string
}

export enum TipoPlanPago {
  CONTADO = 'contado',
  FINANCIADO = 'financiado',
  PERSONALIZADO = 'personalizado'
}

export interface DatosFormularioCotizacion {
  idLead: string
  idProyecto: string
  tipoUnidad?: string
  numeroUnidad?: string
  precioBase: number
  descuento?: number
  tipoDescuento?: TipoDescuento
  moneda: Moneda
  planPago?: PlanPago
  validoHasta: Date
  notas?: string
  elementos?: Omit<ElementoCotizacion, 'id'>[]
}

export interface FiltrosCotizacion {
  busqueda?: string
  estado?: EstadoCotizacion
  idProyecto?: string
  idLead?: string
  fechaDesde?: Date
  fechaHasta?: Date
  precioMin?: number
  precioMax?: number
}

export interface EstadisticasCotizacion {
  total: number
  porEstado: Record<EstadoCotizacion, number>
  valorTotal: number
  valorPromedio: number
  tasaConversion: number
}

export type CampoOrdenCotizacion = 'numeroCotizacion' | 'precioFinal' | 'creadoEn' | 'validoHasta'
