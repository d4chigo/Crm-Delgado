/**
 * Contexto para gestionar notificaciones en tiempo real
 * Proporciona acceso global a las notificaciones y su estado
 */

'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useLeadNotifications } from '@/hooks/useLeadNotifications';
import authService from '@/services/api/auth.service';

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

interface NotificacionConId extends NotificacionLead {
  id: string;
  leida: boolean;
}

interface NotificacionesContextType {
  notificaciones: NotificacionConId[];
  conectado: boolean;
  agregarNotificacion: (notificacion: NotificacionLead) => void;
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
  const usuario = authService.obtenerUsuario();

  const agregarNotificacion = useCallback((notificacion: NotificacionLead) => {
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

  // Usar el hook que funciona
  const { connectWebSocket } = useLeadNotifications(
    usuario?.id,
    agregarNotificacion
  );

  // Cargar notificaciones guardadas al montar
  useEffect(() => {
    try {
      const notificacionesGuardadas = JSON.parse(localStorage.getItem('notificaciones') || '[]');
      setNotificaciones(notificacionesGuardadas);
    } catch (error) {
      console.error('[Notificaciones] Error cargando notificaciones guardadas:', error);
    }
  }, []);

  // Conectar cuando el usuario está disponible
  useEffect(() => {
    if (usuario?.id) {
      setConectado(true);
    }
  }, [usuario?.id]);

  const reconectar = useCallback(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  const valor: NotificacionesContextType = {
    notificaciones,
    conectado,
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
