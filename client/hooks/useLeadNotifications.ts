/**
 * Hook para conectarse a notificaciones en tiempo real del CRM
 * Escucha nuevos leads y otros eventos a través de WebSocket
 */

import { useEffect, useCallback } from 'react';

interface NotificacionLead {
  tipo: string;
  titulo: string;
  datos: {
    leadId: string;
    nombre: string;
    apellido?: string;
    email: string;
    telefono: string;
    interes?: string;
    origen?: string;
    fecha: string;
  };
  accion: string;
  urgencia: string;
}

export const useLeadNotifications = (
  usuarioId: string | undefined,
  onNewLead: (lead: NotificacionLead) => void
) => {
  const connectWebSocket = useCallback(() => {
    if (!usuarioId) {
      console.log('⏳ useLeadNotifications: esperando usuarioId');
      return;
    }

    // Determinar el protocolo según si estamos en http o https
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/voice`; // Mismo puerto que el servidor

    console.log('🔌 Conectando a WebSocket:', wsUrl);

    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ Conectado a WebSocket de notificaciones');
        // Enviar mensaje de registro con usuarioId
        ws?.send(JSON.stringify({
          tipo: 'registro',
          usuarioId: usuarioId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Notificación recibida:', data);

          if (data.tipo === 'NUEVO_LEAD') {
            console.log('🔔 ¡Nuevo lead!:', data.datos.nombre);
            onNewLead(data);
          }
        } catch (error) {
          console.warn('⚠️ Error al procesar notificación:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado. Reintentando en 5 segundos...');
        // Reconectar automáticamente después de 5 segundos
        setTimeout(() => connectWebSocket(), 5000);
      };
    } catch (error) {
      console.error('❌ Error al crear WebSocket:', error);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [usuarioId, onNewLead]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, [connectWebSocket]);

  return { connectWebSocket };
};
