/**
 * Tipos relacionados con proyectos inmobiliarios
 * Sincronizado con schema Prisma
 */

import { Etiqueta } from './etiqueta.types'
import { Contacto } from './contacto.types'

export interface Proyecto {
  id: string
  nombre: string
  descripcion?: string
  imagen?: string
  precio?: number
  ubicacion?: string
  estado: EstadoProyecto
  activo: boolean
  creadoEn: Date
  actualizadoEn: Date
  usuarioId: string
  etiquetas?: ProyectoEtiqueta[]
  clientes?: ProyectoCliente[]
}

export interface ProyectoEtiqueta {
  proyectoId: string
  etiquetaId: string
  asignadoEn: Date
  etiqueta: Etiqueta
}

export interface ProyectoCliente {
  proyectoId: string
  clienteId: string
  asociadoEn: Date
  notas?: string
  cliente: Contacto
}

export enum EstadoProyecto {
  DISPONIBLE = 'DISPONIBLE',
  RESERVADO = 'RESERVADO',
  VENDIDO = 'VENDIDO',
  CONSTRUCCION = 'CONSTRUCCION',
  FINALIZADO = 'FINALIZADO'
}

export interface DatosFormularioProyecto {
  nombre: string
  descripcion?: string
  imagen?: string
  precio?: number
  ubicacion?: string
  estado: EstadoProyecto
  etiquetaIds?: string[]
}

export interface DatosAsociarCliente {
  clienteId: string
  notas?: string
}

export interface FiltrosProyecto {
  busqueda?: string
  estado?: EstadoProyecto
  etiquetaId?: string
  activo?: boolean
}

export type CampoOrdenProyecto = 'nombre' | 'ubicacion' | 'precio' | 'creadoEn'
