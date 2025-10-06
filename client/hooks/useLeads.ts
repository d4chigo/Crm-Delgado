import { useState } from "react"

export interface LeadSimple {
  id: string
  nombre: string
  email: string
  telefono: string
  fuente: string
  estado: "nuevo" | "contactado" | "calificado" | "negociacion" | "cerrado" | "perdido"
  puntaje: number
  presupuesto: string
  proyecto: string
  ubicacion: string
  fechaCreacion: string
  ultimoContacto: string
  notas: string
  etiquetas: string[]
}

export function useLeads() {
  const [leads, setLeads] = useState<LeadSimple[]>([])

  const [leadsSeleccionados, setLeadsSeleccionados] = useState<string[]>([])

  const agregarLead = (nuevoLead: Omit<LeadSimple, "id" | "estado" | "puntaje" | "fechaCreacion" | "ultimoContacto" | "etiquetas">) => {
    const lead: LeadSimple = {
      id: Date.now().toString(),
      ...nuevoLead,
      estado: "nuevo",
      puntaje: Math.floor(Math.random() * 40) + 40,
      fechaCreacion: new Date().toISOString().split("T")[0],
      ultimoContacto: "Sin contactar",
      etiquetas: [],
    }
    setLeads([lead, ...leads])
  }

  const eliminarLead = (id: string) => {
    setLeads(leads.filter((lead) => lead.id !== id))
    setLeadsSeleccionados(leadsSeleccionados.filter((leadId) => leadId !== id))
  }

  const alternarSeleccionLead = (leadId: string) => {
    setLeadsSeleccionados((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    )
  }

  const seleccionarTodos = (leadsFiltrados: LeadSimple[]) => {
    if (leadsSeleccionados.length === leadsFiltrados.length) {
      setLeadsSeleccionados([])
    } else {
      setLeadsSeleccionados(leadsFiltrados.map((lead) => lead.id))
    }
  }

  const aplicarEtiquetas = (etiquetas: string[]) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (leadsSeleccionados.includes(lead.id)) {
          const nuevasEtiquetas = [...new Set([...lead.etiquetas, ...etiquetas])]
          return { ...lead, etiquetas: nuevasEtiquetas }
        }
        return lead
      })
    )
    setLeadsSeleccionados([])
  }

  const eliminarEtiqueta = (leadId: string, etiquetaAEliminar: string) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (lead.id === leadId) {
          return { ...lead, etiquetas: lead.etiquetas.filter((etiqueta) => etiqueta !== etiquetaAEliminar) }
        }
        return lead
      })
    )
  }

  const leadsFiltrados = (terminoBusqueda: string, filtroEstado: string, filtroEtiqueta: string) => {
    return leads.filter((lead) => {
      const coincideBusqueda =
        lead.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        lead.email.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        lead.telefono.includes(terminoBusqueda)
      const coincideEstado = filtroEstado === "all" || lead.estado === filtroEstado
      const coincideEtiqueta = filtroEtiqueta === "all" || lead.etiquetas.includes(filtroEtiqueta)
      return coincideBusqueda && coincideEstado && coincideEtiqueta
    })
  }

  return {
    leads,
    leadsSeleccionados,
    agregarLead,
    eliminarLead,
    alternarSeleccionLead,
    seleccionarTodos,
    aplicarEtiquetas,
    eliminarEtiqueta,
    leadsFiltrados,
  }
}
