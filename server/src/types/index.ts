import { Rol, Sexo, EstadoLead, Prioridad } from '@prisma/client';

// ==================== USUARIO ====================
export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  avatar?: string;
  telefono?: string;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface UsuarioSinPassword extends Omit<Usuario, 'contrasena'> {}

// ==================== JWT ====================
export interface PayloadJWT {
  usuarioId: string;
  email: string; // Se mantiene como 'email' en el JWT por compatibilidad
  rol: Rol | 'CLIENTE'; // Permitir CLIENTE para portal web
}

export interface TokenRespuesta {
  token: string;
  expiraEn: string;
}

// ==================== RESPUESTAS API ====================
export interface RespuestaExito<T = any> {
  exito: true;
  datos: T;
  mensaje?: string;
}

export interface RespuestaError {
  exito: false;
  error: string;
  detalles?: any;
  codigo?: string;
}

// ==================== AUTENTICACIÓN ====================
export interface LoginDTO {
  email: string; // Se recibe como 'email' del frontend
  password: string; // Se recibe como 'password' del frontend
}

export interface RegistroDTO {
  nombre: string;
  email: string; // Se recibe como 'email' del frontend
  password: string; // Se recibe como 'password' del frontend
  telefono?: string;
}

export interface RespuestaLogin {
  usuario: UsuarioSinPassword;
  token: TokenRespuesta;
}

// ==================== REQUEST EXTENDIDO ====================
declare global {
  namespace Express {
    interface Request {
      usuario?: PayloadJWT;
    }
  }
}

// ==================== CONTACTOS ====================
export interface Contacto {
  id: string;
  nombre: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  dni?: string;
  sexo?: Sexo;
  fechaNacimiento?: Date;
  edad?: number; // Campo calculado
  tipo?: 'LEAD' | 'CLIENTE'; // Para compatibilidad
  creadoEn: Date;
  actualizadoEn: Date;
  usuarioId: string;
}

export interface CrearContactoDTO {
  nombre: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  dni?: string;
  sexo?: Sexo;
  fechaNacimiento?: string; // ISO string
  tipo?: 'LEAD' | 'CLIENTE';
  estado?: EstadoLead;
  fuente?: string;
  empresa?: string;
  cargo?: string;
  presupuesto?: number;
  prioridad?: Prioridad;
  probabilidad?: number;
  fechaSeguimiento?: string;
  notas?: string;
  etiquetas?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
}

export interface ActualizarContactoDTO {
  nombre?: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  dni?: string;
  sexo?: Sexo;
  fechaNacimiento?: string; // ISO string
  tipo?: 'LEAD' | 'CLIENTE';
  estado?: EstadoLead; // Para actualizar el estado del lead
  estadoLead?: EstadoLead; // Alias para compatibilidad con frontend
}

export interface FiltrosContacto {
  tipo?: 'LEAD' | 'CLIENTE';
  ciudad?: string;
  busqueda?: string; // Para buscar en nombre, apellido, correo
  estado?: EstadoLead; // NUEVO, CONTACTADO, CALIFICADO, NEGOCIACION, PROPUESTA, GANADO, PERDIDO, EN_ESPERA
  pagina?: number;
  limite?: number;
}

// ==================== COTIZACIONES ====================
export * from './cotizacion.types';
