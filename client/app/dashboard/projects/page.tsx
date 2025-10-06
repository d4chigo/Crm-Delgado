"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Building2,
  MapPin,
  DollarSign,
  Home,
  Bed,
  Bath,
  Maximize,
  Calendar,
  TrendingUp,
  Filter,
  Eye,
} from "lucide-react"

interface Property {
  id: string
  projectName: string
  unitNumber: string
  type: "departamento" | "casa" | "oficina"
  bedrooms: number
  bathrooms: number
  area: number
  price: number
  status: "disponible" | "reservado" | "vendido" | "construccion"
  floor: string
  location: string
  program: "Techo Propio" | "Mi Vivienda" | "Tradicional"
  deliveryDate: string
  features: string[]
}

export default function PaginaProyectos() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const [properties, setProperties] = useState<Property[]>([])

  const statusConfig = {
    disponible: { label: "Disponible", color: "bg-green-100 text-green-700 border-green-200" },
    reservado: { label: "Reservado", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    vendido: { label: "Vendido", color: "bg-red-100 text-red-700 border-red-200" },
    construccion: { label: "En Construcción", color: "bg-blue-100 text-blue-700 border-blue-200" },
  }

  const programColors = {
    "Techo Propio": "bg-purple-100 text-purple-700",
    "Mi Vivienda": "bg-blue-100 text-blue-700",
    Tradicional: "bg-gray-100 text-gray-700",
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || property.status === filterStatus
    const matchesType = filterType === "all" || property.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: properties.length,
    disponible: properties.filter((p) => p.status === "disponible").length,
    reservado: properties.filter((p) => p.status === "reservado").length,
    vendido: properties.filter((p) => p.status === "vendido").length,
    totalValue: properties.filter((p) => p.status === "disponible").reduce((acc, p) => acc + p.price, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Proyectos e Inventario</h1>
          <p className="text-muted-foreground mt-1">Gestiona propiedades y unidades disponibles</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Propiedad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#303030]">Agregar Nueva Propiedad</DialogTitle>
              <DialogDescription>Registra una nueva unidad en el inventario</DialogDescription>
            </DialogHeader>
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>Formulario de registro de propiedad</p>
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
                <p className="text-sm text-muted-foreground">Total Unidades</p>
                <p className="text-3xl font-bold text-[#303030] mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponibles</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.disponible}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <Home className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reservadas</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.reservado}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vendidas</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.vendido}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Disponible</p>
                <p className="text-2xl font-bold text-[#303030] mt-1">S/ {(stats.totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-[#FCBA00]" />
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por proyecto, unidad o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="reservado">Reservado</SelectItem>
                <SelectItem value="vendido">Vendido</SelectItem>
                <SelectItem value="construccion">En Construcción</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="departamento">Departamento</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="oficina">Oficina</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="border-border hover:shadow-xl transition-all overflow-hidden group">
            {/* Property Image Placeholder */}
            <div className="relative h-48 bg-gradient-to-br from-[#303030] to-[#404040] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white/20" />
              </div>
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className={`${statusConfig[property.status].color} border font-medium`}>
                  {statusConfig[property.status].label}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge className={`${programColors[property.program]} font-medium`}>{property.program}</Badge>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Button
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]"
                  onClick={() => setSelectedProperty(property)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>
            </div>

            <CardContent className="p-5 space-y-4">
              {/* Project Name & Unit */}
              <div>
                <h3 className="text-lg font-bold text-[#303030] line-clamp-1">{property.projectName}</h3>
                <p className="text-sm text-muted-foreground">{property.unitNumber}</p>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{property.location}</span>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-3 gap-3 py-3 border-y border-border">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Bed className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-semibold text-[#303030]">{property.bedrooms}</p>
                  <p className="text-xs text-muted-foreground">Dorm.</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Bath className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-semibold text-[#303030]">{property.bathrooms}</p>
                  <p className="text-xs text-muted-foreground">Baños</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Maximize className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-semibold text-[#303030]">{property.area}m²</p>
                  <p className="text-xs text-muted-foreground">Área</p>
                </div>
              </div>

              {/* Price & Delivery */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Precio:</span>
                  <span className="text-xl font-bold text-[#FCBA00]">S/ {property.price.toLocaleString("es-PE")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Entrega:</span>
                  <span className="font-medium text-[#303030]">{property.deliveryDate}</span>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {property.features.slice(0, 3).map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {property.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{property.features.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#303030] mb-2">No se encontraron propiedades</h3>
            <p className="text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Property Details Dialog */}
      {selectedProperty && (
        <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#303030]">{selectedProperty.projectName}</DialogTitle>
              <DialogDescription>{selectedProperty.unitNumber}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Status & Program */}
              <div className="flex gap-2">
                <Badge className={`${statusConfig[selectedProperty.status].color} border font-medium`}>
                  {statusConfig[selectedProperty.status].label}
                </Badge>
                <Badge className={`${programColors[selectedProperty.program]} font-medium`}>
                  {selectedProperty.program}
                </Badge>
              </div>

              {/* Main Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-semibold text-[#303030] flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedProperty.location}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Piso</p>
                  <p className="font-semibold text-[#303030]">{selectedProperty.floor}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-semibold text-[#303030] capitalize">{selectedProperty.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Entrega</p>
                  <p className="font-semibold text-[#303030]">{selectedProperty.deliveryDate}</p>
                </div>
              </div>

              {/* Property Specs */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <Bed className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#303030]">{selectedProperty.bedrooms}</p>
                  <p className="text-sm text-muted-foreground">Dormitorios</p>
                </div>
                <div className="text-center">
                  <Bath className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#303030]">{selectedProperty.bathrooms}</p>
                  <p className="text-sm text-muted-foreground">Baños</p>
                </div>
                <div className="text-center">
                  <Maximize className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#303030]">{selectedProperty.area}m²</p>
                  <p className="text-sm text-muted-foreground">Área Total</p>
                </div>
              </div>

              {/* Price */}
              <div className="p-6 bg-[#FCBA00]/10 rounded-lg border-2 border-[#FCBA00]">
                <p className="text-sm text-muted-foreground mb-1">Precio de Venta</p>
                <p className="text-4xl font-bold text-[#303030]">S/ {selectedProperty.price.toLocaleString("es-PE")}</p>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold text-[#303030] mb-3">Características</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold">
                  Generar Cotización
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Asignar a Lead
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
