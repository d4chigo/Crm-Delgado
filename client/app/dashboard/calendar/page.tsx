"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import googleAuthService from "@/services/api/google-auth.service"
import { calendarService } from "@/services/api/calendar.service"
import { Calendar as IconoCalendario, RefreshCcw, Bell } from "lucide-react"

type Evento = {
  id: string
  resumen: string
  descripcion?: string | null
  inicio: string
  fin: string
  todoElDia: boolean
}

function formatDateLabel(date: Date) {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

export default function PaginaCalendario() {
  const { toast } = useToast()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [fechaBase, setFechaBase] = useState(new Date())
  const [permisoNotifs, setPermisoNotifs] = useState<NotificationPermission>('default')
  const [minutosAntes, setMinutosAntes] = useState<5 | 10 | 15 | 30>(15)
  const timersRef = useState<number[]>([])[0]

  // Manejar callback OAuth (legacy: token en URL)
  useEffect(() => {
    const token = googleAuthService.getTokenFromCallback()
    if (token) {
      fetch(`/api/calendar/google/connect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ access_token: token }) })
        .then(() => {
          toast({ title: 'Google conectado', description: 'Sincronizando eventos...' })
          recargarEventos()
        })
        .catch((e) => {
          toast({ title: 'Error conectando Google', description: String(e.message), variant: 'destructive' })
        })
    }
  }, [])

  const diasMes = useMemo(() => {
    const y = fechaBase.getFullYear()
    const m = fechaBase.getMonth()
    const primerDiaMes = new Date(y, m, 1)
    const primerDiaSemana = new Date(primerDiaMes)
    primerDiaSemana.setDate(primerDiaMes.getDate() - ((primerDiaMes.getDay() + 6) % 7)) // lunes como primer día
    const celdas: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(primerDiaSemana)
      d.setDate(primerDiaSemana.getDate() + i)
      celdas.push(d)
    }
    return celdas
  }, [fechaBase])

  function abrirOAuth() {
    calendarService.getAuthUrl()
      .then((url) => { window.location.href = url })
      .catch((e) => toast({ title: 'Error', description: String(e.message), variant: 'destructive' }))
  }

  async function recargarEventos() {
    try {
      await calendarService.sync()
      const lista = await calendarService.list()
      setEventos(lista as any)
    } catch (e: any) {
      toast({ title: 'Error al cargar eventos', description: String(e.message), variant: 'destructive' })
    }
  }

  useEffect(() => {
    recargarEventos()
    if (typeof window !== 'undefined') setPermisoNotifs(Notification.permission)
  }, [])

  function eventosDelDia(d: Date) {
    const y = d.toISOString().slice(0, 10)
    return eventos.filter((ev) => ev.inicio.slice(0, 10) === y)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2"><IconoCalendario className="h-5 w-5"/> Calendario</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setFechaBase(new Date(fechaBase.getFullYear(), fechaBase.getMonth()-1, 1))}>{'<'}</Button>
          <Button variant="secondary" onClick={() => setFechaBase(new Date(fechaBase.getFullYear(), fechaBase.getMonth()+1, 1))}>{'>'}</Button>
          <Button onClick={abrirOAuth}>Conectar Google</Button>
          <Button variant="outline" onClick={recargarEventos}><RefreshCcw className="h-4 w-4 mr-1"/> Sync</Button>
          <div className="flex items-center gap-2">
            <select className="border rounded px-2 py-1 text-sm" value={minutosAntes} onChange={(e) => setMinutosAntes(Number(e.target.value) as any)}>
              <option value={5}>5 min</option>
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
            </select>
            <Button variant="outline" onClick={async () => {
              try {
                const p = await Notification.requestPermission();
                setPermisoNotifs(p)
                if (p !== 'granted') return toast({ title: 'Permiso denegado', description: 'Activa notificaciones del navegador' })
                toast({ title: 'Notificaciones activadas' })
              } catch (e: any) {
                toast({ title: 'Error', description: String(e.message), variant: 'destructive' })
              }
            }}><Bell className="h-4 w-4 mr-1"/> Notificar</Button>
          </div>
        </div>
      </div>

      <Card className="p-2">
        <div className="grid grid-cols-7 gap-2">
          {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {diasMes.map((d, i) => {
            const enMes = d.getMonth() === fechaBase.getMonth()
            const lista = eventosDelDia(d)
            return (
              <div key={i} className={`border rounded-md min-h-24 p-1 ${enMes ? '' : 'opacity-50'}`}>
                <div className="text-[10px] text-muted-foreground">{formatDateLabel(d)}</div>
                <div className="space-y-1 mt-1">
                  {lista.slice(0, 3).map(ev => (
                    <button
                      key={ev.id}
                      className="text-left w-full text-xs truncate rounded bg-primary/10 px-1 py-0.5 hover:bg-primary/20"
                      onClick={() => {
                        if (permisoNotifs !== 'granted') return
                        const inicioMs = new Date(ev.inicio).getTime()
                        const delay = inicioMs - Date.now() - minutosAntes * 60 * 1000
                        if (delay > 0) {
                          const id = window.setTimeout(() => {
                            new Notification('Recordatorio de reunión', {
                              body: `${ev.resumen} empieza en ${minutosAntes} minutos`,
                              icon: '/placeholder-logo.png'
                            })
                          }, delay)
                          timersRef.push(id)
                          toast({ title: 'Recordatorio programado', description: `${ev.resumen}` })
                        } else {
                          toast({ title: 'Evento muy próximo', description: 'No se pudo programar con el margen elegido' })
                        }
                      }}
                    >{ev.resumen}</button>
                  ))}
                  {lista.length > 3 && (
                    <div className="text-[10px] text-muted-foreground">+{lista.length - 3} más</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
