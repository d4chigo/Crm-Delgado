import { Router, Request, Response } from 'express';
import { getCRMContext } from '@/services/crm-context.service';
import prisma from '@/config/database';

const router = Router();

/**
 * GET /api/crm-data/context
 * Obtiene el contexto completo del CRM con todas las métricas
 */
router.get('/context', async (req: Request, res: Response) => {
  try {
    const context = await getCRMContext();
    return res.json({ exito: true, datos: context });
  } catch (error) {
    console.error('[CRM Data] Error obteniendo contexto:', error);
    return res.status(500).json({ exito: false, error: 'Error obteniendo contexto del CRM' });
  }
});

/**
 * GET /api/crm-data/leads/count
 * Obtiene el número total de leads
 */
router.get('/leads/count', async (req: Request, res: Response) => {
  try {
    const count = await prisma.contacto.count({ where: { tipo: 'LEAD' } });
    return res.json({ exito: true, datos: { count } });
  } catch (error) {
    console.error('[CRM Data] Error contando leads:', error);
    return res.status(500).json({ exito: false, error: 'Error contando leads' });
  }
});

/**
 * GET /api/crm-data/leads/recent
 * Obtiene los leads más recientes
 */
router.get('/leads/recent', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const leads = await prisma.contacto.findMany({
      where: { tipo: 'LEAD' },
      take: limit,
      orderBy: { creadoEn: 'desc' },
      include: { usuario: { select: { nombre: true } } }
    });
    return res.json({ exito: true, datos: { leads } });
  } catch (error) {
    console.error('[CRM Data] Error obteniendo leads recientes:', error);
    return res.status(500).json({ exito: false, error: 'Error obteniendo leads recientes' });
  }
});

/**
 * GET /api/crm-data/oportunidades/count
 * Obtiene el número total de oportunidades
 */
router.get('/oportunidades/count', async (req: Request, res: Response) => {
  try {
    const count = await prisma.oportunidadCliente.count();
    const ganadas = await prisma.oportunidadCliente.count({ where: { etapa: 'GANADO' } });
    const valor = await prisma.oportunidadCliente.aggregate({
      _sum: { valor: true }
    });
    return res.json({ exito: true, datos: { count, ganadas, valor: Number(valor._sum.valor || 0) } });
  } catch (error) {
    console.error('[CRM Data] Error contando oportunidades:', error);
    return res.status(500).json({ exito: false, error: 'Error contando oportunidades' });
  }
});

/**
 * GET /api/crm-data/cotizaciones/count
 * Obtiene el número total de cotizaciones
 */
router.get('/cotizaciones/count', async (req: Request, res: Response) => {
  try {
    const count = await prisma.cotizacion.count();
    const valor = await prisma.cotizacion.aggregate({
      _sum: { totalPagar: true }
    });
    return res.json({ exito: true, datos: { count, valor: Number(valor._sum.totalPagar || 0) } });
  } catch (error) {
    console.error('[CRM Data] Error contando cotizaciones:', error);
    return res.status(500).json({ exito: false, error: 'Error contando cotizaciones' });
  }
});

/**
 * GET /api/crm-data/proyectos/count
 * Obtiene el número total de proyectos
 */
router.get('/proyectos/count', async (req: Request, res: Response) => {
  try {
    const total = await prisma.proyecto.count();
    const activos = await prisma.proyecto.count({ where: { activo: true } });
    return res.json({ exito: true, datos: { total, activos } });
  } catch (error) {
    console.error('[CRM Data] Error contando proyectos:', error);
    return res.status(500).json({ exito: false, error: 'Error contando proyectos' });
  }
});

/**
 * GET /api/crm-data/contactos/search
 * Busca contactos por nombre
 */
router.get('/contactos/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      return res.json({ exito: true, datos: { contactos: [] } });
    }

    const contactos = await prisma.contacto.findMany({
      where: {
        OR: [
          { nombre: { contains: query } },
          { apellido: { contains: query } },
          { correo: { contains: query } },
          { telefono: { contains: query } }
        ]
      },
      take: 10,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        telefono: true,
        tipo: true,
        estadoLead: true
      }
    });

    return res.json({ exito: true, datos: { contactos } });
  } catch (error) {
    console.error('[CRM Data] Error buscando contactos:', error);
    return res.status(500).json({ exito: false, error: 'Error buscando contactos' });
  }
});

/**
 * GET /api/crm-data/estadisticas/resumen
 * Obtiene un resumen rápido de estadísticas
 */
router.get('/estadisticas/resumen', async (req: Request, res: Response) => {
  try {
    const [
      totalContactos,
      totalLeads,
      totalClientes,
      totalOportunidades,
      oportunidadesGanadas,
      totalCotizaciones,
      totalProyectos,
      usuariosActivos
    ] = await Promise.all([
      prisma.contacto.count(),
      prisma.contacto.count({ where: { tipo: 'LEAD' } }),
      prisma.contacto.count({ where: { tipo: 'CLIENTE' } }),
      prisma.oportunidadCliente.count(),
      prisma.oportunidadCliente.count({ where: { etapa: 'GANADO' } }),
      prisma.cotizacion.count(),
      prisma.proyecto.count(),
      prisma.usuario.count({ where: { activo: true } })
    ]);

    const valorOportunidades = await prisma.oportunidadCliente.aggregate({
      _sum: { valor: true }
    });

    const valorCotizaciones = await prisma.cotizacion.aggregate({
      _sum: { totalPagar: true }
    });

    return res.json({
      exito: true,
      datos: {
        totalContactos,
        totalLeads,
        totalClientes,
        totalOportunidades,
        oportunidadesGanadas,
        valorOportunidades: Number(valorOportunidades._sum.valor || 0),
        totalCotizaciones,
        valorCotizaciones: Number(valorCotizaciones._sum.totalPagar || 0),
        totalProyectos,
        usuariosActivos
      }
    });
  } catch (error) {
    console.error('[CRM Data] Error obteniendo estadísticas:', error);
    return res.status(500).json({ exito: false, error: 'Error obteniendo estadísticas' });
  }
});

/**
 * GET /api/crm-data/testimonios
 * Obtiene testimonios (si existen en la BD)
 */
router.get('/testimonios', async (req: Request, res: Response) => {
  try {
    // Verificar si existe la tabla de testimonios
    const testimonios = await (prisma as any).testimonio?.findMany?.({
      take: 10,
      orderBy: { creadoEn: 'desc' }
    }) || [];

    return res.json({ exito: true, datos: { testimonios } });
  } catch (error) {
    console.error('[CRM Data] Error obteniendo testimonios:', error);
    // No es un error crítico si la tabla no existe
    return res.json({ exito: true, datos: { testimonios: [] } });
  }
});

/**
 * GET /api/crm-data/servicios
 * Obtiene servicios (si existen en la BD)
 */
router.get('/servicios', async (req: Request, res: Response) => {
  try {
    // Verificar si existe la tabla de servicios
    const servicios = await (prisma as any).paginaServicio?.findMany?.({
      take: 20,
      orderBy: { creadoEn: 'desc' }
    }) || [];

    return res.json({ exito: true, datos: { servicios } });
  } catch (error) {
    console.error('[CRM Data] Error obteniendo servicios:', error);
    // No es un error crítico si la tabla no existe
    return res.json({ exito: true, datos: { servicios: [] } });
  }
});

/**
 * GET /api/crm-data/portal-clientes
 * Obtiene información del portal de clientes
 */
router.get('/portal-clientes', async (req: Request, res: Response) => {
  try {
    const clientesActivos = await prisma.contacto.count({
      where: { tipo: 'CLIENTE', activo: true }
    });

    const cotizacionesActivas = await prisma.cotizacion.count({
      where: { estado: { in: ['PENDIENTE', 'EN_REVISION'] } }
    });

    return res.json({
      exito: true,
      datos: {
        clientesActivos,
        cotizacionesActivas,
        descripcion: 'Portal de clientes con acceso a cotizaciones y documentos'
      }
    });
  } catch (error) {
    console.error('[CRM Data] Error obteniendo datos del portal:', error);
    return res.status(500).json({ exito: false, error: 'Error obteniendo datos del portal' });
  }
});

export default router;
