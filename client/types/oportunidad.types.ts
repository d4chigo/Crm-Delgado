export type EtapaPipeline =
  | 'LEAD'
  | 'CONTACTO'
  | 'VISITA'
  | 'NEGOCIACION'
  | 'CIERRE'
  | 'GANADO'
  | 'PERDIDO'
  | 'FIDELIZACION'
  | 'CIERRE_GANADO'
  | 'CIERRE_PERDIDO'
  | 'CONTACTO_INICIAL';

export interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
  descripcion?: string;
  icono?: string;
}

export interface ContactoConEtiquetas {
  id: string;
  nombre: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  empresa?: string;
  etiquetasRel?: Array<{
    etiqueta: Etiqueta;
  }>;
  proyectos?: Array<{
    proyecto: {
      id: string;
      nombre: string;
      estado: string;
    };
  }>;
}

export interface OportunidadCliente {
  id: string;
  clienteId: string;
  leadId?: string;
  titulo: string;
  proyecto?: string;
  propiedad?: string;
  etapa: EtapaPipeline;
  valor?: number;
  probabilidad?: number;
  proximaAccion?: string;
  ultimaActividad: string;
  notas?: string;
  creadoEn: string;
  actualizadoEn: string;
  usuarioId: string;
  cliente?: ContactoConEtiquetas;
  lead?: ContactoConEtiquetas;
}

export interface CrearOportunidadDTO {
  clienteId: string;
  titulo: string;
  proyecto?: string;
  propiedad?: string;
  etapa?: EtapaPipeline;
  valor?: number;
  probabilidad?: number;
  proximaAccion?: string;
  notas?: string;
}

export interface ActualizarOportunidadDTO {
  titulo?: string;
  proyecto?: string;
  propiedad?: string;
  etapa?: EtapaPipeline;
  valor?: number;
  probabilidad?: number;
  proximaAccion?: string;
  notas?: string;
}

export interface FiltrosOportunidad {
  clienteId?: string;
  etapa?: EtapaPipeline;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}

export interface EstadisticasOportunidad {
  total: number;
  totalValor: number;
  valorGanado: number;
  valorPipeline: number;
  porEtapa: {
    etapa: EtapaPipeline;
    cantidad: number;
    valor: number;
  }[];
}

export interface RespuestaOportunidades {
  oportunidades: OportunidadCliente[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}
