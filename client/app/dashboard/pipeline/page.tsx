"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useOportunidades } from "@/hooks/useOportunidades"
import { etiquetaService } from "@/services/api/etiqueta.service"
import type { Etiqueta } from "@/types/etiqueta.types"
import type { OportunidadCliente, EtapaPipeline } from "@/types/oportunidad.types"
import {
  Building2,
  DollarSign,
  Phone,
  Mail,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Loader2,
  Search,
  Tag,
} from "lucide-react"
import AssistantFab from "@/components/assistant/AssistantFab"
import AssistantPanel from "@/components/assistant/AssistantPanel"

// Mapeo de etapas para el pipeline
const ETAPAS_PIPELINE: { id: EtapaPipeline; nombre: string; color: string }[] = [
  { id: "LEAD", nombre: "Lead", color: "bg-blue-500" },
  { id: "CONTACTO", nombre: "Contacto Inicial", color: "bg-purple-500" },
  { id: "VISITA", nombre: "Visita Agendada", color: "bg-indigo-500" },
  { id: "NEGOCIACION", nombre: "Negociación", color: "bg-yellow-500" },
  { id: "CIERRE", nombre: "Cierre", color: "bg-orange-500" },
  { id: "GANADO", nombre: "Ganado", color: "bg-green-500" },
  { id: "PERDIDO", nombre: "Perdido", color: "bg-red-500" },
]

export default function PaginaPipeline() {
  const { toast } = useToast()
  const { oportunidades, estadisticas, cargando, error, moverOportunidad, refrescar } = useOportunidades()
  
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("2025")
  const [selectedDeal, setSelectedDeal] = useState<OportunidadCliente | null>(null)
  const [busqueda, setBusqueda] = useState<string>("")
  const [etiquetaFiltro, setEtiquetaFiltro] = useState<string>("todas")
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [abiertoAsistente, setAbiertoAsistente] = useState(false)

  const years = Array.from({ length: 11 }, (_, i) => (2020 + i).toString())

  // Cargar etiquetas al montar
  useEffect(() => {
    const cargarEtiquetas = async () => {
      try {
        const etiquetasObtenidas = await etiquetaService.obtenerTodas()
        if (Array.isArray(etiquetasObtenidas)) {
          setEtiquetas(etiquetasObtenidas)
        }
      } catch (error) {
        toast({ 
          title: 'Error al cargar etiquetas',
          description: (error as Error).message,
          variant: 'destructive',
        });
      }
    }
    cargarEtiquetas()
  }, [])

  // Cargar oportunidades al montar (solo una vez)
  useEffect(() => {
    refrescar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filtrar oportunidades por mes, año, búsqueda y etiqueta
  const oportunidadesFiltradas = oportunidades.filter((op: OportunidadCliente) => {
    // Filtro por mes y año
    if (selectedMonth !== "all") {
      const opDate = new Date(op.creadoEn)
      const opMonth = opDate.getMonth() + 1
      const opYear = opDate.getFullYear()
      if (opMonth !== Number.parseInt(selectedMonth) || opYear !== Number.parseInt(selectedYear)) {
        return false
      }
    }

    // Filtro por búsqueda (nombre, apellido, correo, empresa)
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase()
      const nombreCompleto = `${op.cliente?.nombre || ''} ${op.cliente?.apellido || ''}`.toLowerCase()
      const correo = op.cliente?.correo?.toLowerCase() || ''
      const empresa = op.cliente?.empresa?.toLowerCase() || ''
      const titulo = op.titulo?.toLowerCase() || ''
      
      if (!nombreCompleto.includes(searchLower) && 
          !correo.includes(searchLower) && 
          !empresa.includes(searchLower) &&
          !titulo.includes(searchLower)) {
        return false
      }
    }

    // Nota: El filtro por etiqueta requiere que el backend incluya las etiquetas del cliente
    // Por ahora, este filtro está deshabilitado hasta que se actualice el tipo OportunidadCliente
    if (etiquetaFiltro !== "todas") {
      // TODO: Agregar soporte de etiquetas en el backend para oportunidades
      return true
    }

    return true
  })

  // Calcular datos por etapa
  const etapasConDatos = ETAPAS_PIPELINE.map((etapa) => {
    const oportunidadesEtapa = oportunidadesFiltradas.filter((op: OportunidadCliente) => op.etapa === etapa.id)
    return {
      ...etapa,
      count: oportunidadesEtapa.length,
      value: oportunidadesEtapa.reduce((acc: number, op: OportunidadCliente) => acc + (op.valor ? Number(op.valor) : 0), 0),
    }
  })

  // Estadísticas generales
  const valorPipeline = oportunidadesFiltradas
    .filter((op: OportunidadCliente) => !["GANADO", "PERDIDO"].includes(op.etapa))
    .reduce((acc: number, op: OportunidadCliente) => acc + (op.valor ? Number(op.valor) : 0), 0)

  const oportunidadesGanadas = oportunidadesFiltradas.filter((op: OportunidadCliente) => op.etapa === "GANADO")
  const valorGanado = oportunidadesGanadas.reduce((acc: number, op: OportunidadCliente) => acc + (op.valor ? Number(op.valor) : 0), 0)

  const getProbabilityColor = (probability?: number | null) => {
    if (!probability) return "text-gray-600 bg-gray-50"
    if (probability >= 75) return "text-green-600 bg-green-50"
    if (probability >= 50) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const handleWhatsApp = (telefono: string, nombre: string) => {
    console.log('[WA] handler called with', telefono, nombre)
    if (!telefono) {
      toast({ title: 'Teléfono no disponible', description: 'El contacto no tiene teléfono registrado.' })
      return
    }
    if (telefono) {
      const message = `Hola ${nombre}, te contacto para hacer seguimiento.`
      // Normalize phone (digits only) and build wa.me URL so it opens in browser
      const phone = telefono.replace(/\D/g, '')
      if (!phone) return
      let url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      // map whatsapp:// scheme (if somehow provided) to web wa.me
      try {
        if (telefono.startsWith('whatsapp:') || telefono.startsWith('whatsapp://')) {
          // in case telefono contains a whatsapp://... URL, extract digits
          const digits = telefono.replace(/\D/g, '')
          url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
        }
      } catch (e) {
        // ignore
      }
      try {
        console.log('[WA] opening url:', url)
        // show a small toast to give user feedback
        toast({ title: 'Abriendo WhatsApp', description: url })
        if (typeof window !== 'undefined' && (window as any).electron?.shell?.openExternal) {
          ;(window as any).electron.shell.openExternal(url)
        } else if (typeof window !== 'undefined') {
          window.open(url, '_blank')
        }
      } catch (e) {
        // fallback
        try { window.open(url, '_blank') } catch (_) { /* ignore */ }
      }
    }
  };

  const handleScheduleMeeting = (nombre: string, correo: string) => {
    const asunto = `Reunión con ${nombre}`;
    const descripcion = `Discutir detalles de la oportunidad con ${nombre}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(asunto)}&details=${encodeURIComponent(descripcion)}&add=${encodeURIComponent(correo)}`
    try {
      toast({ title: 'Abriendo calendario', description: url })
      if (typeof window !== 'undefined' && (window as any).electron?.shell?.openExternal) {
        ;(window as any).electron.shell.openExternal(url)
      } else if (typeof window !== 'undefined') {
        window.open(url, '_blank')
      }
    } catch (e) {
      try { window.open(url, '_blank') } catch (_) { /* ignore */ }
    }
  };

  const handleMoverOportunidad = async (oportunidadId: string, nuevaEtapa: EtapaPipeline) => {
    try {
      await moverOportunidad(oportunidadId, nuevaEtapa)
      await refrescar()
      toast({ title: 'Éxito', description: 'Oportunidad movida exitosamente' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Error al mover oportunidad', variant: 'destructive' })
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#303030]">Pipeline de Ventas</h1>
            <p className="text-muted-foreground mt-1">Gestiona el proceso de ventas de principio a fin</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={refrescar} variant="outline">
              {cargando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Actualizar
            </Button>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los meses</SelectItem>
                <SelectItem value="1">Enero</SelectItem>
                <SelectItem value="2">Febrero</SelectItem>
                <SelectItem value="3">Marzo</SelectItem>
                <SelectItem value="4">Abril</SelectItem>
                <SelectItem value="5">Mayo</SelectItem>
                <SelectItem value="6">Junio</SelectItem>
                <SelectItem value="7">Julio</SelectItem>
                <SelectItem value="8">Agosto</SelectItem>
                <SelectItem value="9">Septiembre</SelectItem>
                <SelectItem value="10">Octubre</SelectItem>
                <SelectItem value="11">Noviembre</SelectItem>
                <SelectItem value="12">Diciembre</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, correo, empresa, título o DNI..."
              value={busqueda}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusqueda(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={etiquetaFiltro} onValueChange={setEtiquetaFiltro}>
            <SelectTrigger className="w-[220px]">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <SelectValue placeholder="Todas las etiquetas" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las etiquetas</SelectItem>
              {etiquetas.map((etiqueta: Etiqueta) => (
                <SelectItem key={etiqueta.id} value={etiqueta.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: etiqueta.color }}
                    />
                    {etiqueta.nombre}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Oportunidades Activas</p>
                <p className="text-3xl font-bold text-[#303030] mt-1">
                  {oportunidadesFiltradas.filter((op: OportunidadCliente) => !["GANADO", "PERDIDO"].includes(op.etapa)).length}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor del Pipeline</p>
                <p className="text-2xl font-bold text-[#303030] mt-1">
                  S/ {(valorPipeline / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-[#FCBA00]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ventas Ganadas</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{oportunidadesGanadas.length}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Ganado</p>
                <p className="text-2xl font-bold text-green-600 mt-1">S/ {(valorGanado / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {etapasConDatos.map((etapa) => {
            const oportunidadesEtapa = oportunidadesFiltradas.filter((op: OportunidadCliente) => op.etapa === etapa.id)
            return (
              <div key={etapa.id} className="flex-shrink-0 w-80">
                <Card className="border-border h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${etapa.color}`} />
                        <CardTitle className="text-base font-semibold text-[#303030]">{etapa.nombre}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="font-semibold">
                        {etapa.count}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      S/ {(etapa.value / 1000).toFixed(0)}K
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 h-[calc(100vh-420px)] overflow-y-auto pr-2 scrollbar-visible">
                    {oportunidadesEtapa.map((oportunidad: OportunidadCliente) => (
                      <Card
                        key={oportunidad.id}
                        className="border-border hover:shadow-md transition-shadow cursor-pointer bg-white"
                        onClick={() => setSelectedDeal(oportunidad)}
                      >
                        <CardContent className="p-4 space-y-3">
                          {/* Client Info */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8 bg-[#FCBA00]">
                                <AvatarFallback className="bg-[#FCBA00] text-[#303030] text-xs font-bold">
                                  {oportunidad.cliente?.nombre?.charAt(0) || 'C'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-sm text-[#303030] line-clamp-1">
                                  {oportunidad.cliente?.nombre || 'Sin nombre'} {oportunidad.cliente?.apellido || ''}
                                </h4>
                                <p className="text-xs text-muted-foreground">{oportunidad.titulo}</p>
                              </div>
                            </div>
                          </div>

                          {/* Property */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="w-3 h-3" />
                              <span className="line-clamp-1">{oportunidad.proyecto || 'Sin proyecto'}</span>
                            </div>
                            <p className="text-sm font-medium text-[#303030]">{oportunidad.propiedad || 'Sin propiedad'}</p>
                          </div>

                          {/* Value */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-lg font-bold text-[#FCBA00]">
                              S/ {oportunidad.valor ? (Number(oportunidad.valor) / 1000).toFixed(0) : '0'}K
                            </span>
                            <Badge className={`${getProbabilityColor(oportunidad.probabilidad)} font-semibold text-xs`}>
                              {oportunidad.probabilidad || 0}%
                            </Badge>
                          </div>

                          {/* Last Activity */}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(oportunidad.ultimaActividad).toLocaleDateString('es-PE')}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {oportunidadesEtapa.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <p>No hay oportunidades</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* Deal Details Dialog */}
      {selectedDeal && (
        <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#303030]">
                {selectedDeal.cliente?.nombre || 'Sin nombre'} {selectedDeal.cliente?.apellido || ''}
              </DialogTitle>
              <DialogDescription>{selectedDeal.titulo}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Stage & Probability */}
              <div className="flex gap-3">
                <Badge
                  className={`${ETAPAS_PIPELINE.find((e: { id: EtapaPipeline; nombre: string; color: string }) => e.id === selectedDeal.etapa)?.color} text-white font-medium`}
                >
                  {ETAPAS_PIPELINE.find((e: { id: EtapaPipeline; nombre: string; color: string }) => e.id === selectedDeal.etapa)?.nombre}
                </Badge>
                <Badge className={`${getProbabilityColor(selectedDeal.probabilidad)} font-semibold`}>
                  Probabilidad: {selectedDeal.probabilidad || 0}%
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-[#303030] flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate min-w-0 flex-1" title={selectedDeal.cliente?.correo || 'Sin email'}>
                      {selectedDeal.cliente?.correo || 'Sin email'}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium text-[#303030] flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate min-w-0 flex-1">
                      {selectedDeal.cliente?.telefono || 'Sin teléfono'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleWhatsApp(selectedDeal.cliente?.telefono || '', selectedDeal.cliente?.nombre || '')}><Phone className="h-4 w-4 mr-1" />WhatsApp</Button>
                <Button variant="outline" size="sm" onClick={() => handleScheduleMeeting(selectedDeal.cliente?.nombre || '', selectedDeal.cliente?.correo || '')}><Calendar className="h-4 w-4 mr-1" />Agendar</Button>
              </div>

              {/* Property Details */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Propiedad</p>
                    <p className="font-semibold text-[#303030]">{selectedDeal.propiedad || 'Sin propiedad'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="text-2xl font-bold text-[#FCBA00]">
                      S/ {selectedDeal.valor ? Number(selectedDeal.valor).toLocaleString("es-PE") : '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activity Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Última Actividad</p>
                  <p className="font-medium text-[#303030]">
                    {new Date(selectedDeal.ultimaActividad).toLocaleDateString('es-PE')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Próxima Acción</p>
                  <p className="font-medium text-[#303030]">{selectedDeal.proximaAccion || 'Sin próxima acción'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Proyecto</p>
                  <p className="font-medium text-[#303030]">{selectedDeal.proyecto || 'Sin proyecto'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                  <p className="font-medium text-[#303030]">
                    {new Date(selectedDeal.creadoEn).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notas</p>
                <p className="text-sm text-[#303030] bg-muted/30 p-3 rounded-lg">
                  {selectedDeal.notas || 'Sin notas'}
                </p>
              </div>

              {/* Move Stage Actions */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium text-[#303030]">Mover a:</p>
                <div className="flex flex-wrap gap-2">
                  {ETAPAS_PIPELINE
                    .filter((e: { id: EtapaPipeline; nombre: string; color: string }) => e.id !== selectedDeal.etapa)
                    .map((etapa: { id: EtapaPipeline; nombre: string; color: string }) => (
                      <Button
                        key={etapa.id}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleMoverOportunidad(selectedDeal.id, etapa.id)
                          setSelectedDeal(null)
                        }}
                        className="border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00]/10"
                      >
                        {etapa.nombre}
                      </Button>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setSelectedDeal(null)}
                  className="flex-1 bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AssistantFab onClick={() => setAbiertoAsistente(true)} />
      <AssistantPanel open={abiertoAsistente} onClose={() => setAbiertoAsistente(false)} />
    </div>
  )
}
