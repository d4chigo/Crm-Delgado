import axios from 'axios';
import type { 
  CrearCotizacionDTO,
  ActualizarCotizacionDTO,
  Cotizacion, 
  FiltrosCotizacion,
  RespuestaPaginadaCotizaciones,
  EstadoCotizacion
} from '@/types/cotizacion.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Crear instancia específica de axios para cotizaciones
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Configurar interceptor para incluir token y loguear
import type { InternalAxiosRequestConfig } from 'axios';

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('crm_token');
    if (token) {
      // axios internal headers type expects an object with string values
      config.headers = config.headers ?? {};
      // Normalize assignment to work with Axios headers types
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      console.log('[Cotizaciones] Token enviado:', token);
    } else {
      console.warn('[Cotizaciones] No hay token en localStorage — la petición se enviará sin Authorization');
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
    plazoMeses: number,
    options?: {
      modalidadPago?: 'FIJA' | 'FLEXIBLE_TRADICIONAL' | 'ESCALONADA' | 'GRACIA' | 'FLEXIBLE_ESPECIAL';
      // FLEXIBLE_TRADICIONAL
      flexibleOverridesText?: string; // formato "mes:monto\n..."
      // ESCALONADA
      escalonadoIncrementoMensual?: number;
      escalonadoPorcentaje?: number;
      escalonadoCadaMeses?: number;
      // GRACIA
      periodoGraciaTipo?: 'SIN_PAGO' | 'SOLO_INTERES';
      periodoGraciaMeses?: number;
      // FLEXIBLE_ESPECIAL
      frecuenciaCuotaEspecial?: 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
      cuotaEspecialTipo?: 'FIJO' | 'PORCENTAJE';
      cuotaEspecialValor?: number;
      montoCuotaManual?: number;
    }
  ) {
    if (monto <= 0 || tasaAnual < 0 || plazoMeses <= 0) return [];

    const modalidad = options?.modalidadPago || 'FIJA';
    
    // FLEXIBLE_ESPECIAL_AMORTIZACION: manejo especial - cuota fija + pago especial cada N meses
    if (modalidad === 'FLEXIBLE_ESPECIAL_AMORTIZACION' && options?.frecuenciaCuotaEspecial && options?.cuotaEspecialValor !== undefined) {
      return this.calcularCronogramaFlexibleEspecial(monto, tasaAnual, options.frecuenciaCuotaEspecial, options.cuotaEspecialValor, options.cuotaEspecialTipo, options.montoCuotaManual);
    }
  
  let cuota = this.calcularCuotaMensual(monto, tasaAnual, plazoMeses);
  
  if (options?.montoCuotaManual && options.montoCuotaManual > 0) {
    cuota = options.montoCuotaManual;
  }
  
    let saldo = monto;
    const cronograma: Array<any> = [];

    // Helper to determine special payment months
    const freqToMonths: Record<string, number> = {
      TRIMESTRAL: 3,
      SEMESTRAL: 6,
      ANUAL: 12
    };

    const extraTipo = options?.cuotaEspecialTipo;
    const extraValor = options?.cuotaEspecialValor ?? 0;
    const freq = options?.frecuenciaCuotaEspecial ? freqToMonths[options.frecuenciaCuotaEspecial] : null;

    // parse flexible overrides (FLEXIBLE_TRADICIONAL)
    const overrides: Record<number, number> = {};
    if (options?.flexibleOverridesText) {
      options.flexibleOverridesText.split(/\r?\n/).forEach(line => {
        const parts = line.split(':').map(p => p.trim());
        const m = parseInt(parts[0], 10);
        const v = parseFloat(parts[1]);
        if (!isNaN(m) && !isNaN(v)) overrides[m] = v;
      });
    }

    // grace period tracking
    const graciaMeses = options?.periodoGraciaMeses ?? 0;
    const graciaTipo = options?.periodoGraciaTipo;

    const tasaMensual = tasaAnual === 0 ? 0 : tasaAnual / 100 / 12;

    for (let mes = 1; mes <= plazoMeses; mes++) {
      // interés calculado sobre saldo actual
      const interes = Math.round(saldo * tasaMensual * 100) / 100;
      // cuota base mensual
      let cuotaMes = Math.round(cuota * 100) / 100;
      let pagoEspecial = 0;
      let pagoEspecialAplicado = 0;
      let pagoEspecialNoUtilizado = 0;
      let esCuotaEspecial = false;

      // Handle grace period months first
      if (modalidad === 'GRACIA' && mes <= graciaMeses) {
        if (graciaTipo === 'SIN_PAGO') {
          // No se paga; el interés se capitaliza
          const capital = 0;
          const cuotaRegistro = 0;
          // capitalizar interés
          const nuevoSaldo = Math.round((saldo + interes) * 100) / 100;
          cronograma.push({
            mes,
            cuota: cuotaRegistro,
            cuotaBase: 0,
            pagoEspecial: 0,
            pagoEspecialAplicado: 0,
            pagoEspecialNoUtilizado: 0,
            interes,
            capital,
            saldo: nuevoSaldo,
            esCuotaEspecial: false,
            nota: 'Periodo de gracia (sin pago)'
          });
          saldo = nuevoSaldo;
          // continuar al siguiente mes
          continue;
        }
        if (graciaTipo === 'SOLO_INTERES') {
          // Paga sólo interés
          const capital = 0;
          const cuotaRegistro = interes;
          cronograma.push({
            mes,
            cuota: cuotaRegistro,
            cuotaBase: 0,
            pagoEspecial: 0,
            pagoEspecialAplicado: 0,
            pagoEspecialNoUtilizado: 0,
            interes,
            capital,
            saldo: saldo,
            esCuotaEspecial: false,
            nota: 'Periodo de gracia (solo interés)'
          });
          // saldo no cambia
          continue;
        }
      }

      // FLEXIBLE_TRADICIONAL overrides: if exists an override for this month, use it and recompute remaining cuota
      if (modalidad === 'FLEXIBLE_TRADICIONAL' && overrides[mes] !== undefined) {
        cuotaMes = Math.round(overrides[mes] * 100) / 100;
        // After applying this override, we'll recompute cuota para los meses restantes
        esCuotaEspecial = false;
      }

      // ESCALONADA: ajustar cuotaMes según incremento o porcentaje progresivo
      if (modalidad === 'ESCALONADA') {
        // incremento fijo mensual
        if (options?.escalonadoIncrementoMensual) {
          const inc = options.escalonadoIncrementoMensual;
          cuotaMes = Math.round((cuota + inc * (mes - 1)) * 100) / 100;
        }
        // porcentaje progresivo cada N meses
        if (options?.escalonadoPorcentaje && options?.escalonadoCadaMeses) {
          const bloques = Math.floor((mes - 1) / options.escalonadoCadaMeses);
          const factor = Math.pow(1 + options.escalonadoPorcentaje / 100, bloques);
          cuotaMes = Math.round((cuota * factor) * 100) / 100;
        }
      }

      // Determinar si este mes toca un pago especial
      if ((modalidad === 'FLEXIBLE_ESPECIAL' || (modalidad === 'FIJA' && freq)) && freq && freq > 0 && mes % freq === 0) {
        esCuotaEspecial = true;
        const cuotaBaseRounded = Math.round(cuota * 100) / 100;
        let cuotaFinalEspecial = cuotaBaseRounded;

        if (extraTipo === 'FIJO') {
          cuotaFinalEspecial = Math.round(extraValor * 100) / 100;
        } else if (extraTipo === 'PORCENTAJE') {
          cuotaFinalEspecial = Math.round(cuotaBaseRounded * (extraValor / 100) * 100) / 100;
        }
        
        pagoEspecial = Math.round((cuotaFinalEspecial - cuotaBaseRounded) * 100) / 100;
        pagoEspecialAplicado = pagoEspecial;
        cuotaMes = cuotaFinalEspecial;
      }


      // calcular capital (puede incluir pago especial)
      let capital = Math.round((cuotaMes - interes) * 100) / 100;

      // Si la cuota programada (cuotaMes) es mayor al total adeudado (interes + saldo), ajustar
      const adeudado = Math.round((saldo + interes) * 100) / 100;

      if (options?.montoCuotaManual && options.montoCuotaManual > 0 && mes === plazoMeses) {
        capital = saldo;
        cuotaMes = saldo + interes;
      } else if (cuotaMes > adeudado) {
        // sólo se debe pagar lo que falta (adeudado). Ajustar cuotaMes y capital en consecuencia
        const cuotaOriginal = cuotaMes;
        cuotaMes = adeudado;
        // nuevo capital = cuotaMes - interes (puede ser menor que saldo)
        capital = Math.round((cuotaMes - interes) * 100) / 100;
        // calcular cuánto del pagoEspecial quedó sin usarse
        const cuotaBaseRounded = Math.round(cuota * 100) / 100;
        // La porción aplicada del pago especial es la parte de la cuota final que excede la cuota base
        const aplicado = Math.max(0, Math.min(pagoEspecial, Math.round((cuotaMes - cuotaBaseRounded) * 100) / 100));
        pagoEspecialAplicado = Math.round(aplicado * 100) / 100;
        pagoEspecialNoUtilizado = Math.round((pagoEspecial - pagoEspecialAplicado) * 100) / 100;
      }

      saldo = Math.round((saldo - capital) * 100) / 100;

      // Normalize cuotaBase and ensure applied/unused values are consistent
      const cuotaBaseRounded = Math.round(cuota * 100) / 100;
      if (esCuotaEspecial) {
        // applied is min(pagoEspecial, cuotaMes - cuotaBase)
        const potencialAplicado = Math.max(0, Math.round((cuotaMes - cuotaBaseRounded) * 100) / 100);
        pagoEspecialAplicado = Math.round(Math.min(pagoEspecial, potencialAplicado) * 100) / 100;
        pagoEspecialNoUtilizado = Math.round((pagoEspecial - pagoEspecialAplicado) * 100) / 100;
      } else {
        pagoEspecialAplicado = 0;
        pagoEspecialNoUtilizado = 0;
      }

      cronograma.push({
        mes,
        cuota: cuotaMes,
        cuotaBase: cuotaBaseRounded,
        pagoEspecial,
        pagoEspecialAplicado,
        pagoEspecialNoUtilizado,
        interes,
        capital,
        saldo: saldo < 0.01 ? 0 : saldo,
        esCuotaEspecial
      });

      // Si saldo se hizo cero antes del plazo, truncar el cronograma (amortización anticipada)
      if (saldo <= 0) {
        break;
      }

      // After a special payment, recompute cuota for remaining months SOLO para modalidades que no sean FLEXIBLE_ESPECIAL
      if (esCuotaEspecial && modalidad !== 'FLEXIBLE_ESPECIAL') {
        const mesesRestantes = plazoMeses - mes;
        if (mesesRestantes > 0) {
          cuota = this.calcularCuotaMensual(saldo, tasaAnual, mesesRestantes);
        }
      }

      // After certain events (override applied), recompute cuota for remaining months to keep amortization
      if (modalidad === 'FLEXIBLE_TRADICIONAL' && overrides[mes] !== undefined) {
        const mesesRestantes = plazoMeses - mes;
        if (mesesRestantes > 0) {
          cuota = this.calcularCuotaMensual(saldo, tasaAnual, mesesRestantes);
        }
      }

      // If modalidad was GRACIA and we just finished grace period, recompute cuota for remaining months
      if (modalidad === 'GRACIA' && graciaMeses > 0 && mes === graciaMeses) {
        const mesesRestantes = plazoMeses - mes;
        if (mesesRestantes > 0) {
          cuota = this.calcularCuotaMensual(saldo, tasaAnual, mesesRestantes);
        }
      }
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
        error.response?.data?.mensaje || error.response?.data?.error || error.response?.data?.message || error.message || 'Error al crear cotización'
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
        error.response?.data?.mensaje || error.response?.data?.error || error.response?.data?.message || error.message || 'Error al obtener cotizaciones'
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
        error.response?.data?.mensaje || error.response?.data?.error || error.response?.data?.message || error.message || 'Error al obtener cotización'
      );
    }
  },

  /**
   * Obtener todas las cotizaciones de un contacto (lead o cliente)
   */
  async obtenerPorContacto(contactoId: string): Promise<Cotizacion[]> {
    try {
      const response = await axiosInstance.get(
        `/api/cotizaciones/contacto/${contactoId}`
      );
      return response.data;
    } catch (error: any) {
      console.warn(`[Cotizaciones] No se encontraron cotizaciones para contacto ${contactoId}`);
      return [];
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
        error.response?.data?.mensaje || error.response?.data?.error || error.response?.data?.message || error.message || 'Error al actualizar cotización'
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
        error.response?.data?.mensaje || error.response?.data?.error || error.response?.data?.message || error.message || 'Error al cambiar estado'
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
        error.response?.data?.mensaje || error.response?.data?.error || error.response?.data?.message || error.message || 'Error al eliminar cotización'
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
    if (monto <= 0 || plazoMeses <= 0) return 0;
    
    // Si no hay interés (TEA = 0%), la cuota es simplemente monto / plazo
    if (tasaAnual === 0) {
      return Math.round((monto / plazoMeses) * 100) / 100;
    }
    
    // Con interés, usar fórmula de amortización francesa
    const tasaMensual = tasaAnual / 100 / 12;
    const factor = Math.pow(1 + tasaMensual, plazoMeses);
    const cuota = monto * (tasaMensual * factor) / (factor - 1);
    
    return Math.round(cuota * 100) / 100;
  },

  /**
   * Calcular cuota mensual para FLEXIBLE_ESPECIAL considerando pagos especiales
   */
  calcularCuotaMensualFlexibleEspecial(
    monto: number,
    tasaAnual: number,
    plazoMeses: number,
    frecuenciaMeses: number,
    cuotaEspecialValor: number
  ): number {
    if (monto <= 0 || plazoMeses <= 0) return 0;
    
    // Calcular cuántos pagos especiales habrá
    const cantidadPagosEspeciales = Math.floor(plazoMeses / frecuenciaMeses);
    
    // Monto total a pagar en especiales (sin considerar reinversión de saldo)
    const totalPagosEspeciales = cantidadPagosEspeciales * cuotaEspecialValor;
    
    // Monto restante a amortizar con cuotas regulares
    const montoRegular = monto - totalPagosEspeciales;
    
    // Meses regulares (no especiales)
    const mesesRegulares = plazoMeses - cantidadPagosEspeciales;
    
    if (mesesRegulares <= 0) return 0;
    
    // Calcular cuota mensual para los meses regulares
    if (tasaAnual === 0) {
      return Math.round((montoRegular / mesesRegulares) * 100) / 100;
    }
    
    const tasaMensual = tasaAnual / 100 / 12;
    const factor = Math.pow(1 + tasaMensual, plazoMeses);
    const cuota = montoRegular * (tasaMensual * factor) / (factor - 1);
    
    return Math.round(cuota * 100) / 100;
  },

  /**
   * Calcular cronograma para FLEXIBLE_ESPECIAL: cuota fija base + pago especial cada N meses
   * No recalcula, mantiene patrón constante hasta agotar saldo
   */
  calcularCronogramaFlexibleEspecial(
    monto: number,
    tasaAnual: number,
    frecuenciaCuotaEspecial: 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL',
    cuotaEspecialValor: number,
    cuotaEspecialTipo?: 'FIJO' | 'PORCENTAJE',
    montoCuotaManual?: number
  ) {
    const freqToMonths: Record<string, number> = {
      TRIMESTRAL: 3,
      SEMESTRAL: 6,
      ANUAL: 12
    };

    const freq = freqToMonths[frecuenciaCuotaEspecial];
    let cuotaBase = montoCuotaManual ?? 0;
    
    // Si no hay cuota manual, calcular una razonable
    if (!montoCuotaManual || montoCuotaManual <= 0) {
      cuotaBase = Math.round((monto / (monto > 10000 ? 36 : 24)) * 100) / 100;
    }

    let saldo = monto;
    const cronograma: Array<any> = [];
    const tasaMensual = tasaAnual === 0 ? 0 : tasaAnual / 100 / 12;
    let mes = 1;

    // Continuar hasta agotar el saldo
    while (saldo > 0.01) {
      const interes = Math.round(saldo * tasaMensual * 100) / 100;
      
      // Determinar si este mes es especial (cada N meses)
      const esEspecial = mes % freq === 0;
      
      let cuotaMes = cuotaBase;
      if (esEspecial) {
        if (cuotaEspecialTipo === 'PORCENTAJE') {
          cuotaMes = Math.round(cuotaBase * (1 + cuotaEspecialValor / 100) * 100) / 100;
        } else {
          // FIJO: suma el valor especial
          cuotaMes = Math.round((cuotaBase + cuotaEspecialValor) * 100) / 100;
        }
      }

      // Capital = cuota - interes
      let capital = Math.round((cuotaMes - interes) * 100) / 100;

      // Si el capital calculado es mayor al saldo, ajustar para agotar exactamente
      if (capital > saldo) {
        capital = saldo;
        cuotaMes = Math.round((capital + interes) * 100) / 100;
      }

      saldo = Math.round((saldo - capital) * 100) / 100;
      if (saldo < 0) saldo = 0;

      cronograma.push({
        mes,
        cuota: cuotaMes,
        cuotaBase: cuotaBase,
        pagoEspecial: esEspecial ? cuotaEspecialValor : 0,
        pagoEspecialAplicado: esEspecial ? cuotaEspecialValor : 0,
        pagoEspecialNoUtilizado: 0,
        interes,
        capital,
        saldo,
        esCuotaEspecial: esEspecial
      });

      // Si saldo se agotó, terminar
      if (saldo <= 0) break;

      mes++;
      // Seguridad: no exceder más de 360 meses
      if (mes > 360) break;
    }

    return cronograma;
  },

  /**
   * Calcular totales (utilidad local)
   */
  calcularTotales(
    precioInmueble: number,
    cuotaInicial: number,
    tasaAnual: number,
    plazoMeses: number,
    options?: {
      modalidadPago?: 'FIJA' | 'FLEXIBLE_TRADICIONAL' | 'ESCALONADA' | 'GRACIA' | 'FLEXIBLE_ESPECIAL';
      flexibleOverridesText?: string;
      escalonadoIncrementoMensual?: number;
      escalonadoPorcentaje?: number;
      escalonadoCadaMeses?: number;
      periodoGraciaTipo?: 'SIN_PAGO' | 'SOLO_INTERES';
      periodoGraciaMeses?: number;
      frecuenciaCuotaEspecial?: 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
      cuotaEspecialTipo?: 'FIJO' | 'PORCENTAJE';
      cuotaEspecialValor?: number;
      montoCuotaManual?: number;
    }
  ) {
    const montoFinanciar = precioInmueble - cuotaInicial;
    let cuotaMensual = this.calcularCuotaMensual(
      montoFinanciar,
      tasaAnual,
      plazoMeses
    );

    if (options?.montoCuotaManual && options.montoCuotaManual > 0) {
      cuotaMensual = options.montoCuotaManual;
    }

    // If no special options provided, fallback to simple estimate
    if (!options) {
      const totalPagar = Math.round(cuotaMensual * plazoMeses * 100) / 100;
      const totalIntereses = Math.round((totalPagar - montoFinanciar) * 100) / 100;
      const porcentajeCuotaInicial = (cuotaInicial / precioInmueble) * 100;
      return {
        montoFinanciar,
        cuotaMensual,
        totalPagar,
        totalIntereses,
        porcentajeCuotaInicial: Math.round(porcentajeCuotaInicial * 100) / 100
      };
    }

    // Otherwise generate cronograma and derive totals precisely
    const cronograma = this.calcularCronogramaPagos(
      montoFinanciar,
      tasaAnual,
      plazoMeses,
      options as any
    );

    const totalPagar = Math.round(cronograma.reduce((s: number, p: any) => s + (p.cuota || 0), 0) * 100) / 100;
    const totalIntereses = Math.round(cronograma.reduce((s: number, p: any) => s + (p.interes || 0), 0) * 100) / 100;
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
