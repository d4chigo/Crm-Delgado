import prisma from '@/config/database';
import { CrearCotizacionDTO, ActualizarCotizacionDTO, CalculoCuota, FiltrosCotizacion } from '@/types/cotizacion.types';
import { TipoCuota, EstadoCotizacion } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export class CotizacionService {
  /**
   * Generar número de referencia único para la cotización
   */
  private async generarNumeroReferencia(): Promise<string> {
    const año = new Date().getFullYear();
    const mes = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const prefijo = `COT-${año}${mes}-`;

    // Buscar la última cotización del mes actual
    const ultimaCotizacion = await prisma.cotizacion.findFirst({
      where: {
        numeroReferencia: {
          startsWith: prefijo
        }
      },
      orderBy: {
        numeroReferencia: 'desc'
      }
    });

    let numero = 1;

    if (ultimaCotizacion) {
      // Extraer el número secuencial (últimos 4 dígitos)
      const partes = ultimaCotizacion.numeroReferencia.split('-');
      if (partes.length === 3) {
        const ultimoNumero = parseInt(partes[2]);
        if (!isNaN(ultimoNumero)) {
          numero = ultimoNumero + 1;
        }
      }
    }

    return `${prefijo}${numero.toString().padStart(4, '0')}`;
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
    try {
      console.log('🔧 [CotizacionService] Iniciando creación de cotización');
      console.log('🔧 [CotizacionService] Datos recibidos:', JSON.stringify(datos, null, 2));
      
      // Validar que al menos leadId o clienteId esté presente
      if (!datos.leadId && !datos.clienteId) {
        throw new Error('Se requiere al menos un leadId o clienteId');
      }

      console.log('🔧 [CotizacionService] Verificando lead/cliente...');
      // Verificar que el lead o cliente existe
      const lead = datos.leadId ? await prisma.lead.findUnique({
        where: { id: datos.leadId }
      }) : null;

      const cliente = datos.clienteId ? await prisma.cliente.findUnique({
        where: { id: datos.clienteId }
      }) : null;

      if (datos.leadId && !lead) {
        console.error('❌ Lead no encontrado:', datos.leadId);
        throw new Error('Lead no encontrado');
      }
      if (datos.clienteId && !cliente) {
        console.error('❌ Cliente no encontrado:', datos.clienteId);
        throw new Error('Cliente no encontrado');
      }
      console.log('✅ Lead/Cliente verificado');

      // Generar número de referencia
      console.log('🔧 Generando número de referencia...');
      const numeroReferencia = await this.generarNumeroReferencia();
      console.log('✅ Número generado:', numeroReferencia);

      // Calcular valores
      console.log('🔧 Calculando valores...');
      const calculos = this.calcularValores(datos);
      console.log('✅ Valores calculados:', JSON.stringify(calculos));

      // Crear cotización
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

      // Agregar IDs de lead/cliente
      if (datos.leadId) dataCotizacion.idLead = datos.leadId;
      if (datos.clienteId) dataCotizacion.idCliente = datos.clienteId;

      // Agregar campos opcionales solo si existen
      if (datos.tipoInmueble !== undefined && datos.tipoInmueble !== null) dataCotizacion.tipoInmueble = datos.tipoInmueble;
      if (datos.descripcion !== undefined && datos.descripcion !== null) dataCotizacion.descripcion = datos.descripcion;
      if (datos.cuotasPostergables !== undefined && datos.cuotasPostergables !== null) dataCotizacion.cuotasPostergables = datos.cuotasPostergables;
      if (datos.cuotasDoblesAnuales !== undefined && datos.cuotasDoblesAnuales !== null) dataCotizacion.cuotasDoblesAnuales = datos.cuotasDoblesAnuales;
      if (datos.montoCuotaManual !== undefined && datos.montoCuotaManual !== null) dataCotizacion.montoCuotaManual = datos.montoCuotaManual;
      if (datos.notas !== undefined && datos.notas !== null) dataCotizacion.notas = datos.notas;
      if (datos.observaciones !== undefined && datos.observaciones !== null) dataCotizacion.observaciones = datos.observaciones;
      if (datos.fechaValidez !== undefined && datos.fechaValidez !== null) {
        console.log('🔧 Procesando fechaValidez:', datos.fechaValidez);
        dataCotizacion.fechaValidez = new Date(datos.fechaValidez);
      }

      console.log('🔧 Intentando crear en BD con data:', JSON.stringify(dataCotizacion, null, 2));

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
    } catch (error: any) {
      console.error('❌ Error CRÍTICO en CotizacionService.crearCotizacion:', error);
      throw error;
    }
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

    // Soporte para búsqueda por contactoId (lead o cliente)
    if (contactoId) {
      where.OR = [
        { idLead: contactoId },
        { idCliente: contactoId }
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
      where: lead ? { idLead: contactoId } : { idCliente: contactoId },
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

  /**
   * Generar PDF de la cotización usando pdfkit
   */
  async generarPDF(cotizacionId: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // Obtener cotización
        const cotizacion = await prisma.cotizacion.findUnique({
          where: { id: cotizacionId },
          include: {
            lead: true,
            cliente: true,
            usuario: true
          }
        });

        if (!cotizacion) {
          throw new Error('Cotización no encontrada');
        }

        // Crear documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        doc.on('error', reject);

        // Encabezado
        doc.fontSize(24).font('Helvetica-Bold').text('COTIZACIÓN', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica').text(`Referencia: ${cotizacion.numeroReferencia}`, { align: 'center' });
        doc.fontSize(10).text(`Fecha: ${new Date(cotizacion.creadoEn).toLocaleDateString('es-PE')}`, { align: 'center' });
        doc.moveDown(1);

        // Estado
        const estadoColor = cotizacion.estado === 'ACEPTADA' ? '#10b981' : cotizacion.estado === 'ENVIADA' ? '#3b82f6' : '#f59e0b';
        doc.fontSize(11).font('Helvetica-Bold').fillColor(estadoColor).text(`Estado: ${cotizacion.estado}`).fillColor('black');
        doc.moveDown(1);

        // Información del cliente/lead
        doc.fontSize(12).font('Helvetica-Bold').text('CLIENTE/LEAD');
        const nombreContacto = cotizacion.cliente 
          ? `${cotizacion.cliente.nombre} ${cotizacion.cliente.apellido}`
          : `${cotizacion.lead?.nombre} ${cotizacion.lead?.apellido}`;
        doc.fontSize(11).font('Helvetica').text(nombreContacto);
        doc.moveDown(1);

        // Detalles de la cotización
        doc.fontSize(12).font('Helvetica-Bold').text('DETALLES DE LA COTIZACIÓN');
        doc.moveDown(0.5);

        const detalles = [
          { label: 'Precio del Inmueble:', valor: `S/ ${(cotizacion.precioInmueble || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` },
          { label: 'Cuota Inicial:', valor: `S/ ${(cotizacion.cuotaInicial || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` },
          { label: 'Cuota Mensual Estimada:', valor: `S/ ${(cotizacion.cuotaMensualEstimada || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` },
          { label: 'Plazo:', valor: `${cotizacion.plazoMeses} meses` },
          { label: 'Tasa de Interés:', valor: `${cotizacion.tasaInteres}%` }
        ];

        detalles.forEach(detalle => {
          doc.fontSize(10).font('Helvetica').text(`${detalle.label} ${detalle.valor}`);
          doc.moveDown(0.3);
        });

        doc.moveDown(1);

        // Información del asesor
        doc.fontSize(11).font('Helvetica-Bold').text('ASESOR ASIGNADO');
        doc.fontSize(10).font('Helvetica').text(`Nombre: ${cotizacion.usuario?.nombre || 'N/A'}`);
        doc.text(`Correo: ${cotizacion.usuario?.correo || 'N/A'}`);
        doc.moveDown(1);

        // Pie de página
        doc.fontSize(9).font('Helvetica').text('---', { align: 'center' });
        doc.text('Este documento es una cotización válida por 30 días.', { align: 'center' });
        doc.text('Para más información, contacta con tu asesor.', { align: 'center' });

        // Finalizar documento
        doc.end();
      } catch (error: any) {
        console.error('Error al generar PDF:', error);
        reject(new Error(`Error al generar PDF: ${error.message}`));
      }
    });
  }
}

export default new CotizacionService();
