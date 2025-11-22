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
    // Evitar NaN cuando precioInmueble es 0
    const porcentajeCuotaInicial = precioInmueble > 0 ? (cuotaInicial / precioInmueble) * 100 : 0;
    
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
    // Verificar que el contacto existe (lead o cliente)
    const lead = await prisma.lead.findUnique({
      where: { id: datos.contactoId }
    });

    const cliente = !lead ? await prisma.cliente.findUnique({
      where: { id: datos.contactoId }
    }) : null;

    // Validar que exista el contacto
    if (!lead && !cliente) {
      throw new Error('Contacto no encontrado');
    }

    // Generar número de referencia
    const numeroReferencia = await this.generarNumeroReferencia();

    // Calcular valores
    const calculos = this.calcularValores(datos);

    // Crear cotización para lead o cliente
    // Construir objeto de datos sin campos undefined
    const dataCotizacion: any = {
      numeroReferencia,
      nombreProyecto: datos.nombreProyecto,
      precioInmueble: datos.precioInmueble,
      cuotaInicial: datos.cuotaInicial,
      porcentajeCuotaInicial: calculos.porcentajeCuotaInicial,
      montoFinanciar: calculos.montoFinanciar,
      plazoMeses: datos.plazoMeses,
      tipoCuota: datos.tipoCuota,
      tasaInteresAnual: datos.tasaInteresAnual,
      permitePostergar: datos.permitePostergar || false,
      permiteDoble: datos.permiteDoble || false,
      permiteCambioFecha: datos.permiteCambioFecha || false,
      cuotaMensualEstimada: calculos.cuotaMensual,
      totalIntereses: calculos.totalIntereses,
      totalPagar: calculos.totalPagar,
      estado: EstadoCotizacion.BORRADOR
    };

    // Agregar campos opcionales solo si existen
    if (lead) dataCotizacion.leadId = datos.contactoId;
    if (cliente) dataCotizacion.clienteId = datos.contactoId;
    if (datos.tipoInmueble !== undefined && datos.tipoInmueble !== null) dataCotizacion.tipoInmueble = datos.tipoInmueble;
    if (datos.descripcion !== undefined && datos.descripcion !== null) dataCotizacion.descripcion = datos.descripcion;
    if (datos.cuotasPostergables !== undefined && datos.cuotasPostergables !== null) dataCotizacion.cuotasPostergables = datos.cuotasPostergables;
    if (datos.cuotasDoblesAnuales !== undefined && datos.cuotasDoblesAnuales !== null) dataCotizacion.cuotasDoblesAnuales = datos.cuotasDoblesAnuales;
    if (datos.montoCuotaManual !== undefined && datos.montoCuotaManual !== null) dataCotizacion.montoCuotaManual = datos.montoCuotaManual;
    if (datos.notas !== undefined && datos.notas !== null) dataCotizacion.notas = datos.notas;
    if (datos.observaciones !== undefined && datos.observaciones !== null) dataCotizacion.observaciones = datos.observaciones;
    if (datos.fechaValidez !== undefined && datos.fechaValidez !== null) dataCotizacion.fechaValidez = new Date(datos.fechaValidez);

    const cotizacion = await prisma.cotizacion.create({
      data: dataCotizacion,
      include: {
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true
          }
        },
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true
          }
        }
      }
    });

    const contactoInfo = lead || cliente;
    console.log(`✅ Cotización creada: ${numeroReferencia} para ${contactoInfo?.nombre} ${contactoInfo?.apellido || ''}`);
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
      where.OR = [
        { leadId: contactoId },
        { clienteId: contactoId }
      ];
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
          lead: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              telefono: true
            }
          },
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              telefono: true
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
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true
          }
        },
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true
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

    // Construir objeto de datos sin campos undefined
    const datosActualizados: any = {};
    
    // Si se actualizan valores financieros, recalcular
    if (datos.precioInmueble || datos.cuotaInicial || datos.plazoMeses || datos.tasaInteresAnual || datos.montoCuotaManual) {
      const datosParaCalculo = {
        precioInmueble: datos.precioInmueble || cotizacionExistente.precioInmueble.toNumber(),
        cuotaInicial: datos.cuotaInicial || cotizacionExistente.cuotaInicial.toNumber(),
        plazoMeses: datos.plazoMeses || cotizacionExistente.plazoMeses,
        tasaInteresAnual: datos.tasaInteresAnual || cotizacionExistente.tasaInteresAnual.toNumber(),
        montoCuotaManual: datos.montoCuotaManual
      };

      const calculos = this.calcularValores(datosParaCalculo);
      
      datosActualizados.porcentajeCuotaInicial = calculos.porcentajeCuotaInicial;
      datosActualizados.montoFinanciar = calculos.montoFinanciar;
      datosActualizados.cuotaMensualEstimada = calculos.cuotaMensual;
      datosActualizados.totalIntereses = calculos.totalIntereses;
      datosActualizados.totalPagar = calculos.totalPagar;
    }

    // Agregar campos opcionales solo si existen
    if (datos.nombreProyecto !== undefined && datos.nombreProyecto !== null) datosActualizados.nombreProyecto = datos.nombreProyecto;
    if (datos.tipoInmueble !== undefined && datos.tipoInmueble !== null) datosActualizados.tipoInmueble = datos.tipoInmueble;
    if (datos.descripcion !== undefined && datos.descripcion !== null) datosActualizados.descripcion = datos.descripcion;
    if (datos.precioInmueble !== undefined && datos.precioInmueble !== null) datosActualizados.precioInmueble = datos.precioInmueble;
    if (datos.cuotaInicial !== undefined && datos.cuotaInicial !== null) datosActualizados.cuotaInicial = datos.cuotaInicial;
    if (datos.plazoMeses !== undefined && datos.plazoMeses !== null) datosActualizados.plazoMeses = datos.plazoMeses;
    if (datos.tipoCuota !== undefined && datos.tipoCuota !== null) datosActualizados.tipoCuota = datos.tipoCuota;
    if (datos.tasaInteresAnual !== undefined && datos.tasaInteresAnual !== null) datosActualizados.tasaInteresAnual = datos.tasaInteresAnual;
    if (datos.permitePostergar !== undefined && datos.permitePostergar !== null) datosActualizados.permitePostergar = datos.permitePostergar;
    if (datos.cuotasPostergables !== undefined && datos.cuotasPostergables !== null) datosActualizados.cuotasPostergables = datos.cuotasPostergables;
    if (datos.permiteDoble !== undefined && datos.permiteDoble !== null) datosActualizados.permiteDoble = datos.permiteDoble;
    if (datos.cuotasDoblesAnuales !== undefined && datos.cuotasDoblesAnuales !== null) datosActualizados.cuotasDoblesAnuales = datos.cuotasDoblesAnuales;
    if (datos.permiteCambioFecha !== undefined && datos.permiteCambioFecha !== null) datosActualizados.permiteCambioFecha = datos.permiteCambioFecha;
    if (datos.montoCuotaManual !== undefined && datos.montoCuotaManual !== null) datosActualizados.montoCuotaManual = datos.montoCuotaManual;
    if (datos.notas !== undefined && datos.notas !== null) datosActualizados.notas = datos.notas;
    if (datos.observaciones !== undefined && datos.observaciones !== null) datosActualizados.observaciones = datos.observaciones;
    if (datos.fechaValidez !== undefined && datos.fechaValidez !== null) datosActualizados.fechaValidez = new Date(datos.fechaValidez);
    if (datos.estado !== undefined && datos.estado !== null) datosActualizados.estado = datos.estado;

    const cotizacionActualizada = await prisma.cotizacion.update({
      where: { id },
      data: datosActualizados,
      include: {
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true
          }
        },
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true
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
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true
          }
        },
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true
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
   * Obtener cotizaciones de un contacto específico (lead o cliente)
   */
  async obtenerCotizacionesPorContacto(contactoId: string) {
    // Verificar si el contacto es un lead o cliente
    const lead = await prisma.lead.findUnique({ where: { id: contactoId } });
    const cliente = !lead ? await prisma.cliente.findUnique({ where: { id: contactoId } }) : null;

    if (!lead && !cliente) {
      return [];
    }

    // Obtener cotizaciones para lead o cliente
    const cotizaciones = await prisma.cotizacion.findMany({
      where: lead ? { leadId: contactoId } : { clienteId: contactoId },
      orderBy: { creadoEn: 'desc' },
      include: {
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true
          }
        },
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true
          }
        }
      }
    });

    return cotizaciones;
  }
}

export default new CotizacionService();
