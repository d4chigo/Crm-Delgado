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
  const [ultimasNotificaciones, setUltimasNotificaciones] = useState<NotificacionLead[]>([]);
  const [mostrarPanel, setMostrarPanel] = useState(false);

  const handleNewLead = (lead: NotificacionLead) => {
    setNoLeidas(prev => prev + 1);
    setUltimasNotificaciones(prev => [lead, ...prev.slice(0, 4)]);
  };

  useLeadNotifications(userData?.id, handleNewLead);

  const limpiarNotificaciones = () => {
    setNoLeidas(0);
    setMostrarPanel(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setMostrarPanel(!mostrarPanel)}
      >
        <Bell className="h-5 w-5" />
        {noLeidas > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </Button>

      {/* Panel flotante de notificaciones */}
      {mostrarPanel && ultimasNotificaciones.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl p-4 z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">🔔 Notificaciones</h3>
            <button
              onClick={limpiarNotificaciones}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {ultimasNotificaciones.map((notif, idx) => (
              <div
                key={idx}
                className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-[#FCBA00] rounded hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-[#303030] text-sm">
                  {notif.datos.nombre} {notif.datos.apellido || ''}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  🎯 {notif.datos.interes || 'No especificado'}
                </p>
                <p className="text-xs text-gray-500">
                  📱 {notif.datos.telefono}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {notif.datos.fecha}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              limpiarNotificaciones();
              window.location.href = '/dashboard/leads';
            }}
            className="w-full mt-4 px-4 py-2 bg-[#FCBA00] text-[#303030] rounded font-semibold hover:bg-yellow-500 transition-colors text-sm"
          >
            Ver todos los leads
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;
