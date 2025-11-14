/**
 * Componente FormularioContacto - Formulario para crear contactos
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import type { CrearContactoDTO, Contacto } from "@/types/contacto.types"

interface FormularioContactoProps {
  onCrear: (datos: CrearContactoDTO) => Promise<Contacto>
}

export function FormularioContacto({ onCrear }: FormularioContactoProps) {
  const [abierto, setAbierto] = useState(false)
  const [estaCargando, setEstaCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formulario, setFormulario] = useState<CrearContactoDTO>({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    ciudad: "",
  })

  const handleChange = (campo: keyof CrearContactoDTO, valor: any) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (!formulario.nombre.trim()) {
      setError("El nombre es requerido")
      return
    }

    setEstaCargando(true)

    try {
      // Preparar datos para enviar
      const datos: CrearContactoDTO = {
        nombre: formulario.nombre.trim(),
      }

      // Agregar campos opcionales solo si tienen valor
      if (formulario.apellido?.trim()) datos.apellido = formulario.apellido.trim()
      if (formulario.correo?.trim()) datos.correo = formulario.correo.trim()
      if (formulario.telefono?.trim()) datos.telefono = formulario.telefono.trim()
      if (formulario.ciudad?.trim()) datos.ciudad = formulario.ciudad.trim()

      // Crear el contacto
      await onCrear(datos)

      // Limpiar formulario y cerrar
      setFormulario({
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        ciudad: "",
      })
      setError(null)
      setAbierto(false)
    } catch (err: any) {
      setError(err.message || "Error al crear contacto")
    } finally {
      setEstaCargando(false)
    }
  }

  const esValido = formulario.nombre.trim().length > 0

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Contacto
        </Button>
      </DialogTrigger>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Contacto</DialogTitle>
          <DialogDescription>
            Solo el <strong>nombre</strong> es obligatorio. Completa los demás campos cuando tengas la información disponible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <Input
                placeholder="Juan"
                value={formulario.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                disabled={estaCargando}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Apellido</label>
              <Input
                placeholder="Pérez"
                value={formulario.apellido || ''}
                onChange={(e) => handleChange('apellido', e.target.value)}
                disabled={estaCargando}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Correo Electrónico (Opcional)</label>
            <Input
              type="email"
              placeholder="juan@example.com (opcional)"
              value={formulario.correo || ''}
              onChange={(e) => handleChange('correo', e.target.value)}
              disabled={estaCargando}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <Input
                placeholder="+51 999 999 999"
                value={formulario.telefono || ''}
                onChange={(e) => handleChange('telefono', e.target.value)}
                disabled={estaCargando}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ciudad</label>
              <Input
                placeholder="Lima"
                value={formulario.ciudad || ''}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                disabled={estaCargando}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAbierto(false)}
              disabled={estaCargando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={estaCargando || !esValido}
              className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]"
            >
              {estaCargando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Contacto
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
