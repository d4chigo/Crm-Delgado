import { Rol } from '@prisma/client';

// ==================== USUARIO ====================
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  avatar?: string;
  telefono?: string;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface UsuarioSinPassword extends Omit<Usuario, 'password'> {}

// ==================== JWT ====================
export interface PayloadJWT {
  usuarioId: string;
  email: string;
  rol: Rol;
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
  email: string;
  password: string;
}

export interface RegistroDTO {
  nombre: string;
  email: string;
  password: string;
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
