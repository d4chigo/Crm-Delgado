'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Calendar, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { crearEventoEnCalendar, actualizarEventoEnCalendar, eliminarEventoEnCalendar } from '@/services/api/calendar.service'

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

  const handleGuardarReunion = async () => {
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
              <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
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
                disabled={cargando || eliminando}
                className="bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030]"
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
