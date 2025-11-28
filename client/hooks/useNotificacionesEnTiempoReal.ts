/**
 * Hook para gestionar notificaciones en tiempo real vía WebSocket
 * Se conecta automáticamente cuando el usuario inicia sesión
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface Notificacion {
  tipo: string;
  titulo: string;
  datos: any;
  accion?: string;
  urgencia?: 'baja' | 'media' | 'alta';
  timestamp?: string;
}

interface UseNotificacionesEnTiempoRealOptions {
  habilitado?: boolean;
  onNotificacion?: (notificacion: Notificacion) => void;
  onConexion?: (conectado: boolean) => void;
}

export const useNotificacionesEnTiempoReal = (
  opciones: UseNotificacionesEnTiempoRealOptions = {}
) => {
  const { habilitado = true, onNotificacion, onConexion } = opciones;
  const wsRef = useRef<WebSocket | null>(null);
  const reconectarTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [conectado, setConectado] = useState(false);
  const [intentosReconexion, setIntentosReconexion] = useState(0);
  const { toast } = useToast();

  const obtenerToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

  const obtenerUsuarioId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const usuario = localStorage.getItem('usuario');
    if (!usuario) return null;
    try {
      return JSON.parse(usuario).id;
    } catch {
      return null;
    }
  }, []);

  const conectarWebSocket = useCallback(() => {
    if (!habilitado) return;

    const token = obtenerToken();
    const usuarioId = obtenerUsuarioId();

    if (!token || !usuarioId) {
      console.warn('[Notificaciones] Token o usuarioId no disponibles');
      return;
    }

    try {
      const protocolo = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocolo}//${window.location.host}/api/voice`;

      console.log('[Notificaciones] Conectando a WebSocket:', wsUrl);

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[Notificaciones] WebSocket conectado');

        // Enviar registro con usuarioId
        wsRef.current?.send(
          JSON.stringify({
            tipo: 'registro',
            usuarioId: usuarioId,
            token: token,
          })
        );

        setConectado(true);
        setIntentosReconexion(0);
        onConexion?.(true);

        toast({
          title: 'Conectado',
          description: 'Sistema de notificaciones en tiempo real activado',
          duration: 3000,
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const mensaje = JSON.parse(event.data);
          console.log('[Notificaciones] Mensaje recibido:', mensaje);

          if (mensaje.tipo === 'registro_confirmado') {
            console.log('[Notificaciones] Registro confirmado en servidor');
            return;
          }

          if (mensaje.tipo === 'notificacion' || mensaje.tipo === 'NUEVO_LEAD') {
            const notificacion: Notificacion = {
              tipo: mensaje.tipo,
              titulo: mensaje.titulo,
              datos: mensaje.datos,
              accion: mensaje.accion,
              urgencia: mensaje.urgencia,
              timestamp: mensaje.timestamp,
            };

            onNotificacion?.(notificacion);

            // Mostrar toast según urgencia
            const duracion =
              notificacion.urgencia === 'alta'
                ? 5000
                : notificacion.urgencia === 'media'
                  ? 4000
                  : 3000;

            toast({
              title: notificacion.titulo,
              description: `${notificacion.datos?.nombre || ''} ${notificacion.datos?.apellido || ''}`,
              duration: duracion,
              variant: notificacion.urgencia === 'alta' ? 'destructive' : 'default',
            });
          }
        } catch (error) {
          console.error('[Notificaciones] Error procesando mensaje:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('[Notificaciones] Error WebSocket:', error);
        setConectado(false);
        onConexion?.(false);
      };

      wsRef.current.onclose = () => {
        console.log('[Notificaciones] WebSocket desconectado');
        setConectado(false);
        onConexion?.(false);

        // Intentar reconectar con backoff exponencial
        if (habilitado && intentosReconexion < 5) {
          const delayMs = Math.min(1000 * Math.pow(2, intentosReconexion), 30000);
          console.log(
            `[Notificaciones] Reintentando conexión en ${delayMs}ms (intento ${intentosReconexion + 1})`
          );

          reconectarTimeoutRef.current = setTimeout(() => {
            setIntentosReconexion((prev) => prev + 1);
            conectarWebSocket();
          }, delayMs);
        }
      };
    } catch (error) {
      console.error('[Notificaciones] Error al conectar WebSocket:', error);
      setConectado(false);
    }
  }, [habilitado, obtenerToken, obtenerUsuarioId, onNotificacion, onConexion, intentosReconexion, toast]);

  const desconectar = useCallback(() => {
    if (reconectarTimeoutRef.current) {
      clearTimeout(reconectarTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConectado(false);
    setIntentosReconexion(0);
  }, []);

  const reconectar = useCallback(() => {
    desconectar();
    setIntentosReconexion(0);
    setTimeout(() => conectarWebSocket(), 500);
  }, [desconectar, conectarWebSocket]);

  useEffect(() => {
    if (!habilitado) return;

    // Conectar cuando el componente se monta
    conectarWebSocket();

    // Reconectar cuando el usuario vuelve a la pestaña
    const handleVisibilityChange = () => {
      if (!document.hidden && !conectado) {
        console.log('[Notificaciones] Página visible, reconectando...');
        reconectar();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      desconectar();
    };
  }, [habilitado, conectarWebSocket, desconectar, reconectar, conectado]);

  return {
    conectado,
    intentosReconexion,
    reconectar,
    desconectar,
  };
};
