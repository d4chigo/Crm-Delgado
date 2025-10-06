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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2, Search } from "lucide-react"
import { Sexo, type CrearContactoDTO, type Contacto } from "@/types/contacto.types"
import { dniService } from "@/services/api/dni.service"

interface FormularioContactoProps {
  onCrear: (datos: CrearContactoDTO) => Promise<Contacto>
}

export function FormularioContacto({ onCrear }: FormularioContactoProps) {
  const [abierto, setAbierto] = useState(false)
  const [estaCargando, setEstaCargando] = useState(false)
  const [buscandoDNI, setBuscandoDNI] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formulario, setFormulario] = useState<CrearContactoDTO>({
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

  const handleChange = (campo: keyof CrearContactoDTO, valor: any) => {
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
      
      // Auto-completar nombre y apellido
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
    setEstaCargando(true)
    setError(null)

    try {
      // Preparar datos para enviar
      const datos: CrearContactoDTO = {
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        correo: formulario.correo.trim(),
      }

      // Agregar campos opcionales solo si tienen valor
      if (formulario.telefono?.trim()) datos.telefono = formulario.telefono.trim()
      if (formulario.direccion?.trim()) datos.direccion = formulario.direccion.trim()
      if (formulario.ciudad?.trim()) datos.ciudad = formulario.ciudad.trim()
      if (formulario.dni?.trim()) datos.dni = formulario.dni.trim()
      if (formulario.sexo) datos.sexo = formulario.sexo
      if (formulario.fechaNacimiento?.trim()) {
        // Convertir fecha a formato ISO
        const fecha = new Date(formulario.fechaNacimiento)
        datos.fechaNacimiento = fecha.toISOString()
      }

      await onCrear(datos)

      // Limpiar formulario y cerrar
      setFormulario({
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
      setAbierto(false)
    } catch (err: any) {
      setError(err.message || "Error al crear contacto")
    } finally {
      setEstaCargando(false)
    }
  }

  const esValido = formulario.nombre.trim() && formulario.apellido.trim() && formulario.correo.trim()

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030]">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Contacto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Contacto</DialogTitle>
          <DialogDescription>
            Completa la información del contacto. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={formulario.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Juan"
                required
              />
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <Label htmlFor="apellido">
                Apellido <span className="text-red-500">*</span>
              </Label>
              <Input
                id="apellido"
                value={formulario.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
                placeholder="Pérez"
                required
              />
            </div>
          </div>

          {/* Correo */}
          <div className="space-y-2">
            <Label htmlFor="correo">
              Correo Electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="correo"
              type="email"
              value={formulario.correo}
              onChange={(e) => handleChange("correo", e.target.value)}
              placeholder="juan@example.com"
              required
            />
          </div>

          {/* DNI con botón de búsqueda */}
          <div className="space-y-2">
            <Label htmlFor="dni">DNI (Perú)</Label>
            <div className="flex gap-2">
              <Input
                id="dni"
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
              Ingresa el DNI y haz clic en buscar para auto-completar nombre y apellido
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formulario.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                placeholder="987654321"
              />
            </div>

            {/* Sexo */}
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
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
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                value={formulario.fechaNacimiento}
                onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formulario.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
              placeholder="Av. Principal 123"
            />
          </div>

          {/* Ciudad */}
          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input
              id="ciudad"
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
