"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { PageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { etiquetaService } from "@/services/api/etiqueta.service"
import leadService from "@/services/api/lead.service"
import type { Etiqueta } from "@/types/etiqueta.types"
import { LeadCard, DialogoDetallesLead, DialogoEditarLead, DialogoCrearLead, DialogoConfirmarEliminar } from "@/components/features/leads"
import { ContactImportDialog } from "@/components/features/contacts/ContactImportDialog"
import { FormularioCotizacion } from "@/components/features/cotizaciones"
import { DialogoAgendarReunion } from "@/components/features/calendar/DialogoAgendarReunion"
import { cotizacionService } from "@/services/api/cotizacion.service"
import { CrearCotizacionDTO } from "@/types/cotizacion.types"
import { Loader2, Search, Users, TrendingUp, Tag, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"
import { FILTROS_LEADS } from "@/types/estadoLead.types"
import AssistantFab from "@/components/assistant/AssistantFab"
import googleAuthService from "@/services/api/google-auth.service"
import contactoService from "@/services/api/contacto.service"
import dynamic from "next/dynamic"
import type { Contacto } from "@/types/contacto.types"
import DialogoWhatsApp from "@/components/features/whatsapp/DialogoWhatsApp"

const AssistantPanel = dynamic(() => import("@/components/assistant/AssistantPanel"), { ssr: false })

type Lead = Contacto

export default function PaginaLeads() {
  const [abiertoAsistente, setAbiertoAsistente] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paginacion, setPaginacion] = useState({ pagina: 1, total: 0, totalPaginas: 0 })
  const [busqueda, setBusqueda] = useState("")
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [etiquetaFiltro, setEtiquetaFiltro] = useState<string>("todas")
  const [estadoFiltro, setEstadoFiltro] = useState<string>("")
  const [leadSeleccionado, setLeadSeleccionado] = useState<Lead | null>(null)
  const [dialogoDetallesAbierto, setDialogoDetallesAbierto] = useState(false)
  const [dialogoEditarAbierto, setDialogoEditarAbierto] = useState(false)
  const [dialogoCotizacionAbierto, setDialogoCotizacionAbierto] = useState(false)
  const [leadParaCotizar, setLeadParaCotizar] = useState<Lead | null>(null)
  const [convirtiendoCliente, setConvirtiendoCliente] = useState<string | null>(null)
  const [dialogoCrearAbierto, setDialogoCrearAbierto] = useState(false)
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false)
  const [leadAEliminar, setLeadAEliminar] = useState<Lead | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [dialogoWhatsappAbierto, setDialogoWhatsappAbierto] = useState(false)
  const [whatsappTelefono, setWhatsappTelefono] = useState<string | null>(null)
  const [importando, setImportando] = useState(false)
  const [dialogoAgendarAbierto, setDialogoAgendarAbierto] = useState(false)
  const [leadParaAgendar, setLeadParaAgendar] = useState<Lead | null>(null)
  const [agregandonPipeline, setAgregandoPipeline] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const cargarLeads = useCallback(async (filtros?: any) => {
    setEstaCargando(true)
    setError(null)
    try {
      const resultado: any = await leadService.obtenerLeads({
        tipo: "LEAD",
        pagina: filtros?.pagina || 1,
        limite: 6,
        busqueda: filtros?.busqueda || "",
        estadoLead: filtros?.estadoLead || ""
      })
      setLeads(resultado.contactos || [])
      setPaginacion(resultado.paginacion || { pagina: 1, total: 0, totalPaginas: 0 })
    } catch (err: any) {
      setError(err.message || "Error al cargar leads")
      setLeads([])
    } finally {
      setEstaCargando(false)
    }
  }, [])

  const cargarEtiquetas = useCallback(async () => {
    try {
      const etiquetasObtenidas = await etiquetaService.obtenerTodas()
      if (Array.isArray(etiquetasObtenidas)) setEtiquetas(etiquetasObtenidas)
      else setEtiquetas([])
    } catch {
      setEtiquetas([])
    }
  }, [])

  useEffect(() => {
    cargarLeads({ estadoLead: estadoFiltro, pagina: 1 })
    cargarEtiquetas()
  }, [estadoFiltro, cargarEtiquetas, cargarLeads])

  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Configurar nuevo timeout con debounce
    searchTimeoutRef.current = setTimeout(() => {
      cargarLeads({ busqueda, estadoLead: estadoFiltro, pagina: 1 })
    }, 500)

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [busqueda, estadoFiltro, cargarLeads])

  const leadsFiltrados = useMemo(() => {
    if (etiquetaFiltro !== "todas") {
      return leads.filter((lead: Lead) => 
        lead.etiquetas?.some((e: any) => e.etiqueta.id === etiquetaFiltro)
      )
    }
    return leads
  }, [leads, etiquetaFiltro])

  const handleConvertirCliente = async (leadId: string) => {
    setConvirtiendoCliente(leadId)
    try {
      const token = localStorage.getItem("crm_token")
      if (!token) {
        toast({ title: "Sesión expirada", description: "Por favor inicia sesión nuevamente", variant: "destructive" })
        if (typeof window !== "undefined") window.location.href = "/login"
        return
      }
      const respuesta = await fetch(`$${process.env.NEXT_PUBLIC_API_URL}/contactos/$${leadId}/convertir-cliente`, { method: "POST", headers: { Authorization: `Bearer $${token}` } })
      if (respuesta.status === 401) {
        localStorage.removeItem("crm_token")
        localStorage.removeItem("crm_user")
        toast({ title: "Sesión expirada", description: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.", variant: "destructive" })
        if (typeof window !== "undefined") window.location.href = "/login"
        return
      }
      const resultado = await respuesta.json()
      if (!respuesta.ok) throw new Error(resultado.mensaje || "Error al convertir lead")
      toast({ title: "Lead convertido a Cliente", description: "El lead ahora es un cliente y aparece en la pestaña Clientes" })
      cargarLeads()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo convertir el lead", variant: "destructive" })
    } finally {
      setConvirtiendoCliente(null)
    }
  }

  const handleGuardarCotizacion = async (datos: CrearCotizacionDTO) => {
    try {
      await cotizacionService.crear(datos)
      toast({ title: "Cotización guardada", description: "La cotización ha sido creada exitosamente." })
      setDialogoCotizacionAbierto(false)
    } catch {
      toast({ title: "Error", description: "No se pudo guardar la cotización.", variant: "destructive" })
    }
  }

  const handleImportarGoogle = async () => {
    if (importando) return
    
    setImportando(true)
    try {
      // Iniciar flujo de autenticación OAuth
      await googleAuthService.startAuthFlow()
      
      toast({
        title: "Importación iniciada",
        description: "Redirigiendo a Google para autorizar el acceso..."
      })
    } catch (error: any) {
      toast({
        title: "Error al iniciar importación",
        description: error.message || "No se pudo iniciar el proceso de importación",
        variant: "destructive"
      })
      setImportando(false)
    }
  }

  // Procesar callback de Google OAuth
  useEffect(() => {
    const procesarCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const googleToken = params.get('google_token')
      const googleError = params.get('google_error')
      const errorMessage = params.get('message') || params.get('description')
      
      // Manejar error de Google
      if (googleError) {
        const errorMessages: { [key: string]: string } = {
          'access_denied': 'Acceso denegado. Necesitas autorizar el acceso a tus contactos.',
          'no_code': 'No se recibió código de autorización de Google',
          'auth_failed': 'Error al autenticar con Google',
        }
        
        toast({
          title: "Error en la importación",
          description: errorMessages[googleError] || errorMessage || "No se pudo completar la autenticación",
          variant: "destructive"
        })
        
        // Limpiar URL
        window.history.replaceState({}, '', window.location.pathname)
        return
      }
      
      // Procesar token e importar contactos
      if (googleToken) {
        setImportando(true)
        try {
          // Importar contactos usando el token
          const resultado = await contactoService.importarDesdeGoogle(googleToken)
          
          toast({
            title: "✅ Importación completada",
            description: `Se importaron ${resultado.importados} contactos como leads. ${resultado.duplicados > 0 ? `${resultado.duplicados} duplicados omitidos.` : ''}`
          })
          
          // Recargar leads
          await cargarLeads({ estadoLead: estadoFiltro })
        } catch (error: any) {
          toast({
            title: "Error en la importación",
            description: error.message || "No se pudieron importar los contactos",
            variant: "destructive"
          })
        } finally {
          setImportando(false)
          // Limpiar URL
          window.history.replaceState({}, '', window.location.pathname)
        }
      }
    }
    
    procesarCallback()
  }, [])

  const handleCotizar = (lead: Lead) => {
    setLeadParaCotizar(lead)
    setDialogoCotizacionAbierto(true)
  }

  const handleWhatsApp = (telefono: string) => {
    if (!telefono) {
      toast({ title: "Sin teléfono", description: "No hay número disponible.", variant: "destructive" })
      return
    }
    setWhatsappTelefono(telefono)
    setDialogoWhatsappAbierto(true)
  }

  const handleEnviarWhatsApp = useCallback((mensajeLocal: string) => {
    let raw = (whatsappTelefono || "").replace(/\D/g, "")
    if (raw.length === 9) raw = `51${raw}`
    if (!raw) {
      toast({ title: "Sin teléfono", description: "Este contacto no tiene teléfono. Copia y envía manualmente.", variant: "destructive" })
      return
    }
    
    // Actualizar estado a CONTACTADO si es NUEVO
    const leadActual = leads.find(l => l.telefono === whatsappTelefono)
    if (leadActual && leadActual.estadoLead === 'NUEVO') {
      leadService.actualizarLead(leadActual.id, { estadoLead: 'CONTACTADO' }).catch(error => {
        console.error('Error al actualizar estado:', error)
      })
    }
    
    const url = `https://wa.me/${raw}?text=${encodeURIComponent(mensajeLocal)}`
    try {
      window.open(url, "_blank")
    } catch {}
    
    // Recargar después de actualizar
    setTimeout(() => cargarLeads(), 500)
    setDialogoWhatsappAbierto(false)
  }, [whatsappTelefono, leads, cargarLeads, toast])

  const handleScheduleMeeting = (nombre: string, correo: string, telefono?: string) => {
    // Encontrar el lead actual para obtener más información
    const leadActual = leads.find(l => l.nombre === nombre && l.correo === correo)
    if (leadActual) {
      setLeadParaAgendar(leadActual)
    }
    setDialogoAgendarAbierto(true)
  }

  const handleAgregarAlPipeline = async (lead: Lead) => {
    setAgregandoPipeline(lead.id)
    try {
      const token = localStorage.getItem("crm_token")
      if (!token) {
        toast({ title: "Sesión expirada", description: "Por favor inicia sesión nuevamente", variant: "destructive" })
        if (typeof window !== "undefined") window.location.href = "/login"
        return
      }
      
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contactos/${lead.id}/agregar-pipeline`, { 
        method: "POST", 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      })
      
      if (respuesta.status === 401) {
        localStorage.removeItem("crm_token")
        localStorage.removeItem("crm_user")
        toast({ title: "Sesión expirada", description: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.", variant: "destructive" })
        if (typeof window !== "undefined") window.location.href = "/login"
        return
      }
      
      const resultado = await respuesta.json()
      if (!respuesta.ok) throw new Error(resultado.mensaje || "Error al agregar al pipeline")
      
      toast({ title: "Éxito", description: "Lead agregado al pipeline correctamente" })
      cargarLeads()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo agregar al pipeline", variant: "destructive" })
    } finally {
      setAgregandoPipeline(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="Gestiona tus prospectos y oportunidades de negocio" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Leads Activos" value={paginacion.total} description="En proceso de conversión" icon={TrendingUp} iconColor="text-yellow-500" valueColor="text-yellow-600" />
        <StatCard title="Conversión" value="0%" description="Leads convertidos a clientes" icon={Users} iconColor="text-green-500" valueColor="text-green-600" />
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {FILTROS_LEADS.map((filtro) => (
            <Button
              key={filtro.value}
              onClick={() => setEstadoFiltro(filtro.value)}
              variant={estadoFiltro === filtro.value ? "default" : "outline"}
              className={estadoFiltro === filtro.value ? "bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030]" : ""}
            >
              {filtro.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar leads" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-9" />
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
              {Array.isArray(etiquetas) && etiquetas.map((et) => (
                <SelectItem key={et.id} value={et.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: et.color }} />
                    {et.nombre}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ContactImportDialog onImport={handleImportarGoogle} />
          <Button 
            onClick={() => setDialogoCrearAbierto(true)}
            className="bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030]"
          >
            + Nuevo Lead
          </Button>
        </div>

        {estaCargando && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#FCBA00]" />
          </div>
        )}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {!estaCargando && leadsFiltrados.length > 0 && (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
              {leadsFiltrados.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isConverting={convirtiendoCliente === lead.id}
                  onVerDetalles={(l) => {
                    setLeadSeleccionado(l)
                    setDialogoDetallesAbierto(true)
                  }}
                  onConvertir={handleConvertirCliente}
                  onEditar={(l) => {
                    setLeadSeleccionado(l)
                    setDialogoEditarAbierto(true)
                  }}
                  onWhatsApp={(tel) => handleWhatsApp(tel)}
                  onScheduleMeeting={(nombre, correo) => handleScheduleMeeting(nombre, correo, lead.telefono || undefined)}
                  onCotizar={handleCotizar}
                  onPipeline={handleAgregarAlPipeline}
                  onEliminar={(l) => {
                    setLeadAEliminar(l)
                    setDialogoEliminarAbierto(true)
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {!estaCargando && leads.length > 0 && paginacion.totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-semibold">{leadsFiltrados.length}</span> de <span className="font-semibold">{paginacion.total}</span> leads
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => cargarLeads({ pagina: paginacion.pagina - 1 })} 
                disabled={paginacion.pagina === 1 || estaCargando}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm font-medium px-4 py-2 bg-secondary rounded">
                {paginacion.pagina} / {paginacion.totalPaginas}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => cargarLeads({ pagina: paginacion.pagina + 1 })} 
                disabled={paginacion.pagina === paginacion.totalPaginas || estaCargando}
                className="gap-1"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {!estaCargando && leadsFiltrados.length === 0 && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay leads</h3>
              <p className="text-muted-foreground text-center mb-4">
                {busqueda ? "No se encontraron leads con ese criterio de búsqueda" : "Importa contactos de Google o crea nuevos leads para comenzar a gestionarlos"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <DialogoDetallesLead lead={leadSeleccionado} abierto={dialogoDetallesAbierto} onCerrar={() => setDialogoDetallesAbierto(false)} onActualizado={() => cargarLeads()} />
      <DialogoEditarLead lead={leadSeleccionado} abierto={dialogoEditarAbierto} onCerrar={() => setDialogoEditarAbierto(false)} onActualizado={() => {
        cargarLeads()
        setDialogoEditarAbierto(false)
      }} />

      <DialogoCrearLead 
        abierto={dialogoCrearAbierto} 
        onCerrar={() => setDialogoCrearAbierto(false)} 
        onCreado={() => cargarLeads()}
        tipo="lead"
      />

      {leadParaCotizar && (
        <FormularioCotizacion open={dialogoCotizacionAbierto} onOpenChange={setDialogoCotizacionAbierto} onGuardar={handleGuardarCotizacion} contactoId={leadParaCotizar.id} nombreContacto={`$${leadParaCotizar.nombre} $${leadParaCotizar.apellido || ""}`} />
      )}

      {leadAEliminar && (
        <DialogoConfirmarEliminar
          abierto={dialogoEliminarAbierto}
          onCerrar={() => {
            setDialogoEliminarAbierto(false)
            setLeadAEliminar(null)
          }}
          onConfirmar={async () => {
            setEliminando(true)
            try {
              await leadService.eliminarLead(leadAEliminar.id)
              toast({ title: "Éxito", description: "Lead eliminado correctamente" })
              cargarLeads()
              setDialogoEliminarAbierto(false)
              setLeadAEliminar(null)
            } catch (error: any) {
              toast({ title: "Error", description: error.message || "No se pudo eliminar el lead", variant: "destructive" })
            } finally {
              setEliminando(false)
            }
          }}
          nombre={`$${leadAEliminar.nombre} $${leadAEliminar.apellido || ""}`}
          cargando={eliminando}
        />
      )}

      <DialogoWhatsApp
        abierto={dialogoWhatsappAbierto}
        onCerrar={() => setDialogoWhatsappAbierto(false)}
        mensajeInicial="Hola, te contacto para hacer seguimiento."
        telefono={whatsappTelefono}
        titulo="Enviar confirmación por WhatsApp"
        onEnviar={handleEnviarWhatsApp}
      />

      {leadParaAgendar && (
        <DialogoAgendarReunion
          abierto={dialogoAgendarAbierto}
          onCerrar={() => {
            setDialogoAgendarAbierto(false)
            setLeadParaAgendar(null)
          }}
          contactoNombre={leadParaAgendar.nombre}
          contactoEmail={leadParaAgendar.correo}
          contactoTelefono={leadParaAgendar.telefono}
          onEventoCreado={() => {
            cargarLeads()
          }}
        />
      )}

      <AssistantFab onClick={() => setAbiertoAsistente(true)} />
      <AssistantPanel open={abiertoAsistente} onClose={() => setAbiertoAsistente(false)} />
    </div>
  )
}
