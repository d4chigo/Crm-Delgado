import { Request, Response } from 'express';
import prisma from '@/config/database';

class ClientPortalController {
  /**
   * GET /api/portal-cliente/perfil
   * Obtener información personal del cliente
   */
  async obtenerPerfil(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario?.usuarioId;

      console.log('[Portal] obtenerPerfil - Usuario:', {
        usuarioId,
        usuario: (req as any).usuario,
        headers: req.headers.authorization ? 'presente' : 'ausente'
      });

      if (!usuarioId) {
        console.error('[Portal] No hay usuarioId en el token');
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Buscar en Cliente primero, luego en Lead
      let cliente = await prisma.cliente.findUnique({
        where: { id: usuarioId },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          telefono: true,
          direccion: true,
          ciudad: true,
          provincia: true,
          dni: true,
          creadoEn: true,
          usuario: {
            select: {
              id: true,
              nombre: true,
              correo: true,
              telefono: true,
              avatar: true
            }
          }
        }
      });

      if (!cliente) {
        const lead = await prisma.lead.findUnique({
          where: { id: usuarioId },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            direccion: true,
            ciudad: true,
            provincia: true,
            dni: true,
            creadoEn: true,
            usuario: {
              select: {
                id: true,
                nombre: true,
                correo: true,
                telefono: true,
                avatar: true
              }
            }
          }
        });

        if (!lead) {
          return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        return res.json({
          success: true,
          data: lead
        });
      }

      res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil del cliente' });
    }
  }

  /**
   * PUT /api/portal-cliente/perfil
   * Actualizar información personal del cliente
   */
  async actualizarPerfil(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario?.usuarioId;

      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { nombre, apellido, telefono, dni, direccion, ciudad, provincia } = req.body;

      // Intentar actualizar en Cliente
      let clienteActualizado = await prisma.cliente.findUnique({
        where: { id: usuarioId }
      });

      if (clienteActualizado) {
        clienteActualizado = await prisma.cliente.update({
          where: { id: usuarioId },
          data: {
            nombre,
            apellido,
            telefono,
            dni,
            direccion,
            ciudad,
            provincia
          }
        });
      } else {
        // Si no está en Cliente, actualizar en Lead
        clienteActualizado = await prisma.lead.update({
          where: { id: usuarioId },
          data: {
            nombre,
            apellido,
            telefono,
            dni,
            direccion,
            ciudad,
            provincia
          }
        });
      }

      res.json({
        success: true,
        data: clienteActualizado,
        message: 'Perfil actualizado correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ error: 'Error al actualizar perfil del cliente' });
    }
  }

  /**
   * GET /api/portal-cliente/oportunidades
   * Listar todas las oportunidades del cliente
   */
  async obtenerOportunidades(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario?.usuarioId;

      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const oportunidades = await prisma.oportunidadCliente.findMany({
        where: { idCliente: usuarioId },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              correo: true,
              telefono: true,
              avatar: true
            }
          }
        },
        orderBy: { ultimaActividad: 'desc' }
      });

      res.json({
        success: true,
        total: oportunidades.length,
        data: oportunidades
      });
    } catch (error) {
      console.error('Error al obtener oportunidades:', error);
      res.status(500).json({ error: 'Error al obtener oportunidades' });
    }
  }

  /**
   * GET /api/portal-cliente/oportunidades/:id
   * Obtener detalle de una oportunidad
   */
  async obtenerOportunidadDetalle(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario?.usuarioId;
      const { id } = req.params;

      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const oportunidad = await prisma.oportunidadCliente.findUnique({
        where: { id },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              correo: true,
              telefono: true,
              avatar: true
            }
          }
        }
      });

      if (!oportunidad) {
        return res.status(404).json({ error: 'Oportunidad no encontrada' });
      }

      if (oportunidad.clienteId !== usuarioId) {
        return res.status(403).json({ error: 'No tienes acceso a esta oportunidad' });
      }

      res.json({
        success: true,
        data: oportunidad
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener oportunidad' });
    }
  }

  /**
   * GET /api/portal-cliente/cotizaciones
   * Listar cotizaciones del cliente
   */
  async obtenerCotizaciones(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario?.usuarioId;

      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const cotizaciones = await prisma.cotizacion.findMany({
        where: {
          OR: [
            { leadId: usuarioId },
            { clienteId: usuarioId }
          ]
        },
        orderBy: { creadoEn: 'desc' }
      });

      res.json({
        success: true,
        total: cotizaciones.length,
        data: cotizaciones
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener cotizaciones' });
    }
  }

  /**
   * GET /api/portal-cliente/documentos
   * Obtener documentos requeridos vs subidos
   */
  async obtenerDocumentos(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario?.usuarioId;

      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const documentosSubidos = await prisma.clienteDocumento.findMany({
        where: { contactoId: usuarioId },
        orderBy: { subidoEn: 'desc' }
      });

      const documentosRequeridos = [
        {
          id: 'DNI',
          nombre: 'DNI (frontal y reverso)',
          descripcion: 'Documento de identidad válido',
          obligatorio: true,
          instrucciones: 'Sube fotos claras del frente y reverso de tu DNI'
        },
        {
          id: 'RECIBOS_SUELDO',
          nombre: 'Últimos 3 recibos de sueldo',
          descripcion: 'Comprobante de ingresos',
          obligatorio: true,
          instrucciones: 'Últimos 3 meses de recibos de pago'
        },
        {
          id: 'DECLARACION_IMPUESTOS',
          nombre: 'Declaración de impuestos',
          descripcion: 'Último año fiscal',
          obligatorio: true,
          instrucciones: 'UIT del año anterior o PDT'
        },
        {
          id: 'REFERENCIA_BANCO',
          nombre: 'Referencia bancaria',
          descripcion: 'Carta del banco',
          obligatorio: true,
          instrucciones: 'Solícitala a tu banco'
        }
      ];

      const documentosConEstado = documentosRequeridos.map((req: any) => {
        const subido = documentosSubidos.find((d: any) => d.tipoDocumento === req.id);

        let estado = 'PENDIENTE';
        if (subido) {
          if (subido.estado === 'RECHAZADO') estado = 'RECHAZADO';
          else if (subido.estado === 'VERIFICADO') estado = 'VERIFICADO';
          else estado = 'SUBIDO';
        }

        return {
          ...req,
          estado,
          subido: subido ? {
            id: subido.id,
            nombreArchivo: subido.nombreArchivo,
            subidoEn: subido.subidoEn,
            estado: subido.estado,
            notas: subido.notas
          } : null
        };
      });

      const documentosVerificados = documentosConEstado.filter((d: any) => d.estado === 'VERIFICADO').length;
      const totalObligatorios = documentosConEstado.filter((d: any) => d.obligatorio).length;

      res.json({
        success: true,
        data: {
          documentosRequeridos: documentosConEstado,
          progreso: {
            total: documentosConEstado.length,
            verificados: documentosVerificados,
            faltantes: totalObligatorios - documentosVerificados,
            porcentaje: totalObligatorios > 0 ? Math.round((documentosVerificados / totalObligatorios) * 100) : 0
          }
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener documentos' });
    }
  }

  /**
   * GET /api/portal-cliente/asesor
   * Obtener información del asesor asignado
   */
  async obtenerAsesor(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario?.usuarioId;

      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const cliente = await prisma.contacto.findFirst({
        where: { id: usuarioId },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              telefono: true,
              avatar: true,
              activo: true
            }
          }
        }
      });

      if (!cliente?.usuario) {
        return res.status(404).json({ error: 'No hay asesor asignado' });
      }

      const totalClientes = await prisma.contacto.count({
        where: { usuarioId: cliente.usuario.id }
      });

      const totalCerrados = await prisma.oportunidadCliente.count({
        where: {
          usuarioId: cliente.usuario.id,
          etapa: 'CIERRE_GANADO'
        }
      });

      res.json({
        success: true,
        data: {
          ...cliente.usuario,
          estadisticas: {
            clientesActivos: totalClientes,
            cerrados: totalCerrados
          },
          horarioAtencion: {
            lunesViernes: '09:00 - 18:00',
            sabado: '10:00 - 14:00',
            domingo: 'Cerrado'
          }
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener asesor' });
    }
  }

  /**
   * GET /api/portal-cliente/actividades
   * Historial de actividades
   */
  async obtenerActividades(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario?.usuarioId;
      const { limite = 20, offset = 0 } = req.query;

      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const actividades = await prisma.clienteActividad.findMany({
        where: { contactoId: usuarioId },
        orderBy: { fecha: 'desc' },
        take: parseInt(limite as string),
        skip: parseInt(offset as string)
      });

      res.json({
        success: true,
        total: actividades.length,
        data: actividades
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener actividades' });
    }
  }

  /**
   * GET /api/portal-cliente/resumen
   * Obtener resumen del dashboard
   */
  async obtenerResumen(req: Request, res: Response) {
    try {
      const usuarioId = (req as any).usuario?.usuarioId;

      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Buscar cliente primero, luego lead
      let cliente = await prisma.cliente.findUnique({
        where: { id: usuarioId },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          telefono: true,
          creadoEn: true,
          usuario: {
            select: {
              id: true,
              nombre: true,
              telefono: true,
              avatar: true
            }
          }
        }
      });

      if (!cliente) {
        cliente = await prisma.lead.findUnique({
          where: { id: usuarioId },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            creadoEn: true,
            usuario: {
              select: {
                id: true,
                nombre: true,
                telefono: true,
                avatar: true
              }
            }
          }
        });
      }

      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      const oportunidades = await prisma.oportunidadCliente.findMany({
        where: {
          OR: [
            { idCliente: usuarioId },
            { idLead: usuarioId }
          ]
        },
        orderBy: { ultimaActividad: 'desc' },
        take: 5
      });

      const documentosSubidos = await prisma.clienteDocumento.findMany({
        where: { id_contacto: usuarioId },
        orderBy: { subido_en: 'desc' }
      });

      const cotizaciones = await prisma.cotizacion.findMany({
        where: {
          OR: [
            { idLead: usuarioId },
            { idCliente: usuarioId }
          ]
        },
        orderBy: { creadoEn: 'desc' },
        take: 3
      });

      res.json({
        success: true,
        data: {
          cliente,
          estadisticas: {
            oportunidadesActivas: oportunidades.filter((o: any) => o.etapa !== 'CIERRE_GANADO' && o.etapa !== 'CIERRE_PERDIDO').length,
            documentosVerificados: documentosSubidos.filter((d: any) => d.estado === 'VERIFICADO').length,
            documentosPendientes: documentosSubidos.filter((d: any) => d.estado === 'PENDIENTE').length,
            cotizacionesPendientes: cotizaciones.filter((c: any) => c.estado === 'ENVIADA').length
          },
          oportunidadesRecientes: oportunidades.slice(0, 3),
          cotizacionesRecientes: cotizaciones.slice(0, 2)
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener resumen' });
    }
  }
}

export default new ClientPortalController();
