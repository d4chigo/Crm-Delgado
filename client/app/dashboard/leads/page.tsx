"use client"

import { useState, useEffect } from "react"
import { useContactos } from "@/hooks/useContactos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Users, TrendingUp, Phone, Mail, MapPin, Calendar, User, Eye, Edit, ArrowRight, DollarSign } from "lucide-react"
import { TipoContacto, Contacto } from "@/types/contacto.types"
import { DialogoDetallesLead, DialogoEditarLead } from "@/components/features/leads"
import { toast } from "@/hooks/use-toast"

export default function PaginaLeads() {
  const {
    contactos,
    estadisticas,
    estaCargando,
    error,
    buscarContactos,
    filtrarPorTipo,
    cargarContactos
  } = useContactos()

  const [busqueda, setBusqueda] = useState("")
  const [leadSeleccionado, setLeadSeleccionado] = useState<Contacto | null>(null)
  const [dialogoDetallesAbierto, setDialogoDetallesAbierto] = useState(false)
  const [dialogoEditarAbierto, setDialogoEditarAbierto] = useState(false)
  const [convirtiendoCliente, setConvirtiendoCliente] = useState<string | null>(null)

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

  const handleVerDetalles = (lead: Contacto) => {
    setLeadSeleccionado(lead)
    setDialogoDetallesAbierto(true)
  }

  const handleEditar = (lead: Contacto) => {
    setLeadSeleccionado(lead)
    setDialogoEditarAbierto(true)
  }

  const handleConvertirCliente = async (leadId: string) => {
    setConvirtiendoCliente(leadId)
    try {
      const token = localStorage.getItem('crm_token')
      if (!token) {
        toast({
          title: 'Error',
          description: 'No estás autenticado',
          variant: 'destructive',
        })
        return
      }

      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contactos/${leadId}/convertir-cliente`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const resultado = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'Error al convertir lead')
      }

      toast({
        title: 'Lead convertido',
        description: 'El lead se ha convertido a cliente exitosamente',
      })

      cargarContactos()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo convertir el lead',
        variant: 'destructive',
      })
    } finally {
      setConvirtiendoCliente(null)
    }
  }

  const obtenerColorEstado = (estado?: string): string => {
    const colores: Record<string, string> = {
      'NUEVO': 'bg-blue-100 text-blue-800 border-blue-200',
      'CONTACTADO': 'bg-purple-100 text-purple-800 border-purple-200',
      'CALIFICADO': 'bg-green-100 text-green-800 border-green-200',
      'NEGOCIACION': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PROPUESTA': 'bg-orange-100 text-orange-800 border-orange-200',
      'GANADO': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'PERDIDO': 'bg-red-100 text-red-800 border-red-200',
      'EN_ESPERA': 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return estado ? colores[estado] : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const obtenerColorPrioridad = (prioridad?: string): string => {
    const colores: Record<string, string> = {
      'BAJA': 'bg-gray-100 text-gray-700 border-gray-200',
      'MEDIA': 'bg-blue-100 text-blue-700 border-blue-200',
      'ALTA': 'bg-orange-100 text-orange-700 border-orange-200',
      'URGENTE': 'bg-red-100 text-red-700 border-red-200',
    }
    return prioridad ? colores[prioridad] : 'bg-gray-100 text-gray-700 border-gray-200'
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
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        LEAD
                      </Badge>
                      {lead.estadoLead && (
                        <Badge className={obtenerColorEstado(lead.estadoLead)}>
                          {lead.estadoLead.replace('_', ' ')}
                        </Badge>
                      )}
                      {lead.prioridad && (
                        <Badge className={obtenerColorPrioridad(lead.prioridad)}>
                          {lead.prioridad}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {lead.empresa && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">🏢 {lead.empresa}</span>
                    </div>
                  )}

                  {lead.cargo && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{lead.cargo}</span>
                    </div>
                  )}

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

                  {lead.presupuesto && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>S/ {lead.presupuesto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  
                  {lead.ciudad && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{lead.ciudad}</span>
                    </div>
                  )}

                  {/* Etiquetas */}
                  {lead.etiquetas && lead.etiquetas.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex flex-wrap gap-1">
                        {lead.etiquetas.map((ce) => (
                          <Badge
                            key={ce.etiqueta.id}
                            variant="outline"
                            style={{
                              backgroundColor: ce.etiqueta.color + '20',
                              color: ce.etiqueta.color,
                              borderColor: ce.etiqueta.color,
                            }}
                            className="text-xs"
                          >
                            {ce.etiqueta.icono && <span className="mr-1">{ce.etiqueta.icono}</span>}
                            {ce.etiqueta.nombre}
                          </Badge>
                        ))}
                      </div>
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

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerDetalles(lead)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditar(lead)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleConvertirCliente(lead.id)}
                      disabled={convirtiendoCliente === lead.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {convirtiendoCliente === lead.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Cliente
                        </>
                      )}
                    </Button>
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

      {/* Diálogos */}
      <DialogoDetallesLead
        lead={leadSeleccionado}
        abierto={dialogoDetallesAbierto}
        onCerrar={() => setDialogoDetallesAbierto(false)}
      />

      <DialogoEditarLead
        lead={leadSeleccionado}
        abierto={dialogoEditarAbierto}
        onCerrar={() => setDialogoEditarAbierto(false)}
        onActualizado={() => {
          cargarContactos()
          setDialogoEditarAbierto(false)
        }}
      />
    </div>
  )
}
