/**
 * Servicio MCP (Model Context Protocol)
 * Proporciona herramientas para que Gemini acceda a datos del CRM
 * Análisis de datos reales y recomendaciones de marketing
 */

import prisma from '@/config/database';
import { EstadoLead, Prioridad } from '@prisma/client';

// ============ TIPOS ============
export interface CRMAnalysis {
  totalLeads: number;
  totalClientes: number;
  leadsPorEstado: Record<string, number>;
  tasaConversion: number;
  ingresoPromedio: number;
  proyectosActivos: number;
  proyectosVendidos: number;
  leadsPorDepartamento: Record<string, number>;
  leadsPorFuente: Record<string, number>;
  cotizacionesPendientes: number;
  cotizacionesAceptadas: number;
}

export interface MarketingInsight {
  titulo: string;
  descripcion: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  accionRecomendada: string;
  impactoEstimado: string;
}

export interface LeadData {
  id: string;
  nombre: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  estado: string;
  prioridad: string;
  departamento?: string;
  ciudad?: string;
  empresa?: string;
  presupuesto?: number;
  fuente?: string;
  creadoEn: Date;
}

// ============ ANÁLISIS DE DATOS ============

/**
 * Obtener análisis completo del CRM
 */
export async function getCRMAnalysis(): Promise<CRMAnalysis> {
  try {
    // Contar leads y clientes
    const totalLeads = await prisma.lead.count();
    const totalClientes = await prisma.cliente.count();

    // Leads por estado
    const leadsPorEstado = await prisma.lead.groupBy({
      by: ['estado'],
      _count: true,
    });

    const leadsPorEstadoMap: Record<string, number> = {};
    leadsPorEstado.forEach((item) => {
      if (item.estado) {
        leadsPorEstadoMap[item.estado] = item._count;
      }
    });

    // Tasa de conversión (leads convertidos a clientes)
    const leadsConvertidos = await prisma.lead.count({
      where: { estado: 'GANADO' },
    });
    const tasaConversion = totalLeads > 0 ? (leadsConvertidos / totalLeads) * 100 : 0;

    // Ingreso promedio de cotizaciones aceptadas
    const cotizacionesAceptadas = await prisma.cotizacion.findMany({
      where: { estado: 'ACEPTADA' },
      select: { precioInmueble: true },
    });
    const ingresoPromedio =
      cotizacionesAceptadas.length > 0
        ? cotizacionesAceptadas.reduce((sum, c) => sum + c.precioInmueble, 0) /
          cotizacionesAceptadas.length
        : 0;

    // Proyectos
    const proyectosActivos = await prisma.proyecto.count({
      where: { estado: 'ACTIVO' },
    });
    const proyectosVendidos = await prisma.proyecto.count({
      where: { estado: 'VENDIDO' },
    });

    // Leads por departamento
    const leadsPorDeptData = await prisma.lead.groupBy({
      by: ['departamento'],
      _count: true,
    });
    const leadsPorDepartamento: Record<string, number> = {};
    leadsPorDeptData.forEach((item) => {
      if (item.departamento) {
        leadsPorDepartamento[item.departamento] = item._count;
      }
    });

    // Leads por fuente
    const leadsPorFuenteData = await prisma.lead.groupBy({
      by: ['fuente'],
      _count: true,
    });
    const leadsPorFuente: Record<string, number> = {};
    leadsPorFuenteData.forEach((item) => {
      if (item.fuente) {
        leadsPorFuente[item.fuente] = item._count;
      }
    });

    // Cotizaciones
    const cotizacionesPendientes = await prisma.cotizacion.count({
      where: { estado: 'BORRADOR' },
    });
    const cotizacionesAceptadasCount = await prisma.cotizacion.count({
      where: { estado: 'ACEPTADA' },
    });

    return {
      totalLeads,
      totalClientes,
      leadsPorEstado: leadsPorEstadoMap,
      tasaConversion,
      ingresoPromedio,
      proyectosActivos,
      proyectosVendidos,
      leadsPorDepartamento,
      leadsPorFuente,
      cotizacionesPendientes,
      cotizacionesAceptadas: cotizacionesAceptadasCount,
    };
  } catch (error) {
    console.error('Error en getCRMAnalysis:', error);
    throw error;
  }
}

/**
 * Generar insights de marketing basados en datos reales
 */
export async function generateMarketingInsights(): Promise<MarketingInsight[]> {
  try {
    const analysis = await getCRMAnalysis();
    const insights: MarketingInsight[] = [];

    // Insight 1: Tasa de conversión
    if (analysis.tasaConversion < 20) {
      insights.push({
        titulo: 'Tasa de Conversión Baja',
        descripcion: `Tu tasa de conversión es ${analysis.tasaConversion.toFixed(1)}%, por debajo del promedio de 20-30%.`,
        prioridad: 'ALTA',
        accionRecomendada: 'Mejora el seguimiento de leads. Implementa un sistema de recordatorios automáticos.',
        impactoEstimado: 'Potencial aumento de 10-15% en conversiones',
      });
    } else if (analysis.tasaConversion > 30) {
      insights.push({
        titulo: 'Excelente Tasa de Conversión',
        descripcion: `Tu tasa de conversión es ${analysis.tasaConversion.toFixed(1)}%, muy por encima del promedio.`,
        prioridad: 'BAJA',
        accionRecomendada: 'Mantén tu estrategia actual. Documenta tus mejores prácticas.',
        impactoEstimado: 'Consolidación de ventaja competitiva',
      });
    }

    // Insight 2: Leads sin calificar
    const leadsNuevos = analysis.leadsPorEstado['NUEVO'] || 0;
    if (leadsNuevos > analysis.totalLeads * 0.3) {
      insights.push({
        titulo: 'Muchos Leads Sin Calificar',
        descripcion: `Tienes ${leadsNuevos} leads nuevos sin calificar (${((leadsNuevos / analysis.totalLeads) * 100).toFixed(1)}%).`,
        prioridad: 'ALTA',
        accionRecomendada: 'Prioriza la calificación de estos leads. Asigna recursos específicos.',
        impactoEstimado: 'Aumento de 20-30% en leads calificados',
      });
    }

    // Insight 3: Cotizaciones pendientes
    if (analysis.cotizacionesPendientes > 5) {
      insights.push({
        titulo: 'Cotizaciones Pendientes',
        descripcion: `Tienes ${analysis.cotizacionesPendientes} cotizaciones en borrador sin enviar.`,
        prioridad: 'ALTA',
        accionRecomendada: 'Revisa y envía estas cotizaciones. Pueden convertirse en ventas rápidas.',
        impactoEstimado: 'Potencial de ingresos inmediato',
      });
    }

    // Insight 4: Concentración geográfica
    const deptEntries = Object.entries(analysis.leadsPorDepartamento);
    if (deptEntries.length > 0) {
      const topDept = deptEntries.sort((a, b) => b[1] - a[1])[0];
      const concentracion = (topDept[1] / analysis.totalLeads) * 100;
      if (concentracion > 50) {
        insights.push({
          titulo: 'Concentración Geográfica Alta',
          descripcion: `${concentracion.toFixed(1)}% de tus leads están en ${topDept[0]}.`,
          prioridad: 'MEDIA',
          accionRecomendada: 'Diversifica tu estrategia de marketing en otras regiones.',
          impactoEstimado: 'Reducción de riesgo y expansión de mercado',
        });
      }
    }

    // Insight 5: Fuentes de leads
    const fuenteEntries = Object.entries(analysis.leadsPorFuente);
    if (fuenteEntries.length > 0) {
      const topFuente = fuenteEntries.sort((a, b) => b[1] - a[1])[0];
      insights.push({
        titulo: 'Fuente Principal de Leads',
        descripcion: `${topFuente[0]} es tu fuente principal (${topFuente[1]} leads).`,
        prioridad: 'MEDIA',
        accionRecomendada: 'Invierte más en esta fuente. Explora canales similares.',
        impactoEstimado: 'Aumento de 15-25% en volumen de leads',
      });
    }

    // Insight 6: Ingresos
    if (analysis.ingresoPromedio > 0) {
      insights.push({
        titulo: 'Ingreso Promedio por Proyecto',
        descripcion: `Tu ingreso promedio es S/. ${analysis.ingresoPromedio.toLocaleString('es-PE', { maximumFractionDigits: 2 })}.`,
        prioridad: 'MEDIA',
        accionRecomendada: 'Identifica proyectos de mayor valor. Enfócate en vender más proyectos premium.',
        impactoEstimado: 'Aumento de 20-30% en ingresos totales',
      });
    }

    return insights;
  } catch (error) {
    console.error('Error en generateMarketingInsights:', error);
    throw error;
  }
}

/**
 * Obtener leads con filtros avanzados
 */
export async function getLeadsFiltered(filtros: {
  estado?: string;
  prioridad?: string;
  departamento?: string;
  fuente?: string;
  limite?: number;
}): Promise<LeadData[]> {
  try {
    const where: any = {};

    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.prioridad) where.prioridad = filtros.prioridad;
    if (filtros.departamento) where.departamento = filtros.departamento;
    if (filtros.fuente) where.fuente = filtros.fuente;

    const leads = await prisma.lead.findMany({
      where,
      take: filtros.limite || 10,
      orderBy: { creadoEn: 'desc' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        telefono: true,
        estado: true,
        prioridad: true,
        departamento: true,
        ciudad: true,
        empresa: true,
        presupuesto: true,
        fuente: true,
        creadoEn: true,
      },
    });

    return leads as LeadData[];
  } catch (error) {
    console.error('Error en getLeadsFiltered:', error);
    throw error;
  }
}

/**
 * Obtener clientes con información de proyectos
 */
export async function getClientesConProyectos(limite: number = 10) {
  try {
    const clientes = await prisma.cliente.findMany({
      take: limite,
      orderBy: { creadoEn: 'desc' },
      include: {
        proyectos: {
          include: {
            proyecto: true,
          },
        },
        cotizaciones: true,
      },
    });

    return clientes;
  } catch (error) {
    console.error('Error en getClientesConProyectos:', error);
    throw error;
  }
}

/**
 * Obtener oportunidades activas
 */
export async function getOportunidadesActivas(limite: number = 10) {
  try {
    const oportunidades = await prisma.oportunidadCliente.findMany({
      where: {
        etapa: {
          notIn: ['GANADA', 'PERDIDA'],
        },
      },
      take: limite,
      orderBy: { ultimaActividad: 'desc' },
      include: {
        lead: true,
        cliente: true,
      },
    });

    return oportunidades;
  } catch (error) {
    console.error('Error en getOportunidadesActivas:', error);
    throw error;
  }
}

/**
 * Obtener resumen de actividad reciente
 */
export async function getActividadReciente(dias: number = 7) {
  try {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    const leadsNuevos = await prisma.lead.count({
      where: { creadoEn: { gte: fechaInicio } },
    });

    const clientesNuevos = await prisma.cliente.count({
      where: { creadoEn: { gte: fechaInicio } },
    });

    const cotizacionesNuevas = await prisma.cotizacion.count({
      where: { creadoEn: { gte: fechaInicio } },
    });

    const oportunidadesNuevas = await prisma.oportunidadCliente.count({
      where: { creadoEn: { gte: fechaInicio } },
    });

    return {
      periodo: `Últimos ${dias} días`,
      leadsNuevos,
      clientesNuevos,
      cotizacionesNuevas,
      oportunidadesNuevas,
      actividadTotal: leadsNuevos + clientesNuevos + cotizacionesNuevas + oportunidadesNuevas,
    };
  } catch (error) {
    console.error('Error en getActividadReciente:', error);
    throw error;
  }
}

/**
 * Buscar contacto por correo
 */
export async function buscarContacto(correo: string) {
  try {
    const lead = await prisma.lead.findFirst({
      where: { correo },
    });

    if (lead) {
      return { tipo: 'lead', datos: lead };
    }

    const cliente = await prisma.cliente.findFirst({
      where: { correo },
    });

    if (cliente) {
      return { tipo: 'cliente', datos: cliente };
    }

    return null;
  } catch (error) {
    console.error('Error en buscarContacto:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas por usuario/agente
 */
export async function getEstadisticasPorAgente() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        leads: true,
        clientes: true,
        oportunidades: true,
      },
    });

    return usuarios.map((usuario) => ({
      nombre: usuario.nombre,
      email: usuario.correo,
      totalLeads: usuario.leads.length,
      totalClientes: usuario.clientes.length,
      totalOportunidades: usuario.oportunidades.length,
    }));
  } catch (error) {
    console.error('Error en getEstadisticasPorAgente:', error);
    throw error;
  }
}
