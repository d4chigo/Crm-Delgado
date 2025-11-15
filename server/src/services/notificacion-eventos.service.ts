/**
 * Servicio de Eventos de Notificaciones
 * Emite notificaciones cuando ocurren eventos importantes en el CRM
 */

import prisma from '@/config/database';
import { NotificacionService } from './notificacion.service';

export class NotificacionEventosService {
  private notificacionService = new NotificacionService();

  /**
   * Notificar cuando se crea un nuevo lead
   */
  async notificarNuevoLead(contacto: any, usuarioId: string) {
    try {
      const titulo = `Nuevo Lead: ${contacto.nombre} ${contacto.apellido || ''}`;
      const mensaje = `Se ha creado un nuevo lead. Teléfono: ${contacto.telefono || 'N/A'}`;

      const notificacion = await this.notificacionService.crearNotificacion({
        usuarioId,
        titulo,
        mensaje,
        tipo: 'NUEVO_LEAD',
        referencia: `contacto:${contacto.id}`,
      });

      // Emitir por Socket.IO
      this.emitirPorSocket(usuarioId, 'notificacion:nueva', notificacion);

      return notificacion;
    } catch (error) {
      console.error('Error al notificar nuevo lead:', error);
    }
  }

  /**
   * Notificar cuando se convierte un lead a cliente
   */
  async notificarConversionACliente(contacto: any, usuarioId: string) {
    try {
      const titulo = `Lead Convertido: ${contacto.nombre}`;
      const mensaje = `${contacto.nombre} ha sido convertido a cliente`;

      const notificacion = await this.notificacionService.crearNotificacion({
        usuarioId,
        titulo,
        mensaje,
        tipo: 'CONVERSION_CLIENTE',
        referencia: `contacto:${contacto.id}`,
      });

      this.emitirPorSocket(usuarioId, 'notificacion:nueva', notificacion);
      return notificacion;
    } catch (error) {
      console.error('Error al notificar conversión:', error);
    }
  }

  /**
   * Notificar cuando se gana una oportunidad
   */
  async notificarOportunidadGanada(oportunidad: any, usuarioId: string) {
    try {
      const titulo = `🎉 Oportunidad Ganada: ${oportunidad.nombre}`;
      const mensaje = `Valor: S/ ${oportunidad.monto?.toLocaleString('es-PE') || '0'}`;

      const notificacion = await this.notificacionService.crearNotificacion({
        usuarioId,
        titulo,
        mensaje,
        tipo: 'OPORTUNIDAD_GANADA',
        referencia: `oportunidad:${oportunidad.id}`,
      });

      this.emitirPorSocket(usuarioId, 'notificacion:nueva', notificacion);
      return notificacion;
    } catch (error) {
      console.error('Error al notificar oportunidad ganada:', error);
    }
  }

  /**
   * Notificar cuando se pierde una oportunidad
   */
  async notificarOportunidadPerdida(oportunidad: any, usuarioId: string, razon?: string) {
    try {
      const titulo = `Oportunidad Perdida: ${oportunidad.nombre}`;
      const mensaje = razon ? `Razón: ${razon}` : 'Se ha perdido una oportunidad';

      const notificacion = await this.notificacionService.crearNotificacion({
        usuarioId,
        titulo,
        mensaje,
        tipo: 'OPORTUNIDAD_PERDIDA',
        referencia: `oportunidad:${oportunidad.id}`,
      });

      this.emitirPorSocket(usuarioId, 'notificacion:nueva', notificacion);
      return notificacion;
    } catch (error) {
      console.error('Error al notificar oportunidad perdida:', error);
    }
  }

  /**
   * Notificar seguimientos vencidos
   */
  async notificarSeguimientosVencidos(usuarioId: string) {
    try {
      // Obtener seguimientos vencidos
      const seguimientosVencidos = await prisma.contacto.findMany({
        where: {
          usuarioId,
          fechaSeguimiento: {
            lt: new Date(),
          },
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          fechaSeguimiento: true,
        },
      });

      if (seguimientosVencidos.length === 0) return;

      const titulo = `⏰ ${seguimientosVencidos.length} Seguimiento(s) Vencido(s)`;
      const mensaje = `Tienes ${seguimientosVencidos.length} seguimiento(s) pendiente(s)`;

      const notificacion = await this.notificacionService.crearNotificacion({
        usuarioId,
        titulo,
        mensaje,
        tipo: 'SEGUIMIENTO_VENCIDO',
        referencia: `seguimientos:${usuarioId}`,
      });

      this.emitirPorSocket(usuarioId, 'notificacion:nueva', notificacion);
      return notificacion;
    } catch (error) {
      console.error('Error al notificar seguimientos vencidos:', error);
    }
  }

  /**
   * Notificar cambio de etapa en oportunidad
   */
  async notificarCambioEtapa(
    oportunidad: any,
    etapaAnterior: string,
    etapaNueva: string,
    usuarioId: string
  ) {
    try {
      const titulo = `Cambio de Etapa: ${oportunidad.nombre}`;
      const mensaje = `${etapaAnterior} → ${etapaNueva}`;

      const notificacion = await this.notificacionService.crearNotificacion({
        usuarioId,
        titulo,
        mensaje,
        tipo: 'CAMBIO_ETAPA',
        referencia: `oportunidad:${oportunidad.id}`,
      });

      this.emitirPorSocket(usuarioId, 'notificacion:nueva', notificacion);
      return notificacion;
    } catch (error) {
      console.error('Error al notificar cambio de etapa:', error);
    }
  }

  /**
   * Notificar cotización creada
   */
  async notificarCotizacionCreada(cotizacionId: string, clienteNombre: string, usuarioId: string) {
    try {
      const titulo = `Cotización Creada para ${clienteNombre}`;
      const mensaje = 'Nueva cotización registrada en el sistema';

      const notificacion = await this.notificacionService.crearNotificacion({
        usuarioId,
        titulo,
        mensaje,
        tipo: 'COTIZACION_CREADA',
        referencia: `cotizacion:${cotizacionId}`,
      });

      this.emitirPorSocket(usuarioId, 'notificacion:nueva', notificacion);
      return notificacion;
    } catch (error) {
      console.error('Error al notificar cotización:', error);
    }
  }

  /**
   * Notificar proyecto creado
   */
  async notificarProyectoCreado(proyectoNombre: string, usuarioId: string) {
    try {
      const titulo = `Nuevo Proyecto: ${proyectoNombre}`;
      const mensaje = 'Se ha creado un nuevo proyecto';

      const notificacion = await this.notificacionService.crearNotificacion({
        usuarioId,
        titulo,
        mensaje,
        tipo: 'PROYECTO_CREADO',
        referencia: `proyecto:${proyectoNombre}`,
      });

      this.emitirPorSocket(usuarioId, 'notificacion:nueva', notificacion);
      return notificacion;
    } catch (error) {
      console.error('Error al notificar proyecto:', error);
    }
  }

  /**
   * Emitir notificación por Socket.IO
   */
  private emitirPorSocket(usuarioId: string, evento: string, datos: any) {
    try {
      const io = (global as any).io;
      if (io) {
        // Emitir al usuario específico
        io.to(`usuario:${usuarioId}`).emit(evento, datos);
        console.log(`📤 Notificación emitida a usuario ${usuarioId}`);
      }
    } catch (error) {
      console.error('Error al emitir por Socket.IO:', error);
    }
  }

  /**
   * Obtener notificaciones pendientes de un usuario
   */
  async obtenerPendientes(usuarioId: string) {
    try {
      return await this.notificacionService.obtenerNoLeidas(usuarioId);
    } catch (error) {
      console.error('Error al obtener pendientes:', error);
      return [];
    }
  }
}

export const notificacionEventosService = new NotificacionEventosService();
