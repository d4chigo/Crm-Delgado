"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, Target, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedYear, setSelectedYear] = useState("2025")

  const metrics = [
    {
      title: "Ventas Totales",
      value: "S/ 2.4M",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Leads Generados",
      value: "342",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Propiedades Vendidas",
      value: "18",
      change: "+15.3%",
      trend: "up",
      icon: Building2,
      color: "text-[#FCBA00]",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Tasa de Conversión",
      value: "5.3%",
      change: "-2.1%",
      trend: "down",
      icon: Target,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  const salesByProject = [
    { project: "Proyecto Los Olivos", sales: 8, value: 2240000, percentage: 35 },
    { project: "Condominio San Isidro", sales: 5, value: 1750000, percentage: 28 },
    { project: "Torres del Norte", sales: 3, value: 660000, percentage: 18 },
    { project: "Residencial Surco", sales: 2, value: 390000, percentage: 19 },
  ]

  const salesByProgram = [
    { program: "Mi Vivienda", count: 8, percentage: 44 },
    { program: "Techo Propio", count: 6, percentage: 33 },
    { program: "Compra Directa", count: 4, percentage: 23 },
  ]

  const topAgents = [
    { name: "Juan Pérez", sales: 8, value: 2100000, conversion: 6.2 },
    { name: "Ana Torres", sales: 6, value: 1500000, conversion: 5.8 },
    { name: "Carlos Ruiz", sales: 4, value: 800000, conversion: 4.5 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Reportes y Analytics</h1>
          <p className="text-muted-foreground mt-1">Análisis detallado del desempeño de ventas</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00]/10 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${metric.bgColor} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${metric.trend === "up" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                  >
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {metric.change}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-3xl font-bold text-[#303030] mt-1">{metric.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Project */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#303030]">Ventas por Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {salesByProject.map((project) => (
              <div key={project.project} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#303030]">{project.project}</span>
                  <span className="text-muted-foreground">
                    {project.sales} ventas - S/ {(project.value / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-[#FCBA00] h-2 rounded-full transition-all"
                    style={{ width: `${project.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sales by Program */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#303030]">Ventas por Programa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {salesByProgram.map((program) => (
              <div key={program.program} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-semibold text-[#303030]">{program.program}</p>
                  <p className="text-sm text-muted-foreground">{program.count} propiedades</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-[#FCBA00] text-[#303030] font-bold">{program.percentage}%</Badge>
                </div>
              </div>
            ))}
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
            {topAgents.map((agent, index) => (
              <div key={agent.name} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FCBA00] text-[#303030] font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#303030]">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">{agent.sales} ventas cerradas</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#FCBA00]">S/ {(agent.value / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-muted-foreground">Conversión: {agent.conversion}%</p>
                </div>
              </div>
            ))}
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
            {[65, 78, 82, 90, 75, 88, 95, 85, 92, 88, 94, 100].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-[#FCBA00] rounded-t-lg hover:bg-[#E0A800] transition-colors cursor-pointer"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][index]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
