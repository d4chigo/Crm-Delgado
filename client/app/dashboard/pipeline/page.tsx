"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  DollarSign,
  Phone,
  Mail,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Settings,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react"

interface Deal {
  id: string
  clientName: string
  email: string
  phone: string
  property: string
  project: string
  value: number
  stage: string
  probability: number
  lastActivity: string
  nextAction: string
  assignedTo: string
  createdAt: string
  notes: string
}

interface Stage {
  id: string
  name: string
  color: string
  count: number
  value?: number
}

export default function PaginaPipeline() {
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("2025")
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isManageStagesOpen, setIsManageStagesOpen] = useState(false)
  const [stages, setStages] = useState<Stage[]>([
    { id: "lead", name: "Lead", color: "bg-blue-500", count: 0 },
    { id: "contacto", name: "Contacto Inicial", color: "bg-purple-500", count: 0 },
    { id: "visita", name: "Visita Agendada", color: "bg-indigo-500", count: 0 },
    { id: "negociacion", name: "Negociación", color: "bg-yellow-500", count: 0 },
    { id: "cierre", name: "Cierre", color: "bg-orange-500", count: 0 },
    { id: "ganado", name: "Ganado", color: "bg-green-500", count: 0 },
  ])
  const [newStageName, setNewStageName] = useState("")
  const [editingStageId, setEditingStageId] = useState<string | null>(null)
  const [editingStageName, setEditingStageName] = useState("")

  const [deals, setDeals] = useState<Deal[]>([])

  const years = Array.from({ length: 11 }, (_, i) => (2020 + i).toString())

  const filteredDeals = deals.filter((deal) => {
    if (selectedMonth === "all") return true
    const dealDate = new Date(deal.createdAt)
    const dealMonth = dealDate.getMonth() + 1
    const dealYear = dealDate.getFullYear()
    return dealMonth === Number.parseInt(selectedMonth) && dealYear === Number.parseInt(selectedYear)
  })

  const stagesWithData = stages.map((stage) => {
    const stageDeals = filteredDeals.filter((deal) => deal.stage === stage.id)
    return {
      ...stage,
      count: stageDeals.length,
      value: stageDeals.reduce((acc, deal) => acc + deal.value, 0),
    }
  })

  const totalPipelineValue = filteredDeals
    .filter((d) => !["ganado", "perdido"].includes(d.stage))
    .reduce((acc, deal) => acc + deal.value, 0)

  const wonDeals = filteredDeals.filter((d) => d.stage === "ganado")
  const totalWonValue = wonDeals.reduce((acc, deal) => acc + deal.value, 0)

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return "text-green-600 bg-green-50"
    if (probability >= 50) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const moveDeal = (dealId: string, newStage: string) => {
    setDeals(
      deals.map((deal) =>
        deal.id === dealId
          ? {
              ...deal,
              stage: newStage,
              probability: newStage === "ganado" ? 100 : newStage === "perdido" ? 0 : deal.probability,
            }
          : deal,
      ),
    )
  }

  const handleAddStage = () => {
    if (!newStageName.trim()) return
    const newStage: Stage = {
      id: newStageName.toLowerCase().replace(/\s+/g, "-"),
      name: newStageName,
      color: "bg-gray-500",
      count: 0,
    }
    setStages([...stages, newStage])
    setNewStageName("")
  }

  const handleDeleteStage = (stageId: string) => {
    const hasDeals = deals.some((deal) => deal.stage === stageId)
    if (hasDeals) {
      alert("No puedes eliminar un estado que tiene oportunidades asignadas")
      return
    }
    setStages(stages.filter((s) => s.id !== stageId))
  }

  const handleEditStage = (stageId: string) => {
    const stage = stages.find((s) => s.id === stageId)
    if (stage) {
      setEditingStageId(stageId)
      setEditingStageName(stage.name)
    }
  }

  const handleSaveStageEdit = () => {
    if (!editingStageName.trim()) return
    setStages(stages.map((s) => (s.id === editingStageId ? { ...s, name: editingStageName } : s)))
    setEditingStageId(null)
    setEditingStageName("")
  }

  const moveStageUp = (index: number) => {
    if (index === 0) return
    const newStages = [...stages]
    ;[newStages[index - 1], newStages[index]] = [newStages[index], newStages[index - 1]]
    setStages(newStages)
  }

  const moveStageDown = (index: number) => {
    if (index === stages.length - 1) return
    const newStages = [...stages]
    ;[newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]]
    setStages(newStages)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Pipeline de Ventas</h1>
          <p className="text-muted-foreground mt-1">Gestiona el proceso de ventas de principio a fin</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsManageStagesOpen(true)}
            className="border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00]/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Gestionar Estados
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Oportunidades Activas</p>
                <p className="text-3xl font-bold text-[#303030] mt-1">
                  {filteredDeals.filter((d) => !["ganado", "perdido"].includes(d.stage)).length}
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
                  S/ {(totalPipelineValue / 1000000).toFixed(1)}M
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
                <p className="text-3xl font-bold text-green-600 mt-1">{wonDeals.length}</p>
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
                <p className="text-2xl font-bold text-green-600 mt-1">S/ {(totalWonValue / 1000000).toFixed(1)}M</p>
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
          {stagesWithData.map((stage) => {
            const stageDeals = filteredDeals.filter((deal) => deal.stage === stage.id)
            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <Card className="border-border h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        <CardTitle className="text-base font-semibold text-[#303030]">{stage.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="font-semibold">
                        {stage.count}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      S/ {(stage.value / 1000).toFixed(0)}K
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                    {stageDeals.map((deal) => (
                      <Card
                        key={deal.id}
                        className="border-border hover:shadow-md transition-shadow cursor-pointer bg-white"
                        onClick={() => setSelectedDeal(deal)}
                      >
                        <CardContent className="p-4 space-y-3">
                          {/* Client Info */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8 bg-[#FCBA00]">
                                <AvatarFallback className="bg-[#FCBA00] text-[#303030] text-xs font-bold">
                                  {deal.clientName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-sm text-[#303030] line-clamp-1">{deal.clientName}</h4>
                                <p className="text-xs text-muted-foreground">{deal.assignedTo}</p>
                              </div>
                            </div>
                          </div>

                          {/* Property */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="w-3 h-3" />
                              <span className="line-clamp-1">{deal.project}</span>
                            </div>
                            <p className="text-sm font-medium text-[#303030]">{deal.property}</p>
                          </div>

                          {/* Value */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-lg font-bold text-[#FCBA00]">
                              S/ {(deal.value / 1000).toFixed(0)}K
                            </span>
                            <Badge className={`${getProbabilityColor(deal.probability)} font-semibold text-xs`}>
                              {deal.probability}%
                            </Badge>
                          </div>

                          {/* Last Activity */}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{deal.lastActivity}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {stageDeals.length === 0 && (
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
              <DialogTitle className="text-2xl font-bold text-[#303030]">{selectedDeal.clientName}</DialogTitle>
              <DialogDescription>{selectedDeal.project}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Stage & Probability */}
              <div className="flex gap-3">
                <Badge
                  className={`${stagesWithData.find((s) => s.id === selectedDeal.stage)?.color} text-white font-medium`}
                >
                  {stagesWithData.find((s) => s.id === selectedDeal.stage)?.name}
                </Badge>
                <Badge className={`${getProbabilityColor(selectedDeal.probability)} font-semibold`}>
                  Probabilidad: {selectedDeal.probability}%
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-[#303030] flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedDeal.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium text-[#303030] flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedDeal.phone}
                  </p>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Propiedad</p>
                    <p className="font-semibold text-[#303030]">{selectedDeal.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="text-2xl font-bold text-[#FCBA00]">S/ {selectedDeal.value.toLocaleString("es-PE")}</p>
                  </div>
                </div>
              </div>

              {/* Activity Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Última Actividad</p>
                  <p className="font-medium text-[#303030]">{selectedDeal.lastActivity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Próxima Acción</p>
                  <p className="font-medium text-[#303030]">{selectedDeal.nextAction}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Asignado a</p>
                  <p className="font-medium text-[#303030]">{selectedDeal.assignedTo}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                  <p className="font-medium text-[#303030]">{selectedDeal.createdAt}</p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notas</p>
                <p className="text-sm text-[#303030] bg-muted/30 p-3 rounded-lg">{selectedDeal.notes}</p>
              </div>

              {/* Move Stage Actions */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium text-[#303030]">Mover a:</p>
                <div className="flex flex-wrap gap-2">
                  {stagesWithData
                    .filter((s) => s.id !== selectedDeal.stage)
                    .map((stage) => (
                      <Button
                        key={stage.id}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          moveDeal(selectedDeal.id, stage.id)
                          setSelectedDeal(null)
                        }}
                        className="border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00]"
                      >
                        {stage.name}
                      </Button>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold">
                  Generar Cotización
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Editar Oportunidad
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isManageStagesOpen} onOpenChange={setIsManageStagesOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#303030]">Gestionar Estados del Pipeline</DialogTitle>
            <DialogDescription>Personaliza los estados de tu proceso de ventas</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add New Stage */}
            <div className="space-y-3">
              <Label>Agregar Nuevo Estado</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre del estado..."
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddStage()
                  }}
                />
                <Button onClick={handleAddStage} className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>

            {/* Existing Stages */}
            <div className="space-y-3">
              <Label>Estados Actuales</Label>
              <div className="space-y-2">
                {stages.map((stage, index) => (
                  <Card key={stage.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Drag Handle */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveStageUp(index)}
                            disabled={index === 0}
                            className="text-muted-foreground hover:text-[#FCBA00] disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveStageDown(index)}
                            disabled={index === stages.length - 1}
                            className="text-muted-foreground hover:text-[#FCBA00] disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Color Indicator */}
                        <div className={`w-4 h-4 rounded-full ${stage.color}`} />

                        {/* Stage Name */}
                        <div className="flex-1">
                          {editingStageId === stage.id ? (
                            <Input
                              value={editingStageName}
                              onChange={(e) => setEditingStageName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveStageEdit()
                                if (e.key === "Escape") {
                                  setEditingStageId(null)
                                  setEditingStageName("")
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <p className="font-semibold text-[#303030]">{stage.name}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {editingStageId === stage.id ? (
                            <>
                              <Button size="sm" onClick={handleSaveStageEdit} className="bg-[#FCBA00] text-[#303030]">
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingStageId(null)
                                  setEditingStageName("")
                                }}
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditStage(stage.id)}
                                className="border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00]/10"
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteStage(stage.id)}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setIsManageStagesOpen(false)} className="bg-[#FCBA00] text-[#303030]">
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
