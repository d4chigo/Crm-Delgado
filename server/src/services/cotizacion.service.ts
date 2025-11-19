import prisma from '@/config/database';
import { CrearCotizacionDTO, ActualizarCotizacionDTO, CalculoCuota, FiltrosCotizacion } from '@/types/cotizacion.types';
import { TipoCuota, EstadoCotizacion } from '@prisma/client';

export class CotizacionService {
  /**
   * Generar número de referencia único para la cotización
   */
  private async generarNumeroReferencia(): Promise<string> {
    const año = new Date().getFullYear();
    const mes = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    // Contar cotizaciones del mes actual
    const inicioMes = new Date(año, new Date().getMonth(), 1);
    const finMes = new Date(año, new Date().getMonth() + 1, 0, 23, 59, 59);
    
    const count = await prisma.cotizacion.count({
      where: {
        creadoEn: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });
    
    const numero = (count + 1).toString().padStart(4, '0');
    return `COT-${año}${mes}-${numero}`;
  }

  /**
   * Calcular cuota mensual usando fórmula de amortización francesa
   * Convierte TEA (Tasa Efectiva Anual) a TEM (Tasa Efectiva Mensual)
   * usando la fórmula: TEM = (1 + TEA)^(1/12) - 1
   */
  private calcularCuotaMensual(monto: number, tasaAnual: number, plazoMeses: number): number {
    if (tasaAnual === 0) {
      return monto / plazoMeses;
    }
    
    // Convertir TEA a TEM usando capitalización compuesta
    const tasaMensual = Math.pow(1 + tasaAnual / 100, 1 / 12) - 1;
    const cuota = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / 
                  (Math.pow(1 + tasaMensual, plazoMeses) - 1);
    
    return Math.round(cuota * 100) / 100;
  }

  /**
   * Calcular todos los valores de la cotización
   */
  private calcularValores(datos: CrearCotizacionDTO | ActualizarCotizacionDTO): CalculoCuota {
    const precioInmueble = datos.precioInmueble || 0;
    const cuotaInicial = datos.cuotaInicial || 0;
    const plazoMeses = datos.plazoMeses || 1;
    const tasaInteresAnual = datos.tasaInteresAnual || 0;
    
    const montoFinanciar = precioInmueble - cuotaInicial;
    const porcentajeCuotaInicial = (cuotaInicial / precioInmueble) * 100;
    
    let cuotaMensual = this.calcularCuotaMensual(montoFinanciar, tasaInteresAnual, plazoMeses);
    if (datos.montoCuotaManual && datos.montoCuotaManual > 0) {
      cuotaMensual = datos.montoCuotaManual;
    }
    const totalPagar = cuotaMensual * plazoMeses;
    const totalIntereses = totalPagar - montoFinanciar;
    
    return {
      cuotaMensual: Math.round(cuotaMensual * 100) / 100,
      totalIntereses: Math.round(totalIntereses * 100) / 100,
      totalPagar: Math.round(totalPagar * 100) / 100,
      porcentajeCuotaInicial: Math.round(porcentajeCuotaInicial * 100) / 100,
      montoFinanciar: Math.round(montoFinanciar * 100) / 100
    };
  }

  /**
   * Crear una nueva cotización
   */
  async crearCotizacion(datos: CrearCotizacionDTO): Promise<any> {
    // Verificar que el contacto existe
    const contacto = await prisma.contacto.findUnique({
      where: { id: datos.contactoId }
    });

    if (!contacto) {
      throw new Error('Contacto no encontrado');
    }

    // Generar número de referencia
    const numeroReferencia = await this.generarNumeroReferencia();

    // Calcular valores
    const calculos = this.calcularValores(datos);

    // Crear cotización
    const cotizacion = await prisma.cotizacion.create({
      data: {
        contactoId: datos.contactoId,
        numeroReferencia,
        nombreProyecto: datos.nombreProyecto,
        tipoInmueble: datos.tipoInmueble,
        descripcion: datos.descripcion,
        precioInmueble: datos.precioInmueble,
        cuotaInicial: datos.cuotaInicial,
        porcentajeCuotaInicial: calculos.porcentajeCuotaInicial,
        montoFinanciar: calculos.montoFinanciar,
        plazoMeses: datos.plazoMeses,
        tipoCuota: datos.tipoCuota,
        tasaInteresAnual: datos.tasaInteresAnual,
        permitePostergar: datos.permitePostergar || false,
        cuotasPostergables: datos.cuotasPostergables,
        permiteDoble: datos.permiteDoble || false,
        cuotasDoblesAnuales: datos.cuotasDoblesAnuales,
        permiteCambioFecha: datos.permiteCambioFecha || false,
        montoCuotaManual: datos.montoCuotaManual,
        cuotaMensualEstimada: calculos.cuotaMensual,
        totalIntereses: calculos.totalIntereses,
        totalPagar: calculos.totalPagar,
        notas: datos.notas,
        observaciones: datos.observaciones,
        fechaValidez: datos.fechaValidez ? new Date(datos.fechaValidez) : undefined,
        estado: EstadoCotizacion.BORRADOR
      },
      include: {
        contacto: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            tipo: true
          }
        }
      }
    });

    console.log(`✅ Cotización creada: ${numeroReferencia} para ${contacto.nombre} ${contacto.apellido || ''}`);
    return cotizacion;
  }

  /**
   * Obtener cotizaciones con filtros
   */
  async obtenerCotizaciones(filtros: FiltrosCotizacion = {}) {
    const {
      contactoId,
      estado,
      tipoCuota,
      fechaDesde,
      fechaHasta,
      pagina = 1,
      limite = 10
    } = filtros;

    const skip = (pagina - 1) * limite;
    const where: any = {};

    if (contactoId) {
      where.contactoId = contactoId;
    }

    if (estado) {
      where.estado = estado;
    }

    if (tipoCuota) {
      where.tipoCuota = tipoCuota;
    }

    if (fechaDesde || fechaHasta) {
      where.creadoEn = {};
      if (fechaDesde) {
        where.creadoEn.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.creadoEn.lte = new Date(fechaHasta);
      }
    }

    const [cotizaciones, total] = await Promise.all([
      prisma.cotizacion.findMany({
        where,
        skip,
        take: limite,
        orderBy: { creadoEn: 'desc' },
        include: {
          contacto: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              telefono: true,
              tipo: true
            }
          }
        }
      }),
      prisma.cotizacion.count({ where })
    ]);

    return {
      cotizaciones,
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite)
      }
    };
  }

  /**
   * Obtener una cotización por ID
   */
  async obtenerCotizacionPorId(id: string) {
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id },
      include: {
        contacto: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            tipo: true
          }
        }
      }
    });

    if (!cotizacion) {
      throw new Error('Cotización no encontrada');
    }

    return cotizacion;
  }

  /**
   * Actualizar una cotización
   */
  async actualizarCotizacion(id: string, datos: ActualizarCotizacionDTO) {
    const cotizacionExistente = await prisma.cotizacion.findUnique({
      where: { id }
    });

    if (!cotizacionExistente) {
      throw new Error('Cotización no encontrada');
    }

    // Solo se pueden editar cotizaciones en estado BORRADOR
    if (cotizacionExistente.estado !== EstadoCotizacion.BORRADOR && datos.estado === undefined) {
      throw new Error('Solo se pueden editar cotizaciones en estado BORRADOR');
    }

    // Si se actualizan valores financieros, recalcular
    let datosActualizados: any = { ...datos };
    
    if (datos.precioInmueble || datos.cuotaInicial || datos.plazoMeses || datos.tasaInteresAnual) {
      const datosParaCalculo = {
        precioInmueble: datos.precioInmueble || cotizacionExistente.precioInmueble.toNumber(),
        cuotaInicial: datos.cuotaInicial || cotizacionExistente.cuotaInicial.toNumber(),
        plazoMeses: datos.plazoMeses || cotizacionExistente.plazoMeses,
        tasaInteresAnual: datos.tasaInteresAnual || cotizacionExistente.tasaInteresAnual.toNumber(),
        montoCuotaManual: datos.montoCuotaManual
      };

      const calculos = this.calcularValores(datosParaCalculo);
      
      datosActualizados = {
        ...datosActualizados,
        porcentajeCuotaInicial: calculos.porcentajeCuotaInicial,
        montoFinanciar: calculos.montoFinanciar,
        cuotaMensualEstimada: calculos.cuotaMensual,
        totalIntereses: calculos.totalIntereses,
        totalPagar: calculos.totalPagar
      };
    }

    if (datos.fechaValidez) {
      datosActualizados.fechaValidez = new Date(datos.fechaValidez);
    }

    const cotizacionActualizada = await prisma.cotizacion.update({
      where: { id },
      data: datosActualizados,
      include: {
        contacto: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            tipo: true
          }
        }
      }
    });

    console.log(`✅ Cotización actualizada: ${cotizacionActualizada.numeroReferencia}`);
    return cotizacionActualizada;
  }

  /**
   * Cambiar estado de una cotización
   */
  async cambiarEstado(id: string, nuevoEstado: EstadoCotizacion) {
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id }
    });

    if (!cotizacion) {
      throw new Error('Cotización no encontrada');
    }

    const cotizacionActualizada = await prisma.cotizacion.update({
      where: { id },
      data: { estado: nuevoEstado },
      include: {
        contacto: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            tipo: true
          }
        }
      }
    });

    console.log(`🔄 Cotización ${cotizacion.numeroReferencia} cambiada a estado: ${nuevoEstado}`);
    return cotizacionActualizada;
  }

  /**
   * Eliminar una cotización
   */
  async eliminarCotizacion(id: string) {
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id }
    });

    if (!cotizacion) {
      throw new Error('Cotización no encontrada');
    }

    await prisma.cotizacion.delete({
      where: { id }
    });

    console.log(`🗑️ Cotización eliminada: ${cotizacion.numeroReferencia}`);
    return { mensaje: 'Cotización eliminada exitosamente' };
  }

  /**
   * Obtener cotizaciones de un contacto específico
   */
  async obtenerCotizacionesPorContacto(contactoId: string) {
    const cotizaciones = await prisma.cotizacion.findMany({
      where: { contactoId },
      orderBy: { creadoEn: 'desc' },
      include: {
        contacto: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            tipo: true
          }
        }
      }
    });

    return cotizaciones;
  }
}

export default new CotizacionService();
