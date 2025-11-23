import { TipoCuota, EstadoCotizacion } from '@prisma/client';

export interface CrearCotizacionDTO {
  leadId?: string;
  clienteId?: string;
  nombreProyecto: string;
  tipoInmueble?: string;
  descripcion?: string;
  precioInmueble: number;
  cuotaInicial: number;
  plazoMeses: number;
  tipoCuota: TipoCuota;
  tasaInteresAnual: number;
  permitePostergar?: boolean;
  cuotasPostergables?: number;
  permiteDoble?: boolean;
  cuotasDoblesAnuales?: number;
  permiteCambioFecha?: boolean;
  montoCuotaManual?: number;
  notas?: string;
  observaciones?: string;
  fechaValidez?: Date | string;
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
  montoCuotaManual?: number;
  notas?: string;
  observaciones?: string;
  fechaValidez?: Date | string;
  estado?: EstadoCotizacion;
}

export interface CalculoCuota {
  cuotaMensual: number;
  totalIntereses: number;
  totalPagar: number;
  porcentajeCuotaInicial: number;
  montoFinanciar: number;
}

export interface FiltrosCotizacion {
  contactoId?: string;
  leadId?: string;
  clienteId?: string;
  estado?: EstadoCotizacion;
  tipoCuota?: TipoCuota;
  fechaDesde?: Date | string;
  fechaHasta?: Date | string;
  pagina?: number;
  limite?: number;
}

export interface Cotizacion {
  id: string;
  leadId?: string;
  clienteId?: string;
  numeroReferencia: string;
  nombreProyecto: string;
  tipoInmueble?: string;
  descripcion?: string;
  precioInmueble: number;
  cuotaInicial: number;
  porcentajeCuotaInicial: number;
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
  observaciones?: string;
  fechaValidez?: Date;
  creadoEn: Date;
  actualizadoEn: Date;
}
