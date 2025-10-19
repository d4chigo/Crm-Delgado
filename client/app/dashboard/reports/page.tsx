"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout";
import { ReportStatCard } from "@/components/features/reports/ReportStatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp as IconoTendenciaArriba, TrendingDown as IconoTendenciaAbajo, DollarSign as IconoDolar, Users as IconoUsuarios, Building2 as IconoEdificio, Target as IconoObjetivo, Calendar as IconoCalendario, Download as IconoDescargar } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaginaReportes() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("month")
  const [anioSeleccionado, setAnioSeleccionado] = useState("2025")

  const metricas: Array<{
    title: string
    value: string
    change: string
    trend: string
    icon: any
    color: string
    bgColor: string
  }> = []

  const ventasPorProyecto: Array<{ project: string; sales: number; value: number; percentage: number }> = []

  const ventasPorPrograma: Array<{ program: string; count: number; percentage: number }> = []

  const mejoresAgentes: Array<{ name: string; sales: number; value: number; conversion: number }> = []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes y Analytics"
        description="Análisis detallado del desempeño de ventas"
      >
        <div className="flex gap-3">
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="w-[150px]">
              <IconoCalendario className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>
          <Select value={anioSeleccionado} onValueChange={setAnioSeleccionado}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00]/10 bg-transparent">
            <IconoDescargar className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </PageHeader>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((metrica) => (
          <ReportStatCard
            key={metrica.title}
            title={metrica.title}
            value={metrica.value}
            change={metrica.change}
            trend={metrica.trend as 'up' | 'down'}
            icon={metrica.icon}
            color={metrica.color}
            bgColor={metrica.bgColor}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Project */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#303030]">Ventas por Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ventasPorProyecto.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No hay datos de ventas por proyecto</p>
              </div>
            ) : (
              ventasPorProyecto.map((proyecto) => (
              <div key={proyecto.project} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#303030]">{proyecto.project}</span>
                  <span className="text-muted-foreground">
                    {proyecto.sales} ventas - S/ {(proyecto.value / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-[#FCBA00] h-2 rounded-full transition-all"
                    style={{ width: `${proyecto.percentage}%` }}
                  />
                </div>
              </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sales by Program */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#303030]">Ventas por Programa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ventasPorPrograma.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No hay datos de ventas por programa</p>
              </div>
            ) : (
              ventasPorPrograma.map((programa) => (
              <div key={programa.program} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-semibold text-[#303030]">{programa.program}</p>
                  <p className="text-sm text-muted-foreground">{programa.count} propiedades</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-[#FCBA00] text-[#303030] font-bold">{programa.percentage}%</Badge>
                </div>
              </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Agents */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#303030]">Top Agentes del Periodo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mejoresAgentes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No hay datos de agentes</p>
              </div>
            ) : (
              mejoresAgentes.map((agente, indice) => (
              <div key={agente.name} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FCBA00] text-[#303030] font-bold">
                  #{indice + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#303030]">{agente.name}</p>
                  <p className="text-sm text-muted-foreground">{agente.sales} ventas cerradas</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#FCBA00]">S/ {(agente.value / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">Conversión: {agente.conversion}%</p>
                </div>
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#303030]">Tendencia Mensual de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {[65, 78, 82, 90, 75, 88, 95, 85, 92, 88, 94, 100].map((altura, indice) => (
              <div key={indice} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-[#FCBA00] rounded-t-lg hover:bg-[#E0A800] transition-colors cursor-pointer"
                  style={{ height: `${altura}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][indice]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
