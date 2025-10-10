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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrendingUp, Loader2 } from "lucide-react"
import { crearOportunidad } from "@/services/api/oportunidades"
import { CrearOportunidadDTO, EtapaPipeline } from "@/types/oportunidad.types"
import { useToast } from "@/hooks/use-toast"
import { useProyectos } from "@/hooks/useProyectos"

interface DialogoCrearOportunidadProps {
  clienteId: string
  clienteNombre: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const ETAPAS_PIPELINE: { value: EtapaPipeline; label: string; description: string }[] = [
  { value: "LEAD", label: "Lead", description: "Interés inicial" },
  { value: "CONTACTO", label: "Contacto", description: "Primera comunicación" },
  { value: "VISITA", label: "Visita", description: "Visita programada" },
  { value: "NEGOCIACION", label: "Negociación", description: "En proceso de negociación" },
  { value: "CIERRE", label: "Cierre", description: "Listo para cerrar" },
]

const PROBABILIDADES = [
  { value: 25, label: "25% - Bajo" },
  { value: 50, label: "50% - Medio" },
  { value: 75, label: "75% - Alto" },
  { value: 90, label: "90% - Muy Alto" },
]

export function DialogoCrearOportunidad({
  clienteId,
  clienteNombre,
  open,
  onOpenChange,
  onSuccess,
}: DialogoCrearOportunidadProps) {
  const { toast } = useToast()
  const { proyectos, estaCargando: cargandoProyectos, cargarProyectos } = useProyectos()
  const [cargando, setCargando] = useState(false)
  const [formulario, setFormulario] = useState<Partial<CrearOportunidadDTO>>({
    clienteId,
    etapa: "LEAD",
    probabilidad: 25,
  })

  // Cargar proyectos activos cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      cargarProyectos({ activo: true })
    }
  }, [open, cargarProyectos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formulario.titulo) {
      toast({
        title: "Error",
        description: "El título es requerido",
        variant: "destructive",
      })
      return
    }

    setCargando(true)

    try {
      await crearOportunidad({
        clienteId,
        titulo: formulario.titulo!,
        proyecto: formulario.proyecto,
        propiedad: formulario.propiedad,
        etapa: formulario.etapa,
        valor: formulario.valor,
        probabilidad: formulario.probabilidad,
        proximaAccion: formulario.proximaAccion,
        notas: formulario.notas,
      })

      toast({
        title: "¡Éxito!",
        description: "Oportunidad creada y agregada al pipeline",
      })

      // Resetear formulario
      setFormulario({
        clienteId,
        etapa: "LEAD",
        probabilidad: 25,
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la oportunidad",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#303030] flex items-center gap-2">
            <div className="bg-[#FCBA00] p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#303030]" />
            </div>
            Agregar al Pipeline
          </DialogTitle>
          <DialogDescription className="text-base pt-1">
            Crear una oportunidad de venta para <strong className="text-[#303030]">{clienteNombre}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 pt-2">
          {/* Información Básica */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
              <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                Información Básica
              </h3>
            </div>

            {/* Título */}
            <div className="space-y-2.5">
              <Label htmlFor="titulo" className="text-sm font-medium text-[#303030]">
                Título de la Oportunidad <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titulo"
                placeholder="Ej: Interés en Departamento 301"
                value={formulario.titulo || ""}
                onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                className="h-11"
                required
              />
            </div>

            {/* Proyecto y Propiedad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="proyecto" className="text-sm font-medium text-[#303030]">
                  Proyecto
                </Label>
                <Select
                  value={formulario.proyecto || "sin-proyecto"}
                  onValueChange={(value) => 
                    setFormulario({ ...formulario, proyecto: value === "sin-proyecto" ? undefined : value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={cargandoProyectos ? "Cargando proyectos..." : "Seleccionar proyecto"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="sin-proyecto" className="py-2.5">
                      <span className="text-muted-foreground">Sin proyecto</span>
                    </SelectItem>
                    {proyectos.map((proyecto) => (
                      <SelectItem 
                        key={proyecto.id} 
                        value={proyecto.nombre} 
                        className="py-2.5"
                      >
                        {proyecto.nombre}
                        {proyecto.ubicacion && ` - ${proyecto.ubicacion}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="propiedad" className="text-sm font-medium text-[#303030]">
                  Unidad/Propiedad
                </Label>
                <Input
                  id="propiedad"
                  placeholder="Ej: Dpto 301, Casa 22"
                  value={formulario.propiedad || ""}
                  onChange={(e) => setFormulario({ ...formulario, propiedad: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Estado y Seguimiento */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
              <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                Estado y Seguimiento
              </h3>
            </div>

            {/* Etapa y Probabilidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="etapa" className="text-sm font-medium text-[#303030]">
                  Etapa Inicial <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formulario.etapa}
                  onValueChange={(value) => setFormulario({ ...formulario, etapa: value as EtapaPipeline })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar etapa" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {ETAPAS_PIPELINE.map((etapa) => (
                      <SelectItem 
                        key={etapa.value} 
                        value={etapa.value} 
                        className="py-2.5"
                      >
                        {etapa.label} - {etapa.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="probabilidad" className="text-sm font-medium text-[#303030]">
                  Probabilidad de Cierre
                </Label>
                <Select
                  value={formulario.probabilidad?.toString()}
                  onValueChange={(value) => setFormulario({ ...formulario, probabilidad: Number(value) })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar probabilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROBABILIDADES.map((prob) => (
                      <SelectItem key={prob.value} value={prob.value.toString()} className="py-2.5">
                        <span className="text-sm">{prob.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-2.5">
              <Label htmlFor="valor" className="text-sm font-medium text-[#303030]">
                Valor Estimado
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  S/
                </span>
                <Input
                  id="valor"
                  type="number"
                  placeholder="250,000"
                  value={formulario.valor || ""}
                  onChange={(e) => setFormulario({ ...formulario, valor: Number(e.target.value) || undefined })}
                  className="h-11 pl-10"
                />
              </div>
            </div>

            {/* Próxima Acción */}
            <div className="space-y-2.5">
              <Label htmlFor="proximaAccion" className="text-sm font-medium text-[#303030]">
                Próxima Acción
              </Label>
              <Input
                id="proximaAccion"
                placeholder="Ej: Agendar visita al proyecto"
                value={formulario.proximaAccion || ""}
                onChange={(e) => setFormulario({ ...formulario, proximaAccion: e.target.value })}
                className="h-11"
              />
            </div>
          </div>

          {/* Notas Adicionales */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
              <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                Notas Adicionales
              </h3>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="notas" className="text-sm font-medium text-[#303030]">
                Observaciones
              </Label>
              <Textarea
                id="notas"
                placeholder="Información adicional, requisitos especiales, observaciones..."
                rows={4}
                value={formulario.notas || ""}
                onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={cargando}
              className="min-w-[120px] h-11"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold min-w-[180px] h-11"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando oportunidad...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Agregar al Pipeline
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
