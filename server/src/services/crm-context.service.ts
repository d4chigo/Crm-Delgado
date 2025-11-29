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

    // Obtener datos de leads y clientes por separado
    const [
      // Conteos básicos
      totalLeads,
      leadsEsteMes,
      leadsConEdad,
      
      totalClientes,
      clientesEsteMes,
      clientesConEdad,
      
      // Estadísticas de leads
      leadsEstado,
      leadsDepto,
      leadsCiudad,
      leadsSexo,
      
      // Estadísticas de clientes
      clientesEstado,
      clientesDepto,
      clientesCiudad,
      clientesSexo,
      
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
      leadsRecientes,
      clientesRecientes,
      oportunidadesRecientes,
      cotizacionesRecientes,
      
      // Todos los registros
      todosLosLeads,
      todosLosClientes,
      todasLasOportunidades,
      todosLosProyectos,
      todasLasCotizaciones,
      todasLasEtiquetas,
    ] = await Promise.all([
      // Conteos básicos
      prisma.lead.count(),
      prisma.lead.count({
        where: {
          creadoEn: { gte: startOfMonth, lt: endOfMonth },
        },
      }),
      prisma.lead.findMany({
        where: { fechaNacimiento: { not: null } },
        select: { fechaNacimiento: true }
      }),
      
      prisma.cliente.count(),
      prisma.cliente.count({
        where: {
          creadoEn: { gte: startOfMonth, lt: endOfMonth },
        },
      }),
      prisma.cliente.findMany({
        where: { fechaNacimiento: { not: null } },
        select: { fechaNacimiento: true }
      }),
      
      // Estadísticas de leads
      prisma.lead.groupBy({
        by: ['estado'],
        _count: { _all: true },
      }),
      prisma.lead.groupBy({
        by: ['departamento'],
        _count: { _all: true },
        where: { departamento: { not: null } },
      }),
      prisma.lead.groupBy({
        by: ['ciudad'],
        _count: { _all: true },
        where: { ciudad: { not: null } },
      }),
      prisma.lead.groupBy({
        by: ['sexo'],
        _count: { _all: true },
        where: { sexo: { not: null } },
      }),
      
      // Estadísticas de clientes
      prisma.cliente.groupBy({
        by: ['prioridad'],
        _count: { _all: true },
      }),
      prisma.cliente.groupBy({
        by: ['departamento'],
        _count: { _all: true },
        where: { departamento: { not: null } },
      }),
      prisma.cliente.groupBy({
        by: ['ciudad'],
        _count: { _all: true },
        where: { ciudad: { not: null } },
      }),
      prisma.cliente.groupBy({
        by: ['sexo'],
        _count: { _all: true },
        where: { sexo: { not: null } },
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
        where: { etapa: 'CIERRE_GANADO' },
      }),
      prisma.oportunidadCliente.count({
        where: { etapa: 'CIERRE_GANADO' },
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
        by: ['idUsuario'],
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
        _sum: { totalPagar: true },
      }),
      prisma.cotizacion.groupBy({
        by: ['nombreProyecto'],
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
        by: ['idUsuario'],
        _count: { _all: true },
      }),
      
      // Usuarios
      prisma.usuario.count({ where: { activo: true } }),
      prisma.usuario.groupBy({
        by: ['rol'],
        _count: { _all: true },
      }),
      
      // Actividades recientes
      prisma.lead.findMany({
        take: 10,
        orderBy: { creadoEn: 'desc' },
        include: { usuario: { select: { nombre: true } } }
      }),
      prisma.cliente.findMany({
        take: 10,
        orderBy: { creadoEn: 'desc' },
        include: { usuario: { select: { nombre: true } } }
      }),
      prisma.oportunidadCliente.findMany({
        take: 10,
        orderBy: { creadoEn: 'desc' },
        include: { 
          cliente: { select: { nombre: true, apellido: true } },
          lead: { select: { nombre: true, apellido: true } },
          usuario: { select: { nombre: true } }
        }
      }),
      prisma.cotizacion.findMany({
        take: 10,
        orderBy: { creadoEn: 'desc' },
        include: { 
          cliente: { select: { nombre: true, apellido: true } },
          lead: { select: { nombre: true, apellido: true } },
        }
      }),
      
      // Todos los registros
      prisma.lead.findMany({
        include: { 
          usuario: { select: { nombre: true } },
          etiquetasRel: { include: { etiqueta: true } }
        }
      }),
      prisma.cliente.findMany({
        include: { 
          usuario: { select: { nombre: true } },
          etiquetasRel: { include: { etiqueta: true } }
        }
      }),
      prisma.oportunidadCliente.findMany({
        include: { 
          cliente: { select: { nombre: true, apellido: true, correo: true, telefono: true } },
          lead: { select: { nombre: true, apellido: true, correo: true, telefono: true } },
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
          lead: { select: { nombre: true, apellido: true } },
        }
      }),
      prisma.etiqueta.findMany(),
    ]);

    // Calcular grupos de edad
    const todosConEdad = [...leadsConEdad, ...clientesConEdad];
    const gruposEdad = todosConEdad.reduce((grupos: any, contacto: any) => {
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

    // Ventas mensuales
    const ventasMensuales = await Promise.all(
      Array.from({ length: 12 }, (_, i) => i).map(async (monthIndex) => {
        const monthStart = new Date(currentYear, monthIndex, 1);
        const monthEnd = new Date(currentYear, monthIndex + 1, 1);
        const result = await prisma.oportunidadCliente.aggregate({
          _sum: { valor: true },
          _count: { _all: true },
          where: {
            etapa: 'CIERRE_GANADO',
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

    // Top 5 proyectos
    const topProyectosRaw = await prisma.oportunidadCliente.groupBy({
      by: ['proyecto'],
      _count: { _all: true },
      _sum: { valor: true },
      where: {
        etapa: 'CIERRE_GANADO',
        proyecto: { not: null },
        creadoEn: { gte: startOfYear, lt: endOfYear },
      },
    });
    const topProyectos = topProyectosRaw
      .map((p: any) => ({
        proyecto: p.proyecto as string,
        oportunidades: p._count._all,
        valorTotal: Number(p._sum.valor || 0),
      }))
      .sort((a: any, b: any) => b.valorTotal - a.valorTotal)
      .slice(0, 5);

    // Conversión
    const leadsConvertidos = await prisma.oportunidadCliente.count({
      where: { creadoEn: { gte: startOfYear, lt: endOfYear } },
    });
    const leadsDelAnio = totalLeads; // Simplificado
    const tasaConversion = leadsDelAnio > 0 ? Math.round((leadsConvertidos / leadsDelAnio) * 100) : 0;

    const totalContactos = totalLeads + totalClientes;
    const leadsEsteMesTotal = leadsEsteMes;
    const clientesEsteMesTotal = clientesEsteMes;

    return {
      resumen: {
        totalContactos,
        totalLeads,
        totalClientes,
        leadsEsteMes: leadsEsteMesTotal,
        clientesEsteMes: clientesEsteMesTotal,
        oportunidadesActivas: oportunidadesPorEtapa.reduce((sum: number, o: any) => sum + o._count._all, 0),
        oportunidadesGanadas,
        valorTotalOportunidades: Number(valorTotalOportunidades._sum.valor || 0),
        valorGanado: Number(valorGanado._sum.valor || 0),
        cotizacionesTotales,
        cotizacionesEsteMes,
        valorTotalCotizaciones: Number(valorTotalCotizaciones._sum.totalPagar || 0),
        proyectosActivos,
        proyectosTotales,
        usuariosActivos,
        tasaConversion,
      },
      detalles: {
        contactosPorEstado: [
          ...leadsEstado.map((c: any) => ({
            tipo: 'LEAD',
            estado: c.estado || 'SIN_ESTADO',
            cantidad: c._count._all,
          })),
          ...clientesEstado.map((c: any) => ({
            tipo: 'CLIENTE',
            prioridad: c.prioridad || 'MEDIA',
            cantidad: c._count._all,
          })),
        ],
        contactosPorDepartamento: [
          ...leadsDepto.map((c: any) => ({
            departamento: c.departamento,
            cantidad: c._count._all,
          })),
          ...clientesDepto.map((c: any) => ({
            departamento: c.departamento,
            cantidad: c._count._all,
          })),
        ],
        contactosPorCiudad: [
          ...leadsCiudad.map((c: any) => ({
            ciudad: c.ciudad,
            cantidad: c._count._all,
          })),
          ...clientesCiudad.map((c: any) => ({
            ciudad: c.ciudad,
            cantidad: c._count._all,
          })),
        ],
        contactosPorSexo: [
          ...leadsSexo.map((c: any) => ({
            sexo: c.sexo,
            cantidad: c._count._all,
          })),
          ...clientesSexo.map((c: any) => ({
            sexo: c.sexo,
            cantidad: c._count._all,
          })),
        ],
        gruposEdad: Object.entries(gruposEdad).map(([rango, cantidad]) => ({
          rango,
          cantidad,
        })),
        oportunidadesPorEtapa: oportunidadesPorEtapa.map((o: any) => ({
          etapa: o.etapa,
          cantidad: o._count._all,
        })),
        oportunidadesPorProyecto: oportunidadesPorProyecto.map((o: any) => ({
          proyecto: o.proyecto,
          cantidad: o._count._all,
        })),
        oportunidadesPorUsuario: oportunidadesPorUsuario.map((o: any) => ({
          usuarioId: o.usuarioId,
          cantidad: o._count._all,
        })),
        cotizacionesPorEstado: cotizacionesPorEstado.map((c: any) => ({
          estado: c.estado,
          cantidad: c._count._all,
        })),
        cotizacionesPorProyecto: cotizacionesPorProyecto.map((c: any) => ({
          nombreProyecto: c.nombreProyecto,
          cantidad: c._count._all,
        })),
        proyectosPorEstado: proyectosPorEstado.map((p: any) => ({
          estado: p.estado,
          cantidad: p._count._all,
        })),
        proyectosPorUsuario: proyectosPorUsuario.map((p: any) => ({
          usuarioId: p.usuarioId,
          cantidad: p._count._all,
        })),
        usuariosPorRol: usuariosPorRol.map((u: any) => ({
          rol: u.rol,
          cantidad: u._count._all,
        })),
        ventasMensuales,
        topProyectos,
      },
      actividadesRecientes: {
        leads: leadsRecientes.map((l: any) => ({
          id: l.id,
          nombre: l.nombre,
          apellido: l.apellido,
          tipo: 'LEAD',
          creadoEn: l.creadoEn,
          usuario: l.usuario.nombre,
        })),
        clientes: clientesRecientes.map((c: any) => ({
          id: c.id,
          nombre: c.nombre,
          apellido: c.apellido,
          tipo: 'CLIENTE',
          creadoEn: c.creadoEn,
          usuario: c.usuario.nombre,
        })),
        oportunidades: oportunidadesRecientes.map((o: any) => {
          const contacto = o.cliente || o.lead;
          return {
            id: o.id,
            titulo: o.titulo,
            cliente: contacto ? `${contacto.nombre} ${contacto.apellido || ''}` : 'Sin contacto',
            etapa: o.etapa,
            valor: Number(o.valor || 0),
            creadoEn: o.creadoEn,
            usuario: o.usuario.nombre,
          };
        }),
        cotizaciones: cotizacionesRecientes.map((c: any) => {
          const contacto = c.cliente || c.lead;
          return {
            id: c.id,
            cliente: contacto ? `${contacto.nombre} ${contacto.apellido || ''}` : 'Sin contacto',
            proyecto: c.nombreProyecto,
            valorTotal: Number((c as any).totalPagar || 0),
            estado: c.estado,
            creadoEn: c.creadoEn,
          };
        }),
      },
      datosCompletos: {
        leads: todosLosLeads,
        clientes: todosLosClientes,
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
    // Devolver estructura vacía cuando falla
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
        contactosPorDepartamento: [],
        contactosPorCiudad: [],
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
        leads: [],
        clientes: [],
        oportunidades: [],
        cotizaciones: [],
      },
      datosCompletos: {
        leads: [],
        clientes: [],
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
