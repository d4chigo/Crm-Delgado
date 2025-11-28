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
    return localStorage.getItem('crm_token');
  }, []);

  const obtenerUsuarioId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const usuario = localStorage.getItem('crm_user');
    if (!usuario) return null;
    try {
      return JSON.parse(usuario).id;
    } catch {
      return null;
    }
  }, []);

  const conectarWebSocket = useCallback(() => {
    // No reconectar si ya hay una conexión activa
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('[Notificaciones] Ya conectado, ignorando nueva conexión');
      return;
    }

    if (!habilitado) return;

    const token = obtenerToken();
    const usuarioId = obtenerUsuarioId();

    console.log('[Notificaciones] Intentando conectar...');
    console.log('[Notificaciones] Token disponible:', !!token);
    console.log('[Notificaciones] UsuarioId disponible:', !!usuarioId);
    console.log('[Notificaciones] UsuarioId valor:', usuarioId);

    if (!token || !usuarioId) {
      console.warn('[Notificaciones] ❌ Token o usuarioId no disponibles');
      console.warn('[Notificaciones] Token:', token ? 'SÍ' : 'NO');
      console.warn('[Notificaciones] UsuarioId:', usuarioId ? 'SÍ' : 'NO');
      return;
    }

    try {
      const protocolo = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Conectar al servidor backend (puerto 5000), no al cliente (puerto 3000)
      const host = window.location.hostname;
      const wsUrl = `${protocolo}//${host}:5000/api/voice`;

      console.log('[Notificaciones] Conectando a WebSocket:', wsUrl);

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[Notificaciones] ✅ WebSocket conectado');
        console.log('[Notificaciones] Estado WebSocket:', wsRef.current?.readyState);
        console.log('[Notificaciones] Enviando registro con usuarioId:', usuarioId);

        // Esperar a que el WebSocket esté en estado OPEN (1) antes de enviar
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(
              JSON.stringify({
                tipo: 'registro',
                usuarioId: usuarioId,
                token: token,
              })
            );
            console.log('[Notificaciones] ✅ Registro enviado, esperando confirmación...');
          } catch (error) {
            console.error('[Notificaciones] Error al enviar registro:', error);
          }
        } else {
          console.warn('[Notificaciones] WebSocket no está en estado OPEN, reintentando...');
          // Reintentar después de un pequeño delay
          setTimeout(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  tipo: 'registro',
                  usuarioId: usuarioId,
                  token: token,
                })
              );
              console.log('[Notificaciones] ✅ Registro enviado (reintento)');
            }
          }, 100);
        }

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

      wsRef.current.onerror = (event) => {
        console.warn('[Notificaciones] ⚠️ Error WebSocket');
        console.warn('[Notificaciones] Tipo de evento:', event.type);
        console.warn('[Notificaciones] Estado WebSocket:', wsRef.current?.readyState);
        console.warn('[Notificaciones] URL:', wsRef.current?.url);
        
        // Los errores de WebSocket no tienen detalles en el evento
        // El error real se ve en onclose con el código de cierre
        setConectado(false);
        onConexion?.(false);
      };

      wsRef.current.onclose = (event) => {
        console.log('[Notificaciones] WebSocket desconectado');
        console.log('[Notificaciones] Código de cierre:', event.code);
        console.log('[Notificaciones] Razón:', event.reason);
        console.log('[Notificaciones] Limpio:', event.wasClean);
        
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
        } else if (intentosReconexion >= 5) {
          console.error('[Notificaciones] ❌ Máximo de intentos de reconexión alcanzado');
        }
      };
    } catch (error) {
      console.error('[Notificaciones] Error al conectar WebSocket:', error);
      setConectado(false);
    }
  }, [habilitado, obtenerToken, obtenerUsuarioId, onNotificacion, onConexion, toast]);

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

  // Efecto para conectar cuando se habilita
  useEffect(() => {
    if (!habilitado) {
      desconectar();
      return;
    }

    // Conectar cuando el componente se monta o cuando se habilita
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
    };
  }, [habilitado, conectarWebSocket, reconectar, conectado, desconectar]);

  return {
    conectado,
    intentosReconexion,
    reconectar,
    desconectar,
  };
};
