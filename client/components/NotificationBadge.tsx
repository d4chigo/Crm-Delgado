/**
 * Componente Badge para mostrar contador de notificaciones no leídas
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
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
  const [animando, setAnimando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionLead[]>([]);

  const reproducirSonido = () => {
    try {
      // Crear un sonido más audible usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Crear múltiples notas para un sonido más agradable
      const notas = [800, 1000, 1200];
      
      notas.forEach((frecuencia, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frecuencia;
        oscillator.type = 'sine';

        const startTime = audioContext.currentTime + (index * 0.1);
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (error) {
      console.warn('⚠️ No se pudo reproducir sonido:', error);
    }
  };

  const handleNewLead = (lead: NotificacionLead) => {
    setNoLeidas(prev => prev + 1);
    setNotificaciones(prev => [lead, ...prev]);
    
    // Reproducir sonido
    reproducirSonido();
    
    // Animar el icono
    setAnimando(true);
    setTimeout(() => setAnimando(false), 600);

    // Mostrar notificación del navegador si está permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔔 ¡Nuevo Lead!', {
        body: `${lead.datos.nombre} ${lead.datos.apellido || ''} - ${lead.datos.interes || 'Sin interés especificado'}`,
        icon: '/logo.png',
        tag: 'nuevo-lead',
        requireInteraction: true
      });
    }
  };

  useLeadNotifications(userData?.id, handleNewLead);

  // Solicitar permiso para notificaciones del navegador
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const limpiarNotificaciones = () => {
    setNoLeidas(0);
    setNotificaciones([]);
  };

  const removerNotificacion = (index: number) => {
    setNotificaciones(prev => prev.filter((_, i) => i !== index));
    setNoLeidas(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={`relative transition-all ${animando ? 'animate-bounce' : ''}`}
        onClick={() => setMostrarDropdown(!mostrarDropdown)}
        title="Nuevas notificaciones"
      >
        <Bell className={`h-5 w-5 transition-colors ${noLeidas > 0 ? 'text-amber-500' : ''}`} />
        {noLeidas > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </Button>

      {/* Dropdown de notificaciones */}
      {mostrarDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setMostrarDropdown(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificaciones.map((notif, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {notif.datos.nombre} {notif.datos.apellido || ''}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          📧 {notif.datos.email}
                        </p>
                        <p className="text-xs text-gray-600">
                          📱 {notif.datos.telefono}
                        </p>
                        {notif.datos.interes && (
                          <p className="text-xs text-gray-600 mt-1">
                            🎯 {notif.datos.interes}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {notif.datos.fecha}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => removerNotificacion(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notificaciones.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={limpiarNotificaciones}
                className="w-full text-xs"
              >
                Limpiar todas
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;
