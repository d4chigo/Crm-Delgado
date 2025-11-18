import { Router, Request, Response } from 'express';
import prisma from '@/config/database';

const router = Router();

/**
 * GET /api/public/leads/recientes
 * Obtener los últimos leads creados (sin autenticación)
 */
router.get('/recientes', async (req: Request, res: Response) => {
  try {
    const leads = await prisma.contacto.findMany({
      where: {
        tipo: 'LEAD',
        estadoLead: 'NUEVO'
      },
      orderBy: {
        creadoEn: 'desc'
      },
      take: 10,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        telefono: true,
        intereses: true,
        notas: true,
        creadoEn: true
      }
    });

    console.log('[Public Leads] Leads encontrados:', leads.length);
    
    return res.json({
      exito: true,
      datos: leads.map((lead: any) => ({
        id: lead.id,
        nombre: lead.nombre,
        apellido: lead.apellido,
        email: lead.correo,
        telefono: lead.telefono,
        interes: lead.intereses || lead.notas,
        timestamp: lead.creadoEn
      }))
    });
  } catch (error) {
    console.error('[Public Leads] Error:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener leads',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
