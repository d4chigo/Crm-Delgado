/**
 * Tipos relacionados con autenticación y autorización
 */

export interface Usuario {
  id: string
  email: string
  nombre: string
  rol: RolUsuario
  avatar?: string
  telefono?: string
  creadoEn: Date
  actualizadoEn?: Date
}

export enum RolUsuario {
  ADMIN = 'admin',
  AGENTE = 'agente',
  SUPERVISOR = 'supervisor',
  INVITADO = 'invitado'
}

export interface CredencialesLogin {
  email: string
  contrasenia: string
}

export interface DatosRegistro extends CredencialesLogin {
  nombre: string
  telefono?: string
}

export interface RespuestaAutenticacion {
  usuario: Usuario
  token: string
  tokenActualizacion?: string
  expiraEn: number
}

export interface EstadoAutenticacion {
  usuario: Usuario | null
  token: string | null
  estaAutenticado: boolean
  estaCargando: boolean
}

export interface Sesion {
  usuario: Usuario
  token: string
  expiraEn: Date
}
