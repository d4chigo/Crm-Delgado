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
import { validarTexto, validarDNI, validarTelefono, calcularEdad, obtenerFechaMaxima, esMayorDeEdad } from "@/lib/validaciones"
import { SelectorEtiquetasCreacion } from './SelectorEtiquetasCreacion'
import { etiquetaService } from '@/services/api/etiqueta.service'

interface FormularioContactoProps {
  onCrear: (datos: CrearContactoDTO) => Promise<Contacto>
}

export function FormularioContacto({ onCrear }: FormularioContactoProps) {
  const [abierto, setAbierto] = useState(false)
  const [estaCargando, setEstaCargando] = useState(false)
  const [buscandoDNI, setBuscandoDNI] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [edad, setEdad] = useState<number | null>(null)
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([])

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
    
    // Calcular edad cuando cambia la fecha de nacimiento
    if (campo === 'fechaNacimiento') {
      setEdad(calcularEdad(valor))
    }
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
    
    // Validar edad mínima
    if (formulario.fechaNacimiento && !esMayorDeEdad(formulario.fechaNacimiento)) {
      setError("El contacto debe ser mayor de 18 años")
      return
    }
    
    setEstaCargando(true)
    setError(null)

    try {
      // Preparar datos para enviar
      const datos: CrearContactoDTO = {
        nombre: formulario.nombre.trim(),
      }

      // Agregar campos opcionales solo si tienen valor
      if (formulario.apellido?.trim()) datos.apellido = formulario.apellido.trim()
      if (formulario.correo?.trim()) datos.correo = formulario.correo.trim()
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

      // Crear el contacto
      const contactoCreado = await onCrear(datos)

      // Si hay etiquetas seleccionadas, asignarlas al contacto recién creado
      if (etiquetasSeleccionadas.length > 0 && contactoCreado?.id) {
        try {
          await etiquetaService.asignarAContacto(contactoCreado.id, etiquetasSeleccionadas)
        } catch (errorEtiquetas) {
          console.error('Error al asignar etiquetas:', errorEtiquetas)
          // No bloquear la creación si falla la asignación de etiquetas
        }
      }

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
      setEtiquetasSeleccionadas([])
      setEdad(null)
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
          {/* DNI con botón de búsqueda - PRIMERO */}
          <div className="space-y-2">
            <Label htmlFor="dni">DNI (Perú)</Label>
            <div className="flex gap-2">
              <Input
                id="dni"
                value={formulario.dni}
                onChange={(e) => handleChange("dni", validarDNI(e.target.value))}
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
              <Label htmlFor="nombre">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={formulario.nombre}
                onChange={(e) => handleChange("nombre", validarTexto(e.target.value))}
                placeholder="Juan"
                required
              />
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <Label htmlFor="apellido">
                Apellido
              </Label>
              <Input
                id="apellido"
                value={formulario.apellido}
                onChange={(e) => handleChange("apellido", validarTexto(e.target.value))}
                placeholder="Pérez"
              />
            </div>
          </div>

          {/* Correo */}
          <div className="space-y-2">
            <Label htmlFor="correo">
              Correo Electrónico (Opcional)
            </Label>
            <Input
              id="correo"
              type="text"
              value={formulario.correo}
              onChange={(e) => handleChange("correo", e.target.value)}
              placeholder="juan@example.com (opcional)"
            />
          </div>

          {/* Selector de Etiquetas */}
          <div className="space-y-2">
            <SelectorEtiquetasCreacion
              etiquetasSeleccionadas={etiquetasSeleccionadas}
              onCambio={setEtiquetasSeleccionadas}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formulario.telefono}
                onChange={(e) => handleChange("telefono", validarTelefono(e.target.value))}
                placeholder="+51 987 654 321"
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
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha de Nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento">
                Fecha de Nacimiento
                {edad !== null && <span className="text-muted-foreground ml-2">({edad} años)</span>}
              </Label>
              <Input
                id="fechaNacimiento"
                type="date"
                max={obtenerFechaMaxima()}
                value={formulario.fechaNacimiento}
                onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
              />
              {edad !== null && edad < 18 && (
                <p className="text-sm text-destructive">El contacto debe ser mayor de 18 años</p>
              )}
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
