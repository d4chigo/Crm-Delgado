import prisma from '@/config/database';

export async function getCRMContext() {
  try {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 1);
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear + 1, 0, 1);

  const [
    totalContactos,
    totalLeads,
    leadsEsteMes,
    contactosPorEstado,
    oportunidadesPorEtapa,
    valorTotalOportunidades,
    valorGanado,
    oportunidadesGanadas,
    cotizacionesTotales,
    cotizacionesPorEstado,
    proyectosActivos,
    proyectosPorEstado,
    usuariosActivos,
  ] = await Promise.all([
    // Contactos totales
    prisma.contacto.count(),
    
    // Leads totales
    prisma.contacto.count({ where: { tipo: 'LEAD' } }),
    
    // Leads creados este mes
    prisma.contacto.count({
      where: {
        tipo: 'LEAD',
        creadoEn: { gte: startOfMonth, lt: endOfMonth },
      },
    }),
    
    // Contactos agrupados por estado de lead
    prisma.contacto.groupBy({
      by: ['estadoLead'],
      _count: { _all: true },
      where: { tipo: 'LEAD' },
    }),
    
    // Oportunidades por etapa
    prisma.oportunidadCliente.groupBy({
      by: ['etapa'],
      _count: { _all: true },
    }),
    
    // Valor total de todas las oportunidades
    prisma.oportunidadCliente.aggregate({
      _sum: { valor: true },
    }),
    
    // Valor ganado (oportunidades GANADO)
    prisma.oportunidadCliente.aggregate({
      _sum: { valor: true },
      where: { etapa: 'GANADO' },
    }),
    
    // Cantidad de oportunidades ganadas
    prisma.oportunidadCliente.count({
      where: { etapa: 'GANADO' },
    }),
    
    // Total de cotizaciones
    prisma.cotizacion.count(),
    
    // Cotizaciones por estado
    prisma.cotizacion.groupBy({
      by: ['estado'],
      _count: { _all: true },
    }),
    
    // Proyectos activos
    prisma.proyecto.count({ where: { activo: true } }),
    
    // Proyectos por estado
    prisma.proyecto.groupBy({
      by: ['estado'],
      _count: { _all: true },
      where: { activo: true },
    }),
    
    // Usuarios activos
    prisma.usuario.count({ where: { activo: true } }),
  ]);

  // Ventas mensuales del año actual
  const ventasMensuales = await Promise.all(
    Array.from({ length: 12 }, (_, i) => i).map(async (monthIndex) => {
      const monthStart = new Date(currentYear, monthIndex, 1);
      const monthEnd = new Date(currentYear, monthIndex + 1, 1);
      const result = await prisma.oportunidadCliente.aggregate({
        _sum: { valor: true },
        _count: { _all: true },
        where: {
          etapa: 'GANADO',
          creadoEn: { gte: monthStart, lt: monthEnd },
        },
      });
      return {
        mes: monthIndex + 1,
        cantidad: result._count._all,
        valor: Number(result._sum.valor || 0),
      };
    })
  );

  // Top 5 proyectos por oportunidades ganadas
  const topProyectosRaw = await prisma.oportunidadCliente.groupBy({
    by: ['proyecto'],
    _count: { _all: true },
    _sum: { valor: true },
    where: {
      etapa: 'GANADO',
      proyecto: { not: null },
      creadoEn: { gte: startOfYear, lt: endOfYear },
    },
  });
  const topProyectos = topProyectosRaw
    .map(p => ({
      proyecto: p.proyecto as string,
      oportunidades: p._count._all,
      valorTotal: Number(p._sum.valor || 0),
    }))
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 5);

  // Conversión de leads a oportunidades (aproximado)
  const leadsConvertidos = await prisma.oportunidadCliente.count({
    where: { creadoEn: { gte: startOfYear, lt: endOfYear } },
  });
  const leadsDelAnio = await prisma.contacto.count({
    where: {
      tipo: 'LEAD',
      creadoEn: { gte: startOfYear, lt: endOfYear },
    },
  });
  const tasaConversion = leadsDelAnio > 0 ? Math.round((leadsConvertidos / leadsDelAnio) * 100) : 0;

  return {
    resumen: {
      totalContactos,
      totalLeads,
      leadsEsteMes,
      oportunidadesActivas: oportunidadesPorEtapa.reduce((sum, o) => sum + o._count._all, 0),
      oportunidadesGanadas,
      valorTotalOportunidades: Number(valorTotalOportunidades._sum.valor || 0),
      valorGanado: Number(valorGanado._sum.valor || 0),
      cotizacionesTotales,
      proyectosActivos,
      usuariosActivos,
      tasaConversion,
    },
    detalles: {
      contactosPorEstado: contactosPorEstado.map(c => ({
        estado: c.estadoLead || 'SIN_ESTADO',
        cantidad: c._count._all,
      })),
      oportunidadesPorEtapa: oportunidadesPorEtapa.map(o => ({
        etapa: o.etapa,
        cantidad: o._count._all,
      })),
      cotizacionesPorEstado: cotizacionesPorEstado.map(c => ({
        estado: c.estado,
        cantidad: c._count._all,
      })),
      proyectosPorEstado: proyectosPorEstado.map(p => ({
        estado: p.estado,
        cantidad: p._count._all,
      })),
      ventasMensuales,
      topProyectos,
    },
    periodo: {
      mesActual: currentMonth + 1,
      anioActual: currentYear,
    },
  };
  } catch (error) {
    console.error('[CRM Context] Error obteniendo datos:', error);
    // Devolver estructura vacía cuando falla la BD
    const now = new Date();
    return {
      resumen: {
        totalContactos: 0,
        totalLeads: 0,
        leadsEsteMes: 0,
        oportunidadesActivas: 0,
        oportunidadesGanadas: 0,
        valorTotalOportunidades: 0,
        valorGanado: 0,
        cotizacionesTotales: 0,
        proyectosActivos: 0,
        usuariosActivos: 0,
        tasaConversion: 0,
      },
      detalles: {
        contactosPorEstado: [],
        oportunidadesPorEtapa: [],
        cotizacionesPorEstado: [],
        proyectosPorEstado: [],
        ventasMensuales: Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, cantidad: 0, valor: 0 })),
        topProyectos: [],
      },
      periodo: {
        mesActual: now.getMonth() + 1,
        anioActual: now.getFullYear(),
      },
    };
  }
}
