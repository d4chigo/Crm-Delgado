"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Search } from "lucide-react"
import { Sexo, type ActualizarContactoDTO, type Contacto } from "@/types/contacto.types"
import { dniService } from "@/services/api/dni.service"

interface DialogoEditarContactoProps {
  contacto: Contacto | null
  abierto: boolean
  onActualizar: (id: string, datos: ActualizarContactoDTO) => Promise<Contacto>
  onCancelar: () => void
}

export function DialogoEditarContacto({
  contacto,
  abierto,
  onActualizar,
  onCancelar,
}: DialogoEditarContactoProps) {
  const [estaCargando, setEstaCargando] = useState(false)
  const [buscandoDNI, setBuscandoDNI] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<ActualizarContactoDTO>({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    dni: "",
    sexo: undefined,
    fechaNacimiento: "",
  })

  // Cargar datos del contacto cuando se abre el diálogo
  useEffect(() => {
    if (contacto && abierto) {
      setFormulario({
        nombre: contacto.nombre || "",
        apellido: contacto.apellido || "",
        correo: contacto.correo || "",
        telefono: contacto.telefono || "",
        direccion: contacto.direccion || "",
        ciudad: contacto.ciudad || "",
        dni: contacto.dni || "",
        sexo: contacto.sexo,
        fechaNacimiento: contacto.fechaNacimiento 
          ? new Date(contacto.fechaNacimiento).toISOString().split('T')[0] 
          : "",
      })
      setError(null)
    }
  }, [contacto, abierto])

  const handleChange = (campo: keyof ActualizarContactoDTO, valor: any) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }))
  }

  const handleBuscarDNI = async () => {
    if (!formulario.dni || !dniService.validarFormato(formulario.dni)) {
      setError("El DNI debe tener 8 dígitos")
      return
    }

    setBuscandoDNI(true)
    setError(null)

    try {
      const datos = await dniService.consultarDNI(formulario.dni)
      
      setFormulario(prev => ({
        ...prev,
        nombre: datos.nombre,
        apellido: datos.apellido,
      }))

      setError(null)
    } catch (err: any) {
      setError(err.message || "Error al consultar DNI")
    } finally {
      setBuscandoDNI(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contacto) return

    setEstaCargando(true)
    setError(null)

    try {
      const datos: ActualizarContactoDTO = {}

      // Solo enviar campos que tengan valor
      if (formulario.nombre?.trim()) datos.nombre = formulario.nombre.trim()
      if (formulario.apellido?.trim()) datos.apellido = formulario.apellido.trim()
      if (formulario.correo?.trim()) datos.correo = formulario.correo.trim()
      if (formulario.telefono?.trim()) datos.telefono = formulario.telefono.trim()
      if (formulario.direccion?.trim()) datos.direccion = formulario.direccion.trim()
      if (formulario.ciudad?.trim()) datos.ciudad = formulario.ciudad.trim()
      if (formulario.dni?.trim()) datos.dni = formulario.dni.trim()
      if (formulario.sexo) datos.sexo = formulario.sexo
      if (formulario.fechaNacimiento?.trim()) {
        const fecha = new Date(formulario.fechaNacimiento)
        datos.fechaNacimiento = fecha.toISOString()
      }

      await onActualizar(contacto.id, datos)
      onCancelar()
    } catch (err: any) {
      setError(err.message || "Error al actualizar contacto")
    } finally {
      setEstaCargando(false)
    }
  }

  if (!contacto) return null

  return (
    <Dialog open={abierto} onOpenChange={onCancelar}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Contacto</DialogTitle>
          <DialogDescription>
            Actualiza la información del contacto. Solo el nombre es obligatorio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* DNI con botón de búsqueda - PRIMERO */}
          <div className="space-y-2">
            <Label htmlFor="edit-dni">DNI (Perú)</Label>
            <div className="flex gap-2">
              <Input
                id="edit-dni"
                value={formulario.dni}
                onChange={(e) => handleChange("dni", e.target.value)}
                placeholder="12345678"
                maxLength={8}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleBuscarDNI}
                disabled={buscandoDNI || !formulario.dni || formulario.dni.length !== 8}
                className="flex-shrink-0"
              >
                {buscandoDNI ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {buscandoDNI ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Si tienes el DNI, ingrésalo y haz clic en buscar para auto-completar
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-nombre"
                value={formulario.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Juan"
                required
              />
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <Label htmlFor="edit-apellido">Apellido</Label>
              <Input
                id="edit-apellido"
                value={formulario.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
                placeholder="Pérez"
              />
            </div>
          </div>

          {/* Correo */}
          <div className="space-y-2">
            <Label htmlFor="edit-correo">Correo Electrónico</Label>
            <Input
              id="edit-correo"
              type="email"
              value={formulario.correo}
              onChange={(e) => handleChange("correo", e.target.value)}
              placeholder="juan@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="edit-telefono">Teléfono</Label>
              <Input
                id="edit-telefono"
                type="tel"
                value={formulario.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                placeholder="987654321"
              />
            </div>

            {/* Sexo */}
            <div className="space-y-2">
              <Label htmlFor="edit-sexo">Sexo</Label>
              <Select
                value={formulario.sexo || ""}
                onValueChange={(value) => handleChange("sexo", value as Sexo)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Sexo.MASCULINO}>Masculino</SelectItem>
                  <SelectItem value={Sexo.FEMENINO}>Femenino</SelectItem>
                  <SelectItem value={Sexo.OTRO}>Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha de Nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="edit-fechaNacimiento">Fecha de Nacimiento</Label>
              <Input
                id="edit-fechaNacimiento"
                type="date"
                value={formulario.fechaNacimiento}
                onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="edit-direccion">Dirección</Label>
            <Input
              id="edit-direccion"
              value={formulario.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
              placeholder="Av. Principal 123"
            />
          </div>

          {/* Ciudad */}
          <div className="space-y-2">
            <Label htmlFor="edit-ciudad">Ciudad</Label>
            <Input
              id="edit-ciudad"
              value={formulario.ciudad}
              onChange={(e) => handleChange("ciudad", e.target.value)}
              placeholder="Lima"
            />
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
              onClick={onCancelar}
              disabled={estaCargando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={estaCargando || !formulario.nombre?.trim()}
              className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]"
            >
              {estaCargando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
