"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  FileText,
  Download,
  Send,
  Eye,
  Calendar,
  DollarSign,
  User,
  Building2,
  Calculator,
  Percent,
  TrendingUp,
} from "lucide-react"

interface Quote {
  id: string
  quoteNumber: string
  clientName: string
  clientEmail: string
  property: string
  project: string
  basePrice: number
  discount: number
  finalPrice: number
  program: "Techo Propio" | "Mi Vivienda" | "Tradicional"
  status: "draft" | "sent" | "accepted" | "rejected"
  createdAt: string
  validUntil: string
  notes: string
}

export default function QuotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: "1",
      quoteNumber: "COT-2025-001",
      clientName: "María González",
      clientEmail: "maria.g@email.com",
      property: "Dpto 301",
      project: "Proyecto Los Olivos",
      basePrice: 280000,
      discount: 5,
      finalPrice: 266000,
      program: "Mi Vivienda",
      status: "sent",
      createdAt: "2025-01-15",
      validUntil: "2025-02-15",
      notes: "Incluye estacionamiento y depósito. Descuento por pronto pago.",
    },
    {
      id: "2",
      quoteNumber: "COT-2025-002",
      clientName: "Carlos Ramírez",
      clientEmail: "carlos.r@email.com",
      property: "Dpto 502",
      project: "Condominio San Isidro",
      basePrice: 350000,
      discount: 3,
      finalPrice: 339500,
      program: "Tradicional",
      status: "accepted",
      createdAt: "2025-01-14",
      validUntil: "2025-02-14",
      notes: "Cliente aprobó cotización. Proceder con separación.",
    },
    {
      id: "3",
      quoteNumber: "COT-2025-003",
      clientName: "Ana Torres",
      clientEmail: "ana.t@email.com",
      property: "Casa 15",
      project: "Torres del Norte",
      basePrice: 220000,
      discount: 0,
      finalPrice: 220000,
      program: "Techo Propio",
      status: "draft",
      createdAt: "2025-01-16",
      validUntil: "2025-02-16",
      notes: "Pendiente de envío. Verificar disponibilidad de bono.",
    },
  ])

  const [newQuote, setNewQuote] = useState({
    clientName: "",
    clientEmail: "",
    property: "",
    project: "",
    basePrice: "",
    discount: "",
    program: "Mi Vivienda" as const,
    notes: "",
  })

  const statusConfig = {
    draft: { label: "Borrador", color: "bg-gray-100 text-gray-700 border-gray-200" },
    sent: { label: "Enviada", color: "bg-blue-100 text-blue-700 border-blue-200" },
    accepted: { label: "Aceptada", color: "bg-green-100 text-green-700 border-green-200" },
    rejected: { label: "Rechazada", color: "bg-red-100 text-red-700 border-red-200" },
  }

  const programColors = {
    "Techo Propio": "bg-purple-100 text-purple-700",
    "Mi Vivienda": "bg-blue-100 text-blue-700",
    Tradicional: "bg-gray-100 text-gray-700",
  }

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.project.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === "draft").length,
    sent: quotes.filter((q) => q.status === "sent").length,
    accepted: quotes.filter((q) => q.status === "accepted").length,
    totalValue: quotes.reduce((acc, q) => acc + q.finalPrice, 0),
  }

  const calculateFinalPrice = () => {
    const base = Number.parseFloat(newQuote.basePrice) || 0
    const disc = Number.parseFloat(newQuote.discount) || 0
    return base - base * (disc / 100)
  }

  const handleCreateQuote = () => {
    const finalPrice = calculateFinalPrice()
    const quote: Quote = {
      id: Date.now().toString(),
      quoteNumber: `COT-2025-${String(quotes.length + 1).padStart(3, "0")}`,
      clientName: newQuote.clientName,
      clientEmail: newQuote.clientEmail,
      property: newQuote.property,
      project: newQuote.project,
      basePrice: Number.parseFloat(newQuote.basePrice),
      discount: Number.parseFloat(newQuote.discount) || 0,
      finalPrice,
      program: newQuote.program,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: newQuote.notes,
    }
    setQuotes([quote, ...quotes])
    setNewQuote({
      clientName: "",
      clientEmail: "",
      property: "",
      project: "",
      basePrice: "",
      discount: "",
      program: "Mi Vivienda",
      notes: "",
    })
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Generador de Cotizaciones</h1>
          <p className="text-muted-foreground mt-1">Crea y gestiona cotizaciones para tus clientes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cotización
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#303030]">Crear Nueva Cotización</DialogTitle>
              <DialogDescription>Completa los datos para generar la cotización</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Client Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#303030] flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nombre del Cliente *</Label>
                    <Input
                      id="clientName"
                      value={newQuote.clientName}
                      onChange={(e) => setNewQuote({ ...newQuote, clientName: e.target.value })}
                      placeholder="Ej: María González"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email del Cliente *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={newQuote.clientEmail}
                      onChange={(e) => setNewQuote({ ...newQuote, clientEmail: e.target.value })}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#303030] flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Información de la Propiedad
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Proyecto *</Label>
                    <Input
                      id="project"
                      value={newQuote.project}
                      onChange={(e) => setNewQuote({ ...newQuote, project: e.target.value })}
                      placeholder="Nombre del proyecto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property">Unidad/Propiedad *</Label>
                    <Input
                      id="property"
                      value={newQuote.property}
                      onChange={(e) => setNewQuote({ ...newQuote, property: e.target.value })}
                      placeholder="Ej: Dpto 301"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">Programa de Financiamiento</Label>
                    <Select
                      value={newQuote.program}
                      onValueChange={(value: any) => setNewQuote({ ...newQuote, program: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Techo Propio">Techo Propio</SelectItem>
                        <SelectItem value="Mi Vivienda">Mi Vivienda</SelectItem>
                        <SelectItem value="Tradicional">Tradicional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#303030] flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Cálculo de Precio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Precio Base (S/) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      value={newQuote.basePrice}
                      onChange={(e) => setNewQuote({ ...newQuote, basePrice: e.target.value })}
                      placeholder="280000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Descuento (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={newQuote.discount}
                      onChange={(e) => setNewQuote({ ...newQuote, discount: e.target.value })}
                      placeholder="5"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {/* Price Summary */}
                {newQuote.basePrice && (
                  <div className="p-4 bg-[#FCBA00]/10 rounded-lg border-2 border-[#FCBA00] space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Precio Base:</span>
                      <span className="font-semibold text-[#303030]">
                        S/ {Number.parseFloat(newQuote.basePrice).toLocaleString("es-PE")}
                      </span>
                    </div>
                    {newQuote.discount && Number.parseFloat(newQuote.discount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Descuento ({newQuote.discount}%):</span>
                        <span className="font-semibold text-red-600">
                          - S/{" "}
                          {(
                            Number.parseFloat(newQuote.basePrice) *
                            (Number.parseFloat(newQuote.discount) / 100)
                          ).toLocaleString("es-PE")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-[#FCBA00]">
                      <span className="font-semibold text-[#303030]">Precio Final:</span>
                      <span className="text-2xl font-bold text-[#FCBA00]">
                        S/ {calculateFinalPrice().toLocaleString("es-PE")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={newQuote.notes}
                  onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                  placeholder="Información adicional sobre la cotización..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateQuote}
                  disabled={!newQuote.clientName || !newQuote.clientEmail || !newQuote.project || !newQuote.basePrice}
                  className="flex-1 bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]"
                >
                  Crear Cotización
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cotizaciones</p>
                <p className="text-3xl font-bold text-[#303030] mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Borradores</p>
                <p className="text-3xl font-bold text-gray-600 mt-1">{stats.draft}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enviadas</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.sent}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aceptadas</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.accepted}</p>
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
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-[#303030] mt-1">S/ {(stats.totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-[#FCBA00]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, cliente o proyecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuotes.map((quote) => (
          <Card key={quote.id} className="border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Quote Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-[#303030]">{quote.quoteNumber}</h3>
                        <Badge className={`${statusConfig[quote.status].color} border font-medium`}>
                          {statusConfig[quote.status].label}
                        </Badge>
                        <Badge className={`${programColors[quote.program]} font-medium`}>{quote.program}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{quote.clientName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Proyecto:</span>
                        <span className="font-medium text-[#303030] ml-1">{quote.project}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Unidad:</span>
                        <span className="font-medium text-[#303030] ml-1">{quote.property}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">Válida hasta:</span>
                        <span className="font-medium text-[#303030] ml-1">{quote.validUntil}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div className="flex items-center gap-6 pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Precio Base</p>
                      <p className="text-lg font-semibold text-[#303030]">
                        S/ {quote.basePrice.toLocaleString("es-PE")}
                      </p>
                    </div>
                    {quote.discount > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Descuento</p>
                        <p className="text-lg font-semibold text-red-600 flex items-center gap-1">
                          <Percent className="w-4 h-4" />
                          {quote.discount}%
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Precio Final</p>
                      <p className="text-2xl font-bold text-[#FCBA00]">S/ {quote.finalPrice.toLocaleString("es-PE")}</p>
                    </div>
                  </div>

                  {quote.notes && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{quote.notes}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 lg:flex-none bg-transparent"
                    onClick={() => {
                      setSelectedQuote(quote)
                      setIsPreviewOpen(true)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 lg:flex-none border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00] hover:text-[#303030] bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 lg:flex-none border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#303030] mb-2">No se encontraron cotizaciones</h3>
            <p className="text-muted-foreground">Crea una nueva cotización para comenzar</p>
          </CardContent>
        </Card>
      )}

      {/* Quote Preview Dialog */}
      {selectedQuote && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#303030]">
                Cotización {selectedQuote.quoteNumber}
              </DialogTitle>
              <DialogDescription>Vista previa de la cotización</DialogDescription>
            </DialogHeader>

            {/* Quote Preview */}
            <div className="space-y-6 p-6 bg-white border-2 border-border rounded-lg">
              {/* Header */}
              <div className="flex items-start justify-between pb-6 border-b-2 border-[#FCBA00]">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-[#FCBA00] rounded-lg flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-[#303030]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#303030]">CRM Inmobiliario</h2>
                      <p className="text-sm text-muted-foreground">Cotización de Propiedad</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Cotización N°</p>
                  <p className="text-xl font-bold text-[#303030]">{selectedQuote.quoteNumber}</p>
                  <p className="text-xs text-muted-foreground mt-1">Fecha: {selectedQuote.createdAt}</p>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <h3 className="font-semibold text-[#303030] mb-3">Cliente</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold text-[#303030]">{selectedQuote.clientName}</p>
                  <p className="text-sm text-muted-foreground">{selectedQuote.clientEmail}</p>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h3 className="font-semibold text-[#303030] mb-3">Detalles de la Propiedad</h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proyecto:</span>
                    <span className="font-semibold text-[#303030]">{selectedQuote.project}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unidad:</span>
                    <span className="font-semibold text-[#303030]">{selectedQuote.property}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Programa:</span>
                    <Badge className={`${programColors[selectedQuote.program]}`}>{selectedQuote.program}</Badge>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div>
                <h3 className="font-semibold text-[#303030] mb-3">Detalle de Precios</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground">Precio Base:</span>
                    <span className="font-semibold text-[#303030]">
                      S/ {selectedQuote.basePrice.toLocaleString("es-PE")}
                    </span>
                  </div>
                  {selectedQuote.discount > 0 && (
                    <div className="flex justify-between text-lg">
                      <span className="text-muted-foreground">Descuento ({selectedQuote.discount}%):</span>
                      <span className="font-semibold text-red-600">
                        - S/ {(selectedQuote.basePrice * (selectedQuote.discount / 100)).toLocaleString("es-PE")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4 border-t-2 border-[#FCBA00]">
                    <span className="text-xl font-bold text-[#303030]">Precio Final:</span>
                    <span className="text-3xl font-bold text-[#FCBA00]">
                      S/ {selectedQuote.finalPrice.toLocaleString("es-PE")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedQuote.notes && (
                <div>
                  <h3 className="font-semibold text-[#303030] mb-3">Notas Adicionales</h3>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">{selectedQuote.notes}</p>
                </div>
              )}

              {/* Validity */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Esta cotización es válida hasta el <span className="font-semibold">{selectedQuote.validUntil}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsPreviewOpen(false)}>
                Cerrar
              </Button>
              <Button className="flex-1 bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]">
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Send className="w-4 h-4 mr-2" />
                Enviar al Cliente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
