/**
 * Servicio de Notificaciones en Tiempo Real
 * Utiliza Socket.io para enviar notificaciones instantáneas a los asesores
 */

import { WebSocketServer } from 'ws';
import prisma from '@/config/database';

// Conexiones activas de WebSocket
const activeConnections = new Map<string, any>();

export interface DatosLeadRealtime {
  leadId: string;
  nombre: string;
  apellido?: string;
  correo: string;
  telefono: string;
  interes?: string;
  origen?: string;
  mensaje?: string;
}

/**
 * Registrar una conexión de WebSocket para un usuario
 */
export const registrarConexion = (usuarioId: string, ws: any): void => {
  activeConnections.set(usuarioId, ws);
  console.log(`✅ Usuario ${usuarioId} conectado. Total conexiones: ${activeConnections.size}`);
};

/**
 * Desregistrar una conexión de WebSocket
 */
export const desregistrarConexion = (usuarioId: string): void => {
  activeConnections.delete(usuarioId);
  console.log(`❌ Usuario ${usuarioId} desconectado. Total conexiones: ${activeConnections.size}`);
};

/**
 * Enviar notificación en tiempo real a un usuario específico
 */
export const enviarNotificacionAUsuario = (usuarioId: string, datos: any): boolean => {
  const ws = activeConnections.get(usuarioId);
  
  if (!ws || ws.readyState !== 1) {
    console.log(`⚠️ Usuario ${usuarioId} no está conectado o conexión inactiva`);
    return false;
  }

  try {
    ws.send(JSON.stringify({
      tipo: 'notificacion',
      timestamp: new Date().toISOString(),
      ...datos
    }));
    console.log(`📤 Notificación enviada a usuario ${usuarioId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar notificación a ${usuarioId}:`, error);
    desregistrarConexion(usuarioId);
    return false;
  }
};

/**
 * Enviar notificación de nuevo lead a todos los admins/supervisores conectados
 */
export const notificarNuevoLeadEnTiempoReal = async (datos: DatosLeadRealtime): Promise<void> => {
  try {
    console.log('🔔 Notificando nuevo lead en tiempo real...');
    console.log(`📊 Conexiones WebSocket activas: ${activeConnections.size}`);

    // Obtener todos los admins y supervisores
    let usuarios: any[] = [];
    try {
      usuarios = await prisma.usuario.findMany({
        where: {
          OR: [
            { rol: 'ADMIN' },
            { rol: 'SUPERVISOR' }
          ],
          activo: true
        },
        select: { id: true, nombre: true, correo: true }
      });
      console.log(`📢 Encontrados ${usuarios.length} admins/supervisores en BD`);
    } catch (dbError) {
      console.warn('⚠️ No se pudo obtener usuarios de BD:', dbError);
      return; // Salir silenciosamente si no hay conexión a BD
    }

    // Enviar a cada usuario conectado
    let enviados = 0;
    for (const usuario of usuarios) {
      try {
        const enviado = enviarNotificacionAUsuario(usuario.id, {
          tipo: 'NUEVO_LEAD',
          titulo: `🔔 Nuevo Lead: ${datos.nombre} ${datos.apellido || ''}`,
          datos: {
            leadId: datos.leadId,
            nombre: datos.nombre,
            apellido: datos.apellido,
            correo: datos.correo,
            telefono: datos.telefono,
            interes: datos.interes,
            origen: datos.origen,
            mensaje: datos.mensaje,
            fecha: new Date().toLocaleString('es-PE')
          },
          accion: 'ver_lead',
          urgencia: 'alta'
        });

        if (enviado) {
          enviados++;
        } else {
          console.log(`ℹ️ Usuario ${usuario.id} (${usuario.nombre}) no conectado por WebSocket`);
        }
      } catch (sendError) {
        console.warn(`⚠️ Error enviando notificación a usuario ${usuario.id}:`, sendError);
        // Continuar con el siguiente usuario
      }
    }
    
    console.log(`✅ Notificaciones enviadas por WebSocket: ${enviados}/${usuarios.length}`)

  } catch (error) {
    console.error('❌ Error en notificarNuevoLeadEnTiempoReal:', error);
    // No lanzar excepción - las notificaciones en BD y WhatsApp ya se enviaron
  }
};

/**
 * Obtener estado de conexiones activas (para debugging)
 */
export const obtenerEstadoConexiones = (): any => {
  return {
    totalConexiones: activeConnections.size,
    usuarios: Array.from(activeConnections.keys())
  };
};

/**
 * Enviar notificación de prueba (para testing)
 */
export const enviarNotificacionPrueba = async (usuarioId: string): Promise<void> => {
  const enviado = enviarNotificacionAUsuario(usuarioId, {
    tipo: 'PRUEBA',
    titulo: '✅ Notificación de prueba',
    datos: {
      mensaje: 'Este es un mensaje de prueba del sistema de notificaciones en tiempo real',
      fecha: new Date().toLocaleString('es-PE')
    }
  });

  if (!enviado) {
    console.log(`Usuario ${usuarioId} no está conectado por WebSocket`);
  }
};
