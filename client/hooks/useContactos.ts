/**
 * Hook personalizado para gestionar contactos
 */

"use client"

import { useState } from "react"
import type { Contacto, DatosFormularioContacto, FuenteContacto } from "@/types/contacto.types"

export function useContactos() {
  const [contactos, setContactos] = useState<Contacto[]>([])

  const [consultaBusqueda, setConsultaBusqueda] = useState("")
  const [contactosSeleccionados, setContactosSeleccionados] = useState<string[]>([])

  const crearContacto = (datos: DatosFormularioContacto) => {
    const nuevoContacto: Contacto = {
      id: Date.now().toString(),
      ...datos,
      fuente: "manual" as FuenteContacto,
      creadoEn: new Date(),
    }
    setContactos((prev) => [nuevoContacto, ...prev])
  }

  const importarDesdeGoogle = () => {
    // Aquí se implementará la integración con Google Contacts API
    // Por ahora, esta función está lista para recibir contactos importados
    const contactosImportados: Contacto[] = []
    setContactos((prev) => [...contactosImportados, ...prev])
  }

  const alternarSeleccionContacto = (id: string) => {
    setContactosSeleccionados((prev) => 
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    )
  }

  const convertirALeads = () => {
    if (contactosSeleccionados.length === 0) return false
    // Aquí se implementaría la lógica para convertir contactos a leads
    setContactosSeleccionados([])
    return true
  }

  const contactosFiltrados = contactos.filter(
    (contacto) =>
      contacto.nombre.toLowerCase().includes(consultaBusqueda.toLowerCase()) ||
      contacto.email.toLowerCase().includes(consultaBusqueda.toLowerCase()) ||
      contacto.telefono.includes(consultaBusqueda)
  )

  return {
    contactos,
    contactosFiltrados,
    consultaBusqueda,
    setConsultaBusqueda,
    contactosSeleccionados,
    crearContacto,
    importarDesdeGoogle,
    alternarSeleccionContacto,
    convertirALeads,
  }
}
