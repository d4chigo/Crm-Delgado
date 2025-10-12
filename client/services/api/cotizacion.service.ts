import axios from 'axios';
import type { 
  CrearCotizacionDTO,
  ActualizarCotizacionDTO,
  Cotizacion, 
  FiltrosCotizacion,
  RespuestaPaginadaCotizaciones,
  EstadoCotizacion
} from '@/types/cotizacion.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Crear instancia específica de axios para cotizaciones
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Configurar interceptor para incluir token y loguear
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('crm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Cotizaciones] Token enviado:', token);
    } else {
      console.error('[Cotizaciones] No hay token en localStorage');
      throw new Error('No hay token de autenticación. Inicia sesión.');
    }
  }
  return config;
});

export const cotizacionService = {
  /**
   * Generar cronograma de pagos (amortización francesa)
   */
  calcularCronogramaPagos(
    monto: number,
    tasaAnual: number,
    plazoMeses: number
  ) {
    if (monto <= 0 || tasaAnual < 0 || plazoMeses <= 0) return [];
    const tasaMensual = tasaAnual / 100 / 12;
    const cuota = this.calcularCuotaMensual(monto, tasaAnual, plazoMeses);
    let saldo = monto;
    const cronograma = [];
    for (let mes = 1; mes <= plazoMeses; mes++) {
      const interes = Math.round(saldo * tasaMensual * 100) / 100;
      const capital = Math.round((cuota - interes) * 100) / 100;
      saldo = Math.round((saldo - capital) * 100) / 100;
      cronograma.push({
        mes,
        cuota,
        interes,
        capital,
        saldo: saldo < 0.01 ? 0 : saldo
      });
    }
    return cronograma;
  },
  /**
   * Crear una nueva cotización
   */
  async crear(datos: CrearCotizacionDTO): Promise<Cotizacion> {
    try {
  const response = await axiosInstance.post('cotizaciones', datos);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.mensaje || 'Error al crear cotización'
      );
    }
  },

  /**
   * Obtener lista de cotizaciones con filtros y paginación
   */
  async obtener(filtros: FiltrosCotizacion = {}): Promise<RespuestaPaginadaCotizaciones> {
    try {
  const response = await axiosInstance.get('cotizaciones', {
        params: filtros
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.mensaje || 'Error al obtener cotizaciones'
      );
    }
  },

  /**
   * Obtener cotización por ID
   */
  async obtenerPorId(id: string): Promise<Cotizacion> {
    try {
  const response = await axiosInstance.get(`cotizaciones/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.mensaje || 'Error al obtener cotización'
      );
    }
  },

  /**
   * Obtener todas las cotizaciones de un contacto (lead o cliente)
   */
  async obtenerPorContacto(contactoId: string): Promise<Cotizacion[]> {
    try {
      const response = await axiosInstance.get(
        `cotizaciones/contacto/${contactoId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.mensaje || 'Error al obtener cotizaciones del contacto'
      );
    }
  },

  /**
   * Actualizar cotización (solo si está en estado BORRADOR)
   */
  async actualizar(
    id: string, 
    datos: ActualizarCotizacionDTO
  ): Promise<Cotizacion> {
    try {
      const response = await axiosInstance.put(
        `cotizaciones/${id}`, 
        datos
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.mensaje || 'Error al actualizar cotización'
      );
    }
  },

  /**
   * Cambiar estado de la cotización
   */
  async cambiarEstado(
    id: string, 
    estado: EstadoCotizacion
  ): Promise<Cotizacion> {
    try {
      const response = await axiosInstance.patch(
        `cotizaciones/${id}/estado`,
        { estado }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.mensaje || 'Error al cambiar estado'
      );
    }
  },

  /**
   * Eliminar cotización
   */
  async eliminar(id: string): Promise<void> {
    try {
  await axiosInstance.delete(`cotizaciones/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.mensaje || 'Error al eliminar cotización'
      );
    }
  },

  /**
   * Calcular cuota mensual (utilidad local)
   */
  calcularCuotaMensual(
    monto: number,
    tasaAnual: number,
    plazoMeses: number
  ): number {
    if (monto <= 0 || tasaAnual <= 0 || plazoMeses <= 0) return 0;
    
    const tasaMensual = tasaAnual / 100 / 12;
    const factor = Math.pow(1 + tasaMensual, plazoMeses);
    const cuota = monto * (tasaMensual * factor) / (factor - 1);
    
    return Math.round(cuota * 100) / 100;
  },

  /**
   * Calcular totales (utilidad local)
   */
  calcularTotales(
    precioInmueble: number,
    cuotaInicial: number,
    tasaAnual: number,
    plazoMeses: number
  ) {
    const montoFinanciar = precioInmueble - cuotaInicial;
    const cuotaMensual = this.calcularCuotaMensual(
      montoFinanciar,
      tasaAnual,
      plazoMeses
    );
    const totalPagar = cuotaMensual * plazoMeses;
    const totalIntereses = totalPagar - montoFinanciar;
    const porcentajeCuotaInicial = (cuotaInicial / precioInmueble) * 100;

    return {
      montoFinanciar,
      cuotaMensual,
      totalPagar,
      totalIntereses,
      porcentajeCuotaInicial: Math.round(porcentajeCuotaInicial * 100) / 100
    };
  }
};
