/**
 * Componente NotificationBell - Campana de notificaciones
 */

'use client';

import { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotificaciones, Notificacion } from '@/hooks/useNotificaciones';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const {
    notificaciones,
    noLeidas,
    conectado,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    limpiarLeidas,
  } = useNotificaciones();

  const [abierto, setAbierto] = useState(false);

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'NUEVO_LEAD':
        return '👤';
      case 'CONVERSION_CLIENTE':
        return '🎯';
      case 'OPORTUNIDAD_GANADA':
        return '🎉';
      case 'OPORTUNIDAD_PERDIDA':
        return '❌';
      case 'SEGUIMIENTO_VENCIDO':
        return '⏰';
      case 'CAMBIO_ETAPA':
        return '📊';
      case 'COTIZACION_CREADA':
        return '📄';
      case 'PROYECTO_CREADO':
        return '🏗️';
      default:
        return '📬';
    }
  };

  const formatearFecha = (fecha: Date) => {
    const ahora = new Date();
    const diferencia = ahora.getTime() - new Date(fecha).getTime();
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos}m`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    return new Date(fecha).toLocaleDateString('es-PE');
  };

  return (
    <DropdownMenu open={abierto} onOpenChange={setAbierto}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title={conectado ? 'Notificaciones' : 'Desconectado'}
        >
          <Bell className={cn('h-5 w-5', !conectado && 'opacity-50')} />
          {noLeidas > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
              variant="default"
            >
              {noLeidas > 9 ? '9+' : noLeidas}
            </Badge>
          )}
          {!conectado && (
            <div className="absolute top-0 right-0 h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-4 sticky top-0 bg-background border-b">
          <h3 className="font-semibold">Notificaciones</h3>
          <div className="flex gap-2">
            {noLeidas > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={marcarTodasComoLeidas}
                className="h-8 px-2 text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas
              </Button>
            )}
            {notificaciones.some((n) => n.leida) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={limpiarLeidas}
                className="h-8 px-2 text-xs"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {notificaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No hay notificaciones</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notificaciones.map((notificacion) => (
              <div
                key={notificacion.id}
                className={cn(
                  'p-3 border-b hover:bg-muted/50 transition-colors',
                  !notificacion.leida && 'bg-blue-50/50 dark:bg-blue-950/20'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-1">{getIconoTipo(notificacion.tipo)}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-medium', !notificacion.leida && 'font-semibold')}>
                        {notificacion.titulo}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarNotificacion(notificacion.id)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">{notificacion.mensaje}</p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatearFecha(notificacion.creadoEn)}
                      </span>

                      {!notificacion.leida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => marcarComoLeida(notificacion.id)}
                          className="h-6 px-2 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Leer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />

        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => setAbierto(false)}
          >
            Ver todas las notificaciones
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
