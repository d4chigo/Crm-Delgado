import prisma from '@/config/database';

/**
 * Servicio para gestionar alertas de leads no contactados en las últimas 24 horas
 */

/**
 * Crear alerta para un lead que no ha sido contactado
 */
export const crearAlertaLead = async (
  contactoId: string,
  usuarioId: string,
  notas?: string
): Promise<any> => {
  try {
    const ahora = new Date();
    const fechaLimite = new Date(ahora.getTime() + 24 * 60 * 60 * 1000); // 24 horas desde ahora

    const alerta = await prisma.alertaLead.create({
      data: {
        leadId: contactoId,
        usuarioId,
        fechaCreada: ahora,
        fechaLimite,
        completada: false,
        notas: notas || null,
      },
      include: {
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            estado: true,
          },
        },
      },
    });

    console.log(`✅ Alerta creada para ${alerta.lead.nombre}`);
    return alerta;
  } catch (error: any) {
    console.error('❌ Error creando alerta:', error.message);
    throw error;
  }
};

/**
 * Generar alertas automáticamente para todos los leads no contactados hace 24+ horas
 * Ejecutar periódicamente (ej: cada hora o cada vez que carga el dashboard)
 */
export const generarAlertasLeadsNoContactados = async (): Promise<any[]> => {
  try {
    const ahora = new Date();
    const hace24horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

    console.log('🔍 Buscando leads no contactados en las últimas 24 horas...');

    // Buscar leads que:
    // 1. Fueron creados hace más de 24 horas
    // 2. NO han sido contactados (estado === NUEVO o EN_ESPERA)
    // 3. NO tienen una alerta activa ya creada

    const leadsNoContactados = await prisma.contacto.findMany({
      where: {
        tipo: 'LEAD',
        creadoEn: {
          lte: hace24horas, // Creado hace 24+ horas
        },
        estado: {
          in: ['NUEVO', 'EN_ESPERA'], // No contactado aún
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            correo: true,
          },
        },
      },
    });

    console.log(`📊 Encontrados ${leadsNoContactados.length} leads sin contactar`);

    // Crear alerta para cada lead encontrado
    const alertasCreadas = [];
    for (const lead of leadsNoContactados) {
      try {
        const alerta = await crearAlertaLead(
          lead.id,
          lead.usuarioId,
          `Lead creado hace ${Math.floor((ahora.getTime() - lead.creadoEn.getTime()) / (60 * 60 * 1000))} horas`
        );
        alertasCreadas.push(alerta);
      } catch (error: any) {
        console.error(`⚠️  Error creando alerta para lead ${lead.id}:`, error.message);
      }
    }

    console.log(`✅ ${alertasCreadas.length} alertas creadas exitosamente`);
    return alertasCreadas;
  } catch (error: any) {
    console.error('❌ Error generando alertas:', error.message);
    throw error;
  }
};

/**
 * Obtener alertas activas de un usuario
 */
export const obtenerAlertasActivas = async (usuarioId: string): Promise<any[]> => {
  try {
    const ahora = new Date();

    const alertas = await prisma.alertaLead.findMany({
      where: {
        usuarioId,
        completada: false,
      },
      include: {
        lead: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            estado: true,
            creadoEn: true,
          },
        },
      },
      orderBy: {
        fechaLimite: 'asc', // Ordenar por las más urgentes primero
      },
    });

    // Agregar información calculada
    const alertasConInfo = alertas.map((alerta: any) => ({
      ...alerta,
      tiempoRestante: {
        ms: alerta.fechaLimite.getTime() - ahora.getTime(),
        horas: Math.ceil((alerta.fechaLimite.getTime() - ahora.getTime()) / (60 * 60 * 1000)),
        urgente: (alerta.fechaLimite.getTime() - ahora.getTime()) < (6 * 60 * 60 * 1000), // Menos de 6 horas
      },
      horasDesdeCreacion: Math.floor(
        (ahora.getTime() - alerta.fechaCreada.getTime()) / (60 * 60 * 1000)
      ),
    }));

    return alertasConInfo;
  } catch (error: any) {
    console.error('❌ Error obteniendo alertas activas:', error.message);
    throw error;
  }
};

/**
 * Obtener estadísticas de alertas de un usuario
 */
export const obtenerEstadisticasAlertas = async (
  usuarioId: string
): Promise<{
  total: number;
  activas: number;
  urgentes: number;
  completadas: number;
}> => {
  try {
    const ahora = new Date();

    const alertas = await prisma.alertaLead.findMany({
      where: { idUsuario: usuarioId },
    });

    const activas = alertas.filter((a: any) => !a.completada);
    const urgentes = activas.filter(
      (a: any) => a.fechaLimite.getTime() - ahora.getTime() < 6 * 60 * 60 * 1000
    );
    const completadas = alertas.filter((a: any) => a.completada);

    return {
      total: alertas.length,
      activas: activas.length,
      urgentes: urgentes.length,
      completadas: completadas.length,
    };
  } catch (error: any) {
    console.error('❌ Error obteniendo estadísticas:', error.message);
    throw error;
  }
};

/**
 * Marcar una alerta como completada cuando se contacte al lead
 */
export const completarAlerta = async (
  alertaId: string,
  notas?: string
): Promise<any> => {
  try {
    const alerta = await prisma.alertaLead.findUnique({
      where: { id: alertaId },
      select: { notas: true },
    });

    let notasActualizadas = alerta?.notas || '';
    if (notas) {
      notasActualizadas = notasActualizadas
        ? `${notasActualizadas}\n✅ Completada: ${notas}`
        : `✅ Completada: ${notas}`;
    }

    const alertaCompletada = await prisma.alertaLead.update({
      where: { id: alertaId },
      data: {
        completada: true,
        completadaEn: new Date(),
        notas: notasActualizadas || null,
      },
      include: {
        contacto: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    console.log(
      `✅ Alerta completada para ${alertaCompletada.contacto.nombre} ${alertaCompletada.contacto.apellido}`
    );
    return alertaCompletada;
  } catch (error: any) {
    console.error('❌ Error completando alerta:', error.message);
    throw error;
  }
};

/**
 * Obtener todas las alertas (admin)
 */
export const obtenerTodasAlertas = async (filtro?: {
  completada?: boolean;
  usuarioId?: string;
  contactoId?: string;
}): Promise<any[]> => {
  try {
    const alertas = await prisma.alertaLead.findMany({
      where: {
        ...(filtro?.completada !== undefined && { completada: filtro.completada }),
        ...(filtro?.usuarioId && { usuarioId: filtro.usuarioId }),
        ...(filtro?.contactoId && { contactoId: filtro.contactoId }),
      },
      include: {
        contacto: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            correo: true,
          },
        },
      },
      orderBy: {
        fechaCreada: 'desc',
      },
    });

    return alertas;
  } catch (error: any) {
    console.error('❌ Error obteniendo alertas:', error.message);
    throw error;
  }
};

/**
 * Limpiar alertas completadas hace más de 30 días
 */
export const limpiarAlertasAntiguasCumpletadas = async (): Promise<number> => {
  try {
    const hace30dias = new Date();
    hace30dias.setDate(hace30dias.getDate() - 30);

    const resultado = await prisma.alertaLead.deleteMany({
      where: {
        completada: true,
        completadaEn: {
          lte: hace30dias,
        },
      },
    });

    console.log(`🗑️  ${resultado.count} alertas antiguas eliminadas`);
    return resultado.count;
  } catch (error: any) {
    console.error('❌ Error limpiando alertas:', error.message);
    throw error;
  }
};
