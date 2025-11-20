import { Router, Request, Response } from 'express';
import prisma from '@/config/database';
import { enviarWhatsAppNuevoLead } from '@/services/whatsapp.service';
import { crearNotificacionNuevoLead } from '@/services/notificacion-lead.service';
import { notificarNuevoLeadEnTiempoReal } from '@/services/notificacion-realtime.service';

const router = Router();

/**
 * GET /api/public/team
 * Obtener miembros del equipo (público, sin autenticación)
 */
router.get('/team', async (req: Request, res: Response) => {
  try {
    const team = await prisma.miembroEquipo.findMany({
      where: { activo: true },
      orderBy: { ordenMostrar: 'asc' },
      select: {
        id: true,
        nombre: true,
        cargo: true,
        descripcion: true,
        correo: true,
        telefono: true,
        foto: true,
        facebook: true,
        instagram: true,
        tiktok: true,
        activo: true,
        ordenMostrar: true,
      }
    });

    // Mapear al formato esperado por el frontend
    const teamFormatted = team.map((member: any) => ({
      id: member.id,
      name: member.nombre,
      position: member.cargo,
      description: member.descripcion,
      email: member.correo,
      phone: member.telefono,
      photo: member.foto,
      facebook_url: member.facebook,
      instagram_url: member.instagram,
      tiktok_url: member.tiktok,
      active: member.activo,
      display_order: member.ordenMostrar,
    }));

    res.json({ success: true, data: teamFormatted, count: teamFormatted.length });
  } catch (error) {
    console.error('Error al obtener equipo público:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener los miembros del equipo'
    });
  }
});

/**
 * POST /api/public/lead
 * Crear lead desde formulario público de la web
 */
router.post('/lead', async (req: Request, res: Response) => {
  try {
    const { nombre, apellido, email, telefono, interes, origen, mensaje } = req.body;

    console.log('[Lead] Iniciando creación de lead:', { nombre, email, telefono });

    // Validaciones básicas
    if (!nombre || !email || !telefono) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Nombre, email y teléfono son obligatorios'
      });
    }

    // Verificar si ya existe un contacto con ese email o teléfono
    console.log('[Lead] Buscando contacto existente...');
    const contactoExistente = await prisma.contacto.findFirst({
      where: {
        OR: [
          { correo: email },
          { telefono: telefono }
        ]
      }
    });
    console.log('[Lead] Búsqueda completada. Existente:', !!contactoExistente);

    let contacto;

    if (contactoExistente) {
      // Si existe, actualizar datos y cambiar a LEAD si no lo era
      contacto = await prisma.contacto.update({
        where: { id: contactoExistente.id },
        data: {
          nombre: nombre,
          apellido: apellido || contactoExistente.apellido,
          correo: email,
          telefono: telefono,
          tipo: 'LEAD' as any,
          estadoLead: 'NUEVO' as any,
          notas: mensaje || contactoExistente.notas
        }
      });
    } else {
      // Crear nuevo lead
      // Obtener el primer usuario admin/supervisor para asignarle el lead
      const usuarioAsignado = await prisma.usuario.findFirst({
        where: {
          OR: [
            { rol: 'ADMIN' },
            { rol: 'SUPERVISOR' }
          ],
          activo: true
        },
        orderBy: { creadoEn: 'asc' }
      });

      if (!usuarioAsignado) {
        return res.status(500).json({
          exito: false,
          mensaje: 'No hay usuarios disponibles para asignar el lead'
        });
      }

      contacto = await prisma.contacto.create({
        data: {
          nombre: nombre,
          apellido: apellido || '',
          correo: email,
          telefono: telefono,
          tipo: 'LEAD' as any,
          estadoLead: 'NUEVO' as any,
          notas: mensaje || `Interés: ${interes || 'No especificado'}. Origen: ${origen || 'Web'}`,
          usuarioId: usuarioAsignado.id
        }
      });
    }


    // Crear actividad registrando el origen del lead
    // Nota: El modelo 'Actividad' no existe en el schema, se omite
    // await prisma.actividad.create({
    //   data: {
    //     tipo: 'LLAMADA',
    //     descripcion: `Lead generado desde formulario web. Interés: ${interes || 'No especificado'}. Origen: ${origen || 'Web'}`,
    //     fechaActividad: new Date(),
    //     completada: false,
    //     contactoId: contacto.id,
    //     usuarioId: contacto.usuarioId
    //   }
    // });


    // Si hay etiqueta según el interés, asignarla
    if (interes) {
      const etiquetaNombre = interes === 'Techo Propio' ? 'Techo Propio' 
                           : interes === 'MiVivienda' ? 'Crédito MiVivienda'
                           : interes === 'Comprar' ? 'Comprador'
                           : interes === 'Vender' ? 'Vendedor'
                           : null;

      if (etiquetaNombre) {
        const etiqueta = await prisma.etiqueta.findFirst({
          where: { nombre: etiquetaNombre }
        });

        if (etiqueta) {
          // Verificar si ya tiene esta etiqueta
          const tieneEtiqueta = await prisma.contactoEtiqueta.findFirst({
            where: {
              contactoId: contacto.id,
              etiquetaId: etiqueta.id
            }
          });

          if (!tieneEtiqueta) {
            await prisma.contactoEtiqueta.create({
              data: {
                contactoId: contacto.id,
                etiquetaId: etiqueta.id
              }
            });
          }
        }
      }
    }

    // Crear notificación en el CRM
    try {
      await crearNotificacionNuevoLead({
        leadId: contacto.id,
        nombre,
        apellido,
        email,
        telefono,
        interes,
        origen
      });
    } catch (notifError) {
      console.warn('⚠️ Advertencia: Error al crear notificación en BD:', notifError);
    }

    // Enviar notificación en tiempo real (WebSocket)
    try {
      await notificarNuevoLeadEnTiempoReal({
        leadId: contacto.id,
        nombre,
        apellido,
        email,
        telefono,
        interes,
        origen,
        mensaje
      });
    } catch (realtimeError) {
      console.warn('⚠️ Advertencia: Error al enviar notificación realtime:', realtimeError);
      // No interrumpir el flujo - las notificaciones en BD y WhatsApp ya se enviaron
    }

    // Enviar notificación por WhatsApp al admin
    try {
      await enviarWhatsAppNuevoLead({
        nombre,
        apellido,
        email,
        telefono,
        interes,
        origen,
        mensaje
      });
    } catch (whatsappError) {
      console.warn('⚠️ Advertencia: Error al enviar WhatsApp:', whatsappError);
      // No interrumpir el flujo si falla WhatsApp
    }

    console.log('✅ Lead creado exitosamente:', contacto.id);
    res.status(201).json({
      exito: true,
      mensaje: 'Lead creado exitosamente',
      contacto: {
        id: contacto.id,
        nombre: contacto.nombre,
        apellido: contacto.apellido,
        email: contacto.correo,
        tipo: contacto.tipo
      }
    });

  } catch (error) {
    console.error('❌ Error al crear lead:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al crear el lead',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
