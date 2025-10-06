"use client"

import { useState, useEffect } from "react"
import { useContactos } from "@/hooks/useContactos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Users, TrendingUp, Phone, Mail, MapPin, Calendar, User } from "lucide-react"
import { TipoContacto } from "@/types/contacto.types"

export default function PaginaLeads() {
  const {
    contactos,
    estadisticas,
    estaCargando,
    error,
    buscarContactos,
    filtrarPorTipo,
  } = useContactos()

  const [busqueda, setBusqueda] = useState("")

  // Cargar leads al montar
  useEffect(() => {
    filtrarPorTipo(TipoContacto.LEAD)
  }, [])

  // Filtrar solo leads
  const leads = contactos.filter(c => c.tipo === TipoContacto.LEAD)

  // Efecto para buscar con delay (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      buscarContactos(busqueda)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [busqueda])

  const handleBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value)
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus leads y conviértelos en clientes
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.totalLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">Contactos convertidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contactos</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.totalContactos}</div>
              <p className="text-xs text-muted-foreground mt-1">Pendientes de conversión</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {estadisticas.total > 0 
                  ? Math.round((estadisticas.totalLeads / estadisticas.total) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">De contactos a leads</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads por nombre, apellido o correo..."
            value={busqueda}
            onChange={handleBusqueda}
            className="pl-9"
          />
        </div>
      </div>

      {/* Estado de carga */}
      {estaCargando && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#FCBA00]" />
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Lista de leads */}
      {!estaCargando && leads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {lead.nombre} {lead.apellido}
                    </CardTitle>
                    <Badge className="mt-2 bg-yellow-100 text-yellow-700 border-yellow-200">
                      LEAD
                    </Badge>
                  </div>
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {lead.correo && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{lead.correo}</span>
                    </div>
                  )}
                  
                  {lead.telefono && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{lead.telefono}</span>
                    </div>
                  )}
                  
                  {lead.ciudad && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{lead.ciudad}</span>
                    </div>
                  )}
                  
                  {lead.edad && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{lead.edad} años</span>
                    </div>
                  )}
                  
                  {lead.dni && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-mono">DNI: {lead.dni}</span>
                    </div>
                  )}

                  <div className="pt-3 mt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Creado: {new Date(lead.creadoEn).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {!estaCargando && leads.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay leads</h3>
            <p className="text-muted-foreground text-center mb-4">
              {busqueda 
                ? "No se encontraron leads con ese criterio de búsqueda"
                : "Convierte tus contactos en leads para comenzar a gestionarlos"}
            </p>
            <Button
              onClick={() => window.location.href = '/dashboard/contacts'}
              className="bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030]"
            >
              Ir a Contactos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
