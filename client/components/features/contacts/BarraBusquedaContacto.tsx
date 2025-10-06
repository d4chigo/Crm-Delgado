/**
 * Componente BarraBusquedaContacto - Barra de búsqueda con acciones
 */

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowRight } from "lucide-react"

interface PropsBarraBusquedaContacto {
  consulta: string
  alCambiarBusqueda: (consulta: string) => void
  cantidadSeleccionados: number
  alConvertirALeads: () => void
}

export function BarraBusquedaContacto({
  consulta,
  alCambiarBusqueda,
  cantidadSeleccionados,
  alConvertirALeads,
}: PropsBarraBusquedaContacto) {
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={consulta}
              onChange={(e) => alCambiarBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
          {cantidadSeleccionados > 0 && (
            <Button
              onClick={alConvertirALeads}
              className="bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Convertir a Leads ({cantidadSeleccionados})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
