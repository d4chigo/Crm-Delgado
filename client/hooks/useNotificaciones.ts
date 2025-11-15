/**
 * Hook personalizado para gestionar notificaciones en tiempo real
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Notificacion {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  referencia?: string;
  leida: boolean;
  creadoEn: Date;
}

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState<number>(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conectado, setConectado] = useState(false);

  // Conectar a Socket.IO
  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    if (!token) return;

    const nuevoSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    nuevoSocket.on('connect', () => {
      console.log('✅ Conectado a notificaciones');
      setConectado(true);
      cargarNotificaciones();
    });

    nuevoSocket.on('disconnect', () => {
      console.log('❌ Desconectado de notificaciones');
      setConectado(false);
    });

    nuevoSocket.on('notificacion:nueva', (notificacion: Notificacion) => {
      console.log('📬 Nueva notificación:', notificacion);
      setNotificaciones((prev) => [notificacion, ...prev]);
      setNoLeidas((prev) => prev + 1);
    });

    nuevoSocket.on('error', (error: any) => {
      console.error('Error en Socket.IO:', error);
    });

    setSocket(nuevoSocket);

    return () => {
      nuevoSocket.disconnect();
    };
  }, []);

  // Cargar notificaciones iniciales
  const cargarNotificaciones = useCallback(async () => {
    try {
      const token = localStorage.getItem('crm_token');
      if (!token) return;

      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notificaciones`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (respuesta.ok) {
        const datos = await respuesta.json();
        setNotificaciones(datos.datos || []);
        
        // Contar no leídas
        const noLeidasCount = (datos.datos || []).filter((n: Notificacion) => !n.leida).length;
        setNoLeidas(noLeidasCount);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  }, []);

  // Marcar como leída
  const marcarComoLeida = useCallback(async (notificacionId: string) => {
    try {
      const token = localStorage.getItem('crm_token');
      if (!token) return;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notificaciones/${notificacionId}/leer`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notificacionId ? { ...n, leida: true } : n))
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }, []);

  // Marcar todas como leídas
  const marcarTodasComoLeidas = useCallback(async () => {
    try {
      const token = localStorage.getItem('crm_token');
      if (!token) return;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notificaciones/leer-todas`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  }, []);

  // Eliminar notificación
  const eliminarNotificacion = useCallback(async (notificacionId: string) => {
    try {
      const token = localStorage.getItem('crm_token');
      if (!token) return;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notificaciones/${notificacionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotificaciones((prev) => prev.filter((n) => n.id !== notificacionId));
      const notificacionEliminada = notificaciones.find((n) => n.id === notificacionId);
      if (notificacionEliminada && !notificacionEliminada.leida) {
        setNoLeidas((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  }, [notificaciones]);

  // Limpiar notificaciones leídas
  const limpiarLeidas = useCallback(async () => {
    try {
      const token = localStorage.getItem('crm_token');
      if (!token) return;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notificaciones/limpiar-leidas`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotificaciones((prev) => prev.filter((n) => !n.leida));
    } catch (error) {
      console.error('Error al limpiar leídas:', error);
    }
  }, []);

  return {
    notificaciones,
    noLeidas,
    conectado,
    cargarNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    limpiarLeidas,
  };
}
