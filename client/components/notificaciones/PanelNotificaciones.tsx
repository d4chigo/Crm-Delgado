/**
 * Panel de notificaciones en tiempo real
 * Muestra las notificaciones recibidas y permite interactuar con ellas
 */

'use client';

import React, { useState } from 'react';
import { useNotificaciones } from '@/contexts/NotificacionesContext';
import { Bell, X, Check, CheckCheck, Trash2, Wifi, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const PanelNotificaciones: React.FC = () => {
  const { notificaciones, conectado, marcarComoLeida, marcarTodoComoLeido, limpiarNotificaciones, obtenerNoLeidas } =
    useNotificaciones();
  const [abierto, setAbierto] = useState(false);

  const noLeidas = obtenerNoLeidas();
  const cantidadNoLeidas = noLeidas.length;

  const handleNotificacionClick = (id: string) => {
    marcarComoLeida(id);
  };

  const obtenerColorUrgencia = (urgencia?: string) => {
    switch (urgencia) {
      case 'alta':
        return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950';
      case 'media':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950';
    }
  };

  const obtenerIconoUrgencia = (urgencia?: string) => {
    switch (urgencia) {
      case 'alta':
        return '🔴';
      case 'media':
        return '🟡';
      default:
        return '🔵';
    }
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        title={conectado ? 'Conectado a notificaciones' : 'Desconectado de notificaciones'}
      >
        <div className="relative">
          <Bell className="w-6 h-6" />

          {/* Indicador de conexión */}
          <div
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
              conectado ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`}
          />

          {/* Badge de notificaciones no leídas */}
          {cantidadNoLeidas > 0 && (
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {cantidadNoLeidas > 9 ? '9+' : cantidadNoLeidas}
            </span>
          )}
        </div>
      </button>

      {/* Panel desplegable */}
      {abierto && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
          {/* Encabezado */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
              <div className="flex items-center gap-1">
                {conectado ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {conectado ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Acciones */}
          {notificaciones.length > 0 && (
            <div className="flex gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={marcarTodoComoLeido}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                Marcar todo
              </button>
              <button
                onClick={limpiarNotificaciones}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Limpiar
              </button>
            </div>
          )}

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notificaciones.map((notificacion) => (
                  <div
                    key={notificacion.id}
                    onClick={() => handleNotificacionClick(notificacion.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      notificacion.leida ? 'opacity-60' : ''
                    } ${obtenerColorUrgencia(notificacion.urgencia)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{obtenerIconoUrgencia(notificacion.urgencia)}</span>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {notificacion.titulo}
                          </h4>
                          {!notificacion.leida && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>

                        {/* Detalles del lead */}
                        {notificacion.datos && (
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {notificacion.datos.nombre && (
                              <p>
                                <strong>Nombre:</strong> {notificacion.datos.nombre}{' '}
                                {notificacion.datos.apellido || ''}
                              </p>
                            )}
                            {notificacion.datos.correo && (
                              <p>
                                <strong>Email:</strong> {notificacion.datos.correo}
                              </p>
                            )}
                            {notificacion.datos.telefono && (
                              <p>
                                <strong>Teléfono:</strong> {notificacion.datos.telefono}
                              </p>
                            )}
                            {notificacion.datos.interes && (
                              <p>
                                <strong>Interés:</strong> {notificacion.datos.interes}
                              </p>
                            )}
                            {notificacion.datos.origen && (
                              <p>
                                <strong>Origen:</strong> {notificacion.datos.origen}
                              </p>
                            )}
                            {notificacion.datos.mensaje && (
                              <p>
                                <strong>Mensaje:</strong> {notificacion.datos.mensaje.substring(0, 100)}
                                {notificacion.datos.mensaje.length > 100 ? '...' : ''}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Timestamp */}
                        {notificacion.timestamp && (
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                            {formatDistanceToNow(new Date(notificacion.timestamp), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </p>
                        )}
                      </div>

                      {/* Icono de leído */}
                      <div className="flex-shrink-0">
                        {notificacion.leida ? (
                          <CheckCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <Check className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
