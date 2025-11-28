/**
 * Contexto para gestionar notificaciones en tiempo real
 * Proporciona acceso global a las notificaciones y su estado
 */

'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useNotificacionesEnTiempoReal, Notificacion } from '@/hooks/useNotificacionesEnTiempoReal';

interface NotificacionConId extends Notificacion {
  id: string;
  leida: boolean;
}

interface NotificacionesContextType {
  notificaciones: NotificacionConId[];
  conectado: boolean;
  agregarNotificacion: (notificacion: Notificacion) => void;
  marcarComoLeida: (id: string) => void;
  marcarTodoComoLeido: () => void;
  limpiarNotificaciones: () => void;
  obtenerNoLeidas: () => NotificacionConId[];
  reconectar: () => void;
}

const NotificacionesContext = createContext<NotificacionesContextType | undefined>(undefined);

export const ProveedorNotificaciones: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState<NotificacionConId[]>([]);
  const [conectado, setConectado] = useState(false);

  const agregarNotificacion = useCallback((notificacion: Notificacion) => {
    const id = `${Date.now()}-${Math.random()}`;
    const nuevaNotificacion: NotificacionConId = {
      ...notificacion,
      id,
      leida: false,
    };

    setNotificaciones((prev) => [nuevaNotificacion, ...prev]);

    // Guardar en localStorage para persistencia
    try {
      const notificacionesGuardadas = JSON.parse(localStorage.getItem('notificaciones') || '[]');
      notificacionesGuardadas.unshift(nuevaNotificacion);
      // Mantener solo las últimas 50 notificaciones
      localStorage.setItem('notificaciones', JSON.stringify(notificacionesGuardadas.slice(0, 50)));
    } catch (error) {
      console.error('[Notificaciones] Error guardando en localStorage:', error);
    }
  }, []);

  const marcarComoLeida = useCallback((id: string) => {
    setNotificaciones((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, leida: true } : notif))
    );
  }, []);

  const marcarTodoComoLeido = useCallback(() => {
    setNotificaciones((prev) => prev.map((notif) => ({ ...notif, leida: true })));
  }, []);

  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([]);
    localStorage.removeItem('notificaciones');
  }, []);

  const obtenerNoLeidas = useCallback(() => {
    return notificaciones.filter((notif) => !notif.leida);
  }, [notificaciones]);

  const { conectado: wsConectado, reconectar } = useNotificacionesEnTiempoReal({
    habilitado: true,
    onNotificacion: agregarNotificacion,
    onConexion: setConectado,
  });

  // Cargar notificaciones guardadas al montar
  useEffect(() => {
    try {
      const notificacionesGuardadas = JSON.parse(localStorage.getItem('notificaciones') || '[]');
      setNotificaciones(notificacionesGuardadas);
    } catch (error) {
      console.error('[Notificaciones] Error cargando notificaciones guardadas:', error);
    }
  }, []);

  const valor: NotificacionesContextType = {
    notificaciones,
    conectado: wsConectado,
    agregarNotificacion,
    marcarComoLeida,
    marcarTodoComoLeido,
    limpiarNotificaciones,
    obtenerNoLeidas,
    reconectar,
  };

  return (
    <NotificacionesContext.Provider value={valor}>{children}</NotificacionesContext.Provider>
  );
};

export const useNotificaciones = (): NotificacionesContextType => {
  const contexto = useContext(NotificacionesContext);
  if (!contexto) {
    throw new Error('useNotificaciones debe usarse dentro de ProveedorNotificaciones');
  }
  return contexto;
};
