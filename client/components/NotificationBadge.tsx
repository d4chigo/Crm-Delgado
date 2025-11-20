/**
 * Componente Badge para mostrar contador de notificaciones no leídas
 */

'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { obtenerUsuario } from '@/lib/autenticacion';
import { useLeadNotifications } from '@/hooks/useLeadNotifications';

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

export const NotificationBadge: React.FC = () => {
  const userData = obtenerUsuario();
  const [noLeidas, setNoLeidas] = useState<number>(0);

  const handleNewLead = (lead: NotificacionLead) => {
    setNoLeidas(prev => prev + 1);
  };

  useLeadNotifications(userData?.id, handleNewLead);

  const limpiarNotificaciones = () => {
    setNoLeidas(0);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={limpiarNotificaciones}
        title="Nuevas notificaciones"
      >
        <Bell className="h-5 w-5" />
        {noLeidas > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </Button>
    </div>
  );
};

export default NotificationBadge;
