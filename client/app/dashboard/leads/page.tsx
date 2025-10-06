"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  Building2,
  Edit,
  Trash2,
  Tag,
  XIcon,
} from "lucide-react"

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  source: string
  status: "new" | "contacted" | "qualified" | "negotiation" | "closed" | "lost"
  score: number
  budget: string
  project: string
  location: string
  createdAt: string
  lastContact: string
  notes: string
  tags: string[]
}

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTag, setFilterTag] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "1",
      name: "María González",
      email: "maria.g@email.com",
      phone: "+51 987 654 321",
      source: "Web",
      status: "qualified",
      score: 85,
      budget: "S/ 250,000 - S/ 300,000",
      project: "Proyecto Los Olivos",
      location: "Los Olivos, Lima",
      createdAt: "2025-01-15",
      lastContact: "Hoy, 10:30 AM",
      notes: "Interesada en departamento de 3 dormitorios. Tiene buen score crediticio.",
      tags: ["Mi Vivienda", "Compra"],
    },
    {
      id: "2",
      name: "Carlos Ramírez",
      email: "carlos.r@email.com",
      phone: "+51 987 654 322",
      source: "Referido",
      status: "negotiation",
      score: 72,
      budget: "S/ 180,000 - S/ 220,000",
      project: "Condominio San Isidro",
      location: "San Isidro, Lima",
      createdAt: "2025-01-14",
      lastContact: "Hoy, 09:15 AM",
      notes: "Busca departamento cerca al trabajo. Necesita financiamiento Techo Propio.",
      tags: ["Techo Propio"],
    },
    {
      id: "3",
      name: "Ana Torres",
      email: "ana.t@email.com",
      phone: "+51 987 654 323",
      source: "Facebook",
      status: "contacted",
      score: 45,
      budget: "S/ 150,000 - S/ 180,000",
      project: "Edificio Miraflores",
      location: "Miraflores, Lima",
      createdAt: "2025-01-13",
      lastContact: "Ayer, 04:20 PM",
      notes: "Primera vivienda. Requiere asesoría sobre Mi Vivienda.",
      tags: ["Mi Vivienda", "Compra"],
    },
    {
      id: "4",
      name: "Roberto Silva",
      email: "roberto.s@email.com",
      phone: "+51 987 654 324",
      source: "Web",
      status: "new",
      score: 60,
      budget: "S/ 200,000 - S/ 250,000",
      project: "Torres del Norte",
      location: "Independencia, Lima",
      createdAt: "2025-01-16",
      lastContact: "Sin contactar",
      notes: "Lead nuevo desde formulario web.",
      tags: ["Venta"],
    },
  ])

  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    budget: "",
    project: "",
    location: "",
    notes: "",
  })

  const availableTags = ["Techo Propio", "Mi Vivienda", "Compra", "Venta"]
  const [selectedTagsForBatch, setSelectedTagsForBatch] = useState<string[]>([])

  const statusConfig = {
    new: { label: "Nuevo", color: "bg-blue-100 text-blue-700 border-blue-200" },
    contacted: { label: "Contactado", color: "bg-purple-100 text-purple-700 border-purple-200" },
    qualified: { label: "Calificado", color: "bg-green-100 text-green-700 border-green-200" },
    negotiation: { label: "Negociación", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    closed: { label: "Cerrado", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    lost: { label: "Perdido", color: "bg-red-100 text-red-700 border-red-200" },
  }

  const tagColors: Record<string, string> = {
    "Techo Propio": "bg-orange-100 text-orange-700 border-orange-200",
    "Mi Vivienda": "bg-cyan-100 text-cyan-700 border-cyan-200",
    Compra: "bg-green-100 text-green-700 border-green-200",
    Venta: "bg-purple-100 text-purple-700 border-purple-200",
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm)
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus
    const matchesTag = filterTag === "all" || lead.tags.includes(filterTag)
    return matchesSearch && matchesStatus && matchesTag
  })

  const handleAddLead = () => {
    const lead: Lead = {
      id: Date.now().toString(),
      ...newLead,
      status: "new",
      score: Math.floor(Math.random() * 40) + 40,
      createdAt: new Date().toISOString().split("T")[0],
      lastContact: "Sin contactar",
      tags: [],
    }
    setLeads([lead, ...leads])
    setNewLead({
      name: "",
      email: "",
      phone: "",
      source: "",
      budget: "",
      project: "",
      location: "",
      notes: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleDeleteLead = (id: string) => {
    setLeads(leads.filter((lead) => lead.id !== id))
    setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id))
  }

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads((prev) => (prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]))
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map((lead) => lead.id))
    }
  }

  const handleApplyTags = () => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (selectedLeads.includes(lead.id)) {
          const newTags = [...new Set([...lead.tags, ...selectedTagsForBatch])]
          return { ...lead, tags: newTags }
        }
        return lead
      }),
    )
    setSelectedLeads([])
    setSelectedTagsForBatch([])
    setIsTagDialogOpen(false)
  }

  const handleRemoveTag = (leadId: string, tagToRemove: string) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (lead.id === leadId) {
          return { ...lead, tags: lead.tags.filter((tag) => tag !== tagToRemove) }
        }
        return lead
      }),
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Gestión de Leads</h1>
          <p className="text-muted-foreground mt-1">Administra y califica tus prospectos</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#303030]">Agregar Nuevo Lead</DialogTitle>
                <DialogDescription>Completa la información del prospecto</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="Ej: María González"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+51 987 654 321"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Fuente</Label>
                  <Select value={newLead.source} onValueChange={(value) => setNewLead({ ...newLead, source: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web">Sitio Web</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Referido">Referido</SelectItem>
                      <SelectItem value="Llamada">Llamada Directa</SelectItem>
                      <SelectItem value="Google Contacts">Google Contacts</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Presupuesto</Label>
                  <Input
                    id="budget"
                    value={newLead.budget}
                    onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                    placeholder="S/ 200,000 - S/ 250,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Proyecto de Interés</Label>
                  <Input
                    id="project"
                    value={newLead.project}
                    onChange={(e) => setNewLead({ ...newLead, project: e.target.value })}
                    placeholder="Nombre del proyecto"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Ubicación Preferida</Label>
                  <Input
                    id="location"
                    value={newLead.location}
                    onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                    placeholder="Distrito, Ciudad"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={newLead.notes}
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    placeholder="Información adicional sobre el lead..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddLead}
                  disabled={!newLead.name || !newLead.email || !newLead.phone}
                  className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]"
                >
                  Guardar Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                <User className="w-6 h-6 text-blue-600" />
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
                  {leads.filter((l) => l.status === "qualified").length}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
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
                  {leads.filter((l) => l.status === "negotiation").length}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-yellow-600" />
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
                  {Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length)}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="new">Nuevos</SelectItem>
                  <SelectItem value="contacted">Contactados</SelectItem>
                  <SelectItem value="qualified">Calificados</SelectItem>
                  <SelectItem value="negotiation">En Negociación</SelectItem>
                  <SelectItem value="closed">Cerrados</SelectItem>
                  <SelectItem value="lost">Perdidos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Tag className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por etiqueta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las etiquetas</SelectItem>
                  {availableTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLeads.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-[#FCBA00]/10 rounded-lg border border-[#FCBA00]/20">
                <span className="text-sm font-medium text-[#303030]">{selectedLeads.length} leads seleccionados</span>
                <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]">
                      <Tag className="w-4 h-4 mr-2" />
                      Etiquetar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-[#303030]">Etiquetar Leads</DialogTitle>
                      <DialogDescription>
                        Selecciona las etiquetas para aplicar a {selectedLeads.length} lead(s)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      {availableTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-3">
                          <Checkbox
                            id={tag}
                            checked={selectedTagsForBatch.includes(tag)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTagsForBatch([...selectedTagsForBatch, tag])
                              } else {
                                setSelectedTagsForBatch(selectedTagsForBatch.filter((t) => t !== tag))
                              }
                            }}
                          />
                          <Label htmlFor={tag} className="flex items-center gap-2 cursor-pointer">
                            <Badge className={`${tagColors[tag]} border`}>{tag}</Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleApplyTags}
                        disabled={selectedTagsForBatch.length === 0}
                        className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]"
                      >
                        Aplicar Etiquetas
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLeads([])}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {filteredLeads.length > 0 && (
        <div className="flex items-center gap-2 px-2">
          <Checkbox
            id="select-all"
            checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
            Seleccionar todos ({filteredLeads.length})
          </Label>
        </div>
      )}

      {/* Leads List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={() => handleSelectLead(lead.id)}
                    className="mt-1"
                  />

                  {/* Lead Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-bold text-[#303030]">{lead.name}</h3>
                          <Badge className={`${statusConfig[lead.status].color} border font-medium`}>
                            {statusConfig[lead.status].label}
                          </Badge>
                          <Badge className={`${getScoreColor(lead.score)} border font-bold`}>Score: {lead.score}</Badge>
                        </div>
                        {lead.tags.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap mt-2">
                            {lead.tags.map((tag) => (
                              <Badge key={tag} className={`${tagColors[tag]} border text-xs`}>
                                {tag}
                                <button
                                  onClick={() => handleRemoveTag(lead.id, tag)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <XIcon className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Proyecto:</span>
                        <span className="font-medium text-[#303030]">{lead.project}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Ubicación:</span>
                        <span className="font-medium text-[#303030]">{lead.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Presupuesto:</span>
                        <span className="font-medium text-[#303030]">{lead.budget}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Creado: {lead.createdAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Último contacto: {lead.lastContact}
                      </span>
                      <span className="px-2 py-1 bg-muted rounded text-[#303030]">Fuente: {lead.source}</span>
                    </div>

                    {lead.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{lead.notes}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 lg:flex-none border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00] hover:text-[#303030] bg-transparent"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteLead(lead.id)}
                    className="flex-1 lg:flex-none border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#303030] mb-2">No se encontraron leads</h3>
            <p className="text-muted-foreground">Intenta ajustar los filtros o agrega un nuevo lead</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
