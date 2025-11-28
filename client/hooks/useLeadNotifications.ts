/**
 * Hook para conectarse a notificaciones en tiempo real del CRM
 * Escucha nuevos leads y otros eventos a través de WebSocket
 */

import { useEffect, useCallback, useRef, useState } from 'react';

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

interface UseLeadNotificationsReturn {
  connectWebSocket: () => void;
  conectado: boolean;
}

export const useLeadNotifications = (
  usuarioId: string | undefined,
  onNewLead: (lead: NotificacionLead) => void,
  onConexionCambiada?: (conectado: boolean) => void
): UseLeadNotificationsReturn => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const attemptCountRef = useRef(0);
  const maxAttemptsRef = useRef(5);
  const isConnectingRef = useRef(false);
  const [conectado, setConectado] = useState(false);

  const connectWebSocket = useCallback(() => {
    // No intentar conectar si ya estamos conectando o ya tenemos una conexión
    if (isConnectingRef.current) {
      console.log('⏳ Conexión en progreso...');
      return () => {};
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket ya está conectado');
      return () => {};
    }

    if (!usuarioId) {
      console.log('⏳ useLeadNotifications: esperando usuarioId');
      return () => {};
    }

    // Si ya hemos intentado muchas veces, parar
    if (attemptCountRef.current >= maxAttemptsRef.current) {
      console.warn('⚠️ Máximo de intentos de conexión alcanzado. WebSocket deshabilitado.');
      return () => {};
    }

    isConnectingRef.current = true;
    attemptCountRef.current++;

    // Determinar el protocolo según si estamos en http o https
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Obtener la URL del API desde variables de entorno o usar localhost:5000 por defecto
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    let apiHost = '';
    
    try {
      apiHost = new URL(apiUrl).host;
    } catch (e) {
      console.warn('⚠️ URL de API inválida, usando localhost:5000');
      apiHost = 'localhost:5000';
    }
    
    const wsUrl = `${protocol}//${apiHost}/api/voice`;

    if (attemptCountRef.current === 1) {
      console.log('🔌 Intentando conectar a WebSocket:', wsUrl);
    }

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ Conectado a WebSocket de notificaciones');
        attemptCountRef.current = 0; 
        setConectado(true);
        onConexionCambiada?.(true);
        
        // Limpiar timer de reconexión si existe
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
        
        // Enviar mensaje de registro con usuarioId
        try {
          wsRef.current?.send(JSON.stringify({
            tipo: 'registro',
            usuarioId: usuarioId
          }));
          console.log('📤 Mensaje de registro enviado al servidor');
        } catch (sendError) {
          console.warn('⚠️ Error al enviar registro:', sendError);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Loguear todos los mensajes para debugging
          console.log('📨 Mensaje recibido del WebSocket:', data.tipo);

          if (data.tipo === 'NUEVO_LEAD') {
            console.log('🔔 ¡Nuevo lead!:', data.datos?.nombre || 'Sin nombre');
            onNewLead(data);
          } else if (data.tipo === 'registro_confirmado') {
            console.log('✅ Registro confirmado por el servidor');
          }
        } catch (parseError) {
          console.warn('⚠️ Error al procesar notificación:', parseError);
        }
      };

      wsRef.current.onerror = (event) => {
        if (attemptCountRef.current <= 3) {
          console.warn(`⚠️ Error en WebSocket (intento ${attemptCountRef.current}/${maxAttemptsRef.current})`);
        }
      };

      wsRef.current.onclose = () => {
        isConnectingRef.current = false;
        setConectado(false);
        onConexionCambiada?.(false);
        console.log(`❌ WebSocket desconectado (intento ${attemptCountRef.current}/${maxAttemptsRef.current})`);
        if (attemptCountRef.current < maxAttemptsRef.current) {
          console.log(`🔌 Reintentando en 5 segundos...`);
          
          // Limpiar cualquier timer anterior
          if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
          }
          
          // Reconectar automáticamente después de 5 segundos
          reconnectTimerRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      };
    } catch (error) {
      if (attemptCountRef.current <= 3) {
        console.warn(`⚠️ Error al crear WebSocket (intento ${attemptCountRef.current}/${maxAttemptsRef.current}):`, error);
      }
      
      // Intentar reconectar si no hemos alcanzado el máximo
      if (attemptCountRef.current < maxAttemptsRef.current) {
        reconnectTimerRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      }
    }

    // Cleanup function
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        wsRef.current.close();
      }
    };
  }, [usuarioId, onNewLead]);

  useEffect(() => {
    // Solo conectar si tenemos usuarioId
    if (!usuarioId) {
      return;
    }

    // Verificar si ya estamos conectados
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket ya está conectado, no reconectar');
      return;
    }

    // Conectar solo una vez por usuarioId
    if (!isConnectingRef.current && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
      connectWebSocket();
    }

    // Cleanup: cerrar conexión al desmontar
    return () => {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        wsRef.current.close();
      }
    };
  }, [usuarioId]);

  return { connectWebSocket, conectado };
};