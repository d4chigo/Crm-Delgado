"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  obtenerUrlAutenticacion,
  obtenerEstadoAutenticacion,
  cerrarSesionCalendario,
  listarEventos,
  sincronizarEventos,
  getTokenFromCallback,
  guardarTokens,
  type CalendarEvent,
} from "@/services/api/calendar.service";
import { Calendar as IconoCalendario, RefreshCcw, Bell, LogOut, AlertCircle } from "lucide-react";

type Evento = {
  id: string;
  resumen: string;
  descripcion?: string | null;
  inicio: string;
  fin: string;
  todoElDia: boolean;
  ubicacion?: string;
  participantes?: string[];
  enlace?: string;
};

function formatDateLabel(date: Date) {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

interface CalendarViewProps {
  onAuthChange?: (authenticated: boolean) => void;
}

export default function CalendarView({ onAuthChange }: CalendarViewProps) {
  const { toast } = useToast();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [fechaBase, setFechaBase] = useState(new Date());
  const [permisoNotifs, setPermisoNotifs] = useState<NotificationPermission>('default');
  const [minutosAntes, setMinutosAntes] = useState<5 | 10 | 15 | 30>(15);
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timersRef = useState<number[]>([])[0];

  // Manejar callback OAuth
  useEffect(() => {
    const token = getTokenFromCallback();
    if (token) {
      toast({ title: 'Google conectado', description: 'Sincronizando eventos...' });
      recargarEventos();
    }
  }, []);

  // Verificar autenticación inicial
  useEffect(() => {
    verificarAutenticacion();
    if (typeof window !== 'undefined') setPermisoNotifs(Notification.permission);
  }, []);

  async function verificarAutenticacion() {
    try {
      const { authenticated } = await obtenerEstadoAutenticacion();
      setAutenticado(authenticated);
      onAuthChange?.(authenticated);
      if (authenticated) {
        await recargarEventos();
      }
    } catch (err) {
      console.error("[Calendar] Error verificando autenticación:", err);
      setError("Error verificando autenticación");
    } finally {
      setCargando(false);
    }
  }

  async function recargarEventos() {
    try {
      setCargando(true);
      setError(null);
      await sincronizarEventos();
      const lista = await listarEventos();
      const eventosFormateados = lista.map(evento => ({
        id: evento.id,
        resumen: evento.title,
        descripcion: evento.description,
        inicio: evento.start,
        fin: evento.end,
        todoElDia: evento.allDay || false,
        ubicacion: evento.location,
        participantes: evento.attendees,
        enlace: evento.htmlLink,
      }));
      setEventos(eventosFormateados);
    } catch (e: any) {
      console.error('Error al cargar eventos:', e);
      setError('Error al cargar eventos del calendario');
      toast({ title: 'Error al cargar eventos', description: String(e.message), variant: 'destructive' });
    } finally {
      setCargando(false);
    }
  }

  function abrirOAuth() {
    obtenerUrlAutenticacion()
      .then(({ authUrl }) => { window.location.href = authUrl; })
      .catch((e) => {
        console.error('Error obteniendo URL de autenticación:', e);
        toast({ title: 'Error', description: String(e.message), variant: 'destructive' });
      });
  }

  async function cerrarSesion() {
    try {
      await cerrarSesionCalendario();
      setAutenticado(false);
      setEventos([]);
      onAuthChange?.(false);
      toast({ title: 'Sesión cerrada', description: 'Se ha desconectado de Google Calendar' });
    } catch (err) {
      console.error("Error cerrando sesión:", err);
      toast({ title: 'Error', description: 'Error al cerrar sesión', variant: 'destructive' });
    }
  }

  const diasMes = useMemo(() => {
    const y = fechaBase.getFullYear();
    const m = fechaBase.getMonth();
    const primerDiaMes = new Date(y, m, 1);
    const primerDiaSemana = new Date(primerDiaMes);
    primerDiaSemana.setDate(primerDiaMes.getDate() - ((primerDiaMes.getDay() + 6) % 7)); // lunes como primer día
    const celdas: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(primerDiaSemana);
      d.setDate(primerDiaSemana.getDate() + i);
      celdas.push(d);
    }
    return celdas;
  }, [fechaBase]);

  function eventosDelDia(d: Date) {
    const y = d.toISOString().slice(0, 10);
    return eventos.filter((ev) => ev.inicio.slice(0, 10) === y);
  }

  function formatearHora(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCBA00] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return (
      <Card className="border-border">
        <div className="p-12 text-center">
          <IconoCalendario className="w-16 h-16 text-[#FCBA00] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#303030] mb-2">
            Conecta tu Google Calendar
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Sincroniza tus reuniones y eventos de Google Calendar para gestionarlos desde el CRM
          </p>
          {error && (
            <div className="flex items-center gap-2 justify-center text-red-600 mb-4">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <Button
            onClick={abrirOAuth}
            className="bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030]"
          >
            <IconoCalendario className="w-4 h-4 mr-2" />
            Conectar con Google Calendar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <IconoCalendario className="h-5 w-5" /> Calendario
        </h1>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={() => setFechaBase(new Date(fechaBase.getFullYear(), fechaBase.getMonth()-1, 1))}
          >
            {'<'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setFechaBase(new Date(fechaBase.getFullYear(), fechaBase.getMonth()+1, 1))}
          >
            {'>'}
          </Button>
          <Button variant="outline" onClick={recargarEventos}>
            <RefreshCcw className="h-4 w-4 mr-1" /> Sync
          </Button>
          <div className="flex items-center gap-2">
            <select 
              className="border rounded px-2 py-1 text-sm" 
              value={minutosAntes} 
              onChange={(e) => setMinutosAntes(Number(e.target.value) as any)}
            >
              <option value={5}>5 min</option>
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
            </select>
            <Button 
              variant="outline" 
              onClick={async () => {
                try {
                  const p = await Notification.requestPermission();
                  setPermisoNotifs(p);
                  if (p !== 'granted') return toast({ title: 'Permiso denegado', description: 'Activa notificaciones del navegador' });
                  toast({ title: 'Notificaciones activadas' });
                } catch (e: any) {
                  toast({ title: 'Error', description: String(e.message), variant: 'destructive' });
                }
              }}
            >
              <Bell className="h-4 w-4 mr-1" /> Notificar
            </Button>
          </div>
          <Button variant="outline" onClick={cerrarSesion} className="text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-1" /> Desconectar
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Card className="p-2">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#303030] capitalize">
            {fechaBase.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {diasMes.map((d, i) => {
            const enMes = d.getMonth() === fechaBase.getMonth();
            const lista = eventosDelDia(d);
            const esHoy = d.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
            
            return (
              <div 
                key={i} 
                className={`border rounded-md min-h-24 p-1 ${
                  enMes 
                    ? esHoy 
                      ? 'bg-[#FCBA00]/10 border-[#FCBA00] border-2' 
                      : 'hover:bg-muted/50' 
                    : 'opacity-50'
                }`}
              >
                <div className={`text-[10px] ${esHoy ? 'text-[#FCBA00] font-semibold' : 'text-muted-foreground'}`}>
                  {formatDateLabel(d)}
                </div>
                <div className="space-y-1 mt-1">
                  {lista.slice(0, 3).map(ev => (
                    <button
                      key={ev.id}
                      className="text-left w-full text-xs truncate rounded bg-[#FCBA00]/20 px-1 py-0.5 hover:bg-[#FCBA00]/30 text-[#303030]"
                      onClick={() => {
                        if (permisoNotifs !== 'granted') return;
                        const inicioMs = new Date(ev.inicio).getTime();
                        const delay = inicioMs - Date.now() - minutosAntes * 60 * 1000;
                        if (delay > 0) {
                          const id = window.setTimeout(() => {
                            new Notification('Recordatorio de reunión', {
                              body: `${ev.resumen} empieza en ${minutosAntes} minutos`,
                              icon: '/placeholder-logo.png'
                            });
                          }, delay);
                          timersRef.push(id);
                          toast({ title: 'Recordatorio programado', description: `${ev.resumen}` });
                        } else {
                          toast({ title: 'Evento muy próximo', description: 'No se pudo programar con el margen elegido' });
                        }
                      }}
                      title={`${ev.resumen} - ${formatearHora(ev.inicio)}`}
                    >
                      {ev.resumen}
                    </button>
                  ))}
                  {lista.length > 3 && (
                    <div className="text-[10px] text-muted-foreground">+{lista.length - 3} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
