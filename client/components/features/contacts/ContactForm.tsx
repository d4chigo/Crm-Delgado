/**
 * Componente ContactForm - Formulario para crear contactos
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

interface ContactFormProps {
  onSubmit: (data: DatosFormularioContacto) => void
}

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<DatosFormularioContacto>({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    ubicacion: "",
    notas: "",
  })

  const handleSubmit = () => {
    onSubmit(formData)
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      empresa: "",
      ubicacion: "",
      notas: "",
    })
    setOpen(false)
  }

  const isValid = formData.nombre && formData.email && formData.telefono

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="juan@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+51 987 654 321"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              placeholder="Nombre de la empresa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              placeholder="Lima, Perú"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Información adicional..."
              rows={3}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold"
          >
            Crear Contacto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
