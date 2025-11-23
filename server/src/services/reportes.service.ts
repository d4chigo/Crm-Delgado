import prisma from '@/config/database';

/**
 * Reporte de Leads
 * Cantidad de leads ingresados, fuentes de origen, etapa actual en oportunidades, tiempo promedio
 */
export async function obtenerReporteLead(filtros?: { usuarioId?: string; fechaInicio?: Date; fechaFin?: Date }) {
  const where: any = {};
  
  if (filtros?.usuarioId) {
    where.usuarioId = filtros.usuarioId;
  }
  
  if (filtros?.fechaInicio || filtros?.fechaFin) {
    where.creadoEn = {};
    if (filtros.fechaInicio) where.creadoEn.gte = filtros.fechaInicio;
    if (filtros.fechaFin) where.creadoEn.lte = filtros.fechaFin;
  }

  console.log('[REPORTE LEADS] Filtros:', JSON.stringify(filtros));
  console.log('[REPORTE LEADS] Where:', JSON.stringify(where));

  // Total de leads - siempre pasar where, aunque esté vacío
  const totalLeads = await prisma.lead.count({ where });
  console.log('[REPORTE LEADS] Total leads encontrados:', totalLeads);

  // Leads por fuente
  const leadsPorFuente = await prisma.lead.groupBy({
    by: ['fuente'],
    where,
    _count: { id: true },
  });

  // Leads por etapa de oportunidad (más relevante que estado del lead)
  const oppWhere: any = {
    leadId: { not: null }
  };
  if (filtros?.usuarioId) {
    oppWhere.usuarioId = filtros.usuarioId;
  }
  if (filtros?.fechaInicio || filtros?.fechaFin) {
    oppWhere.creadoEn = {};
    if (filtros.fechaInicio) oppWhere.creadoEn.gte = filtros.fechaInicio;
    if (filtros.fechaFin) oppWhere.creadoEn.lte = filtros.fechaFin;
  }
  
  const oppWhereClause = Object.keys(oppWhere).length > 1 ? oppWhere : { leadId: { not: null } };

  const oportunidadesPorEtapa = await prisma.oportunidadCliente.groupBy({
    by: ['etapa'],
    where: oppWhereClause,
    _count: { id: true },
  });

  // Obtener oportunidades con sus fechas para calcular tiempo promedio
  const oportunidadesConFechas = await prisma.oportunidadCliente.findMany({
    where: oppWhereClause,
    select: {
      id: true,
      etapa: true,
      creadoEn: true,
      ultimaActividad: true,
    },
  });

  // Calcular tiempo promedio por etapa
  const tiempoMap = new Map<string, number[]>();
  oportunidadesConFechas.forEach((opp: any) => {
    const etapa = opp.etapa || 'CONTACTO_INICIAL';
    const diasEnEtapa = Math.floor(
      (opp.ultimaActividad.getTime() - opp.creadoEn.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (!tiempoMap.has(etapa)) {
      tiempoMap.set(etapa, []);
    }
    tiempoMap.get(etapa)!.push(diasEnEtapa);
  });

  const tiempoPromedio = Array.from(tiempoMap.entries()).map(([etapa, tiempos]: [string, number[]]) => ({
    etapa,
    diasPromedio: Math.round(tiempos.reduce((a: number, b: number) => a + b, 0) / tiempos.length),
    cantidad: tiempos.length,
  }));

  return {
    totalLeads,
    leadsPorFuente: leadsPorFuente.map((item: any) => ({
      fuente: item.fuente || 'Sin especificar',
      cantidad: item._count.id,
    })),
    oportunidadesPorEtapa: oportunidadesPorEtapa.map((item: any) => ({
      etapa: item.etapa || 'CONTACTO_INICIAL',
      cantidad: item._count.id,
    })),
    tiempoPromedioPorEtapa: tiempoPromedio,
  };
}

/**
 * Reporte de Conversión
 * Conversión de leads a través del pipeline de oportunidades
 */
export async function obtenerReporteConversion(filtros?: { fechaInicio?: Date; fechaFin?: Date }) {
  const where: any = {};
  
  if (filtros?.fechaInicio || filtros?.fechaFin) {
    where.creadoEn = {};
    if (filtros.fechaInicio) where.creadoEn.gte = filtros.fechaInicio;
    if (filtros.fechaFin) where.creadoEn.lte = filtros.fechaFin;
  }

  // Total de leads
  const totalLeads = await prisma.lead.count({ where });

  // Leads con oportunidades activas
  const leadsConOportunidades = await prisma.oportunidadCliente.findMany({
    where: {
      ...where,
      lead: {
        isNot: null
      }
    },
    select: { clienteId: true },
    distinct: ['clienteId']
  });

  // Oportunidades ganadas (CIERRE_GANADO)
  const oportunidadesGanadas = await prisma.oportunidadCliente.count({
    where: {
      ...where,
      etapa: 'CIERRE_GANADO',
      lead: {
        isNot: null
      }
    }
  });

  // Valor total de oportunidades ganadas
  const valorGanado = await prisma.oportunidadCliente.aggregate({
    where: {
      ...where,
      etapa: 'CIERRE_GANADO',
      lead: {
        isNot: null
      }
    },
    _sum: { valor: true }
  });

  // Conversión por etapa del pipeline
  const etapas = ['CONTACTO_INICIAL', 'AGENDAMIENTO', 'SEPARACION', 'CIERRE_GANADO'];
  const conversionPorEtapa: any[] = [];

  for (let i = 0; i < etapas.length - 1; i++) {
    const enEtapaActual = await prisma.oportunidadCliente.count({
      where: { ...where, etapa: etapas[i] }
    });
    const enEtapaSiguiente = await prisma.oportunidadCliente.count({
      where: { ...where, etapa: etapas[i + 1] }
    });

    const porcentaje = enEtapaActual > 0 ? (enEtapaSiguiente / enEtapaActual) * 100 : 0;
    conversionPorEtapa.push({
      de: etapas[i],
      a: etapas[i + 1],
      cantidad: enEtapaSiguiente,
      porcentaje: Math.round(porcentaje * 100) / 100,
    });
  }

  const tasaConversionLeads = totalLeads > 0 ? (leadsConOportunidades.length / totalLeads) * 100 : 0;

  return {
    totalLeads,
    leadsConOportunidades: leadsConOportunidades.length,
    oportunidadesGanadas,
    valorGanado: valorGanado._sum.valor || 0,
    tasaConversionLeads: Math.round(tasaConversionLeads * 100) / 100,
    conversionPorEtapa,
  };
}

/**
 * Reporte de Actividad
 * Oportunidades por etapa y agente
 */
export async function obtenerReporteActividad(filtros?: { usuarioId?: string; fechaInicio?: Date; fechaFin?: Date }) {
  const where: any = {};
  
  if (filtros?.usuarioId) {
    where.usuarioId = filtros.usuarioId;
  }
  
  if (filtros?.fechaInicio || filtros?.fechaFin) {
    where.creadoEn = {};
    if (filtros.fechaInicio) where.creadoEn.gte = filtros.fechaInicio;
    if (filtros.fechaFin) where.creadoEn.lte = filtros.fechaFin;
  }

  // Oportunidades por usuario (agente)
  const oportunidadesPorUsuario = await prisma.oportunidadCliente.groupBy({
    by: ['usuarioId'],
    where,
    _count: { id: true },
  });

  // Obtener información de usuarios
  const usuariosConActividad = await Promise.all(
    oportunidadesPorUsuario.map(async (item: any) => {
      const usuario = await prisma.usuario.findUnique({
        where: { id: item.usuarioId },
        select: { id: true, nombre: true },
      });
      return {
        usuario: usuario?.nombre || 'Desconocido',
        usuarioId: item.usuarioId,
        oportunidadesTotal: item._count.id,
      };
    })
  );

  // Oportunidades por etapa
  const oportunidadesPorEtapa = await prisma.oportunidadCliente.groupBy({
    by: ['etapa'],
    where,
    _count: { id: true },
  });

  return {
    oportunidadesPorAgente: usuariosConActividad.sort((a, b) => b.oportunidadesTotal - a.oportunidadesTotal),
    oportunidadesPorEtapa: oportunidadesPorEtapa.map((item: any) => ({
      etapa: item.etapa,
      cantidad: item._count.id,
    })),
  };
}

/**
 * Reporte de Ventas Cerradas
 * Detalles de oportunidades finalizadas: propiedades, montos, tiempos de cierre
 */
export async function obtenerReporteVentasCerradas(filtros?: { fechaInicio?: Date; fechaFin?: Date }) {
  const where: any = {
    etapa: 'CIERRE_GANADO',
  };
  
  if (filtros?.fechaInicio || filtros?.fechaFin) {
    where.ultimaActividad = {};
    if (filtros.fechaInicio) where.ultimaActividad.gte = filtros.fechaInicio;
    if (filtros.fechaFin) where.ultimaActividad.lte = filtros.fechaFin;
  }

  // Oportunidades ganadas
  const ventasCerradas = await prisma.oportunidadCliente.findMany({
    where,
    select: {
      id: true,
      titulo: true,
      proyecto: true,
      propiedad: true,
      valor: true,
      probabilidad: true,
      creadoEn: true,
      ultimaActividad: true,
      usuario: {
        select: { nombre: true },
      },
      cliente: {
        select: { nombre: true, apellido: true, correo: true }
      }
    },
    orderBy: { ultimaActividad: 'desc' }
  });

  // Calcular tiempo de cierre
  const ventasConTiempo = ventasCerradas.map((venta: any) => ({
    ...venta,
    diasParaCierre: Math.floor(
      (venta.ultimaActividad.getTime() - venta.creadoEn.getTime()) / (1000 * 60 * 60 * 24)
    ),
  }));

  // Estadísticas
  const totalVentas = ventasConTiempo.length;
  const montoTotal = ventasConTiempo.reduce((sum: number, v: any) => sum + (v.valor || 0), 0);
  const diasPromedio = totalVentas > 0 
    ? Math.round(ventasConTiempo.reduce((sum: number, v: any) => sum + v.diasParaCierre, 0) / totalVentas)
    : 0;

  return {
    totalVentas,
    montoTotal,
    diasPromedioCierre: diasPromedio,
    ventasDetalladas: ventasConTiempo.slice(0, 50), // Limitar a 50 registros
  };
}

/**
 * Reporte de Clientes Activos
 * Clientes con contratos vigentes y oportunidades de seguimiento
 */
export async function obtenerReporteClientesActivos() {
  // Clientes con oportunidades activas
  const clientesConOportunidades = await prisma.cliente.findMany({
    select: {
      id: true,
      nombre: true,
      apellido: true,
      correo: true,
      telefono: true,
      oportunidades: {
        where: {
          etapa: {
            in: ['CONTACTO_INICIAL', 'NEGOCIACION', 'PROPUESTA'],
          },
        },
        select: {
          id: true,
          titulo: true,
          etapa: true,
          valor: true,
        },
      },
    },
  });

  // Filtrar solo clientes con oportunidades activas
  const clientesActivos = clientesConOportunidades.filter((c: any) => c.oportunidades.length > 0);

  return {
    totalClientesActivos: clientesActivos.length,
    clientes: clientesActivos.map((cliente: any) => ({
      id: cliente.id,
      nombre: `${cliente.nombre} ${cliente.apellido || ''}`.trim(),
      correo: cliente.correo,
      telefono: cliente.telefono,
      oportunidadesActivas: cliente.oportunidades.length,
      montoEnJuego: cliente.oportunidades.reduce((sum: number, o: any) => sum + (o.valor || 0), 0),
      oportunidades: cliente.oportunidades,
    })),
  };
}

/**
 * Análisis de Tiempo y Eficiencia
 * Promedio de días por etapa, tiempos muertos
 */
export async function obtenerAnalisisTiempoEficiencia(filtros?: { usuarioId?: string }) {
  const where: any = {};
  
  if (filtros?.usuarioId) {
    where.usuarioId = filtros.usuarioId;
  }

  const leads = await prisma.lead.findMany({
    where,
    select: {
      id: true,
      estado: true,
      creadoEn: true,
      actualizadoEn: true,
      usuario: {
        select: { nombre: true },
      },
    },
  });

  // Agrupar por etapa y calcular tiempos
  const tiemposPorEtapa = new Map<string, number[]>();
  
  leads.forEach((lead: any) => {
    const etapa = lead.estado || 'NUEVO';
    const diasEnEtapa = Math.floor(
      (lead.actualizadoEn.getTime() - lead.creadoEn.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (!tiemposPorEtapa.has(etapa)) {
      tiemposPorEtapa.set(etapa, []);
    }
    tiemposPorEtapa.get(etapa)!.push(diasEnEtapa);
  });

  // Calcular estadísticas
  const estadisticas = Array.from(tiemposPorEtapa.entries()).map(([etapa, tiempos]) => {
    const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    const maximo = Math.max(...tiempos);
    const minimo = Math.min(...tiempos);
    
    return {
      etapa,
      diasPromedio: Math.round(promedio),
      diasMaximo: maximo,
      diasMinimo: minimo,
      cantidad: tiempos.length,
      tiempoMuerto: maximo > promedio * 2 ? 'Sí' : 'No',
    };
  });

  return {
    estadisticas: estadisticas.sort((a, b) => b.diasPromedio - a.diasPromedio),
    totalLeads: leads.length,
  };
}

/**
 * Reporte de Fuente de Leads
 * Identificar cuáles canales generan más leads y mejor conversión
 */
export async function obtenerReporteFuenteLeads(filtros?: { fechaInicio?: Date; fechaFin?: Date }) {
  const where: any = {};
  
  if (filtros?.fechaInicio || filtros?.fechaFin) {
    where.creadoEn = {};
    if (filtros.fechaInicio) where.creadoEn.gte = filtros.fechaInicio;
    if (filtros.fechaFin) where.creadoEn.lte = filtros.fechaFin;
  }

  // Leads por fuente
  const leadsPorFuente = await prisma.lead.groupBy({
    by: ['fuente'],
    where,
    _count: { id: true },
  });

  // Para cada fuente, calcular conversión a oportunidades
  const reportePorFuente = await Promise.all(
    leadsPorFuente.map(async (item: any) => {
      const totalLeads = item._count.id;
      
      // Leads con oportunidades activas
      const leadsConOportunidades = await prisma.oportunidadCliente.findMany({
        where: {
          ...where,
          lead: {
            fuente: item.fuente
          }
        },
        select: { clienteId: true },
        distinct: ['clienteId']
      });

      // Oportunidades ganadas desde esta fuente
      const oportunidadesGanadas = await prisma.oportunidadCliente.count({
        where: {
          ...where,
          etapa: 'CIERRE_GANADO',
          lead: {
            fuente: item.fuente
          }
        }
      });

      // Valor total de oportunidades ganadas
      const valorGanado = await prisma.oportunidadCliente.aggregate({
        where: {
          ...where,
          etapa: 'CIERRE_GANADO',
          lead: {
            fuente: item.fuente
          }
        },
        _sum: { valor: true }
      });

      const tasaConversion = totalLeads > 0 ? (leadsConOportunidades.length / totalLeads) * 100 : 0;

      return {
        fuente: item.fuente || 'Sin especificar',
        totalLeads,
        leadsConOportunidades: leadsConOportunidades.length,
        oportunidadesGanadas,
        valorGanado: valorGanado._sum.valor || 0,
        tasaConversion: Math.round(tasaConversion * 100) / 100,
        eficiencia: tasaConversion > 30 ? 'Alta' : tasaConversion > 15 ? 'Media' : 'Baja',
      };
    })
  );

  return {
    reportePorFuente: reportePorFuente.sort((a, b) => b.tasaConversion - a.tasaConversion),
    mejorFuente: reportePorFuente.length > 0 ? reportePorFuente[0] : null,
  };
}
