"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar as IconoCalendario, Download as IconoDescargar, BarChart3 as IconoGrafico, TrendingUp as IconoTendenciaArriba, TrendingDown as IconoTendenciaAbajo, Users as IconoUsuarios, Target as IconoObjetivo, Activity as IconoActividad, MapPin as IconoUbicacion } from "lucide-react"
import { Button } from "@/components/ui/button"
import AssistantFab from "@/components/assistant/AssistantFab"
import AssistantPanel from "@/components/assistant/AssistantPanel"
import { obtenerEstadisticas, type EstadisticasResponse } from "@/services/api/analytics.service"

export default function PaginaEstadisticas() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("month")
  const [anioSeleccionado, setAnioSeleccionado] = useState("2025")
  const [abiertoAsistente, setAbiertoAsistente] = useState(false)

  const [estadisticasGenerales, setEstadisticasGenerales] = useState<EstadisticasResponse["estadisticasGenerales"]>([])
  const [actividadesRecientes, setActividadesRecientes] = useState<EstadisticasResponse["actividadesRecientes"]>([])
  const [gruposEdad, setGruposEdad] = useState<EstadisticasResponse["gruposEdad"]>([])
  const [departamentos, setDepartamentos] = useState<EstadisticasResponse["departamentos"]>([])

  useEffect(() => {
    async function cargar() {
      try {
        const datos = await obtenerEstadisticas({ period: periodoSeleccionado, year: anioSeleccionado })
        setEstadisticasGenerales(datos.estadisticasGenerales)
        setActividadesRecientes(datos.actividadesRecientes)
        setGruposEdad(datos.gruposEdad)
        setDepartamentos(datos.departamentos)
      } catch (e) {
        console.error('Error cargando estadísticas:', e)
      }
    }
    cargar()
  }, [periodoSeleccionado, anioSeleccionado])

  

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estadísticas"
        description="Análisis completo del rendimiento y actividad del CRM"
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

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {estadisticasGenerales.map((stat, index) => {
          const iconos = [IconoUsuarios, IconoTendenciaArriba, IconoObjetivo]
          const colores = ["text-blue-600", "text-green-600", "text-purple-600"]
          const bgColores = ["bg-blue-100", "bg-green-100", "bg-purple-100"]
          const IconoComponente = iconos[index] || IconoUsuarios
          const color = colores[index] || "text-blue-600"
          const bgColor = bgColores[index] || "bg-blue-100"
          
          return (
            <Card key={index} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.titulo}</p>
                    <p className="text-2xl font-bold text-[#303030]">{stat.valor}</p>
                    <div className="flex items-center mt-1">
                      {stat.tendencia === "up" ? (
                        <IconoTendenciaArriba className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <IconoTendenciaAbajo className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${stat.tendencia === "up" ? "text-green-600" : "text-red-600"}`}>
                        {stat.cambio}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${bgColor}`}>
                    <IconoComponente className={`w-6 h-6 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gráficas de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de Edades de Clientes */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#303030] flex items-center">
              <IconoUsuarios className="w-5 h-5 mr-2" />
              Edades de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {(() => {
                const max = Math.max(1, ...gruposEdad.map(g => g.cantidad))
                return gruposEdad.length === 0 ? (
                  <div className="w-full text-center py-8 text-muted-foreground">
                    No hay datos de edades disponibles
                  </div>
                ) : (
                  gruposEdad.map((grupo, index) => {
                    const altura = Math.round((grupo.cantidad / max) * 100)
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          title={`${grupo.cantidad} clientes`}
                          className="w-full bg-[#FCBA00] rounded-t-lg hover:bg-[#E0A800] transition-colors cursor-pointer"
                          style={{ height: `${altura}%` }}
                        />
                        <span className="text-xs text-muted-foreground">{grupo.rango}</span>
                      </div>
                    )
                  })
                )
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Gráfica de Departamentos */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#303030] flex items-center">
              <IconoUbicacion className="w-5 h-5 mr-2" />
              Distribución por Departamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departamentos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de departamentos disponibles
                </div>
              ) : (
                departamentos.map((depto, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#303030]">{depto.departamento}</span>
                      <span className="text-muted-foreground">{depto.cantidad} clientes</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-[#FCBA00] h-2 rounded-full transition-all"
                        style={{ 
                          width: `${departamentos.length > 0 ? (depto.cantidad / Math.max(...departamentos.map(d => d.cantidad))) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Actividad Reciente */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#303030] flex items-center">
            <IconoActividad className="w-5 h-5 mr-2" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actividadesRecientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No hay actividades recientes
                  </TableCell>
                </TableRow>
              ) : (
                actividadesRecientes.map((actividad, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm text-muted-foreground">{actividad.fecha}</TableCell>
                    <TableCell className="font-medium">{actividad.actividad}</TableCell>
                    <TableCell>{actividad.usuario}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          actividad.tipo === "contacto" ? "border-blue-200 text-blue-800" :
                          actividad.tipo === "lead" ? "border-green-200 text-green-800" :
                          actividad.tipo === "cliente" ? "border-purple-200 text-purple-800" :
                          "border-gray-200 text-gray-800"
                        }
                      >
                        {actividad.tipo}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AssistantFab onClick={() => setAbiertoAsistente(true)} />
      <AssistantPanel open={abiertoAsistente} onClose={() => setAbiertoAsistente(false)} />
    </div>
  )
}
