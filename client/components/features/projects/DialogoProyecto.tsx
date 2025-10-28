"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormularioProyecto } from "./FormularioProyecto"
import { DatosFormularioProyecto, Proyecto } from "@/types/proyecto.types"
import { Etiqueta } from "@/types/etiqueta.types"

interface DialogoProyectoProps {
  abierto: boolean
  onCerrar: () => void
  onSubmit: (datos: DatosFormularioProyecto) => Promise<void>
  proyecto?: Proyecto
  etiquetas: Etiqueta[]
  estaCargando?: boolean
}

export function DialogoProyecto({
  abierto,
  onCerrar,
  onSubmit,
  proyecto,
  etiquetas,
  estaCargando = false
}: DialogoProyectoProps) {
  const titulo = proyecto ? "Editar proyecto" : "Crear nuevo proyecto"
  const descripcion = proyecto
    ? "Modifica los datos del proyecto"
    : "Completa los datos para crear un nuevo proyecto"

  const valorInicial = proyecto
    ? {
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        imagen: proyecto.imagen,
        precio: proyecto.precio ? Number(proyecto.precio) : undefined,
        ubicacion: proyecto.ubicacion,
        estado: proyecto.estado,
        etiquetaIds: proyecto.etiquetas?.map(e => e.etiquetaId) || []
      }
    : undefined

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <FormularioProyecto
          etiquetas={etiquetas}
          onSubmit={onSubmit}
          onCancel={onCerrar}
          valorInicial={valorInicial}
          estaCargando={estaCargando}
        />
      </DialogContent>
    </Dialog>
  )
}
