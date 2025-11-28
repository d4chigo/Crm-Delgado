/**
 * Componente Badge para mostrar contador de notificaciones en tiempo real
 * Usa el contexto global de notificaciones
 */

'use client';

import React, { useState } from 'react';
import { Bell, X, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificaciones } from '@/contexts/NotificacionesContext';

export const NotificationBadge: React.FC = () => {
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const { notificaciones, conectado, obtenerNoLeidas, marcarComoLeida, limpiarNotificaciones } = useNotificaciones();
  
  const noLeidas = obtenerNoLeidas().length;

  const removerNotificacion = (id: string) => {
    marcarComoLeida(id);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative transition-all"
        onClick={() => setMostrarDropdown(!mostrarDropdown)}
        title={conectado ? 'Conectado a notificaciones en tiempo real' : 'Desconectado de notificaciones'}
      >
        <div className="relative">
          <Bell className={`h-5 w-5 transition-colors ${noLeidas > 0 ? 'text-amber-500' : ''}`} />
          
          {/* Indicador de conexión WebSocket */}
          <div
            className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
              conectado ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`}
          />
          
          {/* Badge de notificaciones no leídas */}
          {noLeidas > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          )}
        </div>
      </Button>

      {/* Dropdown de notificaciones */}
      {mostrarDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
              <div className="flex items-center gap-1">
                {conectado ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {conectado ? 'En vivo' : 'Desconectado'}
                </span>
              </div>
            </div>
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
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay notificaciones</p>
                {!conectado && (
                  <p className="text-xs text-red-500 mt-2">Esperando conexión...</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notificaciones.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🔔</span>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {notif.datos.nombre} {notif.datos.apellido || ''}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          📧 {notif.datos.email}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          📱 {notif.datos.telefono}
                        </p>
                        {notif.datos.interes && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            🎯 {notif.datos.interes}
                          </p>
                        )}
                        {notif.datos.origen && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            📍 {notif.datos.origen}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {notif.datos.fecha}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => removerNotificacion(notif.id)}
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
