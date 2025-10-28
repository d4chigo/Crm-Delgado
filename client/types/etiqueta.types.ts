/**
 * Tipos relacionados con etiquetas
 */

export interface Etiqueta {
  id: string
  nombre: string
  color: string
  descripcion?: string
  icono?: string
  activa: boolean
  orden: number
  creadoEn: string
  actualizadoEn: string
}

export interface CrearEtiquetaDTO {
  nombre: string
  color: string
  descripcion?: string
  icono?: string
}

export interface AsignarEtiquetasDTO {
  etiquetaIds: string[]
}
