import { Request, Response } from 'express';
import prisma from '@/config/database';

// Nuevo endpoint para obtener estadísticas específicas
export async function getEstadisticas(req: Request, res: Response) {
  try {
    const { period = 'month', year } = req.query as { period?: string; year?: string };
    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    // Obtener datos básicos
    const [totalContactos, totalLeads, leadsConvertidos] = await Promise.all([
      prisma.contacto.count(),
      prisma.contacto.count({ where: { tipo: 'LEAD' } }),
      prisma.contacto.count({ where: { tipo: 'CLIENTE' } })
    ]);

    // Obtener actividades recientes (últimos 10 contactos creados)
    const actividadesRecientes = await prisma.contacto.findMany({
      take: 10,
      orderBy: { creadoEn: 'desc' },
      select: {
        nombre: true,
        apellido: true,
        tipo: true,
        creadoEn: true,
        usuario: {
          select: { nombre: true }
        }
      }
    });

    // Obtener edades de clientes (solo los que tienen fecha de nacimiento)
    const clientesConEdad = await prisma.contacto.findMany({
      where: {
        fechaNacimiento: { not: null },
        tipo: { in: ['LEAD', 'CLIENTE'] }
      },
      select: {
        fechaNacimiento: true,
        tipo: true
      }
    });

    // Calcular grupos de edad
    const gruposEdad = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56-65': 0,
      '65+': 0
    };

    clientesConEdad.forEach(cliente => {
      if (cliente.fechaNacimiento) {
        const edad = now.getFullYear() - cliente.fechaNacimiento.getFullYear();
        if (edad >= 18 && edad <= 25) gruposEdad['18-25']++;
        else if (edad >= 26 && edad <= 35) gruposEdad['26-35']++;
        else if (edad >= 36 && edad <= 45) gruposEdad['36-45']++;
        else if (edad >= 46 && edad <= 55) gruposEdad['46-55']++;
        else if (edad >= 56 && edad <= 65) gruposEdad['56-65']++;
        else if (edad > 65) gruposEdad['65+']++;
      }
    });

    // Obtener departamentos de clientes
    const departamentos = await prisma.contacto.groupBy({
      by: ['departamento'],
      _count: { _all: true },
      where: {
        departamento: { not: null },
        tipo: { in: ['LEAD', 'CLIENTE'] }
      }
    });

    const departamentosData = departamentos
      .filter(d => d.departamento)
      .map(d => ({
        departamento: d.departamento as string,
        cantidad: d._count._all
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Formatear a la forma que espera el frontend
    const estadisticasGenerales = [
      { titulo: 'Contactos', valor: String(totalContactos), cambio: '—', tendencia: 'up' as const },
      { titulo: 'Leads', valor: String(totalLeads), cambio: '—', tendencia: 'up' as const },
      { titulo: 'Clientes', valor: String(leadsConvertidos), cambio: '—', tendencia: 'up' as const },
    ];

    const actividadesFormateadas = actividadesRecientes.map((a) => ({
      fecha: new Date(a.creadoEn).toLocaleString('es-PE'),
      actividad: `Creación de ${a.tipo?.toLowerCase() || 'contacto'}: ${[a.nombre, a.apellido].filter(Boolean).join(' ')}`,
      usuario: a.usuario?.nombre || '—',
      tipo: (a.tipo || 'CONTACTO').toLowerCase(),
    }));

    const gruposEdadArray = Object.entries(gruposEdad).map(([rango, cantidad]) => ({ rango, cantidad }));

    res.json({ exito: true, datos: {
      estadisticasGenerales,
      actividadesRecientes: actividadesFormateadas,
      gruposEdad: gruposEdadArray,
      departamentos: departamentosData,
    } });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: 'Error obteniendo estadísticas' });
  }
}

export async function getReporteConversionPorOrigen(req: Request, res: Response) {
  try {
    const leadsPorFuente = await prisma.contacto.groupBy({
      by: ['fuente'],
      _count: { _all: true },
      where: { tipo: 'LEAD' },
    });

    const oportunidadesGanadas = await prisma.oportunidadCliente.findMany({
      where: { etapa: 'GANADO' },
      select: { cliente: { select: { fuente: true } }, valor: true },
    });

    const ganadasPorFuente = new Map<string, { count: number; value: number }>();
    for (const o of oportunidadesGanadas) {
      const key = o.cliente?.fuente || 'DESCONOCIDO';
      const prev = ganadasPorFuente.get(key) || { count: 0, value: 0 };
      ganadasPorFuente.set(key, { count: prev.count + 1, value: prev.value + Number(o.valor || 0) });
    }

    const data = leadsPorFuente.map((l) => {
      const key = (l.fuente as string) || 'DESCONOCIDO';
      const won = ganadasPorFuente.get(key)?.count || 0;
      const valor = ganadasPorFuente.get(key)?.value || 0;
      const conversion = l._count._all > 0 ? Math.round((won * 10000) / l._count._all) / 100 : 0;
      return { origen: key, leads: l._count._all, ganadas: won, conversion, valorGanado: valor };
    });

    try {
      await prisma.reporte.create({
        data: {
          tipo: 'conversion_por_origen',
          parametros: {},
          resultadosResumen: { totalOrigenes: data.length },
        },
      });
    } catch (auditErr) {
      console.warn('[Analytics] No se pudo registrar reporte conversion_por_origen:', auditErr);
    }

    res.json({ exito: true, datos: data });
  } catch (error) {
    console.error('[Analytics] Error conversion-origen:', error);
    res.json({ exito: true, datos: [] });
  }
}

export async function getReporteVelocidadCiclo(req: Request, res: Response) {
  try {
    const oportunidades = await prisma.oportunidadCliente.findMany({
      select: { etapa: true, creadoEn: true, actualizadoEn: true },
    });

    const agg = new Map<string, { totalDias: number; count: number }>();
    const now = new Date();
    for (const o of oportunidades) {
      const end = o.actualizadoEn || now as any;
      const diffMs = (new Date(end).getTime() - new Date(o.creadoEn).getTime());
      const dias = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      const key = o.etapa as string;
      const prev = agg.get(key) || { totalDias: 0, count: 0 };
      agg.set(key, { totalDias: prev.totalDias + dias, count: prev.count + 1 });
    }

    const data = Array.from(agg.entries()).map(([etapa, v]) => ({
      etapa,
      tiempoPromedioDias: v.count ? Math.round((v.totalDias / v.count) * 100) / 100 : 0,
      oportunidades: v.count,
    }));

    try {
      await prisma.reporte.create({
        data: {
          tipo: 'velocidad_ciclo',
          parametros: {},
          resultadosResumen: { etapas: data.length },
        },
      });
    } catch (auditErr) {
      console.warn('[Analytics] No se pudo registrar reporte velocidad_ciclo:', auditErr);
    }

    res.json({ exito: true, datos: data });
  } catch (error) {
    console.error('[Analytics] Error velocidad-ciclo:', error);
    res.json({ exito: true, datos: [] });
  }
}

export async function getReporteDesempenoAsesor(req: Request, res: Response) {
  try {
    const [usuarios, leadsPorAsesor, oportunidadesActivas, valorActivas] = await Promise.all([
      prisma.usuario.findMany({ select: { id: true, nombre: true } }),
      prisma.contacto.groupBy({ by: ['usuarioId'], _count: { _all: true }, where: { tipo: 'LEAD' } }),
      prisma.oportunidadCliente.groupBy({ by: ['usuarioId'], _count: { _all: true }, where: { etapa: { notIn: ['GANADO', 'PERDIDO'] } } }),
      prisma.oportunidadCliente.groupBy({ by: ['usuarioId'], _sum: { valor: true }, where: { etapa: { notIn: ['GANADO', 'PERDIDO'] } } }),
    ]);

    const leadsMap = new Map(leadsPorAsesor.map((r) => [r.usuarioId, r._count._all] as const));
    const oppMap = new Map(oportunidadesActivas.map((r) => [r.usuarioId, r._count._all] as const));
    const valMap = new Map(valorActivas.map((r) => [r.usuarioId, Number(r._sum.valor || 0)] as const));

    const data = usuarios.map((u) => ({
      asesor: u.nombre,
      leadsAsignados: leadsMap.get(u.id) || 0,
      oportunidadesActivas: oppMap.get(u.id) || 0,
      valorPipeline: valMap.get(u.id) || 0,
    }));

    try {
      await prisma.reporte.create({
        data: {
          tipo: 'desempeno_asesor',
          parametros: {},
          resultadosResumen: { asesores: data.length },
        },
      });
    } catch (auditErr) {
      console.warn('[Analytics] No se pudo registrar reporte desempeno_asesor:', auditErr);
    }

    res.json({ exito: true, datos: data });
  } catch (error) {
    console.error('[Analytics] Error desempeno-asesor:', error);
    res.json({ exito: true, datos: [] });
  }
}

export async function getReporteForecast(req: Request, res: Response) {
  try {
    const oportunidades = await prisma.oportunidadCliente.findMany({
      where: { etapa: { notIn: ['GANADO', 'PERDIDO'] } },
      select: { valor: true, probabilidad: true, creadoEn: true, proyecto: true },
    });

    let totalEsperado = 0;
    const porMes = new Map<number, number>();
    for (const o of oportunidades) {
      const p = Math.max(0, Math.min(100, Number(o.probabilidad ?? 0))) / 100;
      const v = Number(o.valor || 0) * p;
      totalEsperado += v;
      const m = (new Date(o.creadoEn).getMonth() + 1);
      porMes.set(m, (porMes.get(m) || 0) + v);
    }

    const mensual = Array.from(porMes.entries()).sort((a, b) => a[0] - b[0]).map(([mes, valor]) => ({ mes, valor: Math.round(valor * 100) / 100 }));

    try {
      await prisma.reporte.create({
        data: {
          tipo: 'forecast_ingresos',
          parametros: {},
          resultadosResumen: { totalEsperado: Math.round(totalEsperado * 100) / 100 },
        },
      });
    } catch (auditErr) {
      console.warn('[Analytics] No se pudo registrar reporte forecast_ingresos:', auditErr);
    }

    res.json({ exito: true, datos: { totalEsperado: Math.round(totalEsperado * 100) / 100, mensual } });
  } catch (error) {
    console.error('[Analytics] Error forecast:', error);
    res.json({ exito: true, datos: { totalEsperado: 0, mensual: [] } });
  }
}

export async function getMetrics(req: Request, res: Response) {
  try {
    const { period = 'month', year } = req.query as { period?: string; year?: string };

    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear + 1, 0, 1);

    // Aggregados principales
    const [totalLeadsMes, oportunidadesPorEtapa, cotizacionesPorEstado, ventasGanadas, ventasMensuales] = await Promise.all([
      prisma.contacto.count({
        where: {
          creadoEn: {
            gte: new Date(targetYear, now.getMonth(), 1),
            lt: new Date(targetYear, now.getMonth() + 1, 1),
          },
          tipo: 'LEAD',
        },
      }),
      prisma.oportunidadCliente.groupBy({
        by: ['etapa'],
        _count: { _all: true },
      }),
      prisma.cotizacion.groupBy({
        by: ['estado'],
        _count: { _all: true },
      }),
      prisma.oportunidadCliente.aggregate({
        _sum: { valor: true },
        _count: { _all: true },
        where: { etapa: 'GANADO' },
      }),
      // Serie mensual de "ventas" como oportunidades GANADO por mes
      Promise.all(
        Array.from({ length: 12 }, (_, i) => i).map(async (m) => {
          const ini = new Date(targetYear, m, 1);
          const fin = new Date(targetYear, m + 1, 1);
          const agg = await prisma.oportunidadCliente.aggregate({
            _sum: { valor: true },
            _count: { _all: true },
            where: { etapa: 'GANADO', creadoEn: { gte: ini, lt: fin } },
          });
          return { month: m + 1, count: agg._count._all, value: Number(agg._sum.valor || 0) };
        })
      ),
    ]);

    // Ventas por proyecto (proxy: oportunidades GANADO agrupadas por proyecto)
    const ventasPorProyectoRaw = await prisma.oportunidadCliente.groupBy({
      by: ['proyecto'],
      _count: { _all: true },
      _sum: { valor: true },
      where: { etapa: 'GANADO', creadoEn: { gte: startOfYear, lt: endOfYear } },
    });

    const totalValor = ventasPorProyectoRaw.reduce((acc, v) => acc + Number(v._sum.valor || 0), 0);
    const ventasPorProyecto = ventasPorProyectoRaw
      .filter(v => v.proyecto)
      .map(v => ({
        project: v.proyecto as string,
        sales: v._count._all,
        value: Number(v._sum.valor || 0),
        percentage: totalValor ? Math.round((Number(v._sum.valor || 0) * 100) / totalValor) : 0,
      }));

    // Ventas por "programa" no existe en schema; devolvemos agrupación por EstadoProyecto desde proyectos relacionados (proxy)
    const proyectos = await prisma.proyecto.findMany({
      where: { activo: true },
      select: { estado: true },
    });
    const estadoCounts = proyectos.reduce<Record<string, number>>((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {});
    const totalProgramas = Object.values(estadoCounts).reduce((a, b) => a + b, 0) || 1;
    const ventasPorPrograma = Object.entries(estadoCounts).map(([program, count]) => ({
      program,
      count,
      percentage: Math.round((count * 100) / totalProgramas),
    }));

    // Mejores agentes (proxy: usuarios ordenados por cantidad de oportunidades GANADO y valor)
    const mejoresAgentesRaw = await prisma.oportunidadCliente.groupBy({
      by: ['usuarioId'],
      _count: { _all: true },
      _sum: { valor: true },
      where: { etapa: 'GANADO', creadoEn: { gte: startOfYear, lt: endOfYear } },
    });
    const usuarios = await prisma.usuario.findMany({ select: { id: true, nombre: true } });
    const userMap = new Map(usuarios.map(u => [u.id, u.nombre] as const));
    const mejoresAgentes = mejoresAgentesRaw
      .map(a => ({
        name: userMap.get(a.usuarioId) || 'Agente',
        sales: a._count._all,
        value: Number(a._sum.valor || 0),
        conversion: 0, // si se requiere, se calcula con leads -> GANADO
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const metricas = [
      { title: 'Leads nuevos (mes)', value: String(totalLeadsMes), change: '—', trend: 'up', icon: 'users', color: '#303030', bgColor: '#FCBA00' },
      { title: 'Oportunidades (GANADO)', value: String(ventasGanadas._count._all), change: '—', trend: 'up', icon: 'target', color: '#303030', bgColor: '#FCBA00' },
      { title: 'Valor ganado', value: `S/ ${Math.round(Number(ventasGanadas._sum.valor || 0)).toLocaleString('es-PE')}`, change: '—', trend: 'up', icon: 'dollar', color: '#303030', bgColor: '#FCBA00' },
      { title: 'Cotizaciones', value: String(cotizacionesPorEstado.reduce((a, c) => a + c._count._all, 0)), change: '—', trend: 'up', icon: 'file', color: '#303030', bgColor: '#FCBA00' },
    ];

    res.json({ exito: true, datos: {
      metricas,
      ventasPorProyecto,
      ventasPorPrograma,
      mejoresAgentes,
      ventasMensuales,
    }});
  } catch (error: any) {
    console.error('[Analytics] Error obteniendo métricas:', error);
    // Devolver estructura vacía en lugar de 500 cuando no hay datos
    res.json({ exito: true, datos: {
      metricas: [
        { title: 'Leads nuevos (mes)', value: '0', change: '—', trend: 'up', icon: 'users', color: '#303030', bgColor: '#FCBA00' },
        { title: 'Oportunidades (GANADO)', value: '0', change: '—', trend: 'up', icon: 'target', color: '#303030', bgColor: '#FCBA00' },
        { title: 'Valor ganado', value: 'S/ 0', change: '—', trend: 'up', icon: 'dollar', color: '#303030', bgColor: '#FCBA00' },
        { title: 'Cotizaciones', value: '0', change: '—', trend: 'up', icon: 'file', color: '#303030', bgColor: '#FCBA00' },
      ],
      ventasPorProyecto: [],
      ventasPorPrograma: [],
      mejoresAgentes: [],
      ventasMensuales: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0, value: 0 })),
    }});
  }
}
