export type EtapaPipeline =
  | 'LEAD'
  | 'CONTACTO'
  | 'VISITA'
  | 'NEGOCIACION'
  | 'CIERRE'
  | 'GANADO'
  | 'PERDIDO';

export interface OportunidadCliente {
  id: string;
  clienteId: string;
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
  cliente?: {
    id: string;
    nombre: string;
    apellido?: string;
    correo?: string;
    telefono?: string;
    empresa?: string;
    proyectos?: Array<{
      proyecto: {
        id: string;
        nombre: string;
        estado: string;
      };
    }>;
  };
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
