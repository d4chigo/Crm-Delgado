/**
 * Componente que muestra toasts cuando llegan notificaciones
 * Escucha el contexto global de notificaciones
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNotificaciones } from '@/contexts/NotificacionesContext';

export const ToastNotificaciones: React.FC = () => {
  const { notificaciones } = useNotificaciones();
  const notificacionesAnteriorRef = useRef<string[]>([]);

  useEffect(() => {
    // Obtener IDs de notificaciones anteriores
    const idsAnteriores = notificacionesAnteriorRef.current;
    const idsActuales = notificaciones.map(n => n.id);

    // Encontrar notificaciones nuevas
    const notificacionesNuevas = notificaciones.filter(
      n => !idsAnteriores.includes(n.id)
    );

    // Mostrar toast para cada notificación nueva
    notificacionesNuevas.forEach((notif) => {
      toast.success(
        `🔔 ¡Nuevo Lead! ${notif.datos.nombre} - ${notif.datos.interes || 'Sin interés'}`,
        {
          position: 'bottom-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    });

    // Actualizar referencia
    notificacionesAnteriorRef.current = idsActuales;
  }, [notificaciones]);

  return null;
};

export default ToastNotificaciones;
