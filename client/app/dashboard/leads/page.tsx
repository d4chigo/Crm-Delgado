"use client"

import { useState, useEffect } from "react"
import { useContactos } from "@/hooks/useContactos";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Users, TrendingUp, Phone, Mail, MapPin, Calendar, User, Eye, Edit, ArrowRight, DollarSign, Tag, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { TipoContacto, Contacto } from "@/types/contacto.types"
import { DialogoDetallesLead, DialogoEditarLead, LeadCard, ClientCard } from "@/components/features/leads";
import { DialogoCrearOportunidad } from "@/components/features/contacts/DialogoCrearOportunidad";
import { FormularioCotizacion } from "@/components/features/cotizaciones";
import { cotizacionService } from "@/services/api/cotizacion.service";
import { CrearCotizacionDTO } from "@/types/cotizacion.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { etiquetaService, type Etiqueta } from "@/services/api/etiqueta.service"

export default function PaginaLeads() {
  const {
    contactos,
    estadisticas,
    estaCargando,
    error,
    paginacion,
    buscarContactos,
    filtrarPorTipo,
    cargarContactos,
    cambiarPagina,
    filtros,
  } = useContactos()

  // Usamos el estado de filtros del hook useContactos
  const [leadSeleccionado, setLeadSeleccionado] = useState<Contacto | null>(null)
  const [dialogoDetallesAbierto, setDialogoDetallesAbierto] = useState(false)
  const [dialogoEditarAbierto, setDialogoEditarAbierto] = useState(false)
  const [dialogoOportunidadAbierto, setDialogoOportunidadAbierto] = useState(false)
  const [dialogoCotizacionAbierto, setDialogoCotizacionAbierto] = useState(false);
  const [leadParaCotizar, setLeadParaCotizar] = useState<Contacto | null>(null);
  const [clienteParaOportunidad, setClienteParaOportunidad] = useState<Contacto | null>(null)
  const [convirtiendoCliente, setConvirtiendoCliente] = useState<string | null>(null)
  const [tabActivo, setTabActivo] = useState<'leads' | 'clientes'>('leads')
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [etiquetaFiltroLeads, setEtiquetaFiltroLeads] = useState<string>("todas")
  const [etiquetaFiltroClientes, setEtiquetaFiltroClientes] = useState<string>("todas")
  const [totalLeads, setTotalLeads] = useState(0)
  const [totalClientes, setTotalClientes] = useState(0)

  // Cargar leads/clientes según el tab activo
  useEffect(() => {
    const tipo = tabActivo === 'leads' ? TipoContacto.LEAD : TipoContacto.CLIENTE
    cargarContactos({ tipo, pagina: 1, limite: 6 })
  }, [tabActivo])

  // Cargar etiquetas al montar
  useEffect(() => {
    cargarEtiquetas()
  }, [])

  // Actualizar totales cuando cambie la paginación
  useEffect(() => {
    if (tabActivo === 'leads') {
      setTotalLeads(paginacion.total)
    } else {
      setTotalClientes(paginacion.total)
    }
  }, [paginacion.total, tabActivo])

  const cargarEtiquetas = async () => {
    try {
      const etiquetasObtenidas = await etiquetaService.obtenerTodas()
      // Asegurarse de que sea un array
      if (Array.isArray(etiquetasObtenidas)) {
        setEtiquetas(etiquetasObtenidas)
      } else {
        console.error('Las etiquetas obtenidas no son un array:', etiquetasObtenidas)
        setEtiquetas([])
      }
    } catch (error) {
      console.error('Error al cargar etiquetas:', error)
      setEtiquetas([]) // Establecer array vacío en caso de error
    }
  }

  // El backend ya filtra por tipo según el tab activo
  // Solo aplicar filtro por etiqueta si es necesario
  const contactosFiltrados = tabActivo === 'leads'
    ? (etiquetaFiltroLeads === "todas" 
        ? contactos 
        : contactos.filter(c => c.etiquetas?.some(e => e.etiqueta.id === etiquetaFiltroLeads)))
    : (etiquetaFiltroClientes === "todas" 
        ? contactos 
        : contactos.filter(c => c.etiquetas?.some(e => e.etiqueta.id === etiquetaFiltroClientes)))

  // Para mantener compatibilidad con el código existente
  const leads = tabActivo === 'leads' ? contactosFiltrados : []
  const clientes = tabActivo === 'clientes' ? contactosFiltrados : []

  // Manejador de búsqueda que se pasa al componente de búsqueda
  const handleBusqueda = (query: string) => {
    console.log('⌨️ Buscando leads:', query);
    buscarContactos(query);
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
          title: 'Sesión expirada',
          description: 'Por favor inicia sesión nuevamente',
          variant: 'destructive',
        })
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return
      }

      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contactos/${leadId}/convertir-cliente`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Si el token expiró
      if (respuesta.status === 401) {
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
        toast({
          title: 'Sesión expirada',
          description: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          variant: 'destructive',
        });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return;
      }

      const resultado = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'Error al convertir lead')
      }

      toast({
        title: 'Lead convertido a Cliente',
        description: `El lead ahora es un cliente y aparece en la pestaña "Clientes"`,
      })

      // Cambiar a la pestaña de clientes (esto recargará automáticamente con el filtro correcto)
      setTabActivo('clientes')
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

  const handleGuardarCotizacion = async (datos: CrearCotizacionDTO) => {
    try {
      await cotizacionService.crear(datos);
      toast({
        title: "Cotización guardada",
        description: "La cotización ha sido creada exitosamente.",
      });
      setDialogoCotizacionAbierto(false);
    } catch (error) {
      console.error("Error al guardar la cotización:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la cotización.",
        variant: "destructive",
      });
    }
  };

  const handleCotizar = (lead: Contacto) => {
    setLeadParaCotizar(lead);
    setDialogoCotizacionAbierto(true);
  };

  const handleWhatsApp = (telefono: string, nombre: string) => {
    if (telefono) {
      const message = `Hola ${nombre}, te contacto para hacer seguimiento.`
      const url = `https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      if (window.electron) {
        window.electron.shell.openExternal(url);
      } else {
        window.open(url, '_blank');
      }
    }
  };

  const handleScheduleMeeting = (nombre: string, correo: string) => {
    const asunto = `Reunión con ${nombre}`;
    const descripcion = `Discutir detalles de la oportunidad con ${nombre}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(asunto)}&details=${encodeURIComponent(descripcion)}&add=${encodeURIComponent(correo)}`;
    if (window.electron) {
      window.electron.shell.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads & Clientes"
        description="Gestiona tus leads y clientes en un solo lugar"
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Leads Activos"
          value={totalLeads}
          description="En proceso de conversión"
          icon={TrendingUp}
          iconColor="text-yellow-500"
          valueColor="text-yellow-600"
        />
        <StatCard
          title="Clientes"
          value={totalClientes}
          description="Leads convertidos"
          icon={Users}
          iconColor="text-green-500"
          valueColor="text-green-600"
        />
        <StatCard
          title="Tasa de Conversión"
          value={`${(totalLeads + totalClientes) > 0 
              ? Math.round((totalClientes / (totalLeads + totalClientes)) * 100)
              : 0}%`}
          description="Leads → Clientes"
          icon={TrendingUp}
          iconColor="text-blue-500"
          valueColor="text-blue-600"
        />
      </div>

      {/* Tabs: Leads y Clientes */}
      <Tabs value={tabActivo} onValueChange={(value) => setTabActivo(value as 'leads' | 'clientes')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Leads ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clientes ({clientes.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB: LEADS */}
        <TabsContent value="leads" className="space-y-4">
          {/* Barra de búsqueda y filtros */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, apellido, correo o DNI..."
                value={filtros?.busqueda || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('📝 Valor del input:', value);
                  handleBusqueda(value);
                }}
                className="pl-9"
              />
            </div>
            <Select value={etiquetaFiltroLeads} onValueChange={setEtiquetaFiltroLeads}>
              <SelectTrigger className="w-[220px]">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <SelectValue placeholder="Todas las etiquetas" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las etiquetas</SelectItem>
                {Array.isArray(etiquetas) && etiquetas.map((etiqueta) => (
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
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isConverting={convirtiendoCliente === lead.id}
                  onVerDetalles={handleVerDetalles}
                  onConvertir={handleConvertirCliente}
                  onEditar={handleEditar}
                  onWhatsApp={handleWhatsApp}
                  onScheduleMeeting={handleScheduleMeeting}
                  onCotizar={handleCotizar}
                />
              ))}
            </div>
          )}

          {/* Paginación para Leads */}
          {!estaCargando && leads.length > 0 && paginacion.totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Mostrando {leads.length} de {paginacion.total} leads
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarPagina(paginacion.pagina - 1)}
                  disabled={paginacion.pagina === 1 || estaCargando}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                
                <span className="text-sm text-muted-foreground px-4">
                  Página {paginacion.pagina} de {paginacion.totalPaginas}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarPagina(paginacion.pagina + 1)}
                  disabled={paginacion.pagina === paginacion.totalPaginas || estaCargando}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {!estaCargando && leads.length === 0 && !error && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay leads</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {filtros?.busqueda 
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
        </TabsContent>

        {/* TAB: CLIENTES */}
        <TabsContent value="clientes" className="space-y-4">
          {/* Barra de búsqueda y filtros */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes por nombre, apellido o correo..."
                  value={filtros?.busqueda || ''}
                  onChange={(e) => handleBusqueda(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={etiquetaFiltroClientes} onValueChange={setEtiquetaFiltroClientes}>
              <SelectTrigger className="w-[220px]">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <SelectValue placeholder="Todas las etiquetas" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las etiquetas</SelectItem>
                {Array.isArray(etiquetas) && etiquetas.map((etiqueta) => (
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

          {/* Lista de clientes */}
          {!estaCargando && clientes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientes.map((cliente) => (
                <ClientCard
                  key={cliente.id}
                  cliente={cliente}
                  onVerDetalles={handleVerDetalles}
                  onEditar={handleEditar}
                  onWhatsApp={handleWhatsApp}
                  onScheduleMeeting={handleScheduleMeeting}
                  onAgregarOportunidad={() => {
                    setClienteParaOportunidad(cliente)
                    setDialogoOportunidadAbierto(true)
                  }}
                />
              ))}
            </div>
          )}

          {/* Paginación para Clientes */}
          {!estaCargando && clientes.length > 0 && paginacion.totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Mostrando {clientes.length} de {paginacion.total} clientes
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarPagina(paginacion.pagina - 1)}
                  disabled={paginacion.pagina === 1 || estaCargando}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                
                <span className="text-sm text-muted-foreground px-4">
                  Página {paginacion.pagina} de {paginacion.totalPaginas}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cambiarPagina(paginacion.pagina + 1)}
                  disabled={paginacion.pagina === paginacion.totalPaginas || estaCargando}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {!estaCargando && clientes.length === 0 && !error && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay clientes</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {filtros?.busqueda 
                    ? "No se encontraron clientes con ese criterio de búsqueda"
                    : "Convierte tus leads en clientes para comenzar"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
          cargarContactos({}) // Recargar todos los contactos sin filtro
          setDialogoEditarAbierto(false)
        }}
      />

      {/* Diálogo para crear oportunidad */}
      {clienteParaOportunidad && (
        <DialogoCrearOportunidad
          clienteId={clienteParaOportunidad.id}
          clienteNombre={`${clienteParaOportunidad.nombre} ${clienteParaOportunidad.apellido || ''}`}
          open={dialogoOportunidadAbierto}
          onOpenChange={setDialogoOportunidadAbierto}
          onSuccess={() => {
            toast({
              title: "¡Oportunidad creada!",
              description: "El cliente ha sido agregado al pipeline exitosamente",
            })
            setDialogoOportunidadAbierto(false)
            setClienteParaOportunidad(null)
          }}
        />
      )}

      {/* Diálogo para cotización */}
      {leadParaCotizar && (
        <FormularioCotizacion
          open={dialogoCotizacionAbierto}
          onOpenChange={setDialogoCotizacionAbierto}
          onGuardar={handleGuardarCotizacion}
          contactoId={leadParaCotizar.id}
          nombreContacto={`${leadParaCotizar.nombre} ${leadParaCotizar.apellido || ''}`}
        />
      )}
    </div>
  )
}
