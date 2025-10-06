"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Plus as IconoMas,
  Search as IconoBuscar,
  Filter as IconoFiltro,
  Mail as IconoCorreo,
  Phone as IconoTelefono,
  MapPin as IconoUbicacion,
  Calendar as IconoCalendario,
  DollarSign as IconoDolar,
  TrendingUp as IconoTendencia,
  User as IconoUsuario,
  Edit as IconoEditar,
  Trash2 as IconoEliminar,
  Tag as IconoEtiqueta,
  XIcon as IconoCerrar,
} from "lucide-react"
import { useLeads, type LeadSimple } from "@/hooks/useLeads"

export default function PaginaLeads() {
  const {
    leads,
    leadsSeleccionados,
    agregarLead,
    eliminarLead,
    alternarSeleccionLead,
    seleccionarTodos,
    eliminarEtiqueta,
    leadsFiltrados: obtenerLeadsFiltrados,
  } = useLeads()

  const [terminoBusqueda, setTerminoBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("all")
  const [filtroEtiqueta, setFiltroEtiqueta] = useState("all")

  const configuracionEstados = {
    nuevo: { etiqueta: "Nuevo", color: "bg-blue-100 text-blue-700 border-blue-200" },
    contactado: { etiqueta: "Contactado", color: "bg-purple-100 text-purple-700 border-purple-200" },
    calificado: { etiqueta: "Calificado", color: "bg-green-100 text-green-700 border-green-200" },
    negociacion: { etiqueta: "Negociación", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    cerrado: { etiqueta: "Cerrado", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    perdido: { etiqueta: "Perdido", color: "bg-red-100 text-red-700 border-red-200" },
  }

  const coloresEtiquetas: Record<string, string> = {
    "Techo Propio": "bg-orange-100 text-orange-700 border-orange-200",
    "Mi Vivienda": "bg-cyan-100 text-cyan-700 border-cyan-200",
    Compra: "bg-green-100 text-green-700 border-green-200",
    Venta: "bg-purple-100 text-purple-700 border-purple-200",
  }

  const obtenerColorPuntaje = (puntaje: number) => {
    if (puntaje >= 70) return "text-green-600 bg-green-50 border-green-200"
    if (puntaje >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const leadsFiltrados = obtenerLeadsFiltrados(terminoBusqueda, filtroEstado, filtroEtiqueta)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Gestión de Leads</h1>
          <p className="text-muted-foreground mt-1">Administra y califica tus prospectos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold text-[#303030] mt-1">{leads.length}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <IconoUsuario className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calificados</p>
                <p className="text-3xl font-bold text-[#303030] mt-1">
                  {leads.filter((l) => l.estado === "calificado").length}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <IconoTendencia className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Negociación</p>
                <p className="text-3xl font-bold text-[#303030] mt-1">
                  {leads.filter((l) => l.estado === "negociacion").length}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl">
                <IconoDolar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Promedio</p>
                <p className="text-3xl font-bold text-[#303030] mt-1">
                  {Math.round(leads.reduce((acc, l) => acc + l.puntaje, 0) / leads.length) || 0}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl">
                <IconoTendencia className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconoBuscar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <IconoFiltro className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="nuevo">Nuevos</SelectItem>
                <SelectItem value="contactado">Contactados</SelectItem>
                <SelectItem value="calificado">Calificados</SelectItem>
                <SelectItem value="negociacion">En Negociación</SelectItem>
                <SelectItem value="cerrado">Cerrados</SelectItem>
                <SelectItem value="perdido">Perdidos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroEtiqueta} onValueChange={setFiltroEtiqueta}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <IconoEtiqueta className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por etiqueta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etiquetas</SelectItem>
                <SelectItem value="Techo Propio">Techo Propio</SelectItem>
                <SelectItem value="Mi Vivienda">Mi Vivienda</SelectItem>
                <SelectItem value="Compra">Compra</SelectItem>
                <SelectItem value="Venta">Venta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {leadsFiltrados.length > 0 && (
        <div className="flex items-center gap-2 px-2">
          <Checkbox
            id="select-all"
            checked={leadsSeleccionados.length === leadsFiltrados.length && leadsFiltrados.length > 0}
            onCheckedChange={() => seleccionarTodos(leadsFiltrados)}
          />
          <Label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
            Seleccionar todos ({leadsFiltrados.length})
          </Label>
        </div>
      )}

      {/* Leads List */}
      <div className="grid grid-cols-1 gap-4">
        {leadsFiltrados.map((lead) => (
          <Card key={lead.id} className="border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <Checkbox
                    checked={leadsSeleccionados.includes(lead.id)}
                    onCheckedChange={() => alternarSeleccionLead(lead.id)}
                    className="mt-1"
                  />

                  {/* Lead Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-bold text-[#303030]">{lead.nombre}</h3>
                          <Badge className={`${configuracionEstados[lead.estado].color} border font-medium`}>
                            {configuracionEstados[lead.estado].etiqueta}
                          </Badge>
                          <Badge className={`${obtenerColorPuntaje(lead.puntaje)} border font-bold`}>
                            Score: {lead.puntaje}
                          </Badge>
                        </div>
                        {lead.etiquetas.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap mt-2">
                            {lead.etiquetas.map((etiqueta) => (
                              <Badge key={etiqueta} className={`${coloresEtiquetas[etiqueta]} border text-xs`}>
                                {etiqueta}
                                <button
                                  onClick={() => eliminarEtiqueta(lead.id, etiqueta)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <IconoCerrar className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <IconoCorreo className="w-4 h-4" />
                            {lead.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <IconoTelefono className="w-4 h-4" />
                            {lead.telefono}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IconoCalendario className="w-3 h-3" />
                        Creado: {lead.fechaCreacion}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconoCalendario className="w-3 h-3" />
                        Último contacto: {lead.ultimoContacto}
                      </span>
                      <span className="px-2 py-1 bg-muted rounded text-[#303030]">Fuente: {lead.fuente}</span>
                    </div>

                    {lead.notas && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{lead.notas}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 lg:flex-none border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00] hover:text-[#303030]"
                  >
                    <IconoEditar className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => eliminarLead(lead.id)}
                    className="flex-1 lg:flex-none border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <IconoEliminar className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leadsFiltrados.length === 0 && (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <IconoUsuario className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#303030] mb-2">No se encontraron leads</h3>
            <p className="text-muted-foreground">Intenta ajustar los filtros o agrega un nuevo lead</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
