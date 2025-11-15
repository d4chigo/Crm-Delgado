'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Calendar, Trash2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { crearEventoEnCalendar, actualizarEventoEnCalendar, eliminarEventoEnCalendar, listarEventos } from '@/services/api/calendar.service'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DialogoAgendarReunionProps {
  abierto: boolean
  onCerrar: () => void
  contactoNombre?: string
  contactoEmail?: string
  contactoTelefono?: string
  onEventoCreado?: () => void
  eventoExistente?: {
    id: string
    summary: string
    description?: string
    location?: string
    startDateTime: string
    endDateTime: string
    attendees?: string[]
  }
}

export function DialogoAgendarReunion({
  abierto,
  onCerrar,
  contactoNombre = '',
  contactoEmail = '',
  contactoTelefono = '',
  onEventoCreado,
  eventoExistente,
}: DialogoAgendarReunionProps) {
  const { toast } = useToast()
  const [cargando, setCargando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [asunto, setAsunto] = useState(`Reunión con ${contactoNombre}`)
  const [descripcion, setDescripcion] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [fecha, setFecha] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [horaInicio, setHoraInicio] = useState('10:00')
  const [horaFin, setHoraFin] = useState('11:00')
  const [correoParticipante, setCorreoParticipante] = useState(contactoEmail || '')
  const [eventosDelDia, setEventosDelDia] = useState<any[]>([])
  const [conflictoHorario, setConflictoHorario] = useState(false)

  // Cargar datos del evento existente si se proporciona
  useEffect(() => {
    if (eventoExistente && abierto) {
      setAsunto(eventoExistente.summary)
      setDescripcion(eventoExistente.description || '')
      setUbicacion(eventoExistente.location || '')
      
      // Extraer fecha y hora del datetime
      const startDate = eventoExistente.startDateTime.split('T')[0]
      const startTime = eventoExistente.startDateTime.split('T')[1].substring(0, 5)
      const endTime = eventoExistente.endDateTime.split('T')[1].substring(0, 5)
      
      setFecha(startDate)
      setHoraInicio(startTime)
      setHoraFin(endTime)
      setCorreoParticipante(eventoExistente.attendees?.[0] || contactoEmail || '')
    }
  }, [eventoExistente, abierto, contactoEmail])

  // Cargar eventos del día cuando cambia la fecha
  useEffect(() => {
    if (abierto && fecha) {
      cargarEventosDelDia()
    }
  }, [fecha, abierto])

  // Detectar conflictos de horario cuando cambian las horas
  useEffect(() => {
    if (eventosDelDia.length > 0 && fecha && horaInicio && horaFin) {
      verificarConflictoHorario()
    } else {
      setConflictoHorario(false)
    }
  }, [horaInicio, horaFin, eventosDelDia, fecha])

  const cargarEventosDelDia = async () => {
    try {
      const eventos = await listarEventos()
      // Filtrar eventos del día seleccionado
      const eventosFiltered = eventos.filter((evento: any) => {
        const fechaEvento = evento.start.split('T')[0]
        return fechaEvento === fecha && evento.id !== eventoExistente?.id
      })
      setEventosDelDia(eventosFiltered)
    } catch (error) {
      console.error('Error cargando eventos del día:', error)
      setEventosDelDia([])
    }
  }

  const verificarConflictoHorario = () => {
    const inicio = new Date(`2000-01-01T${horaInicio}:00`)
    const fin = new Date(`2000-01-01T${horaFin}:00`)

    const hayConflicto = eventosDelDia.some((evento: any) => {
      const eventoInicio = new Date(`2000-01-01T${evento.start.split('T')[1].substring(0, 5)}:00`)
      const eventoFin = new Date(`2000-01-01T${evento.end.split('T')[1].substring(0, 5)}:00`)

      // Detectar solapamiento
      return inicio < eventoFin && fin > eventoInicio
    })

    setConflictoHorario(hayConflicto)
  }

  const validarFechaYHora = (): { valida: boolean; mensaje?: string } => {
    const fechaSeleccionada = new Date(fecha)
    const ahora = new Date()
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
    
    // Validar que no sea una fecha pasada
    if (fechaSeleccionada < hoy) {
      return { valida: false, mensaje: 'No puedes agendar una reunión en un día pasado' }
    }

    // Si es hoy, validar que la hora no sea pasada
    if (fechaSeleccionada.getTime() === hoy.getTime()) {
      const [horaHoy, minutoHoy] = [ahora.getHours().toString().padStart(2, '0'), ahora.getMinutes().toString().padStart(2, '0')]
      const horaActual = `${horaHoy}:${minutoHoy}`
      
      if (horaInicio < horaActual) {
        return { valida: false, mensaje: 'No puedes agendar una reunión a una hora ya pasada' }
      }
    }

    return { valida: true }
  }

  const obtenerFechaMinima = () => {
    const hoy = new Date()
    hoy.setDate(hoy.getDate() + 1) // Mañana como mínimo
    return hoy.toISOString().split('T')[0]
  }

  const handleGuardarReunion = async () => {
    if (!asunto.trim()) {
      toast({ title: 'Error', description: 'El asunto es requerido', variant: 'destructive' })
      return
    }

    if (!fecha) {
      toast({ title: 'Error', description: 'La fecha es requerida', variant: 'destructive' })
      return
    }

    // Validar fecha y hora (solo para nuevos eventos)
    if (!eventoExistente) {
      const validacion = validarFechaYHora()
      if (!validacion.valida) {
        toast({ 
          title: '⚠️ Fecha u hora inválida', 
          description: validacion.mensaje, 
          variant: 'destructive' 
        })
        return
      }
    }

    // Validar que no haya conflicto de horario
    if (conflictoHorario && !eventoExistente) {
      toast({ 
        title: '⚠️ Conflicto de horario', 
        description: 'Ya existe una reunión en este horario', 
        variant: 'destructive' 
      })
      return
    }

    setCargando(true)
    try {
      const startDateTime = `${fecha}T${horaInicio}:00`
      const endDateTime = `${fecha}T${horaFin}:00`

      const evento = {
        summary: asunto,
        description: descripcion || `Reunión con ${contactoNombre}${contactoTelefono ? ` - ${contactoTelefono}` : ''}`,
        location: ubicacion || '',
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        attendees: correoParticipante && 
                   correoParticipante.includes('@') && 
                   !correoParticipante.includes('.local') ? [correoParticipante] : [],
      }

      const datosContacto = {
        nombre: contactoNombre,
        correo: contactoEmail,
        telefono: contactoTelefono,
      }

      if (eventoExistente) {
        // Actualizar evento existente
        await actualizarEventoEnCalendar(eventoExistente.id, evento, datosContacto)
        toast({
          title: '✅ Reunión actualizada',
          description: `"${asunto}" ha sido actualizada en Google Calendar`,
        })
      } else {
        // Crear nuevo evento
        await crearEventoEnCalendar(evento, datosContacto)
        toast({
          title: '✅ Reunión agendada',
          description: `"${asunto}" ha sido creada en Google Calendar`,
        })
      }

      // Resetear formulario
      setAsunto(`Reunión con ${contactoNombre}`)
      setDescripcion('')
      setUbicacion('')
      setCorreoParticipante(contactoEmail || '')

      onEventoCreado?.()
      onCerrar()
    } catch (error: any) {
      console.error('Error guardando reunión:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la reunión',
        variant: 'destructive',
      })
    } finally {
      setCargando(false)
    }
  }

  const handleEliminarReunion = async () => {
    if (!eventoExistente) return

    if (!confirm('¿Estás seguro de que deseas eliminar esta reunión? Esta acción no se puede deshacer.')) {
      return
    }

    setEliminando(true)
    try {
      const datosContacto = {
        nombre: contactoNombre,
        correo: contactoEmail,
        telefono: contactoTelefono,
      }

      await eliminarEventoEnCalendar(eventoExistente.id, datosContacto, {
        summary: eventoExistente.summary,
        description: eventoExistente.description,
        location: eventoExistente.location,
        startDateTime: eventoExistente.startDateTime,
        endDateTime: eventoExistente.endDateTime,
      })
      toast({
        title: '✅ Reunión eliminada',
        description: `"${eventoExistente.summary}" ha sido eliminada de Google Calendar`,
      })
      onEventoCreado?.()
      onCerrar()
    } catch (error: any) {
      console.error('Error eliminando reunión:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la reunión',
        variant: 'destructive',
      })
    } finally {
      setEliminando(false)
    }
  }

  const handleCrearReunion = async () => {
    if (!asunto.trim()) {
      toast({ title: 'Error', description: 'El asunto es requerido', variant: 'destructive' })
      return
    }

    if (!fecha) {
      toast({ title: 'Error', description: 'La fecha es requerida', variant: 'destructive' })
      return
    }

    setCargando(true)
    try {
      // Crear las fechas en formato ISO 8601 sin zona horaria (Google Calendar requiere esto con timeZone especificada)
      // Ejemplo: "2025-01-15T10:00:00"
      const startDateTime = `${fecha}T${horaInicio}:00`
      const endDateTime = `${fecha}T${horaFin}:00`

      const evento = {
        summary: asunto,
        description: descripcion || `Reunión con ${contactoNombre}${contactoTelefono ? ` - ${contactoTelefono}` : ''}`,
        location: ubicacion || '',
        startDateTime: startDateTime, // Enviar sin zona horaria
        endDateTime: endDateTime, // Enviar sin zona horaria
        // Solo incluir emails válidos (no incluir emails importados locales)
        attendees: correoParticipante && 
                   correoParticipante.includes('@') && 
                   !correoParticipante.includes('.local') ? [correoParticipante] : [],
      }

      await crearEventoEnCalendar(evento)

      toast({
        title: '✅ Reunión agendada',
        description: `"${asunto}" ha sido creada en Google Calendar`,
      })

      // Resetear formulario
      setAsunto(`Reunión con ${contactoNombre}`)
      setDescripcion('')
      setUbicacion('')
      setCorreoParticipante(contactoEmail || '')

      onEventoCreado?.()
      onCerrar()
    } catch (error: any) {
      console.error('Error creando reunión:', error)
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la reunión',
        variant: 'destructive',
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {eventoExistente ? 'Editar Reunión' : 'Agendar Reunión'} en Google Calendar
          </DialogTitle>
          <DialogDescription>
            {eventoExistente 
              ? 'Modifica los detalles de la reunión' 
              : 'Crea una reunión y sincronízala automáticamente con Google Calendar'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
          {/* Alerta de conflicto de horario */}
          {conflictoHorario && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ Ya existe una reunión en este horario el {fecha}. 
                Por favor, elige otro horario para evitar conflictos.
              </AlertDescription>
            </Alert>
          )}

          {/* Mostrar reuniones del día */}
          {eventosDelDia.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">
                📅 Reuniones agendadas el {fecha}:
              </p>
              <div className="space-y-1">
                {eventosDelDia.map((evento: any, idx: number) => {
                  const inicio = evento.start.split('T')[1].substring(0, 5)
                  const fin = evento.end.split('T')[1].substring(0, 5)
                  return (
                    <p key={idx} className="text-xs text-blue-800">
                      • {evento.title} ({inicio} - {fin})
                    </p>
                  )
                })}
              </div>
            </div>
          )}

          {/* Asunto */}
          <div>
            <label className="block text-sm font-medium mb-1">Asunto *</label>
            <Input
              placeholder="Ej: Reunión de seguimiento"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Textarea
              placeholder="Detalles de la reunión..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            />
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium mb-1">Ubicación (opcional)</label>
            <Input
              placeholder="Ej: Oficina, Zoom, etc."
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
            />
          </div>

          {/* Fecha y Horas */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha *</label>
              <Input 
                type="date" 
                value={fecha} 
                onChange={(e) => setFecha(e.target.value)}
                min={eventoExistente ? undefined : obtenerFechaMinima()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora Inicio *</label>
              <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora Fin *</label>
              <Input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
            </div>
          </div>

          {/* Email Participante */}
          <div>
            <label className="block text-sm font-medium mb-1">Email del Participante (opcional)</label>
            <Input
              type="email"
              placeholder={contactoEmail || 'correo@ejemplo.com'}
              value={correoParticipante}
              onChange={(e) => setCorreoParticipante(e.target.value)}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 justify-between pt-4 border-t sticky bottom-0 bg-white">
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCerrar} disabled={cargando || eliminando}>
                Cancelar
              </Button>
            </div>
            
            <div className="flex gap-2">
              {eventoExistente && (
                <Button
                  onClick={handleEliminarReunion}
                  disabled={cargando || eliminando}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {eliminando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </>
                  )}
                </Button>
              )}
              
              <Button
                onClick={handleGuardarReunion}
                disabled={cargando || eliminando || (conflictoHorario && !eventoExistente)}
                className="bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {eventoExistente ? 'Actualizando...' : 'Agendando...'}
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    {eventoExistente ? 'Actualizar' : 'Agendar'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
