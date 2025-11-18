import { Router, Request, Response } from 'express';
import prisma from '@/config/database';

const router = Router();

/**
 * POST /api/webhooks/nuevo-lead-pgdp
 * Recibe notificación cuando se crea un nuevo lead desde PGDP
 * Emite evento Socket.IO para notificar en tiempo real
 */
router.post('/nuevo-lead-pgdp', async (req: Request, res: Response) => {
  try {
    const { leadId, nombre, apellido, email, telefono, interes, fuente } = req.body;

    // Validar datos
    if (!leadId || !nombre || !email) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Datos incompletos'
      });
    }

    // Obtener el lead creado
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        contacto: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    if (!lead) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Lead no encontrado'
      });
    }

    // Emitir evento Socket.IO a todos los clientes conectados
    const io = (global as any).io;
    if (io) {
      io.emit('nuevo-lead-pgdp', {
        id: lead.id,
        nombre: `${nombre} ${apellido}`,
        email,
        telefono,
        interes,
        fuente: fuente || 'Página Web',
        estado: lead.estado,
        fechaCreacion: lead.creadoEn,
        mensaje: `Nuevo lead desde PGDP: ${nombre} ${apellido}`
      });

      console.log(`[Webhook] Notificación de nuevo lead enviada: ${nombre} ${apellido}`);
    }

    return res.json({
      exito: true,
      mensaje: 'Notificación recibida correctamente',
      lead: {
        id: lead.id,
        nombre: `${nombre} ${apellido}`,
        email,
        telefono
      }
    });

  } catch (error) {
    console.error('[Webhook] Error:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al procesar la notificación'
    });
  }
});

export default router;
