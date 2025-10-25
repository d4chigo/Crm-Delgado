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

    // Obtener todos los datos en paralelo
    const [
      // Estadísticas básicas
      totalContactos,
      totalLeads,
      totalClientes,
      leadsEsteMes,
      clientesEsteMes,
      contactosPorEstado,
      contactosPorTipo,
      contactosPorDepartamento,
      contactosPorCiudad,
      contactosPorDistrito,
      contactosPorProvincia,
      contactosPorSexo,
      contactosConEdad,
      
      // Oportunidades
      oportunidadesPorEtapa,
      valorTotalOportunidades,
      valorGanado,
      oportunidadesGanadas,
      oportunidadesEsteMes,
      oportunidadesPorProyecto,
      oportunidadesPorUsuario,
      
      // Cotizaciones
      cotizacionesTotales,
      cotizacionesPorEstado,
      cotizacionesEsteMes,
      valorTotalCotizaciones,
      cotizacionesPorProyecto,
      
      // Proyectos
      proyectosActivos,
      proyectosPorEstado,
      proyectosTotales,
      proyectosPorUsuario,
      
      // Usuarios
      usuariosActivos,
      usuariosPorRol,
      
      // Actividades recientes
      contactosRecientes,
      oportunidadesRecientes,
      cotizacionesRecientes,
      
      // Datos detallados
      todosLosContactos,
      todasLasOportunidades,
      todosLosProyectos,
      todasLasCotizaciones,
      todasLasEtiquetas,
    ] = await Promise.all([
      // Estadísticas básicas
      prisma.contacto.count(),
      prisma.contacto.count({ where: { tipo: 'LEAD' } }),
      prisma.contacto.count({ where: { tipo: 'CLIENTE' } }),
      prisma.contacto.count({
        where: {
          tipo: 'LEAD',
          creadoEn: { gte: startOfMonth, lt: endOfMonth },
        },
      }),
      prisma.contacto.count({
        where: {
          tipo: 'CLIENTE',
          creadoEn: { gte: startOfMonth, lt: endOfMonth },
        },
      }),
      prisma.contacto.groupBy({
        by: ['estadoLead'],
        _count: { _all: true },
        where: { tipo: 'LEAD' },
      }),
      prisma.contacto.groupBy({
        by: ['tipo'],
        _count: { _all: true },
      }),
      prisma.contacto.groupBy({
        by: ['departamento'],
        _count: { _all: true },
        where: { departamento: { not: null } },
      }),
      prisma.contacto.groupBy({
        by: ['ciudad'],
        _count: { _all: true },
        where: { ciudad: { not: null } },
      }),
      prisma.contacto.groupBy({
        by: ['distrito'],
        _count: { _all: true },
        where: { distrito: { not: null } },
      }),
      prisma.contacto.groupBy({
        by: ['provincia'],
        _count: { _all: true },
        where: { provincia: { not: null } },
      }),
      prisma.contacto.groupBy({
        by: ['sexo'],
        _count: { _all: true },
        where: { sexo: { not: null } },
      }),
      prisma.contacto.findMany({
        where: { 
          fechaNacimiento: { not: null },
          tipo: { in: ['LEAD', 'CLIENTE'] }
        },
        select: { fechaNacimiento: true, tipo: true }
      }),
      
      // Oportunidades
      prisma.oportunidadCliente.groupBy({
        by: ['etapa'],
        _count: { _all: true },
      }),
      prisma.oportunidadCliente.aggregate({
        _sum: { valor: true },
      }),
      prisma.oportunidadCliente.aggregate({
        _sum: { valor: true },
        where: { etapa: 'GANADO' },
      }),
      prisma.oportunidadCliente.count({
        where: { etapa: 'GANADO' },
      }),
      prisma.oportunidadCliente.count({
        where: {
          creadoEn: { gte: startOfMonth, lt: endOfMonth },
        },
      }),
      prisma.oportunidadCliente.groupBy({
        by: ['proyecto'],
        _count: { _all: true },
        where: { proyecto: { not: null } },
      }),
      prisma.oportunidadCliente.groupBy({
        by: ['usuarioId'],
        _count: { _all: true },
      }),
      
      // Cotizaciones
      prisma.cotizacion.count(),
      prisma.cotizacion.groupBy({
        by: ['estado'],
        _count: { _all: true },
      }),
      prisma.cotizacion.count({
        where: {
          creadoEn: { gte: startOfMonth, lt: endOfMonth },
        },
      }),
      prisma.cotizacion.aggregate({
        _sum: { valorTotal: true },
      }),
      prisma.cotizacion.groupBy({
        by: ['proyectoId'],
        _count: { _all: true },
      }),
      
      // Proyectos
      prisma.proyecto.count({ where: { activo: true } }),
      prisma.proyecto.groupBy({
        by: ['estado'],
        _count: { _all: true },
      }),
      prisma.proyecto.count(),
      prisma.proyecto.groupBy({
        by: ['usuarioId'],
        _count: { _all: true },
      }),
      
      // Usuarios
      prisma.usuario.count({ where: { activo: true } }),
      prisma.usuario.groupBy({
        by: ['rol'],
        _count: { _all: true },
      }),
      
      // Actividades recientes
      prisma.contacto.findMany({
        take: 10,
        orderBy: { creadoEn: 'desc' },
        include: { usuario: { select: { nombre: true } } }
      }),
      prisma.oportunidadCliente.findMany({
        take: 10,
        orderBy: { creadoEn: 'desc' },
        include: { 
          cliente: { select: { nombre: true, apellido: true } },
          usuario: { select: { nombre: true } }
        }
      }),
      prisma.cotizacion.findMany({
        take: 10,
        orderBy: { creadoEn: 'desc' },
        include: { 
          cliente: { select: { nombre: true, apellido: true } },
          proyecto: { select: { nombre: true } }
        }
      }),
      
      // Datos detallados
      prisma.contacto.findMany({
        include: { 
          usuario: { select: { nombre: true } },
          etiquetas: { include: { etiqueta: true } }
        }
      }),
      prisma.oportunidadCliente.findMany({
        include: { 
          cliente: { select: { nombre: true, apellido: true, correo: true, telefono: true } },
          usuario: { select: { nombre: true } }
        }
      }),
      prisma.proyecto.findMany({
        include: { 
          usuario: { select: { nombre: true } },
          etiquetas: { include: { etiqueta: true } }
        }
      }),
      prisma.cotizacion.findMany({
        include: { 
          cliente: { select: { nombre: true, apellido: true } },
          proyecto: { select: { nombre: true } }
        }
      }),
      prisma.etiqueta.findMany(),
    ]);

    // Calcular grupos de edad
    const gruposEdad = contactosConEdad.reduce((grupos, contacto) => {
      if (contacto.fechaNacimiento) {
        const edad = now.getFullYear() - contacto.fechaNacimiento.getFullYear();
        let rango = '';
        
        if (edad >= 18 && edad <= 25) rango = '18-25';
        else if (edad >= 26 && edad <= 35) rango = '26-35';
        else if (edad >= 36 && edad <= 45) rango = '36-45';
        else if (edad >= 46 && edad <= 55) rango = '46-55';
        else if (edad >= 56 && edad <= 65) rango = '56-65';
        else if (edad > 65) rango = '65+';
        
        if (rango) {
          grupos[rango] = (grupos[rango] || 0) + 1;
        }
      }
      return grupos;
    }, {} as Record<string, number>);

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

    // Conversión de leads a oportunidades
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
        totalClientes,
        leadsEsteMes,
        clientesEsteMes,
        oportunidadesActivas: oportunidadesPorEtapa.reduce((sum, o) => sum + o._count._all, 0),
        oportunidadesGanadas,
        valorTotalOportunidades: Number(valorTotalOportunidades._sum.valor || 0),
        valorGanado: Number(valorGanado._sum.valor || 0),
        cotizacionesTotales,
        cotizacionesEsteMes,
        valorTotalCotizaciones: Number(valorTotalCotizaciones._sum.valorTotal || 0),
        proyectosActivos,
        proyectosTotales,
        usuariosActivos,
        tasaConversion,
      },
      detalles: {
        contactosPorEstado: contactosPorEstado.map(c => ({
          estado: c.estadoLead || 'SIN_ESTADO',
          cantidad: c._count._all,
        })),
        contactosPorTipo: contactosPorTipo.map(c => ({
          tipo: c.tipo,
          cantidad: c._count._all,
        })),
        contactosPorDepartamento: contactosPorDepartamento.map(c => ({
          departamento: c.departamento,
          cantidad: c._count._all,
        })),
        contactosPorCiudad: contactosPorCiudad.map(c => ({
          ciudad: c.ciudad,
          cantidad: c._count._all,
        })),
        contactosPorDistrito: contactosPorDistrito.map(c => ({
          distrito: c.distrito,
          cantidad: c._count._all,
        })),
        contactosPorProvincia: contactosPorProvincia.map(c => ({
          provincia: c.provincia,
          cantidad: c._count._all,
        })),
        contactosPorSexo: contactosPorSexo.map(c => ({
          sexo: c.sexo,
          cantidad: c._count._all,
        })),
        gruposEdad: Object.entries(gruposEdad).map(([rango, cantidad]) => ({
          rango,
          cantidad,
        })),
        oportunidadesPorEtapa: oportunidadesPorEtapa.map(o => ({
          etapa: o.etapa,
          cantidad: o._count._all,
        })),
        oportunidadesPorProyecto: oportunidadesPorProyecto.map(o => ({
          proyecto: o.proyecto,
          cantidad: o._count._all,
        })),
        oportunidadesPorUsuario: oportunidadesPorUsuario.map(o => ({
          usuarioId: o.usuarioId,
          cantidad: o._count._all,
        })),
        cotizacionesPorEstado: cotizacionesPorEstado.map(c => ({
          estado: c.estado,
          cantidad: c._count._all,
        })),
        cotizacionesPorProyecto: cotizacionesPorProyecto.map(c => ({
          proyectoId: c.proyectoId,
          cantidad: c._count._all,
        })),
        proyectosPorEstado: proyectosPorEstado.map(p => ({
          estado: p.estado,
          cantidad: p._count._all,
        })),
        proyectosPorUsuario: proyectosPorUsuario.map(p => ({
          usuarioId: p.usuarioId,
          cantidad: p._count._all,
        })),
        usuariosPorRol: usuariosPorRol.map(u => ({
          rol: u.rol,
          cantidad: u._count._all,
        })),
        ventasMensuales,
        topProyectos,
      },
      actividadesRecientes: {
        contactos: contactosRecientes.map(c => ({
          id: c.id,
          nombre: c.nombre,
          apellido: c.apellido,
          tipo: c.tipo,
          creadoEn: c.creadoEn,
          usuario: c.usuario.nombre,
        })),
        oportunidades: oportunidadesRecientes.map(o => ({
          id: o.id,
          titulo: o.titulo,
          cliente: `${o.cliente.nombre} ${o.cliente.apellido || ''}`,
          etapa: o.etapa,
          valor: Number(o.valor || 0),
          creadoEn: o.creadoEn,
          usuario: o.usuario.nombre,
        })),
        cotizaciones: cotizacionesRecientes.map(c => ({
          id: c.id,
          cliente: `${c.cliente.nombre} ${c.cliente.apellido || ''}`,
          proyecto: c.proyecto?.nombre,
          valorTotal: Number(c.valorTotal || 0),
          estado: c.estado,
          creadoEn: c.creadoEn,
        })),
      },
      datosCompletos: {
        contactos: todosLosContactos,
        oportunidades: todasLasOportunidades,
        proyectos: todosLosProyectos,
        cotizaciones: todasLasCotizaciones,
        etiquetas: todasLasEtiquetas,
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
        totalClientes: 0,
        leadsEsteMes: 0,
        clientesEsteMes: 0,
        oportunidadesActivas: 0,
        oportunidadesGanadas: 0,
        valorTotalOportunidades: 0,
        valorGanado: 0,
        cotizacionesTotales: 0,
        cotizacionesEsteMes: 0,
        valorTotalCotizaciones: 0,
        proyectosActivos: 0,
        proyectosTotales: 0,
        usuariosActivos: 0,
        tasaConversion: 0,
      },
      detalles: {
        contactosPorEstado: [],
        contactosPorTipo: [],
        contactosPorDepartamento: [],
        contactosPorCiudad: [],
        contactosPorDistrito: [],
        contactosPorProvincia: [],
        contactosPorSexo: [],
        gruposEdad: [],
        oportunidadesPorEtapa: [],
        oportunidadesPorProyecto: [],
        oportunidadesPorUsuario: [],
        cotizacionesPorEstado: [],
        cotizacionesPorProyecto: [],
        proyectosPorEstado: [],
        proyectosPorUsuario: [],
        usuariosPorRol: [],
        ventasMensuales: Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, cantidad: 0, valor: 0 })),
        topProyectos: [],
      },
      actividadesRecientes: {
        contactos: [],
        oportunidades: [],
        cotizaciones: [],
      },
      datosCompletos: {
        contactos: [],
        oportunidades: [],
        proyectos: [],
        cotizaciones: [],
        etiquetas: [],
      },
      periodo: {
        mesActual: now.getMonth() + 1,
        anioActual: now.getFullYear(),
      },
    };
  }
}