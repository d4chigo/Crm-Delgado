/**
 * Tipos relacionados con contactos
 */

// Enums
export enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO'
}

export enum TipoContacto {
  CONTACTO = 'CONTACTO',
  LEAD = 'LEAD',
  CLIENTE = 'CLIENTE'
}

export enum EstadoLead {
  NUEVO = 'NUEVO',
  CONTACTADO = 'CONTACTADO',
  CALIFICADO = 'CALIFICADO',
  NEGOCIACION = 'NEGOCIACION',
  PROPUESTA = 'PROPUESTA',
  GANADO = 'GANADO',
  PERDIDO = 'PERDIDO',
  EN_ESPERA = 'EN_ESPERA'
}

export enum Prioridad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE'
}

// Interfaz para la relación Lead-Cliente
export interface LeadCliente {
  leadId: string;
  clienteId: string;
  asociadoEn: string;
  notas?: string;
  estado?: string;
  cliente?: Contacto;
}

// Interfaz principal de Contacto
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
  fechaNacimiento?: string;
  edad?: number;
  tipo: TipoContacto;
  
  // Información profesional
  empresa?: string;
  cargo?: string;
  
  // Información comercial (Leads)
  presupuesto?: number;
  estadoLead?: EstadoLead;
  prioridad?: Prioridad;
  fuente?: string;
  probabilidad?: number;
  
  // Fechas de seguimiento
  fechaSeguimiento?: string;
  fechaConversion?: string;
  
  // Notas
  notas?: string;
  intereses?: string;
  
  // Ubicación UBIGEO
  departamento?: string;
  provincia?: string;
  distrito?: string;
  
  // Etiquetas
  etiquetas?: Array<{
    etiqueta: {
      id: string;
      nombre: string;
      color: string;
      descripcion?: string;
      icono?: string;
    };
  }>;
  
  // Clientes asociados (para leads)
  clientesAsociados?: LeadCliente[];
  
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
  
  // Información profesional
  empresa?: string;
  cargo?: string;
  
  // Información comercial
  presupuesto?: number;
  estadoLead?: EstadoLead;
  prioridad?: Prioridad;
  fuente?: string;
  probabilidad?: number;
  
  // Fechas
  fechaSeguimiento?: string;
  
  // Notas
  notas?: string;
  intereses?: string;
  
  // Ubicación
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
  fechaNacimiento?: string;
  tipo?: TipoContacto;
  
  // Información profesional
  empresa?: string;
  cargo?: string;
  
  // Información comercial
  presupuesto?: number;
  estadoLead?: EstadoLead;
  prioridad?: Prioridad;
  fuente?: string;
  probabilidad?: number;
  
  // Fechas
  fechaSeguimiento?: string;
  
  // Notas
  notas?: string;
  intereses?: string;
  
  // Ubicación
  departamento?: string;
  provincia?: string;
  distrito?: string;
}

// Filtros de búsqueda
export interface FiltrosContacto {
  tipo?: TipoContacto;
  ciudad?: string;
  busqueda?: string;
  pagina?: number;
  limite?: number;
  estadoLead?: EstadoLead;
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

// DTO para asociar cliente a lead
export interface AsociarClienteDTO {
  clienteId: string;
  notas?: string;
  estado?: string;
}

// DTO para actualizar asociación
export interface ActualizarAsociacionDTO {
  notas?: string;
  estado?: string;
}