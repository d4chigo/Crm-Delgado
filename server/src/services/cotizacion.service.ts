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
   * Generar PDF de la cotización usando HTML
   * Retorna HTML que será convertido a PDF en el cliente
   */
  async generarPDF(cotizacionId: string): Promise<Buffer> {
    try {
      // Obtener cotización
      const cotizacion = await prisma.cotizacion.findUnique({
        where: { id: cotizacionId },
        include: {
          lead: true,
          cliente: true
        }
      });

      if (!cotizacion) {
        throw new Error('Cotización no encontrada');
      }

      // Función auxiliar para formatear moneda
      const formatearMoneda = (valor: number): string => {
        return new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN',
          minimumFractionDigits: 2
        }).format(valor);
      };

      // Generar HTML del PDF (igual al del CRM)
      const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Cotización - ${cotizacion.nombreProyecto}</title>
    <style>
      * { box-sizing: border-box; }
      @page { size: A4; margin: 10mm; }
      body { font-family: Arial, Helvetica, sans-serif; color: #333; margin: 0; padding: 0; font-size: 11px; }
      .header { display:flex; align-items:center; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
      .header .left { display:flex; align-items:center; gap:10px; }
      .logo { height: 36px; }
      .title { margin: 12px 0 6px; }
      .title h2 { margin: 0; font-size: 16px; }
      .meta { color:#666; font-size: 11px; margin-top: 2px; }
      .section { margin-top: 12px; }
      h3 { margin: 0 0 6px; font-size: 12px; }
      table { width:100%; border-collapse: collapse; font-size: 10.5px; }
      th, td { text-align:left; padding:6px; border-bottom:1px solid #eee; }
      .right { text-align:right; font-size: 11px; }
      .footer { margin-top: 12px; font-size: 10px; color:#777; }
      .tabla-cronograma th { background:#f5f7ff; color:#1f3a8a; }
      .tabla-cronograma td { border-bottom:1px solid #f0f0f0; }
      .num { text-align:right; }
      .rojo { color:#dc2626; }
      .verde { color:#16a34a; }
      .negrita { font-weight: 700; }
      thead { display: table-header-group; }
      tr, td, th { page-break-inside: avoid; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="left">
        <div>
          <div><strong>CRM DELGADO</strong></div>
          <div class="meta">Cotización</div>
        </div>
      </div>
      <div class="right">
        <div><strong>Referencia:</strong> ${cotizacion.numeroReferencia}</div>
        <div class="meta">Fecha: ${new Date(cotizacion.creadoEn).toLocaleDateString('es-PE')}</div>
      </div>
    </div>

    <div class="title">
      <h2>${cotizacion.nombreProyecto}</h2>
      <div class="meta">Estado: <strong>${cotizacion.estado}</strong></div>
      <div class="meta">Cliente: ${cotizacion.cliente ? `${cotizacion.cliente.nombre} ${cotizacion.cliente.apellido}` : `${cotizacion.lead?.nombre} ${cotizacion.lead?.apellido}`}</div>
    </div>

    <div class="section">
      <h3>Datos Financieros</h3>
      <table>
        <tr><th>Precio Inmueble</th><td>${formatearMoneda(cotizacion.precioInmueble)}</td></tr>
        <tr><th>Cuota Inicial</th><td>${formatearMoneda(cotizacion.cuotaInicial)}</td></tr>
        <tr><th>Monto a Financiar</th><td>${formatearMoneda(cotizacion.montoFinanciar)}</td></tr>
        <tr><th>Cuota Mensual Estimada</th><td>${formatearMoneda(cotizacion.cuotaMensualEstimada)}</td></tr>
        <tr><th>Plazo</th><td>${cotizacion.plazoMeses} meses</td></tr>
        <tr><th>Tasa de Interés</th><td>${cotizacion.tasaInteresAnual}%</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>Información Adicional</h3>
      <table>
        <tr><th>Tipo de Inmueble</th><td>${cotizacion.tipoInmueble || 'N/A'}</td></tr>
        <tr><th>Tipo de Cuota</th><td>${cotizacion.tipoCuota}</td></tr>
        <tr><th>Total Intereses</th><td>${formatearMoneda(cotizacion.totalIntereses)}</td></tr>
        <tr><th>Total a Pagar</th><td class="negrita">${formatearMoneda(cotizacion.totalPagar)}</td></tr>
      </table>
    </div>

    ${cotizacion.notas ? `<div class="section">
      <h3>Notas</h3>
      <div>${cotizacion.notas.replace(/</g,'&lt;')}</div>
    </div>` : ''}

    <div class="footer">Generado por CRM Delgado • ${new Date().toLocaleString('es-PE')} • Este documento es una cotización válida por 30 días</div>
  </body>
</html>`;

      // Convertir HTML a Buffer (para que el navegador lo interprete como PDF)
      return Buffer.from(html, 'utf-8');
    } catch (error: any) {
      console.error('Error al generar PDF:', error);
      throw new Error(`Error al generar PDF: ${error.message}`);
    }
  }
}

export default new CotizacionService();
