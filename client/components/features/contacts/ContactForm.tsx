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
import { validarTelefono, validarTexto } from "@/lib/validaciones"

interface ContactFormProps {
  onSubmit: (data: DatosFormularioContacto) => void
}

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<DatosFormularioContacto>({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    dni: "",
    sexo: "",
    fechaNacimiento: "",
  })

  const handleSubmit = () => {
    onSubmit(formData)
    setFormData({
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      direccion: "",
      ciudad: "",
      dni: "",
      sexo: "",
      fechaNacimiento: "",
    })
    setOpen(false)
  }

  const isValid = formData.nombre && formData.correo && formData.telefono

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
              onChange={(e) => setFormData({ ...formData, nombre: validarTexto(e.target.value) })}
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="correo">Correo *</Label>
            <Input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              placeholder="juan@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              value={formData.telefono}
              inputMode="numeric"
              pattern="[0-9\s+\-]*"
              onChange={(e) => setFormData({ ...formData, telefono: validarTelefono(e.target.value) })}
              placeholder="+51 987 654 321"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: validarTexto(e.target.value) })}
                placeholder="Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                value={formData.dni}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/[^0-9]/g, '').slice(0, 8) })}
                placeholder="12345678"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Av. Principal 123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                placeholder="Lima"
              />
            </div>
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
