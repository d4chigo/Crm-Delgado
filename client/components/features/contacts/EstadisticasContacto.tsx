/**
 * Componente EstadisticasContacto - Estadísticas de contactos
 */

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, Upload, ArrowRight } from "lucide-react"

interface PropsEstadisticasContacto {
  total: number
  desdeGoogle: number
  seleccionados: number
}

export function EstadisticasContacto({ total, desdeGoogle, seleccionados }: PropsEstadisticasContacto) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Contactos</p>
              <p className="text-3xl font-bold text-[#303030] mt-1">{total}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Desde Google</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{desdeGoogle}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Seleccionados</p>
              <p className="text-3xl font-bold text-[#FCBA00] mt-1">{seleccionados}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-xl">
              <ArrowRight className="w-6 h-6 text-[#FCBA00]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
