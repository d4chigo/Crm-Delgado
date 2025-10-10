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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#303030] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#FCBA00]" />
            Agregar al Pipeline
          </DialogTitle>
          <DialogDescription>
            Crear una oportunidad de venta para <strong>{clienteNombre}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-sm font-medium">
              Título de la Oportunidad *
            </Label>
            <Input
              id="titulo"
              placeholder="Ej: Interés en Departamento 301"
              value={formulario.titulo || ""}
              onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
              required
            />
          </div>

          {/* Proyecto y Propiedad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proyecto" className="text-sm font-medium">
                Proyecto
              </Label>
              <Select
                value={formulario.proyecto || "sin-proyecto"}
                onValueChange={(value) => 
                  setFormulario({ ...formulario, proyecto: value === "sin-proyecto" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={cargandoProyectos ? "Cargando proyectos..." : "Seleccionar proyecto"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-proyecto">Sin proyecto</SelectItem>
                  {proyectos.map((proyecto) => (
                    <SelectItem key={proyecto.id} value={proyecto.nombre}>
                      <div className="flex flex-col">
                        <span className="font-medium">{proyecto.nombre}</span>
                        {proyecto.ubicacion && (
                          <span className="text-xs text-muted-foreground">{proyecto.ubicacion}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propiedad" className="text-sm font-medium">
                Unidad/Propiedad
              </Label>
              <Input
                id="propiedad"
                placeholder="Ej: Dpto 301, Casa 22, Lote 15"
                value={formulario.propiedad || ""}
                onChange={(e) => setFormulario({ ...formulario, propiedad: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Número o nombre de la unidad específica
              </p>
            </div>
          </div>

          {/* Etapa y Probabilidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="etapa" className="text-sm font-medium">
                Etapa Inicial *
              </Label>
              <Select
                value={formulario.etapa}
                onValueChange={(value) => setFormulario({ ...formulario, etapa: value as EtapaPipeline })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  {ETAPAS_PIPELINE.map((etapa) => (
                    <SelectItem key={etapa.value} value={etapa.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{etapa.label}</span>
                        <span className="text-xs text-muted-foreground">{etapa.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="probabilidad" className="text-sm font-medium">
                Probabilidad de Cierre
              </Label>
              <Select
                value={formulario.probabilidad?.toString()}
                onValueChange={(value) => setFormulario({ ...formulario, probabilidad: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar probabilidad" />
                </SelectTrigger>
                <SelectContent>
                  {PROBABILIDADES.map((prob) => (
                    <SelectItem key={prob.value} value={prob.value.toString()}>
                      {prob.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor" className="text-sm font-medium">
              Valor Estimado (S/)
            </Label>
            <Input
              id="valor"
              type="number"
              placeholder="250000"
              value={formulario.valor || ""}
              onChange={(e) => setFormulario({ ...formulario, valor: Number(e.target.value) || undefined })}
            />
          </div>

          {/* Próxima Acción */}
          <div className="space-y-2">
            <Label htmlFor="proximaAccion" className="text-sm font-medium">
              Próxima Acción
            </Label>
            <Input
              id="proximaAccion"
              placeholder="Ej: Agendar visita al proyecto"
              value={formulario.proximaAccion || ""}
              onChange={(e) => setFormulario({ ...formulario, proximaAccion: e.target.value })}
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas" className="text-sm font-medium">
              Notas
            </Label>
            <Textarea
              id="notas"
              placeholder="Información adicional sobre la oportunidad..."
              rows={3}
              value={formulario.notas || ""}
              onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={cargando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
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
