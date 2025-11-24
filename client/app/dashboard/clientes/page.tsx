"use client"

import { useState, useEffect, useMemo } from "react"
import { useContactos } from "@/hooks/useContactos";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { etiquetaService } from "@/services/api/etiqueta.service"
import contactoService from "@/services/api/contacto.service"
import type { Etiqueta } from "@/types/etiqueta.types"
import { ClientCard, DialogoDetallesLead, DialogoEditarLead, DialogoCrearLead, DialogoConfirmarEliminar } from "@/components/features/leads"
import { DialogoCrearOportunidad, DialogoCrearAccesoWeb } from "@/components/features/contacts";
import { DialogoAgendarReunion } from "@/components/features/calendar/DialogoAgendarReunion"
import { FormularioCotizacion } from "@/components/features/cotizaciones";
import { cotizacionService } from "@/services/api/cotizacion.service";
import { CrearCotizacionDTO } from "@/types/cotizacion.types";
import { Loader2, Search, Users, TrendingUp, Tag, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"
import { TipoContacto, Contacto } from "@/types/contacto.types"
import AssistantFab from "@/components/assistant/AssistantFab"
import dynamic from "next/dynamic"
const AssistantPanel = dynamic(() => import("@/components/assistant/AssistantPanel"), { ssr: false })

export default function PaginaClientes() {
  const [abiertoAsistente, setAbiertoAsistente] = useState(false)
  const {
    contactos,
    estaCargando,
    error,
    paginacion,
    buscarContactos,
    cargarContactos,
    cambiarPagina,
    filtros,
    eliminarContacto,
  } = useContactos()

  const [clienteSeleccionado, setClienteSeleccionado] = useState<Contacto | null>(null)
  const [dialogoDetallesAbierto, setDialogoDetallesAbierto] = useState(false)
  const [dialogoEditarAbierto, setDialogoEditarAbierto] = useState(false)
  const [dialogoOportunidadAbierto, setDialogoOportunidadAbierto] = useState(false)
  const [dialogoCotizacionAbierto, setDialogoCotizacionAbierto] = useState(false);
  const [dialogoAccesoWebAbierto, setDialogoAccesoWebAbierto] = useState(false);
  const [clienteParaCotizar, setClienteParaCotizar] = useState<Contacto | null>(null);
  const [clienteParaAccesoWeb, setClienteParaAccesoWeb] = useState<Contacto | null>(null);
  const [clienteParaOportunidad, setClienteParaOportunidad] = useState<Contacto | null>(null)
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [etiquetaFiltro, setEtiquetaFiltro] = useState<string>("todas")
  const [totalClientes, setTotalClientes] = useState(0)

  // Crear nuevo cliente
  const [dialogoCrearAbierto, setDialogoCrearAbierto] = useState(false)

  // Eliminar contacto
  const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState(false)
  const [contactoAEliminar, setContactoAEliminar] = useState<Contacto | null>(null)
  const [eliminando, setEliminando] = useState(false)

  // WhatsApp Post-Agendado
  const [dialogoWhatsappAbierto, setDialogoWhatsappAbierto] = useState(false)
  const [whatsappMensaje, setWhatsappMensaje] = useState("")
  const [whatsappTelefono, setWhatsappTelefono] = useState<string | null>(null)

  // Agendar reunión
  const [dialogoAgendarAbierto, setDialogoAgendarAbierto] = useState(false)
  const [clienteParaAgendar, setClienteParaAgendar] = useState<Contacto | null>(null)

  useEffect(() => {
    cargarContactos({ tipo: TipoContacto.CLIENTE, pagina: 1, limite: 6 })
  }, [])

  useEffect(() => { cargarEtiquetas() }, [])

  useEffect(() => {
    setTotalClientes(paginacion.total)
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
    const debounceTimer = setTimeout(() => { buscarContactos(busqueda) }, 500)
    return () => clearTimeout(debounceTimer)
  }, [busqueda, buscarContactos])

  const clientesFiltrados = useMemo(() => {
    return etiquetaFiltro === "todas"
      ? contactos
      : contactos.filter(c => c.etiquetas?.some(e => e.etiqueta.id === etiquetaFiltro))
  }, [etiquetaFiltro, contactos])

  const handleVerDetalles = (cliente: Contacto) => { setClienteSeleccionado(cliente); setDialogoDetallesAbierto(true) }
  const handleEditar = (cliente: Contacto) => { setClienteSeleccionado(cliente); setDialogoEditarAbierto(true) }

  const handleGuardarCotizacion = async (datos: CrearCotizacionDTO) => {
    try {
      await cotizacionService.crear(datos);
      toast({ title: "Cotización guardada", description: "La cotización ha sido creada exitosamente." });
      setDialogoCotizacionAbierto(false);
    } catch {
      toast({ title: "Error", description: "No se pudo guardar la cotización.", variant: "destructive" });
    }
  };

  const handleCotizar = (cliente: Contacto) => { setClienteParaCotizar(cliente); setDialogoCotizacionAbierto(true) };

  const handleWhatsApp = (telefono: string) => {
    if (!telefono) { toast({ title: 'Sin teléfono', description: 'No hay número disponible.', variant: 'destructive' }); return; }
    setWhatsappTelefono(telefono)
    setWhatsappMensaje("")
    setDialogoWhatsappAbierto(true)
  }

  const handleScheduleMeeting = (nombre: string, correo: string, telefono?: string) => {
    // Encontrar el cliente actual para obtener más información
    const clienteActual = contactos.find(c => c.nombre === nombre && c.correo === correo)
    if (clienteActual) {
      setClienteParaAgendar(clienteActual)
      setDialogoAgendarAbierto(true)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" description="Gestiona tus clientes y oportunidades de negocio" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Total Clientes" value={totalClientes} description="Clientes activos" icon={Users} iconColor="text-green-500" valueColor="text-green-600" />
        <StatCard title="Oportunidades" value="0" description="En proceso" icon={TrendingUp} iconColor="text-blue-500" valueColor="text-blue-600" />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar clientes" value={filtros?.busqueda || ''} onChange={(e) => handleBusqueda(e.target.value)} className="pl-9 w-full" />
          </div>
          <Select value={etiquetaFiltro} onValueChange={setEtiquetaFiltro}>
            <SelectTrigger className="w-full sm:w-[220px]"><div className="flex items-center gap-2"><Tag className="h-4 w-4" /><SelectValue placeholder="Todas las etiquetas" /></div></SelectTrigger>
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
            className="bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030] w-full sm:w-auto"
          >
            + Nuevo Cliente
          </Button>
        </div>

        {estaCargando && (<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#FCBA00]" /></div>)}
        {error && (<Card className="border-red-200 bg-red-50"><CardContent className="pt-6"><p className="text-red-600">{error}</p></CardContent></Card>)}

                {!estaCargando && clientesFiltrados.length > 0 && (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ gridAutoRows: '1fr', alignItems: 'stretch' }}>
              {clientesFiltrados.map((cliente) => (
                <ClientCard
                  key={cliente.id}
                  cliente={cliente}
                  onVerDetalles={handleVerDetalles}
                  onCotizar={handleCotizar}
                  onEditar={handleEditar}
                  onWhatsApp={handleWhatsApp}
                  onScheduleMeeting={handleScheduleMeeting}
                  onAgregarOportunidad={() => { setClienteParaOportunidad(cliente); setDialogoOportunidadAbierto(true) }}
                  onCrearAccesoWeb={(cliente) => {
                    setClienteParaAccesoWeb(cliente);
                    setDialogoAccesoWebAbierto(true);
                  }}
                  onEliminar={(cliente) => {
                    setContactoAEliminar(cliente)
                    setDialogoEliminarAbierto(true)
                  }}
                />
              ))}
            </div>
          </div>
        )}

                {!estaCargando && contactos.length > 0 && paginacion.totalPaginas > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-semibold">{clientesFiltrados.length}</span> de <span className="font-semibold">{paginacion.total}</span> clientes
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => cambiarPagina(paginacion.pagina - 1)} 
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
                onClick={() => cambiarPagina(paginacion.pagina + 1)} 
                disabled={paginacion.pagina === paginacion.totalPaginas || estaCargando}
                className="gap-1"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {!estaCargando && clientesFiltrados.length === 0 && !error && (
          <Card><CardContent className="flex flex-col items-center justify-center py-12"><Users className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">No hay clientes</h3><p className="text-muted-foreground text-center mb-4">{filtros?.busqueda ? "No se encontraron clientes con ese criterio de búsqueda" : "Convierte tus leads en clientes para comenzar"}</p></CardContent></Card>
        )}
      </div>

      <DialogoDetallesLead lead={clienteSeleccionado} abierto={dialogoDetallesAbierto} onCerrar={() => setDialogoDetallesAbierto(false)} />
      <DialogoEditarLead lead={clienteSeleccionado} abierto={dialogoEditarAbierto} onCerrar={() => setDialogoEditarAbierto(false)} onActualizado={() => { cargarContactos({}); setDialogoEditarAbierto(false) }} />

      <DialogoCrearLead 
        abierto={dialogoCrearAbierto} 
        onCerrar={() => setDialogoCrearAbierto(false)} 
        onCreado={() => cargarContactos({})}
        tipo="cliente"
      />

      {clienteParaCotizar && (
        <FormularioCotizacion open={dialogoCotizacionAbierto} onOpenChange={setDialogoCotizacionAbierto} onGuardar={handleGuardarCotizacion} clienteId={clienteParaCotizar.id} nombreContacto={`${clienteParaCotizar.nombre} ${clienteParaCotizar.apellido || ''}`} />
      )}

      {clienteParaOportunidad && (
        <DialogoCrearOportunidad
          clienteId={clienteParaOportunidad.id}
          clienteNombre={`${clienteParaOportunidad.nombre} ${clienteParaOportunidad.apellido || ''}`}
          open={dialogoOportunidadAbierto}
          onOpenChange={setDialogoOportunidadAbierto}
          onSuccess={() => { toast({ title: "¡Oportunidad creada!", description: "El cliente ha sido agregado al pipeline exitosamente" }); setDialogoOportunidadAbierto(false); setClienteParaOportunidad(null) }}
        />
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
              await eliminarContacto(contactoAEliminar.id)
              toast({ title: 'Éxito', description: 'Cliente eliminado correctamente' })
              setDialogoEliminarAbierto(false)
              setContactoAEliminar(null)
            } catch (error: any) {
              toast({ title: 'Error', description: error.message || 'No se pudo eliminar el cliente', variant: 'destructive' })
            } finally {
              setEliminando(false)
            }
          }}
          nombre={`${contactoAEliminar.nombre} ${contactoAEliminar.apellido || ''}`}
          cargando={eliminando}
        />
      )}

      <DialogoCrearAccesoWeb
        contacto={clienteParaAccesoWeb}
        abierto={dialogoAccesoWebAbierto}
        onCancelar={() => {
          setDialogoAccesoWebAbierto(false);
          setClienteParaAccesoWeb(null);
        }}
        onCreado={() => {
          cargarContactos({});
        }}
      />

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
                let raw = (whatsappTelefono || '').replace(/\D/g, ''); if (raw.length === 9) raw = `51${raw}`; if (!raw) { toast({ title: 'Sin teléfono', description: 'Este cliente no tiene teléfono. Copia y envía manualmente.', variant: 'destructive' }); return; }
                const url = `https://wa.me/${raw}?text=${encodeURIComponent(whatsappMensaje)}`; try { window.open(url, '_blank') } catch {}; setDialogoWhatsappAbierto(false);
              }}>Abrir WhatsApp</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {clienteParaAgendar && (
        <DialogoAgendarReunion
          abierto={dialogoAgendarAbierto}
          onCerrar={() => {
            setDialogoAgendarAbierto(false)
            setClienteParaAgendar(null)
          }}
          contactoNombre={clienteParaAgendar.nombre}
          contactoEmail={clienteParaAgendar.correo}
          contactoTelefono={clienteParaAgendar.telefono}
          onEventoCreado={() => {
            cargarContactos({})
          }}
        />
      )}

      <AssistantFab onClick={() => setAbiertoAsistente(true)} />
      <AssistantPanel open={abiertoAsistente} onClose={() => setAbiertoAsistente(false)} />
    </div>
  )
}
