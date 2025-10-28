"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { EstadoProyecto, DatosFormularioProyecto } from "@/types/proyecto.types"
import { Etiqueta } from "@/types/etiqueta.types"

const formularioSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(255),
  descripcion: z.string().optional(),
  imagen: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  precio: z.number().positive("El precio debe ser positivo").optional(),
  ubicacion: z.string().max(255).optional(),
  estado: z.enum(["DISPONIBLE", "RESERVADO", "VENDIDO", "CONSTRUCCION", "FINALIZADO"]),
  etiquetaIds: z.array(z.string()).optional()
})

interface FormularioProyectoProps {
  etiquetas: Etiqueta[]
  onSubmit: (datos: DatosFormularioProyecto) => Promise<void>
  onCancel: () => void
  valorInicial?: Partial<DatosFormularioProyecto>
  estaCargando?: boolean
}

export function FormularioProyecto({
  etiquetas,
  onSubmit,
  onCancel,
  valorInicial,
  estaCargando = false
}: FormularioProyectoProps) {
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>(
    valorInicial?.etiquetaIds || []
  )

  const form = useForm<DatosFormularioProyecto>({
    resolver: zodResolver(formularioSchema),
    defaultValues: {
      nombre: valorInicial?.nombre || "",
      descripcion: valorInicial?.descripcion || "",
      imagen: valorInicial?.imagen || "",
      precio: valorInicial?.precio || undefined,
      ubicacion: valorInicial?.ubicacion || "",
      estado: valorInicial?.estado || EstadoProyecto.DISPONIBLE,
      etiquetaIds: valorInicial?.etiquetaIds || []
    }
  })

  const handleSubmit = async (datos: DatosFormularioProyecto) => {
    const datosCompletos = {
      ...datos,
      etiquetaIds: etiquetasSeleccionadas,
      precio: datos.precio ? Number(datos.precio) : undefined
    }
    await onSubmit(datosCompletos)
  }

  const toggleEtiqueta = (etiquetaId: string) => {
    setEtiquetasSeleccionadas(prev => {
      if (prev.includes(etiquetaId)) {
        return prev.filter(id => id !== etiquetaId)
      } else {
        return [...prev, etiquetaId]
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Nombre */}
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del proyecto *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Edificio Las Palmeras" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción */}
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe las características del proyecto..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Imagen */}
        <FormField
          control={form.control}
          name="imagen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la imagen</FormLabel>
              <FormControl>
                <Input 
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Precio y Ubicación en fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Precio */}
          <FormField
            control={form.control}
            name="precio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio (S/.)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="150000.00"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ubicación */}
          <FormField
            control={form.control}
            name="ubicacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: San Isidro, Lima" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Estado */}
        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={EstadoProyecto.DISPONIBLE}>
                    Disponible
                  </SelectItem>
                  <SelectItem value={EstadoProyecto.RESERVADO}>
                    Reservado
                  </SelectItem>
                  <SelectItem value={EstadoProyecto.VENDIDO}>
                    Vendido
                  </SelectItem>
                  <SelectItem value={EstadoProyecto.CONSTRUCCION}>
                    En Construcción
                  </SelectItem>
                  <SelectItem value={EstadoProyecto.FINALIZADO}>
                    Finalizado
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Etiquetas */}
        <div className="space-y-3">
          <Label>Etiquetas</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {etiquetas.map((etiqueta) => (
              <div key={etiqueta.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`etiqueta-${etiqueta.id}`}
                  checked={etiquetasSeleccionadas.includes(etiqueta.id)}
                  onCheckedChange={() => toggleEtiqueta(etiqueta.id)}
                />
                <label
                  htmlFor={`etiqueta-${etiqueta.id}`}
                  className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: etiqueta.color }}
                  />
                  {etiqueta.nombre}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={estaCargando}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={estaCargando}>
            {estaCargando ? "Guardando..." : valorInicial ? "Actualizar" : "Crear proyecto"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
