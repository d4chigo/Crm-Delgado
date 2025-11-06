import { Router, Request, Response } from 'express';
import prisma from '@/config/database';
import { TipoContacto, EstadoLead } from '@prisma/client';

const router = Router();

/**
 * POST /api/public/lead
 * Crear lead desde formulario público de la web
 */
router.post('/lead', async (req: Request, res: Response) => {
  try {
    const { nombre, apellido, email, telefono, interes, origen, mensaje } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !telefono) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Nombre, email y teléfono son obligatorios'
      });
    }

    // Verificar si ya existe un contacto con ese email o teléfono
    const contactoExistente = await prisma.contacto.findFirst({
      where: {
        OR: [
          { correo: email },
          { telefono: telefono }
        ]
      }
    });

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
          tipo: TipoContacto.LEAD,
          estadoLead: EstadoLead.NUEVO,
          observaciones: mensaje || contactoExistente.observaciones
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
          tipo: TipoContacto.LEAD,
          estadoLead: EstadoLead.NUEVO,
          observaciones: mensaje || `Interés: ${interes || 'No especificado'}. Origen: ${origen || 'Web'}`,
          usuarioId: usuarioAsignado.id
        }
      });
    }

    // Crear actividad registrando el origen del lead
    await prisma.actividad.create({
      data: {
        tipo: 'LLAMADA',
        descripcion: `Lead generado desde formulario web. Interés: ${interes || 'No especificado'}. Origen: ${origen || 'Web'}`,
        fechaActividad: new Date(),
        completada: false,
        contactoId: contacto.id,
        usuarioId: contacto.usuarioId
      }
    });

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
    console.error('Error al crear lead:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al crear el lead',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
