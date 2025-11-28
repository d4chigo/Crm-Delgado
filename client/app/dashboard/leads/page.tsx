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
import { LeadCard, DialogoDetallesLead, DialogoEditarLead, DialogoCrearLead, DialogoConfirmarEliminar, FiltrosLeadsAvanzados } from "@/components/features/leads"
import { ContactImportDialog } from "@/components/features/contacts/ContactImportDialog"
import { DialogoCrearAccesoWeb } from "@/components/features/contacts"
import { FormularioCotizacion } from "@/components/features/cotizaciones"
import { DialogoAgendarReunion } from "@/components/features/calendar/DialogoAgendarReunion"
import { cotizacionService } from "@/services/api/cotizacion.service"
import { CrearCotizacionDTO } from "@/types/cotizacion.types"
import { Loader2, Search, Users, TrendingUp, Tag, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"
import { FILTROS_LEADS } from "@/types/estadoLead.types"
import AssistantFab from "@/components/assistant/AssistantFab"
import googleAuthService from "@/services/api/google-auth.service"
import contactoService from "@/services/api/contacto.service"
import { useOportunidades } from "@/hooks/useOportunidades"
import dynamic from "next/dynamic"
import type { Contacto } from "@/types/contacto.types"
import { EstadoLead } from "@/types/contacto.types"
import DialogoWhatsApp from "@/components/features/whatsapp/DialogoWhatsApp"
import { DialogoCrearOportunidad, type DatosOportunidad } from "@/components/features/opportunities/DialogoCrearOportunidad"

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
  const [dialogoOportunidadAbierto, setDialogoOportunidadAbierto] = useState(false)
  const [leadParaOportunidad, setLeadParaOportunidad] = useState<Lead | null>(null)
  const [dialogoAccesoWebAbierto, setDialogoAccesoWebAbierto] = useState(false)
  const [leadParaAccesoWeb, setLeadParaAccesoWeb] = useState<Lead | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { oportunidades, removerDelPipeline } = useOportunidades()

  const cargarLeads = useCallback(async (filtros?: any) => {
    setEstaCargando(true)
    setError(null)
    try {
      const resultado: any = await leadService.obtenerLeads({
        tipo: "LEAD",
        pagina: filtros?.pagina || 1,
        limite: 6,
        busqueda: filtros?.busqueda || "",
        estadoLead: "" // No filtrar por estado en backend, lo haremos en frontend
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
    cargarLeads({ pagina: 1 })
    cargarEtiquetas()
  }, [cargarEtiquetas, cargarLeads])

  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Configurar nuevo timeout con debounce
    searchTimeoutRef.current = setTimeout(() => {
      cargarLeads({ busqueda, pagina: 1 })
    }, 500)

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [busqueda, cargarLeads])

  const leadsEnPipeline = useMemo(() => {
    return new Set(oportunidades?.map(o => o.leadId || o.clienteId) || [])
  }, [oportunidades])

  // Función para determinar el estado lógico del lead basado en oportunidades
  const determinarEstadoLogico = useCallback((lead: Lead): string => {
    // Buscar oportunidad del lead
    const oportunidadLead = oportunidades?.find(o => o.leadId === lead.id)
    
    if (oportunidadLead) {
      if (oportunidadLead.etapa === 'CIERRE_GANADO') {
        return 'GANADO' // En pipeline como CIERRE_GANADO
      }
      if (oportunidadLead.etapa === 'CIERRE_PERDIDO') {
        return 'PERDIDO' // En pipeline como CIERRE_PERDIDO
      }
    }
    
    // Si no está en esos estados, usar el estadoLead del lead
    return lead.estadoLead || 'NUEVO'
  }, [oportunidades])

  const leadsFiltrados = useMemo(() => {
    let filtrados = leads
    
    // Filtrar por etiqueta
    if (etiquetaFiltro !== "todas") {
      filtrados = filtrados.filter((lead: Lead) => 
        lead.etiquetas?.some((e: any) => e.etiqueta.id === etiquetaFiltro)
      )
    }
    
    // Filtrar por estado lógico si hay filtro de estado
    if (estadoFiltro) {
      filtrados = filtrados.filter((lead: Lead) => {
        const estadoLogico = determinarEstadoLogico(lead)
        return estadoLogico === estadoFiltro
      })
    }
    
    return filtrados
  }, [leads, etiquetaFiltro, estadoFiltro, determinarEstadoLogico])

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
          console.log('🔍 Google token recibido en callback:', googleToken.substring(0, 30) + '...')
          
          // Validar que tengamos sesión activa antes de importar
          const token = localStorage.getItem('crm_token')
          if (!token) {
            throw new Error('Tu sesión ha expirado. Por favor recarga la página e inicia sesión nuevamente.')
          }

          console.log('📤 Enviando token de Google al servidor...')
          // Importar contactos usando el token
          const resultado = await contactoService.importarDesdeGoogle(googleToken)
          console.log('✅ Resultado de importación:', resultado)
          
          toast({
            title: "✅ Importación completada",
            description: `Se importaron ${resultado.importados} contactos como leads. ${resultado.duplicados > 0 ? `${resultado.duplicados} duplicados omitidos.` : ''}`
          })
          
          // Recargar leads
          await cargarLeads({ estadoLead: estadoFiltro })
        } catch (error: any) {
          const errorMsg = error.message || "No se pudieron importar los contactos"
          
          // Si es error de sesión expirada, mostrar mensaje más claro
          if (errorMsg.includes('sesión ha expirado') || errorMsg.includes('401')) {
            toast({
              title: "⚠️ Sesión expirada",
              description: "Tu sesión ha expirado. Por favor recarga la página e inicia sesión nuevamente.",
              variant: "destructive"
            })
            // Limpiar token y redirigir después de 2 segundos
            setTimeout(() => {
              localStorage.removeItem('crm_token')
              localStorage.removeItem('crm_user')
              window.location.href = '/login'
            }, 2000)
          } else {
            toast({
              title: "Error en la importación",
              description: errorMsg,
              variant: "destructive"
            })
          }
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

  const handleEnviarWhatsApp = useCallback(async (mensajeLocal: string) => {
    let raw = (whatsappTelefono || "").replace(/\D/g, "")
    if (raw.length === 9) raw = `51${raw}`
    if (!raw) {
      toast({ title: "Sin teléfono", description: "Este contacto no tiene teléfono. Copia y envía manualmente.", variant: "destructive" })
      return
    }
    
    // Actualizar estado a CONTACTADO si es NUEVO
    const leadActual = leads.find(l => l.telefono === whatsappTelefono)
    if (leadActual && (leadActual.estadoLead === 'NUEVO' || leadActual.estadoLead === undefined)) {
      try {
        await leadService.actualizarLead(leadActual.id, { estadoLead: EstadoLead.CONTACTADO })
        
        // Actualizar el estado del lead en el state local inmediatamente
        setLeads(leads.map(l => 
          l.id === leadActual.id 
            ? { ...l, estadoLead: EstadoLead.CONTACTADO }
            : l
        ))
        
        toast({ title: "✓ Estado actualizado", description: "Lead marcado como En Contacto" })
      } catch (error) {
        console.error('Error al actualizar estado:', error)
        toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" })
      }
    }
    
    const url = `https://wa.me/${raw}?text=${encodeURIComponent(mensajeLocal)}`
    try {
      window.open(url, "_blank")
    } catch {}
    
    // Cerrar diálogo
    setDialogoWhatsappAbierto(false)
  }, [whatsappTelefono, leads, toast])

  const handleScheduleMeeting = (nombre: string, correo: string, telefono?: string) => {
    // Encontrar el lead actual para obtener más información
    const leadActual = leads.find(l => l.nombre === nombre && l.correo === correo)
    if (leadActual) {
      setLeadParaAgendar(leadActual)
    }
    setDialogoAgendarAbierto(true)
  }

  const handleAgregarAlPipeline = async (lead: Lead) => {
    setLeadParaOportunidad(lead)
    setDialogoOportunidadAbierto(true)
  }

  const handleCrearOportunidad = async (datos: DatosOportunidad) => {
    if (!leadParaOportunidad) return
    
    setAgregandoPipeline(leadParaOportunidad.id)
    try {
      const token = localStorage.getItem("crm_token")
      if (!token) {
        toast({ title: "Sesión expirada", description: "Por favor inicia sesión nuevamente", variant: "destructive" })
        if (typeof window !== "undefined") window.location.href = "/login"
        return
      }
      
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contactos/${leadParaOportunidad.id}/agregar-pipeline`, { 
        method: "POST", 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
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
      
      toast({ title: "Éxito", description: "Oportunidad creada en el pipeline correctamente" })
      setDialogoOportunidadAbierto(false)
      cargarLeadsConInteligencia()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo agregar al pipeline", variant: "destructive" })
    } finally {
      setAgregandoPipeline(null)
    }
  }

  const handleRemoverDelPipeline = async (lead: Lead) => {
    setAgregandoPipeline(lead.id)
    try {
      await removerDelPipeline(lead.id)
      toast({ title: "Éxito", description: "Lead removido del pipeline" })
      cargarLeadsConInteligencia()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo remover del pipeline", variant: "destructive" })
    } finally {
      setAgregandoPipeline(null)
    }
  }

  const handleCrearAccesoWeb = (lead: Lead) => {
    setLeadParaAccesoWeb(lead)
    setDialogoAccesoWebAbierto(true)
  }

  // Función mejorada para recargar leads después de eliminación o conversión
  const cargarLeadsConInteligencia = useCallback(async (filtrosPassed?: any) => {
    setEstaCargando(true)
    setError(null)
    try {
      const paginaActual = filtrosPassed?.pagina || paginacion.pagina
      const limite = 6
      
      const resultado: any = await leadService.obtenerLeads({
        tipo: "LEAD",
        pagina: paginaActual,
        limite: limite,
        busqueda: filtrosPassed?.busqueda || busqueda,
        estadoLead: ""
      })
      
      // Si la página actual tiene menos items de lo esperado (significa que se eliminaron)
      // y no es la última página, traer de la siguiente página para completar
      if (resultado.contactos.length < limite && paginaActual < resultado.paginacion.totalPaginas) {
        const resultadoSiguiente: any = await leadService.obtenerLeads({
          tipo: "LEAD",
          pagina: paginaActual + 1,
          limite: limite - resultado.contactos.length,
          busqueda: filtrosPassed?.busqueda || busqueda,
          estadoLead: ""
        })
        
        // Combinar los contactos de ambas páginas
        const contactosCombinados = [...resultado.contactos, ...(resultadoSiguiente.contactos || [])]
        setLeads(contactosCombinados)
        setPaginacion(resultado.paginacion || { pagina: 1, total: 0, totalPaginas: 0 })
      } 
      // Si la página actual está completamente vacía pero hay páginas anteriores, retroceder
      else if (resultado.contactos.length === 0 && paginaActual > 1) {
        const resultadoPaginaAnterior: any = await leadService.obtenerLeads({
          tipo: "LEAD",
          pagina: paginaActual - 1,
          limite: limite,
          busqueda: filtrosPassed?.busqueda || busqueda,
          estadoLead: ""
        })
        setLeads(resultadoPaginaAnterior.contactos || [])
        setPaginacion(resultadoPaginaAnterior.paginacion || { pagina: 1, total: 0, totalPaginas: 0 })
      } 
      else {
        setLeads(resultado.contactos || [])
        setPaginacion(resultado.paginacion || { pagina: 1, total: 0, totalPaginas: 0 })
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar leads")
      setLeads([])
    } finally {
      setEstaCargando(false)
    }
  }, [paginacion.pagina, busqueda])

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="Gestiona tus prospectos y oportunidades de negocio" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Leads Activos" value={paginacion.total} description="En proceso de conversión" icon={TrendingUp} iconColor="text-yellow-500" valueColor="text-yellow-600" />
        <StatCard title="Conversión" value="0%" description="Leads convertidos a clientes" icon={Users} iconColor="text-green-500" valueColor="text-green-600" />
      </div>

      <div className="space-y-4">
        {/* Filtros Avanzados */}
        <FiltrosLeadsAvanzados
          onAplicar={(filtros) => {
            setBusqueda(filtros.busqueda || "")
            cargarLeads({ busqueda: filtros.busqueda })
          }}
          cargando={estaCargando}
        />

        <div className="flex gap-4 items-center flex-wrap">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ gridAutoRows: '1fr', alignItems: 'stretch' }}>
              {leadsFiltrados.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  enPipeline={leadsEnPipeline.has(lead.id)}
                  estadoLogico={determinarEstadoLogico(lead)}
                  onVerDetalles={(l) => {
                    setLeadSeleccionado(l)
                    setDialogoDetallesAbierto(true)
                  }}
                  onEditar={(l) => {
                    setLeadSeleccionado(l)
                    setDialogoEditarAbierto(true)
                  }}
                  onWhatsApp={(tel) => handleWhatsApp(tel)}
                  onScheduleMeeting={(nombre, correo) => handleScheduleMeeting(nombre, correo, lead.telefono || undefined)}
                  onCotizar={handleCotizar}
                  onPipeline={handleAgregarAlPipeline}
                  onRemoverDelPipeline={handleRemoverDelPipeline}
                  onCrearAccesoWeb={handleCrearAccesoWeb}
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
        <FormularioCotizacion open={dialogoCotizacionAbierto} onOpenChange={setDialogoCotizacionAbierto} onGuardar={handleGuardarCotizacion} leadId={leadParaCotizar.id} nombreContacto={`${leadParaCotizar.nombre} ${leadParaCotizar.apellido || ""}`} />
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
              cargarLeadsConInteligencia()
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

      <DialogoCrearOportunidad
        abierto={dialogoOportunidadAbierto}
        onCerrar={() => {
          setDialogoOportunidadAbierto(false)
          setLeadParaOportunidad(null)
        }}
        lead={leadParaOportunidad}
        onCrear={handleCrearOportunidad}
        cargando={agregandonPipeline !== null}
      />

      <DialogoCrearAccesoWeb
        contacto={leadParaAccesoWeb}
        abierto={dialogoAccesoWebAbierto}
        onCancelar={() => {
          setDialogoAccesoWebAbierto(false)
          setLeadParaAccesoWeb(null)
        }}
        onCreado={() => {
          cargarLeads()
        }}
      />

      <AssistantFab onClick={() => setAbiertoAsistente(true)} />
      <AssistantPanel open={abiertoAsistente} onClose={() => setAbiertoAsistente(false)} />
    </div>
  )
}
