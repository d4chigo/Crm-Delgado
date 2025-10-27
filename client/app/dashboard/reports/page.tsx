"use client"

import { useEffect, useRef, useState } from "react"
import { PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar as IconoCalendario, Download as IconoDescargar, BarChart3 as IconoGrafico, TrendingUp as IconoTendenciaArriba, TrendingDown as IconoTendenciaAbajo, Users as IconoUsuarios, Target as IconoObjetivo, Activity as IconoActividad, MapPin as IconoUbicacion } from "lucide-react"
import { Button } from "@/components/ui/button"
import AssistantFab from "@/components/assistant/AssistantFab"
import AssistantPanel from "@/components/assistant/AssistantPanel"
import { obtenerEstadisticas, type EstadisticasResponse, obtenerReporteConversionPorOrigen, obtenerReporteVelocidadCiclo, obtenerReporteDesempenoAsesor, obtenerReporteForecast, type ReporteConversionOrigenItem, type ReporteVelocidadCicloItem, type ReporteDesempenoAsesorItem, type ReporteForecastResponse } from "@/services/api/analytics.service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from "recharts"

export default function PaginaEstadisticas() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("month")
  const [anioSeleccionado, setAnioSeleccionado] = useState("2025")
  const [abiertoAsistente, setAbiertoAsistente] = useState(false)

  const [estadisticasGenerales, setEstadisticasGenerales] = useState<EstadisticasResponse["estadisticasGenerales"]>([])
  const [actividadesRecientes, setActividadesRecientes] = useState<EstadisticasResponse["actividadesRecientes"]>([])
  const [gruposEdad, setGruposEdad] = useState<EstadisticasResponse["gruposEdad"]>([])
  const [departamentos, setDepartamentos] = useState<EstadisticasResponse["departamentos"]>([])

  // Reportes
  const [conversionOrigen, setConversionOrigen] = useState<ReporteConversionOrigenItem[]>([])
  const [velocidadCiclo, setVelocidadCiclo] = useState<ReporteVelocidadCicloItem[]>([])
  const [desempenoAsesor, setDesempenoAsesor] = useState<ReporteDesempenoAsesorItem[]>([])
  const [forecast, setForecast] = useState<ReporteForecastResponse | null>(null)
  const [cargandoReportes, setCargandoReportes] = useState(false)

  // Refs para capturar gráficos (SVG) y embebidos en PDF
  const refChartConversion = useRef<HTMLDivElement>(null)
  const refChartVelocidad = useRef<HTMLDivElement>(null)
  const refChartDesempeno = useRef<HTMLDivElement>(null)
  const refChartForecast = useRef<HTMLDivElement>(null)

  function descargarCSV(nombre: string, filas: Array<Record<string, any>>, columnas: Array<{ key: string; titulo: string }>) {
    const encabezados = columnas.map(c => c.titulo)
    const lineas = filas.map(f => columnas.map(c => {
      const v = f[c.key]
      const s = v === undefined || v === null ? '' : String(v)
      return '"' + s.replace(/"/g, '""') + '"'
    }).join(','))
    const contenido = [encabezados.join(','), ...lineas].join('\n')
    const blob = new Blob(["\uFEFF" + contenido], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombre
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function svgDataUrlFromRef(ref: React.RefObject<HTMLDivElement>): string | null {
    const container = ref.current
    if (!container) return null
    const svg = container.querySelector('svg') as SVGSVGElement | null
    if (!svg) return null
    const xml = new XMLSerializer().serializeToString(svg)
    const encoded = encodeURIComponent(xml)
    return `data:image/svg+xml;charset=utf-8,${encoded}`
  }

  function descargarPDFHtml(nombre: string, titulo: string, columnas: Array<{ key: string; titulo: string }>, filas: Array<Record<string, any>>, imagenes?: string[]) {
    const win = window.open('', '_blank')
    if (!win) return
    const estilo = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 24px; background: #fff; }
        .encabezado { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .encabezado img { height: 40px; }
        h1 { font-size: 20px; margin: 0; font-weight: 700; }
        .cards { display: grid; grid-template-columns: 1fr; gap: 16px; margin: 16px 0; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); overflow: hidden; }
        .card-header { padding: 12px 16px; background: #f8fafc; font-weight: 600; }
        .card-content { padding: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; border-radius: 8px; overflow: hidden; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 10px 12px; }
        th { background: #f1f5f9; text-align: left; color: #334155; }
        tr:last-child td { border-bottom: 0; }
        .nota { margin-top: 12px; font-size: 11px; color: #64748b; }
        .charts { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .chart img { width: 100%; height: auto; }
      </style>
    `
    const thead = `<tr>${columnas.map(c => `<th>${c.titulo}</th>`).join('')}</tr>`
    const tbody = filas.map(f => `<tr>${columnas.map(c => `<td>${(f[c.key] ?? '')}</td>`).join('')}</tr>`).join('')
    const html = `
      <!DOCTYPE html><html><head><meta charSet="utf-8" />${estilo}</head>
      <body>
        <div class="encabezado">
          <img src="/logodelgado.png" alt="Logo" />
          <h1>${titulo}</h1>
        </div>
        ${imagenes && imagenes.length ? `
          <div class="cards">
            <div class="card">
              <div class="card-header">Gráfico</div>
              <div class="card-content charts">
                ${imagenes.map(src => `<div class="chart"><img src="${src}" /></div>`).join('')}
              </div>
            </div>
          </div>
        ` : ''}
        <div class="card">
          <div class="card-header">Datos</div>
          <div class="card-content">
            <table><thead>${thead}</thead><tbody>${tbody}</tbody></table>
          </div>
        </div>
        <div class="nota">Generado por CRM Inmobiliario Delgado - ${new Date().toLocaleString()}</div>
        <script>window.addEventListener('load', () => { window.print(); });</script>
      </body></html>
    `
    win.document.open()
    win.document.write(html)
    win.document.close()
  }

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

  useEffect(() => {
    async function cargarReportes() {
      try {
        setCargandoReportes(true)
        const [r1, r2, r3, r4] = await Promise.all([
          obtenerReporteConversionPorOrigen(),
          obtenerReporteVelocidadCiclo(),
          obtenerReporteDesempenoAsesor(),
          obtenerReporteForecast(),
        ])
        setConversionOrigen(r1)
        setVelocidadCiclo(r2)
        setDesempenoAsesor(r3)
        setForecast(r4)
      } catch (e) {
        console.error('Error cargando reportes:', e)
      } finally {
        setCargandoReportes(false)
      }
    }
    cargarReportes()
  }, [])

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

      {/* Reportes Esenciales */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#303030] flex items-center gap-2">
            <IconoGrafico className="w-5 h-5" /> Reportes
          </h2>
          <p className="text-sm text-muted-foreground">Análisis accionable para gerencia y supervisión</p>
        </div>

        <Tabs defaultValue="conversion" className="w-full">
          <TabsList>
            <TabsTrigger value="conversion">Conversión por Origen</TabsTrigger>
            <TabsTrigger value="velocidad">Velocidad del Ciclo</TabsTrigger>
            <TabsTrigger value="desempeno">Desempeño del Asesor</TabsTrigger>
            <TabsTrigger value="forecast">Forecast de Ingresos</TabsTrigger>
          </TabsList>

          {/* Conversión por Origen */}
          <TabsContent value="conversion" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#303030]">Tabla</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => descargarCSV(
                      `conversion_por_origen_${new Date().toISOString().slice(0,10)}.csv`,
                      conversionOrigen.map(r => ({ origen: r.origen, leads: r.leads, ganadas: r.ganadas, conversion: `${r.conversion}%`, valorGanado: Math.round(r.valorGanado) })),
                      [
                        { key: 'origen', titulo: 'Origen' },
                        { key: 'leads', titulo: 'Leads' },
                        { key: 'ganadas', titulo: 'Ganadas' },
                        { key: 'conversion', titulo: 'Conversión (%)' },
                        { key: 'valorGanado', titulo: 'Valor Ganado (S/)' },
                      ]
                    )}>Exportar CSV</Button>
                    <Button size="sm" onClick={() => descargarPDFHtml(
                      `conversion_por_origen_${new Date().toISOString().slice(0,10)}.pdf`,
                      'Reporte: Conversión por Origen',
                      [
                        { key: 'origen', titulo: 'Origen' },
                        { key: 'leads', titulo: 'Leads' },
                        { key: 'ganadas', titulo: 'Ganadas' },
                        { key: 'conversion', titulo: 'Conversión (%)' },
                        { key: 'valorGanado', titulo: 'Valor Ganado (S/)' },
                      ],
                      conversionOrigen.map(r => ({ origen: r.origen, leads: r.leads, ganadas: r.ganadas, conversion: `${r.conversion}%`, valorGanado: Math.round(r.valorGanado).toLocaleString('es-PE') }))
                    )}>Exportar PDF</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Origen</TableHead>
                        <TableHead>Leads</TableHead>
                        <TableHead>Ganadas</TableHead>
                        <TableHead>Conversión</TableHead>
                        <TableHead>Valor Ganado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversionOrigen.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sin datos</TableCell>
                        </TableRow>
                      ) : (
                        conversionOrigen.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>{r.origen}</TableCell>
                            <TableCell>{r.leads}</TableCell>
                            <TableCell>{r.ganadas}</TableCell>
                            <TableCell>{r.conversion}%</TableCell>
                            <TableCell>S/ {Math.round(r.valorGanado).toLocaleString('es-PE')}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#303030]">Gráfico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={refChartConversion}>
                  <ChartContainer config={{ leads: { label: 'Leads', color: '#303030' }, conversion: { label: 'Conversión (%)', color: '#FCBA00' } }}>
                    <BarChart data={conversionOrigen}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="origen" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="leads" fill="#303030" name="Leads" />
                      <Bar dataKey="conversion" fill="#FCBA00" name="Conversión (%)" />
                    </BarChart>
                  </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Velocidad del Ciclo */}
          <TabsContent value="velocidad" className="mt-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#303030]">Días Promedio por Etapa</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => descargarCSV(
                    `velocidad_ciclo_${new Date().toISOString().slice(0,10)}.csv`,
                    velocidadCiclo.map(r => ({ etapa: r.etapa, tiempoPromedioDias: r.tiempoPromedioDias, oportunidades: r.oportunidades })),
                    [
                      { key: 'etapa', titulo: 'Etapa' },
                      { key: 'tiempoPromedioDias', titulo: 'Días promedio' },
                      { key: 'oportunidades', titulo: 'Oportunidades' },
                    ]
                  )}>Exportar CSV</Button>
                  <Button size="sm" onClick={() => descargarPDFHtml(
                    `velocidad_ciclo_${new Date().toISOString().slice(0,10)}.pdf`,
                    'Reporte: Velocidad del Ciclo',
                    [
                      { key: 'etapa', titulo: 'Etapa' },
                      { key: 'tiempoPromedioDias', titulo: 'Días promedio' },
                      { key: 'oportunidades', titulo: 'Oportunidades' },
                    ],
                    velocidadCiclo
                  )}>Exportar PDF</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div ref={refChartVelocidad}>
                <ChartContainer config={{ dias: { label: 'Días', color: '#FCBA00' } }}>
                  <BarChart data={velocidadCiclo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="etapa" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="tiempoPromedioDias" fill="#FCBA00" name="Días promedio" />
                  </BarChart>
                </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Desempeño del Asesor */}
          <TabsContent value="desempeno" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#303030]">Tabla</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => descargarCSV(
                      `desempeno_asesor_${new Date().toISOString().slice(0,10)}.csv`,
                      desempenoAsesor.map(r => ({ asesor: r.asesor, leadsAsignados: r.leadsAsignados, oportunidadesActivas: r.oportunidadesActivas, valorPipeline: Math.round(r.valorPipeline) })),
                      [
                        { key: 'asesor', titulo: 'Asesor' },
                        { key: 'leadsAsignados', titulo: 'Leads' },
                        { key: 'oportunidadesActivas', titulo: 'Oportunidades' },
                        { key: 'valorPipeline', titulo: 'Valor Pipeline (S/)' },
                      ]
                    )}>Exportar CSV</Button>
                    <Button size="sm" onClick={() => descargarPDFHtml(
                      `desempeno_asesor_${new Date().toISOString().slice(0,10)}.pdf`,
                      'Reporte: Desempeño del Asesor',
                      [
                        { key: 'asesor', titulo: 'Asesor' },
                        { key: 'leadsAsignados', titulo: 'Leads' },
                        { key: 'oportunidadesActivas', titulo: 'Oportunidades' },
                        { key: 'valorPipeline', titulo: 'Valor Pipeline (S/)' },
                      ],
                      desempenoAsesor.map(r => ({ asesor: r.asesor, leadsAsignados: r.leadsAsignados, oportunidadesActivas: r.oportunidadesActivas, valorPipeline: Math.round(r.valorPipeline).toLocaleString('es-PE') }))
                    )}>Exportar PDF</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asesor</TableHead>
                        <TableHead>Leads</TableHead>
                        <TableHead>Oportunidades</TableHead>
                        <TableHead>Valor Pipeline</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {desempenoAsesor.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Sin datos</TableCell>
                        </TableRow>
                      ) : (
                        desempenoAsesor.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>{r.asesor}</TableCell>
                            <TableCell>{r.leadsAsignados}</TableCell>
                            <TableCell>{r.oportunidadesActivas}</TableCell>
                            <TableCell>S/ {Math.round(r.valorPipeline).toLocaleString('es-PE')}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#303030]">Gráfico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={refChartDesempeno}>
                  <ChartContainer config={{ leads: { label: 'Leads' }, oportunidades: { label: 'Oportunidades' }, valor: { label: 'Valor (S/)' } }}>
                    <BarChart data={desempenoAsesor.map(d => ({ asesor: d.asesor, leads: d.leadsAsignados, oportunidades: d.oportunidadesActivas, valor: d.valorPipeline }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="asesor" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="leads" fill="#303030" name="Leads" />
                      <Bar dataKey="oportunidades" fill="#8884d8" name="Oportunidades" />
                      <Bar dataKey="valor" fill="#FCBA00" name="Valor (S/)" />
                    </BarChart>
                  </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forecast */}
          <TabsContent value="forecast" className="mt-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#303030]">Valor Esperado del Pipeline</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => forecast && descargarCSV(
                    `forecast_${new Date().toISOString().slice(0,10)}.csv`,
                    forecast.mensual.map(m => ({ mes: m.mes, valor: Math.round(m.valor) })),
                    [
                      { key: 'mes', titulo: 'Mes' },
                      { key: 'valor', titulo: 'Valor Esperado (S/)' },
                    ]
                  )}>Exportar CSV</Button>
                  <Button size="sm" onClick={() => forecast && descargarPDFHtml(
                    `forecast_${new Date().toISOString().slice(0,10)}.pdf`,
                    'Reporte: Forecast de Ingresos',
                    [
                      { key: 'mes', titulo: 'Mes' },
                      { key: 'valor', titulo: 'Valor Esperado (S/)' },
                    ],
                    forecast.mensual.map(m => ({ mes: m.mes, valor: Math.round(m.valor).toLocaleString('es-PE') }))
                  )}>Exportar PDF</Button>
                </div>
              </CardHeader>
              <CardContent>
                {forecast ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">Total esperado: <span className="font-semibold text-[#303030]">S/ {Math.round(forecast.totalEsperado).toLocaleString('es-PE')}</span></div>
                    <div ref={refChartForecast}>
                      <ChartContainer config={{ valor: { label: 'Valor (S/)', color: '#FCBA00' } }}>
                        <LineChart data={forecast.mensual.map(m => ({ mes: m.mes, valor: m.valor }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="valor" stroke="#FCBA00" name="Valor (S/)" />
                        </LineChart>
                      </ChartContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Sin datos</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AssistantFab onClick={() => setAbiertoAsistente(true)} />
      <AssistantPanel open={abiertoAsistente} onClose={() => setAbiertoAsistente(false)} />
    </div>
  )
}
