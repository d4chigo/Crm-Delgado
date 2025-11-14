"use client"

import { useState, useEffect, useMemo } from "react"
import { useContactos } from "@/hooks/useContactos";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { etiquetaService } from "@/services/api/etiqueta.service"
import contactoService from "@/services/api/contacto.service"
import type { Etiqueta } from "@/types/etiqueta.types"
import { LeadCard, DialogoDetallesLead, DialogoEditarLead, DialogoCrearLead, DialogoConfirmarEliminar } from "@/components/features/leads"
import { FormularioCotizacion } from "@/components/features/cotizaciones";
import { cotizacionService } from "@/services/api/cotizacion.service";
import { CrearCotizacionDTO } from "@/types/cotizacion.types";
import { Loader2, Search, Users, TrendingUp, Phone, Mail, MapPin, Calendar, User, Eye, Edit, ArrowRight, DollarSign, Tag, ChevronLeft, ChevronRight, FileText, MessageSquare } from "lucide-react"
import { TipoContacto, Contacto } from "@/types/contacto.types"
import { EstadoLead, ESTADOS_LEAD_DISPLAY, FILTROS_LEADS } from "@/types/estadoLead.types"
import AssistantFab from "@/components/assistant/AssistantFab"
import dynamic from "next/dynamic"
const AssistantPanel = dynamic(() => import("@/components/assistant/AssistantPanel"), { ssr: false })

export default function PaginaLeads() {
  const [abiertoAsistente, setAbiertoAsistente] = useState(false)
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

  const [leadSeleccionado, setLeadSeleccionado] = useState<Contacto | null>(null)
  const [dialogoDetallesAbierto, setDialogoDetallesAbierto] = useState(false)
  const [dialogoEditarAbierto, setDialogoEditarAbierto] = useState(false)
  const [dialogoCotizacionAbierto, setDialogoCotizacionAbierto] = useState(false);
  const [leadParaCotizar, setLeadParaCotizar] = useState<Contacto | null>(null);
  const [convirtiendoCliente, setConvirtiendoCliente] = useState<string | null>(null)
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [etiquetaFiltro, setEtiquetaFiltro] = useState<string>("todas")
  const [estadoFiltro, setEstadoFiltro] = useState<string>("")
  const [totalLeads, setTotalLeads] = useState(0)

  // Crear nuevo lead
  const [dialogoCrearAbierto, setDialogoCrearAbierto] = useState(false)

  // Eliminar contacto
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false)
  const [contactoAEliminar, setContactoAEliminar] = useState<Contacto | null>(null)
  const [eliminando, setEliminando] = useState(false)

  // WhatsApp Post-Agendado
  const [dialogoWhatsappAbierto, setDialogoWhatsappAbierto] = useState(false)
  const [whatsappMensaje, setWhatsappMensaje] = useState("")
  const [whatsappTelefono, setWhatsappTelefono] = useState<string | null>(null)

  useEffect(() => {
    const filtros: any = { tipo: TipoContacto.LEAD, pagina: 1, limite: 10 }
    if (estadoFiltro) filtros.estadoLead = estadoFiltro
    cargarContactos(filtros)
  }, [estadoFiltro])

  useEffect(() => { cargarEtiquetas() }, [])

  useEffect(() => {
    setTotalLeads(paginacion.total)
  }, [paginacion.total])

  const cargarEtiquetas = async () => {
    try {
      const etiquetasObtenidas = await etiquetaService.obtenerTodas()
      if (Array.isArray(etiquetasObtenidas)) setEtiquetas(etiquetasObtenidas)
      else setEtiquetas([])
    } catch {
      setEtiquetas([])
    }
  }

  const [busqueda, setBusqueda] = useState("")
  const handleBusqueda = (query: string) => { setBusqueda(query) }
  useEffect(() => {
    const t = setTimeout(() => { buscarContactos(busqueda) }, 300)
    return () => clearTimeout(t)
  }, [busqueda])

  const leads = useMemo(() => {
    let resultado = contactos
    if (etiquetaFiltro !== "todas") {
      resultado = resultado.filter(c => c.etiquetas?.some(e => e.etiqueta.id === etiquetaFiltro))
    }
    return resultado
  }, [etiquetaFiltro, contactos])

  const handleVerDetalles = (lead: Contacto) => { setLeadSeleccionado(lead); setDialogoDetallesAbierto(true) }
  const handleEditar = (lead: Contacto) => { setLeadSeleccionado(lead); setDialogoEditarAbierto(true) }

  const handleConvertirCliente = async (leadId: string) => {
    setConvirtiendoCliente(leadId)
    try {
      const token = localStorage.getItem('crm_token')
      if (!token) {
        toast({ title: 'Sesión expirada', description: 'Por favor inicia sesión nuevamente', variant: 'destructive' })
        if (typeof window !== 'undefined') window.location.href = '/login';
        return
      }
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contactos/${leadId}/convertir-cliente`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (respuesta.status === 401) {
        localStorage.removeItem('crm_token'); localStorage.removeItem('crm_user');
        toast({ title: 'Sesión expirada', description: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.', variant: 'destructive' });
        if (typeof window !== 'undefined') window.location.href = '/login';
        return;
      }
      const resultado = await respuesta.json()
      if (!respuesta.ok) throw new Error(resultado.mensaje || 'Error al convertir lead')
      toast({ title: 'Lead convertido a Cliente', description: 'El lead ahora es un cliente y aparece en la pestaña "Clientes"' })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'No se pudo convertir el lead', variant: 'destructive' })
    } finally { setConvirtiendoCliente(null) }
  }

  const handleGuardarCotizacion = async (datos: CrearCotizacionDTO) => {
    try {
      await cotizacionService.crear(datos);
      toast({ title: "Cotización guardada", description: "La cotización ha sido creada exitosamente." });
      setDialogoCotizacionAbierto(false);
    } catch {
      toast({ title: "Error", description: "No se pudo guardar la cotización.", variant: "destructive" });
    }
  };

  const handleCotizar = (lead: Contacto) => { setLeadParaCotizar(lead); setDialogoCotizacionAbierto(true) };

  const handleWhatsApp = (telefono: string) => {
    if (!telefono) { toast({ title: 'Sin teléfono', description: 'No hay número disponible.', variant: 'destructive' }); return; }
    let tel = telefono.replace(/\D/g, ''); if (tel.length === 9) tel = '51' + tel;
    const url = `https://wa.me/${tel}`; try { window.open(url, '_blank'); } catch {}
  }
  const handleWhatsAppCliente = (telefono: string) => handleWhatsApp(telefono)

  // Agendar + abrir modal WhatsApp de confirmación
  const handleScheduleMeeting = (nombre: string, correo: string, telefono?: string) => {
    // Solo preparar el mensaje y abrir el modal de WhatsApp.
    const fechaInicio = new Date();
    fechaInicio.setHours(9, 0, 0, 0);
    const fecha = fechaInicio.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const hora = fechaInicio.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const lineas = [
      `Hola${nombre ? ` ${nombre}` : ''}, ¿qué tal?`,
      `Te confirmo nuestra reunión agendada desde CRM Delgado.`,
      `Fecha: ${fecha}`,
      `Hora: ${hora}`,
      correo ? `Te envié la invitación al correo: ${correo}` : undefined,
      `Si necesitas reprogramar, avísame por este medio. ¡Gracias!`
    ].filter(Boolean) as string[];
    setWhatsappMensaje(lineas.join('\n'));
    setWhatsappTelefono(telefono || null);
    setDialogoWhatsappAbierto(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="Gestiona tus prospectos y oportunidades de negocio" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Leads Activos" value={totalLeads} description="En proceso de conversión" icon={TrendingUp} iconColor="text-yellow-500" valueColor="text-yellow-600" />
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

        <div className="flex gap-4 items-end">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre, apellido, correo o DNI..." value={filtros?.busqueda || ''} onChange={(e) => handleBusqueda(e.target.value)} className="pl-9" />
          </div>
          <Select value={etiquetaFiltro} onValueChange={setEtiquetaFiltro}>
            <SelectTrigger className="w-[220px]"><div className="flex items-center gap-2"><Tag className="h-4 w-4" /><SelectValue placeholder="Todas las etiquetas" /></div></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las etiquetas</SelectItem>
              {Array.isArray(etiquetas) && etiquetas.map((et) => (
                <SelectItem key={et.id} value={et.id}>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: et.color }} />{et.nombre}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setDialogoCrearAbierto(true)}
            className="bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030]"
          >
            + Nuevo Lead
          </Button>
        </div>

        {estaCargando && (<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#FCBA00]" /></div>)}
        {error && (<Card className="border-red-200 bg-red-50"><CardContent className="pt-6"><p className="text-red-600">{error}</p></CardContent></Card>)}

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
                onWhatsApp={handleWhatsAppCliente}
                onScheduleMeeting={(nombre, correo) => handleScheduleMeeting(nombre, correo, lead.telefono || undefined)}
                onCotizar={handleCotizar}
                onEliminar={(lead) => {
                  setContactoAEliminar(lead)
                  setDialogoEliminarAbierto(true)
                }}
              />
            ))}
          </div>
        )}

        {!estaCargando && leads.length > 0 && paginacion.totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">Mostrando {leads.length} de {paginacion.total} leads</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => cambiarPagina(paginacion.pagina - 1)} disabled={paginacion.pagina === 1 || estaCargando}><ChevronLeft className="h-4 w-4 mr-1" />Anterior</Button>
              <span className="text-sm text-muted-foreground px-4">Página {paginacion.pagina} de {paginacion.totalPaginas}</span>
              <Button variant="outline" size="sm" onClick={() => cambiarPagina(paginacion.pagina + 1)} disabled={paginacion.pagina === paginacion.totalPaginas || estaCargando}>Siguiente<ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </div>
        )}

        {!estaCargando && leads.length === 0 && !error && (
          <Card><CardContent className="flex flex-col items-center justify-center py-12"><TrendingUp className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">No hay leads</h3><p className="text-muted-foreground text-center mb-4">{filtros?.busqueda ? "No se encontraron leads con ese criterio de búsqueda" : "Convierte tus contactos en leads para comenzar a gestionarlos"}</p><Button onClick={() => window.location.href = '/dashboard/contacts'} className="bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030]">Ir a Contactos</Button></CardContent></Card>
        )}
      </div>

      <DialogoDetallesLead lead={leadSeleccionado} abierto={dialogoDetallesAbierto} onCerrar={() => setDialogoDetallesAbierto(false)} onActualizado={() => cargarContactos({})} />
      <DialogoEditarLead lead={leadSeleccionado} abierto={dialogoEditarAbierto} onCerrar={() => setDialogoEditarAbierto(false)} onActualizado={() => { cargarContactos({}); setDialogoEditarAbierto(false) }} />

      <DialogoCrearLead 
        abierto={dialogoCrearAbierto} 
        onCerrar={() => setDialogoCrearAbierto(false)} 
        onCreado={() => cargarContactos({})}
        tipo="lead"
      />

      {leadParaCotizar && (
        <FormularioCotizacion open={dialogoCotizacionAbierto} onOpenChange={setDialogoCotizacionAbierto} onGuardar={handleGuardarCotizacion} contactoId={leadParaCotizar.id} nombreContacto={`${leadParaCotizar.nombre} ${leadParaCotizar.apellido || ''}`} />
      )}

      {contactoAEliminar && (
        <DialogoConfirmarEliminar
          abierto={dialogoEliminarAbierto}
          onCerrar={() => {
            setDialogoEliminarAbierto(false)
            setContactoAEliminar(null)
          }}
          onConfirmar={async () => {
            setEliminando(true)
            try {
              await contactoService.eliminarContacto(contactoAEliminar.id)
              toast({ title: 'Éxito', description: 'Lead eliminado correctamente' })
              cargarContactos({})
              setDialogoEliminarAbierto(false)
              setContactoAEliminar(null)
            } catch (error: any) {
              toast({ title: 'Error', description: error.message || 'No se pudo eliminar el lead', variant: 'destructive' })
            } finally {
              setEliminando(false)
            }
          }}
          nombre={`${contactoAEliminar.nombre} ${contactoAEliminar.apellido || ''}`}
          cargando={eliminando}
        />
      )}

      {/* Modal: Enviar WhatsApp de confirmación */}
      <Dialog open={dialogoWhatsappAbierto} onOpenChange={setDialogoWhatsappAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Enviar confirmación por WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block text-sm text-muted-foreground">Mensaje</label>
            <textarea className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FCBA00]" rows={6} value={whatsappMensaje} onChange={(e) => setWhatsappMensaje(e.target.value)} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { navigator.clipboard.writeText(whatsappMensaje); toast({ title: 'Copiado', description: 'Mensaje copiado al portapapeles.' }) }}>Copiar</Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => {
                let raw = (whatsappTelefono || '').replace(/\D/g, ''); if (raw.length === 9) raw = `51${raw}`; if (!raw) { toast({ title: 'Sin teléfono', description: 'Este contacto no tiene teléfono. Copia y envía manualmente.', variant: 'destructive' }); return; }
                const url = `https://wa.me/${raw}?text=${encodeURIComponent(whatsappMensaje)}`; try { window.open(url, '_blank') } catch {}; setDialogoWhatsappAbierto(false);
              }}>Abrir WhatsApp</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AssistantFab onClick={() => setAbiertoAsistente(true)} />
      <AssistantPanel open={abiertoAsistente} onClose={() => setAbiertoAsistente(false)} />
    </div>
  )
}