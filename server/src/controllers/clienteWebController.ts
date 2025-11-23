import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '@/config/database';
import { generarPasswordTemporal } from '../utils/passwordUtils';
import { enviarCorreoCredenciales } from '../services/emailService';

/**
 * Crear acceso web para un cliente
 * POST /api/clientes/:id/crear-acceso-web
 */
export const crearAccesoWeb = async (req: Request, res: Response) => {
  try {
    const { id: contactoId } = req.params;
    const { passwordTemporal, enviarEmail = true } = req.body;

    // Verificar que el contacto existe (puede ser LEAD o CLIENTE)
    let contacto = await prisma.lead.findUnique({
      where: { id: contactoId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
      },
    });

    // Si no es lead, buscar en clientes
    if (!contacto) {
      contacto = await prisma.cliente.findUnique({
        where: { id: contactoId },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      });
    }

    if (!contacto) {
      return res.status(404).json({
        success: false,
        message: 'Contacto no encontrado',
      });
    }

    if (!contacto.correo) {
      return res.status(400).json({
        success: false,
        message: 'El contacto debe tener un correo electrónico',
      });
    }

    // Verificar si ya tiene acceso web
    const accesoExistente = await prisma.clientePassword.findUnique({
      where: { contactoId },
    });

    if (accesoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Este cliente ya tiene acceso web creado',
      });
    }

    // Generar contraseña temporal o usar la proporcionada
    const password = passwordTemporal || generarPasswordTemporal();
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear registro de acceso web
    const clientePassword = await prisma.clientePassword.create({
      data: {
        contactoId,
        passwordWeb: passwordHash,
      },
    });

    // TODO: Registrar actividad (tabla cliente_actividades no existe aún)
    // await prisma.clienteActividad.create({
    //   data: {
    //     contactoId,
    //     tipo: 'ACCESO_CREADO',
    //     descripcion: 'Acceso web creado por el agente',
    //     metadata: {
    //       passwordTemporal: true,
    //     },
    //   },
    // });

    // Enviar correo con credenciales (opcional)
    if (enviarEmail) {
      await enviarCorreoCredenciales({
        nombreCompleto: `${contacto.nombre} ${contacto.apellido || ''}`.trim(),
        correo: contacto.correo,
        password,
        urlPortal: process.env.WEB_PHP_URL || 'http://localhost:8081/portal',
      });
    }

    res.status(201).json({
      exito: true,
      mensaje: 'Acceso web creado exitosamente',
      datos: {
        contactoId,
        correo: contacto.correo,
        passwordTemporal: password, // Solo en desarrollo, en producción no retornar
        urlPortal: process.env.WEB_PHP_URL || 'http://localhost:8081/portal',
      },
    });
  } catch (error) {
    console.error('Error al crear acceso web:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al crear acceso web',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

/**
 * Resetear contraseña de cliente desde el CRM
 * POST /api/clientes/:id/resetear-password
 */
export const resetearPasswordCliente = async (req: Request, res: Response) => {
  try {
    const { id: contactoId } = req.params;
    const { nuevaPassword, enviarEmail = true } = req.body;

    // Buscar el contacto (puede ser LEAD o CLIENTE)
    let contacto = await prisma.lead.findUnique({
      where: { id: contactoId },
      select: { correo: true, nombre: true, apellido: true },
    });

    if (!contacto) {
      contacto = await prisma.cliente.findUnique({
        where: { id: contactoId },
        select: { correo: true, nombre: true, apellido: true },
      });
    }

    if (!contacto || !contacto.correo) {
      return res.status(404).json({
        success: false,
        message: 'Contacto no encontrado o sin correo',
      });
    }

    const password = nuevaPassword || generarPasswordTemporal();
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.clientePassword.update({
      where: { contactoId },
      data: { passwordWeb: passwordHash },
    });

    if (enviarEmail) {
      await enviarCorreoCredenciales({
        nombreCompleto: `${contacto.nombre} ${contacto.apellido || ''}`.trim(),
        correo: contacto.correo,
        password,
        urlPortal: process.env.WEB_PHP_URL || 'http://localhost:8081/portal',
        esReseteo: true,
      });
    }

    res.json({
      exito: true,
      mensaje: 'Contraseña reseteada exitosamente',
      datos: {
        passwordTemporal: password,
        correo: contacto.correo,
        urlPortal: process.env.WEB_PHP_URL || 'http://localhost:8081/portal',
      },
    });
  } catch (error) {
    console.error('Error al resetear password:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al resetear contraseña',
    });
  }
};

/**
 * Verificar si un cliente tiene acceso web
 * GET /api/clientes/:id/acceso-web
 */
export const verificarAccesoWeb = async (req: Request, res: Response) => {
  try {
    const { id: contactoId } = req.params;

    console.log(`🔍 Verificando acceso web para contacto: ${contactoId}`);

    const acceso = await prisma.clientePassword.findUnique({
      where: { contactoId },
      select: {
        contactoId: true,
        activo: true,
        creadoEn: true,
        actualizadoEn: true,
      },
    });

    console.log(`✅ Resultado de búsqueda:`, acceso);

    res.json({
      exito: true,
      tieneAcceso: !!acceso,
      datos: acceso ? {
        contactoId: acceso.contactoId,
        activo: acceso.activo ?? true,
        creadoEn: acceso.creadoEn,
        actualizadoEn: acceso.actualizadoEn,
      } : null,
    });
  } catch (error) {
    console.error('❌ Error al verificar acceso web:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al verificar acceso',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

/**
 * Eliminar acceso web de un cliente
 * DELETE /api/clientes/:id/acceso-web
 */
export const eliminarAccesoWeb = async (req: Request, res: Response) => {
  try {
    const { id: contactoId } = req.params;

    // Verificar que existe el acceso
    const accesoExistente = await prisma.clientePassword.findUnique({
      where: { contactoId },
    });

    if (!accesoExistente) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El cliente no tiene acceso web',
      });
    }

    // Eliminar el acceso
    await prisma.clientePassword.delete({
      where: { contactoId },
    });

    res.json({
      exito: true,
      mensaje: 'Acceso web eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar acceso web:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar acceso web',
    });
  }
};

/**
 * Activar o desactivar acceso web de un cliente
 * PATCH /api/contactos/:id/acceso-web/estado
 */
export const toggleAccesoWeb = async (req: Request, res: Response) => {
  try {
    const { id: contactoId } = req.params;
    const { activo } = req.body;

    // Verificar que existe el acceso
    const accesoExistente = await prisma.clientePassword.findUnique({
      where: { contactoId },
    });

    if (!accesoExistente) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El cliente no tiene acceso web',
      });
    }

    // Actualizar el estado del acceso usando raw SQL para mayor control
    await prisma.$executeRaw`
      UPDATE \`cliente_passwords\` 
      SET \`activo\` = ${activo ? 1 : 0}, \`updated_at\` = NOW()
      WHERE \`contacto_id\` = ${contactoId}
    `;

    // Obtener el registro actualizado para confirmación
    const accesoActualizado = await prisma.clientePassword.findUnique({
      where: { contactoId },
    });

    res.json({
      exito: true,
      mensaje: `Acceso web ${activo ? 'activado' : 'desactivado'} exitosamente`,
      datos: {
        activo: accesoActualizado?.activo ?? activo,
      },
    });
  } catch (error) {
    console.error('Error al cambiar estado de acceso:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al cambiar estado del acceso',
    });
  }
};

/**
 * Obtener información del acceso web (incluyendo la contraseña en algunos casos)
 * GET /api/contactos/:id/acceso-web/info
 */
export const obtenerInfoAccesoWeb = async (req: Request, res: Response) => {
  try {
    const { id: contactoId } = req.params;

    const acceso = await prisma.clientePassword.findUnique({
      where: { contactoId },
      select: {
        passwordWeb: true,
        activo: true,
        creadoEn: true,
        actualizadoEn: true,
      },
    });

    if (!acceso) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El cliente no tiene acceso web',
      });
    }

    res.json({
      exito: true,
      datos: {
        activo: acceso.activo ?? true,
        creadoEn: acceso.creadoEn,
        actualizadoEn: acceso.actualizadoEn,
        // No devolver la contraseña en plain text en producción
      },
    });
  } catch (error) {
    console.error('Error al obtener info de acceso:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener información del acceso',
    });
  }
};

