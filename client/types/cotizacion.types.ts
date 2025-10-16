/**
 * Tipos relacionados con cotizaciones inmobiliarias
 */

export type TipoCuota = 'FIJA' | 'FLEXIBLE' | 'FLEXIBLE_ESPECIAL';
export type EstadoCotizacion = 'BORRADOR' | 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA' | 'VENCIDA';

export type ModalidadPago = 'FIJA' | 'FLEXIBLE_TRADICIONAL' | 'ESCALONADA' | 'GRACIA' | 'FLEXIBLE_ESPECIAL';

export interface CrearCotizacionDTO {
  contactoId: string;
  nombreProyecto: string;
  tipoInmueble?: string;
  descripcion?: string;
  precioInmueble: number;
  cuotaInicial: number;
  plazoMeses: number;
  tipoCuota: TipoCuota;
  tasaInteresAnual: number;
  // Modalidad avanzada de cuotas (client-side)
  modalidadPago?: ModalidadPago;
  // FLEXIBLE_TRADICIONAL: lista simple de sobrescrituras mes:monto (ej: "3:500\n6:300")
  flexibleOverridesText?: string;
  // ESCALONADA
  escalonadoIncrementoMensual?: number; // monto fijo a añadir cada mes
  escalonadoPorcentaje?: number; // porcentaje a aplicar
  escalonadoCadaMeses?: number; // cada cuantos meses aplicar el porcentaje
  // GRACIA
  periodoGraciaTipo?: 'SIN_PAGO' | 'SOLO_INTERES';
  periodoGraciaMeses?: number;
  // FLEXIBLE_ESPECIAL (ya existían campos, se reusan):
  frecuenciaCuotaEspecial?: 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
  cuotaEspecialTipo?: 'FIJO' | 'PORCENTAJE';
  cuotaEspecialValor?: number;
  permitePostergar?: boolean;
  cuotasPostergables?: number;
  permiteDoble?: boolean;
  cuotasDoblesAnuales?: number;
  permiteCambioFecha?: boolean;
  notas?: string;
  fechaValidez?: string;
}

export interface ActualizarCotizacionDTO {
  nombreProyecto?: string;
  tipoInmueble?: string;
  descripcion?: string;
  precioInmueble?: number;
  cuotaInicial?: number;
  plazoMeses?: number;
  tipoCuota?: TipoCuota;
  tasaInteresAnual?: number;
  permitePostergar?: boolean;
  cuotasPostergables?: number;
  permiteDoble?: boolean;
  cuotasDoblesAnuales?: number;
  permiteCambioFecha?: boolean;
  notas?: string;
  fechaValidez?: string;
}

export interface Cotizacion {
  id: string;
  contactoId: string;
  numeroReferencia: string;
  nombreProyecto: string;
  tipoInmueble?: string;
  descripcion?: string;
  precioInmueble: number;
  cuotaInicial: number;
  montoFinanciar: number;
  plazoMeses: number;
  tipoCuota: TipoCuota;
  tasaInteresAnual: number;
  permitePostergar: boolean;
  cuotasPostergables?: number;
  permiteDoble: boolean;
  cuotasDoblesAnuales?: number;
  permiteCambioFecha: boolean;
  cuotaMensualEstimada: number;
  totalIntereses: number;
  totalPagar: number;
  estado: EstadoCotizacion;
  notas?: string;
  fechaValidez?: string;
  creadoEn: string;
  actualizadoEn: string;
  porcentajeCuotaInicial?: number;
  contacto?: {
    id: string;
    nombre: string;
    apellido: string;
    email?: string;
    telefono?: string;
  };
}

export interface FiltrosCotizacion {
  contactoId?: string;
  estado?: EstadoCotizacion;
  tipoCuota?: TipoCuota;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}

export interface RespuestaPaginadaCotizaciones {
  cotizaciones: Cotizacion[];
  paginacion: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export const TIPOS_CUOTA_LABELS: Record<TipoCuota, string> = {
  FIJA: 'Cuota Fija',
  FLEXIBLE: 'Cuota Flexible',
  FLEXIBLE_ESPECIAL: 'Cuota Flexible Especial'
};

export const ESTADOS_COTIZACION_LABELS: Record<EstadoCotizacion, string> = {
  BORRADOR: 'Borrador',
  ENVIADA: 'Enviada',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
  VENCIDA: 'Vencida'
};

export const ESTADOS_COTIZACION_STYLES: Record<EstadoCotizacion, {
  badge: string;
  dot: string;
}> = {
  BORRADOR: {
    badge: 'bg-gray-100 text-gray-800 border-gray-300',
    dot: 'bg-gray-500'
  },
  ENVIADA: {
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    dot: 'bg-blue-500'
  },
  ACEPTADA: {
    badge: 'bg-green-100 text-green-800 border-green-300',
    dot: 'bg-green-500'
  },
  RECHAZADA: {
    badge: 'bg-red-100 text-red-800 border-red-300',
    dot: 'bg-red-500'
  },
  VENCIDA: {
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    dot: 'bg-orange-500'
  }
};
