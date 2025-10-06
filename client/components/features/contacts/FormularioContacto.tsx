/**
 * Componente FormularioContacto - Formulario para crear contactos
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import type { DatosFormularioContacto } from "@/types/contacto.types"

interface PropsFormularioContacto {
  alEnviar: (datos: DatosFormularioContacto) => void
}

export function FormularioContacto({ alEnviar }: PropsFormularioContacto) {
  const [abierto, setAbierto] = useState(false)
  const [datosFormulario, setDatosFormulario] = useState<DatosFormularioContacto>({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    ubicacion: "",
    notas: "",
  })

  const manejarEnvio = () => {
    alEnviar(datosFormulario)
    setDatosFormulario({
      nombre: "",
      email: "",
      telefono: "",
      empresa: "",
      ubicacion: "",
      notas: "",
    })
    setAbierto(false)
  }

  const esValido = datosFormulario.nombre && datosFormulario.email && datosFormulario.telefono

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Contacto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Contacto</DialogTitle>
          <DialogDescription>Agrega un nuevo contacto manualmente</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              value={datosFormulario.nombre}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, nombre: e.target.value })}
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={datosFormulario.email}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, email: e.target.value })}
              placeholder="juan@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              value={datosFormulario.telefono}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, telefono: e.target.value })}
              placeholder="+51 987 654 321"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              value={datosFormulario.empresa}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, empresa: e.target.value })}
              placeholder="Nombre de la empresa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación</Label>
            <Input
              id="ubicacion"
              value={datosFormulario.ubicacion}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, ubicacion: e.target.value })}
              placeholder="Lima, Perú"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={datosFormulario.notas}
              onChange={(e) => setDatosFormulario({ ...datosFormulario, notas: e.target.value })}
              placeholder="Información adicional..."
              rows={3}
            />
          </div>
          <Button
            onClick={manejarEnvio}
            disabled={!esValido}
            className="w-full bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold"
          >
            Crear Contacto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
