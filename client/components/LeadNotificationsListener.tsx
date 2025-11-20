/**
 * Componente para mostrar notificaciones de nuevos leads en tiempo real
 */

'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuthToken } from '@/hooks/useAuthToken';
import { useLeadNotifications } from '@/hooks/useLeadNotifications';
import { api } from '@/lib/api';

export const LeadNotificationsListener: React.FC = () => {
  const { getToken, getUserData } = useAuthToken();
  const userData = getUserData();
  const [notificacionesRecibidas, setNotificacionesRecibidas] = useState<any[]>([]);

  const handleNewLead = (lead: any) => {
    // Agregar a la lista de notificaciones
    setNotificacionesRecibidas(prev => [lead, ...prev]);

    // Mostrar toast con sonido
    toast.success(
      `🔔 ¡Nuevo Lead! ${lead.datos.nombre} - ${lead.datos.interes}`,
      {
        position: 'top-right',
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        sound: true
      }
    );

    // Reproducir sonido de notificación
    reproducirSonido();
  };

  const reproducirSonido = () => {
    try {
      // Crear un sonido simple usando AudioContext
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Frecuencia y duración del sonido
      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('⚠️ No se pudo reproducir sonido de notificación:', error);
    }
  };

  useLeadNotifications(userData?.id, handleNewLead);

  return (
    <>
      {/* Panel flotante de notificaciones recientes */}
      {notificacionesRecibidas.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm max-h-96 overflow-y-auto z-50">
          <h3 className="font-bold text-lg mb-3 text-[#303030]">
            🔔 Últimos Leads ({notificacionesRecibidas.length})
          </h3>
          <div className="space-y-3">
            {notificacionesRecibidas.slice(0, 5).map((notif, idx) => (
              <div
                key={idx}
                className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-[#FCBA00] rounded cursor-pointer hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-[#303030] text-sm">
                  {notif.datos.nombre} {notif.datos.apellido || ''}
                </p>
                <p className="text-xs text-gray-600">
                  🎯 {notif.datos.interes || 'No especificado'}
                </p>
                <p className="text-xs text-gray-500">
                  📱 {notif.datos.telefono}
                </p>
                <p className="text-xs text-gray-500">
                  ⏰ {notif.datos.fecha}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default LeadNotificationsListener;
