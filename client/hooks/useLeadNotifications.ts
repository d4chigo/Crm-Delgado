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
      return () => {};
    }

    // Determinar el protocolo según si estamos en http o https
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/voice`;

    console.log('🔌 Conectando a WebSocket:', wsUrl);

    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ Conectado a WebSocket de notificaciones');
        // Limpiar timer de reconexión si existe
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        // Enviar mensaje de registro con usuarioId
        try {
          ws?.send(JSON.stringify({
            tipo: 'registro',
            usuarioId: usuarioId
          }));
        } catch (sendError) {
          console.warn('⚠️ Error al enviar registro:', sendError);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Notificación recibida:', data);

          if (data.tipo === 'NUEVO_LEAD') {
            console.log('🔔 ¡Nuevo lead!:', data.datos?.nombre || 'Sin nombre');
            onNewLead(data);
          }
        } catch (parseError) {
          console.warn('⚠️ Error al procesar notificación:', parseError);
          // No lanzar error, solo loguear
        }
      };

      ws.onerror = (event) => {
        console.warn('⚠️ Error en WebSocket (reconectando):', event);
        // No lanzar error, solo loguear como warning
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado. Reintentando en 5 segundos...');
        // Limpiar cualquier timer anterior
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
        }
        // Reconectar automáticamente después de 5 segundos
        reconnectTimer = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };
    } catch (error) {
      console.warn('⚠️ Error al crear WebSocket:', error);
      // Intentar reconectar
      reconnectTimer = setTimeout(() => {
        connectWebSocket();
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
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
