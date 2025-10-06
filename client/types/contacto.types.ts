/**
 * Tipos relacionados con contactos
 */

// Enums
export enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  OTRO = 'OTRO'
}

export enum TipoContacto {
  CONTACTO = 'CONTACTO',
  LEAD = 'LEAD',
  CLIENTE = 'CLIENTE'
}

// Interfaz principal de Contacto
export interface Contacto {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  dni?: string;
  sexo?: Sexo;
  fechaNacimiento?: string;
  edad?: number;
  tipo: TipoContacto;
  creadoEn: string;
  actualizadoEn: string;
  usuarioId: string;
}

// DTOs para crear y actualizar
export interface CrearContactoDTO {
  nombre: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  dni?: string;
  sexo?: Sexo;
  fechaNacimiento?: string;
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
  fechaNacimiento?: string;
  tipo?: TipoContacto;
}

// Filtros de búsqueda
export interface FiltrosContacto {
  tipo?: TipoContacto;
  ciudad?: string;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}

// Respuesta paginada
export interface RespuestaContactos {
  contactos: Contacto[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

// Estadísticas
export interface EstadisticasContactos {
  totalContactos: number;
  totalLeads: number;
  totalClientes: number;
  total: number;
}

// Datos del formulario
export interface DatosFormularioContacto {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  dni: string;
  sexo: Sexo | '';
  fechaNacimiento: string;
}