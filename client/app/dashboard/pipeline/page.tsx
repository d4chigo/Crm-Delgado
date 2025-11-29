"use client"

import { useState, useEffect, useCallback } from "react"
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
import { FiltrosPipeline } from "@/components/features/opportunities"
import type { Etiqueta } from "@/types/etiqueta.types"
import type { OportunidadCliente, FiltrosOportunidad } from "@/types/oportunidad.types"
import type { FiltrosAvanzados } from "@/components/features/opportunities/FiltrosPipeline"
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
  GripVertical,
  Trash2,
} from "lucide-react"
import AssistantFab from "@/components/assistant/AssistantFab"
import AssistantPanel from "@/components/assistant/AssistantPanel"
import DialogoWhatsApp from "@/components/features/whatsapp/DialogoWhatsApp"
import { DialogoAgendarReunion } from "@/components/features/calendar/DialogoAgendarReunion"

// Mapeo de etapas para el pipeline
const ETAPAS_PIPELINE: { id: string; nombre: string; color: string }[] = [
  { id: "CONTACTO_INICIAL", nombre: "Contacto Inicial", color: "bg-blue-500" },
  { id: "AGENDAMIENTO", nombre: "Agendamiento", color: "bg-purple-500" },
  { id: "SEPARACION", nombre: "Separación", color: "bg-indigo-500" },
  { id: "CIERRE_GANADO", nombre: "Cierre Ganado", color: "bg-green-500" },
  { id: "CIERRE_PERDIDO", nombre: "Cierre Perdido", color: "bg-red-500" },
  { id: "FIDELIZACION", nombre: "Fidelización", color: "bg-cyan-500" },
]

export default function PaginaPipeline() {
  const { toast } = useToast()
  const { oportunidades, estadisticas, cargando, error, moverOportunidad, eliminarOportunidad, refrescar } = useOportunidades()
  
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYears, setSelectedYears] = useState<string[]>(["2025"])
  const [selectedDeal, setSelectedDeal] = useState<OportunidadCliente | null>(null)
  const [busqueda, setBusqueda] = useState<string>("")
  const [etiquetaFiltro, setEtiquetaFiltro] = useState<string>("todas")
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [filtrosAvanzados, setFiltrosAvanzados] = useState<FiltrosAvanzados | null>(null)
  const [abiertoAsistente, setAbiertoAsistente] = useState(false)
  const [dialogoWhatsappAbierto, setDialogoWhatsappAbierto] = useState(false)
  const [whatsappTelefono, setWhatsappTelefono] = useState<string | null>(null)
  const [dialogoAgendarAbierto, setDialogoAgendarAbierto] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [overTrash, setOverTrash] = useState(false)
  const [refrescarLeads, setRefrescarLeads] = useState<(() => void) | null>(null)
  const scrollContainerRef = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      (window as any).__pipelineScrollContainer = element
    }
  }, [])

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

  // Filtrar oportunidades por mes, años, búsqueda, etiqueta y filtros avanzados
  const oportunidadesFiltradas = oportunidades.filter((op: OportunidadCliente) => {
    // Si hay filtros avanzados, usar esos
    if (filtrosAvanzados) {
      // Filtro por etapas
      if (filtrosAvanzados.etapas && filtrosAvanzados.etapas.length > 0) {
        if (!filtrosAvanzados.etapas.includes(op.etapa)) {
          return false
        }
      }

      // Filtro por búsqueda
      if (filtrosAvanzados.busqueda?.trim()) {
        const searchLower = filtrosAvanzados.busqueda.toLowerCase()
        const nombreCompleto = `${op.cliente?.nombre || ''} ${op.cliente?.apellido || ''}`.toLowerCase()
        const telefono = op.cliente?.telefono?.replace(/\D/g, '') || ''
        const correo = op.cliente?.correo?.toLowerCase() || ''
        const empresa = op.cliente?.empresa?.toLowerCase() || ''
        const titulo = op.titulo?.toLowerCase() || ''
        
        if (!nombreCompleto.includes(searchLower) && 
            !telefono.includes(searchLower.replace(/\D/g, '')) &&
            !correo.includes(searchLower) && 
            !empresa.includes(searchLower) &&
            !titulo.includes(searchLower)) {
          return false
        }
      }

      // Filtro por probabilidad
      if (filtrosAvanzados.probabilidadMin !== undefined && (op.probabilidad || 0) < filtrosAvanzados.probabilidadMin) {
        return false
      }
      if (filtrosAvanzados.probabilidadMax !== undefined && (op.probabilidad || 0) > filtrosAvanzados.probabilidadMax) {
        return false
      }

      // Filtro por valor
      if (filtrosAvanzados.valorMin !== undefined && (op.valor || 0) < filtrosAvanzados.valorMin) {
        return false
      }
      if (filtrosAvanzados.valorMax !== undefined && (op.valor || 0) > filtrosAvanzados.valorMax) {
        return false
      }

      // Filtro por etiquetas
      if (filtrosAvanzados.etiquetas && filtrosAvanzados.etiquetas.length > 0) {
        // Buscar etiquetas en cliente o lead
        const etiquetasCliente = op.cliente?.etiquetasRel || []
        const etiquetasLead = op.lead?.etiquetasRel || []
        const todasLasEtiquetas = [...etiquetasCliente, ...etiquetasLead]
        
        const tieneEtiqueta = todasLasEtiquetas.some((et: any) => 
          filtrosAvanzados.etiquetas?.includes(et.etiqueta.id)
        )
        
        if (!tieneEtiqueta) {
          return false
        }
      }

      return true
    }

    // Si no hay filtros avanzados, usar los filtros simples
    // Filtro por mes y años
    if (selectedMonth !== "all" && selectedYears.length > 0) {
      const opDate = new Date(op.creadoEn)
      const opMonth = opDate.getMonth() + 1
      const opYear = opDate.getFullYear()
      if (opMonth !== Number.parseInt(selectedMonth) || !selectedYears.includes(opYear.toString())) {
        return false
      }
    }

    // Filtro por búsqueda (nombre, teléfono, empresa)
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase()
      const nombreCompleto = `${op.cliente?.nombre || ''} ${op.cliente?.apellido || ''}`.toLowerCase()
      const telefono = op.cliente?.telefono?.replace(/\D/g, '') || ''
      const correo = op.cliente?.correo?.toLowerCase() || ''
      const empresa = op.cliente?.empresa?.toLowerCase() || ''
      const titulo = op.titulo?.toLowerCase() || ''
      
      if (!nombreCompleto.includes(searchLower) && 
          !telefono.includes(searchLower.replace(/\D/g, '')) &&
          !correo.includes(searchLower) && 
          !empresa.includes(searchLower) &&
          !titulo.includes(searchLower)) {
        return false
      }
    }

    // Filtro por etiqueta
    if (etiquetaFiltro !== "todas") {
      // Verificar si el cliente tiene la etiqueta seleccionada
      const tieneEtiqueta = op.cliente?.etiquetasRel?.some((et: any) => et.etiqueta.id === etiquetaFiltro)
      if (!tieneEtiqueta) {
        return false
      }
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
    .filter((op: OportunidadCliente) => !["CIERRE_GANADO", "CIERRE_PERDIDO"].includes(op.etapa))
    .reduce((acc: number, op: OportunidadCliente) => acc + (op.valor ? Number(op.valor) : 0), 0)

  const oportunidadesGanadas = oportunidadesFiltradas.filter((op: OportunidadCliente) => op.etapa === "CIERRE_GANADO")
  const valorGanado = oportunidadesGanadas.reduce((acc: number, op: OportunidadCliente) => acc + (op.valor ? Number(op.valor) : 0), 0)

  const getProbabilityColor = (probability?: number | null) => {
    if (!probability) return "text-gray-600 bg-gray-50"
    if (probability >= 75) return "text-green-600 bg-green-50"
    if (probability >= 50) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const handleWhatsApp = useCallback((telefono: string, nombre: string) => {
    console.log('[WA] handler called with', telefono, nombre)
    if (!telefono) {
      toast({ title: 'Teléfono no disponible', description: 'El contacto no tiene teléfono registrado.' })
      return
    }
    setWhatsappTelefono(telefono)
    setDialogoWhatsappAbierto(true)
  }, [toast])

  const handleEnviarWhatsApp = useCallback((mensajeLocal: string) => {
    let raw = (whatsappTelefono || "").replace(/\D/g, "")
    if (raw.length === 9) raw = `51${raw}`
    if (!raw) {
      toast({ title: "Sin teléfono", description: "Este contacto no tiene teléfono. Copia y envía manualmente.", variant: "destructive" })
      return
    }
    const url = `https://wa.me/${raw}?text=${encodeURIComponent(mensajeLocal)}`
    try {
      window.open(url, "_blank")
    } catch {}
    setDialogoWhatsappAbierto(false)
  }, [whatsappTelefono, toast])

  const handleScheduleMeeting = () => {
    setDialogoAgendarAbierto(true)
  };

  const handleMoverOportunidad = async (oportunidadId: string, nuevaEtapa: string) => {
    try {
      await moverOportunidad(oportunidadId, nuevaEtapa, refrescarLeads || undefined)
      await refrescar()
      toast({ title: 'Éxito', description: 'Oportunidad movida exitosamente' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Error al mover oportunidad', variant: 'destructive' })
    }
  };

  const handleEliminarOportunidad = async (oportunidadId: string) => {
    console.log('🗑️ Intentando eliminar oportunidad:', oportunidadId);
    
    if (!confirm('¿Estás seguro de que deseas eliminar esta oportunidad?')) {
      return;
    }

    try {
      console.log('📡 Llamando a eliminarOportunidad del hook');
      await eliminarOportunidad(oportunidadId);
      
      console.log('✅ Oportunidad eliminada correctamente');
      toast({ title: 'Éxito', description: 'Oportunidad eliminada correctamente' });
      setSelectedDeal(null);
    } catch (error: any) {
      console.error('❌ Error al eliminar:', error);
      toast({ title: 'Error', description: error.message || 'No se pudo eliminar la oportunidad', variant: 'destructive' });
    }
  };

  const handleDragEnd = async (result: DragEndEvent) => {
    const { active, over } = result

    // Si se soltó fuera de una zona droppable
    if (!over) {
      return
    }

    // Si se soltó en el mismo lugar
    if (active.id === over.id) {
      return
    }

    // El ID del over debería ser la etapa, el ID del active es el oportunidad.id
    const nuevaEtapa = String(over.id)
    const oportunidadId = String(active.id)

    try {
      await moverOportunidad(oportunidadId, nuevaEtapa, refrescarLeads || undefined)
      await refrescar()
      toast({ title: 'Éxito', description: 'Oportunidad movida exitosamente' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Error al mover oportunidad', variant: 'destructive' })
      // Refrescar para revertir cambios en UI
      await refrescar()
    }
    setDraggedItem(null)
  }

  const handleDragStart = (oportunidadId: string) => {
    setDraggedItem(oportunidadId)
  }

  const handleDropZone = async (etapaId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!draggedItem) return

    if (draggedItem === etapaId) {
      setDraggedItem(null)
      return
    }

    try {
      await moverOportunidad(draggedItem, etapaId, refrescarLeads || undefined)
      await refrescar()
      toast({ title: 'Éxito', description: 'Oportunidad movida exitosamente' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Error al mover oportunidad', variant: 'destructive' })
      await refrescar()
    }
    setDraggedItem(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    const container = (window as any).__pipelineScrollContainer
    if (!container) return

    const rect = container.getBoundingClientRect()
    const threshold = 100 // Píxeles desde el borde para activar scroll
    const scrollSpeed = 20 // Píxeles por scroll

    // Scroll izquierda
    if (e.clientX - rect.left < threshold) {
      container.scrollLeft -= scrollSpeed
    }
    
    // Scroll derecha
    if (rect.right - e.clientX < threshold) {
      container.scrollLeft += scrollSpeed
    }
  }

  const handleDropTrash = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setOverTrash(false)
    
    if (!draggedItem) return

    const oportunidad = oportunidades.find(op => op.id === draggedItem)
    if (!oportunidad) return

    const confirmar = confirm(
      `¿Deseas eliminar la oportunidad de ${oportunidad.cliente?.nombre}?\n\nEsta acción no se puede deshacer.`
    )

    if (!confirmar) {
      setDraggedItem(null)
      return
    }

    try {
      await handleEliminarOportunidad(draggedItem)
      toast({ title: 'Éxito', description: 'Oportunidad eliminada' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Error al eliminar', variant: 'destructive' })
    }
    setDraggedItem(null)
  }

  return (
    <div className="space-y-6 relative">
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

          </div>
        </div>

        {/* Filtros Avanzados */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <FiltrosPipeline
              onAplicar={(filtros: FiltrosAvanzados) => {
                console.log('[Pipeline] Filtros aplicados:', filtros)
                setFiltrosAvanzados(filtros)
              }}
              cargando={cargando}
            />
          </div>
          
          {/* Papelera Flotante */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setOverTrash(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setOverTrash(false)
            }}
            onDrop={handleDropTrash}
            className={`p-3 rounded-lg border-2 transition-all cursor-move flex-shrink-0 ${
              overTrash
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 hover:border-red-400 hover:bg-red-50/50 dark:border-gray-600 dark:hover:border-red-400 dark:hover:bg-red-900/10'
            }`}
            title="Arrastra oportunidades aquí para eliminar"
          >
            <Trash2 className={`w-5 h-5 ${
              overTrash ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
            }`} />
          </div>
        </div>
      </div>


      {/* Kanban Board con Drag and Drop */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto pb-4"
        onDragOver={handleDragOver}
      >
        <div className="flex gap-4 min-w-max">
          {etapasConDatos.map((etapa) => {
            const oportunidadesEtapa = oportunidadesFiltradas.filter((op: OportunidadCliente) => op.etapa === etapa.id)
            return (
              <div
                key={etapa.id}
                className="flex-shrink-0 w-80"
              >
                <Card 
                  className="border-border h-full"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.add('bg-muted/50', 'border-2', 'border-[#FCBA00]')
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('bg-muted/50', 'border-2', 'border-[#FCBA00]')
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.remove('bg-muted/50', 'border-2', 'border-[#FCBA00]')
                    handleDropZone(etapa.id, e)
                  }}
                >
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
                      <div
                        key={oportunidad.id}
                        draggable
                        onDragStart={() => handleDragStart(oportunidad.id)}
                        onDragEnd={() => setDraggedItem(null)}
                        className={`transition-all cursor-move ${draggedItem === oportunidad.id ? 'opacity-50' : ''}`}
                      >
                        <Card
                          className="border-border hover:shadow-md transition-shadow bg-white group"
                          onClick={() => setSelectedDeal(oportunidad)}
                        >
                          <CardContent className="p-4 space-y-3 relative">
                            {/* Drag Handle */}
                            <div className="absolute top-2 right-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Client Info */}
                            <div className="flex items-start justify-between pr-6">
                              <div className="flex items-center gap-2 flex-1">
                                <Avatar className="w-8 h-8 bg-[#FCBA00]">
                                  <AvatarFallback className="bg-[#FCBA00] text-[#303030] text-xs font-bold">
                                    {(oportunidad.lead?.nombre || oportunidad.cliente?.nombre)?.charAt(0) || 'C'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm text-[#303030] line-clamp-1">
                                    {(oportunidad.lead?.nombre || oportunidad.cliente?.nombre) || 'Sin nombre'} {(oportunidad.lead?.apellido || oportunidad.cliente?.apellido) || ''}
                                  </h4>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{oportunidad.titulo}</p>
                                </div>
                              </div>
                            </div>

                            {/* Property */}
                            <div className="space-y-2">
                              {/* Tags */}
                              {(() => {
                                const etiquetas = (oportunidad.cliente?.etiquetasRel || oportunidad.lead?.etiquetasRel || []) as Array<{ etiqueta: { id: string; nombre: string; color: string } }>
                                return etiquetas && etiquetas.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {etiquetas.slice(0, 3).map((et: any) => (
                                      <Badge
                                        key={et.etiqueta.id}
                                        className="text-xs font-semibold"
                                        style={{
                                          backgroundColor: et.etiqueta.color || '#E5E7EB',
                                          color: 'white'
                                        }}
                                      >
                                        {et.etiqueta.nombre}
                                      </Badge>
                                    ))}
                                    {etiquetas.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{etiquetas.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )
                              })()}
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
                      </div>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-[#FCBA00]/30">
            <DialogHeader className="border-b border-[#FCBA00]/20 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-2xl font-bold text-[#303030]">
                    {(selectedDeal.lead?.nombre || selectedDeal.cliente?.nombre) || 'Sin nombre'} {(selectedDeal.lead?.apellido || selectedDeal.cliente?.apellido) || ''}
                  </DialogTitle>
                  <DialogDescription className="mt-2">{selectedDeal.titulo}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Stage & Probability */}
              <div className="flex gap-3 items-center flex-wrap">
                <Badge
                  className={`${ETAPAS_PIPELINE.find((e: { id: string; nombre: string; color: string }) => e.id === selectedDeal.etapa)?.color} text-white font-medium`}
                >
                  {ETAPAS_PIPELINE.find((e: { id: string; nombre: string; color: string }) => e.id === selectedDeal.etapa)?.nombre}
                </Badge>
                <Badge className={`${getProbabilityColor(selectedDeal.probabilidad)} font-semibold`}>
                  Probabilidad: {selectedDeal.probabilidad || 0}%
                </Badge>
                {/* Etiquetas del cliente */}
                {selectedDeal.cliente?.etiquetasRel && selectedDeal.cliente.etiquetasRel.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {selectedDeal.cliente.etiquetasRel.slice(0, 3).map((et: any) => (
                      <Badge
                        key={et.etiqueta.id}
                        className="text-xs font-semibold"
                        style={{
                          backgroundColor: et.etiqueta.color || '#E5E7EB',
                          color: 'white'
                        }}
                      >
                        {et.etiqueta.nombre}
                      </Badge>
                    ))}
                    {selectedDeal.cliente.etiquetasRel.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedDeal.cliente.etiquetasRel.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-[#303030] flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate min-w-0 flex-1" title={(selectedDeal.cliente?.correo || selectedDeal.lead?.correo) || 'Sin email'}>
                      {(selectedDeal.cliente?.correo || selectedDeal.lead?.correo) || 'Sin email'}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium text-[#303030] flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate min-w-0 flex-1">
                      {(selectedDeal.cliente?.telefono || selectedDeal.lead?.telefono) || 'Sin teléfono'}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Action Buttons - WhatsApp & Calendar */}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => handleWhatsApp(selectedDeal.cliente?.telefono || selectedDeal.lead?.telefono || '', selectedDeal.cliente?.nombre || selectedDeal.lead?.nombre || '')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  onClick={() => handleScheduleMeeting()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Reunión
                </Button>
              </div>

              {/* Property Details */}
              <div className="p-4 bg-gradient-to-br from-[#FCBA00]/5 to-[#FCBA00]/0 border border-[#FCBA00]/20 rounded-lg space-y-3">
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
                  <p className="font-medium text-[#303030]">
                    {selectedDeal.cliente?.proyectos && selectedDeal.cliente.proyectos.length > 0
                      ? selectedDeal.cliente.proyectos.map(p => p.proyecto.nombre).join(', ')
                      : selectedDeal.proyecto || 'Sin proyecto'}
                  </p>
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[#FCBA00]/20">
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleEliminarOportunidad(selectedDeal.id)
                  }}
                  className="flex-1"
                >
                  Eliminar
                </Button>
                <Button 
                  onClick={() => setSelectedDeal(null)}
                  className="flex-1 bg-[#FCBA00] hover:bg-[#E5A200] text-[#303030] font-semibold"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal para enviar WhatsApp */}
      <DialogoWhatsApp
        abierto={dialogoWhatsappAbierto}
        onCerrar={() => setDialogoWhatsappAbierto(false)}
        mensajeInicial="Hola, te contacto para hacer seguimiento."
        telefono={whatsappTelefono}
        titulo="Enviar mensaje por WhatsApp"
        onEnviar={handleEnviarWhatsApp}
      />

      {/* Modal para agendar reunión */}
      {selectedDeal && (
        <DialogoAgendarReunion
          abierto={dialogoAgendarAbierto}
          onCerrar={() => setDialogoAgendarAbierto(false)}
          contactoNombre={selectedDeal.cliente?.nombre || selectedDeal.lead?.nombre}
          contactoEmail={selectedDeal.cliente?.correo || selectedDeal.lead?.correo}
          contactoTelefono={selectedDeal.cliente?.telefono || selectedDeal.lead?.telefono}
          onEventoCreado={refrescar}
        />
      )}

      <AssistantFab onClick={() => setAbiertoAsistente(true)} />
      <AssistantPanel open={abiertoAsistente} onClose={() => setAbiertoAsistente(false)} />
    </div>
  )
}
