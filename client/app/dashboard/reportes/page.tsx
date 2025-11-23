"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { TrendingUp, Download, Filter, Calendar } from "lucide-react"
import AssistantFab from "@/components/assistant/AssistantFab"
import AssistantPanel from "@/components/assistant/AssistantPanel"
import {
  obtenerReporteLead,
  obtenerReporteConversion,
  obtenerReporteActividad,
  obtenerReporteVentasCerradas,
  obtenerReporteClientesActivos,
  obtenerAnalisisTiempoEficiencia,
  obtenerReporteFuenteLeads,
  type ReporteLead,
  type ReporteConversion,
  type ReporteActividad,
  type ReporteVentasCerradas,
  type ReporteClientesActivos,
  type AnalisisTiempoEficiencia,
  type ReporteFuenteLeads,
} from "@/services/api/reportes.service"
import { useToast } from "@/hooks/use-toast"

const COLORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function PaginaReportes() {
  const { toast } = useToast()
  const [abiertoAsistente, setAbiertoAsistente] = useState(false)
  const [cargando, setCargando] = useState(false)

  // Estados para cada reporte
  const [reporteLead, setReporteLead] = useState<ReporteLead | null>(null)
  const [reporteConversion, setReporteConversion] = useState<ReporteConversion | null>(null)
  const [reporteActividad, setReporteActividad] = useState<ReporteActividad | null>(null)
  const [reporteVentas, setReporteVentas] = useState<ReporteVentasCerradas | null>(null)
  const [reporteClientes, setReporteClientes] = useState<ReporteClientesActivos | null>(null)
  const [reporteTiempo, setReporteTiempo] = useState<AnalisisTiempoEficiencia | null>(null)
  const [reporteFuente, setReporteFuente] = useState<ReporteFuenteLeads | null>(null)

  useEffect(() => {
    cargarTodosLosReportes()
  }, [])

  async function cargarTodosLosReportes() {
    setCargando(true)
    try {
      const [lead, conversion, actividad, ventas, clientes, tiempo, fuente] = await Promise.all([
        obtenerReporteLead(),
        obtenerReporteConversion(),
        obtenerReporteActividad(),
        obtenerReporteVentasCerradas(),
        obtenerReporteClientesActivos(),
        obtenerAnalisisTiempoEficiencia(),
        obtenerReporteFuenteLeads(),
      ])

      setReporteLead(lead)
      setReporteConversion(conversion)
      setReporteActividad(actividad)
      setReporteVentas(ventas)
      setReporteClientes(clientes)
      setReporteTiempo(tiempo)
      setReporteFuente(fuente)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Análisis detallado del desempeño del CRM"
      />

      <div className="flex gap-2">
        <Button onClick={cargarTodosLosReportes} disabled={cargando} variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {cargando ? "Cargando..." : "Actualizar"}
        </Button>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="conversion">Conversión</TabsTrigger>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="tiempo">Eficiencia</TabsTrigger>
          <TabsTrigger value="fuente">Fuentes</TabsTrigger>
        </TabsList>

        {/* REPORTE DE LEADS */}
        <TabsContent value="leads" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reporteLead?.totalLeads || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leads por Fuente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reporteLead?.leadsPorFuente || []}
                    dataKey="cantidad"
                    nameKey="fuente"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {(reporteLead?.leadsPorFuente || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Oportunidades por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reporteLead?.oportunidadesPorEtapa || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="etapa" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tiempo Promedio por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Días Promedio</TableHead>
                    <TableHead>Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reporteLead?.tiempoPromedioPorEtapa.map((item) => (
                    <TableRow key={item.etapa}>
                      <TableCell>{item.etapa}</TableCell>
                      <TableCell className="font-semibold">{item.diasPromedio} días</TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTE DE CONVERSIÓN */}
        <TabsContent value="conversion" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reporteConversion?.totalLeads || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Con Oportunidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reporteConversion?.leadsConOportunidades || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Oportunidades Ganadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reporteConversion?.oportunidadesGanadas || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reporteConversion?.tasaConversionLeads || 0}%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Valor Total Ganado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                ${(reporteConversion?.valorGanado || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversión por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>De</TableHead>
                    <TableHead>A</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Porcentaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reporteConversion?.conversionPorEtapa.map((item) => (
                    <TableRow key={`${item.de}-${item.a}`}>
                      <TableCell>{item.de}</TableCell>
                      <TableCell>{item.a}</TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell>
                        <Badge variant={item.porcentaje > 50 ? "default" : "secondary"}>
                          {item.porcentaje}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTE DE ACTIVIDAD */}
        <TabsContent value="actividad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades por Agente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reporteActividad?.oportunidadesPorAgente || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="usuario" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="oportunidadesTotal" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Oportunidades por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reporteActividad?.oportunidadesPorEtapa || []}
                    dataKey="cantidad"
                    nameKey="etapa"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {(reporteActividad?.oportunidadesPorEtapa || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTE DE VENTAS CERRADAS */}
        <TabsContent value="ventas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reporteVentas?.totalVentas || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${(reporteVentas?.montoTotal || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Días Promedio Cierre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reporteVentas?.diasPromedioCierre || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalle de Ventas Cerradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Días</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reporteVentas?.ventasDetalladas.slice(0, 10).map((venta: any) => (
                      <TableRow key={venta.id}>
                        <TableCell className="font-medium">{venta.titulo}</TableCell>
                        <TableCell>{venta.cliente?.nombre || '-'}</TableCell>
                        <TableCell>{venta.proyecto || '-'}</TableCell>
                        <TableCell>${(venta.valor || 0).toLocaleString()}</TableCell>
                        <TableCell>{venta.diasParaCierre}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTE DE CLIENTES ACTIVOS */}
        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Clientes Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reporteClientes?.totalClientesActivos || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes con Oportunidades Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Oportunidades</TableHead>
                      <TableHead>Monto en Juego</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reporteClientes?.clientes.slice(0, 15).map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nombre}</TableCell>
                        <TableCell>{cliente.correo || '-'}</TableCell>
                        <TableCell>
                          <Badge>{cliente.oportunidadesActivas}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${cliente.montoEnJuego.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANÁLISIS DE TIEMPO Y EFICIENCIA */}
        <TabsContent value="tiempo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Tiempo por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reporteTiempo?.estadisticas || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="etapa" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="diasPromedio" fill="#3b82f6" name="Promedio" />
                  <Bar dataKey="diasMaximo" fill="#ef4444" name="Máximo" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalle de Eficiencia</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Días Promedio</TableHead>
                    <TableHead>Máximo</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Tiempo Muerto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reporteTiempo?.estadisticas.map((item) => (
                    <TableRow key={item.etapa}>
                      <TableCell className="font-medium">{item.etapa}</TableCell>
                      <TableCell>{item.diasPromedio}</TableCell>
                      <TableCell>{item.diasMaximo}</TableCell>
                      <TableCell>{item.diasMinimo}</TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell>
                        <Badge variant={item.tiempoMuerto === 'Sí' ? 'destructive' : 'default'}>
                          {item.tiempoMuerto}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTE DE FUENTE DE LEADS */}
        <TabsContent value="fuente" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mejor Fuente de Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {reporteFuente?.mejorFuente ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{reporteFuente.mejorFuente.fuente}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Leads</p>
                      <p className="text-xl font-semibold">{reporteFuente.mejorFuente.totalLeads}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tasa Conversión</p>
                      <p className="text-xl font-semibold">{reporteFuente.mejorFuente.tasaConversion}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Oportunidades Ganadas</p>
                      <p className="text-xl font-semibold">{reporteFuente.mejorFuente.oportunidadesGanadas}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor Generado</p>
                      <p className="text-xl font-semibold">${reporteFuente.mejorFuente.valorGanado.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Sin datos</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análisis por Fuente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reporteFuente?.reportePorFuente || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fuente" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalLeads" fill="#3b82f6" name="Total Leads" />
                  <Bar dataKey="oportunidadesGanadas" fill="#10b981" name="Ganadas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalle de Fuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fuente</TableHead>
                    <TableHead>Total Leads</TableHead>
                    <TableHead>Con Oportunidades</TableHead>
                    <TableHead>Ganadas</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Conversión</TableHead>
                    <TableHead>Eficiencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reporteFuente?.reportePorFuente.map((item) => (
                    <TableRow key={item.fuente}>
                      <TableCell className="font-medium">{item.fuente}</TableCell>
                      <TableCell>{item.totalLeads}</TableCell>
                      <TableCell>{item.leadsConOportunidades}</TableCell>
                      <TableCell>{item.oportunidadesGanadas}</TableCell>
                      <TableCell>${item.valorGanado.toLocaleString()}</TableCell>
                      <TableCell>{item.tasaConversion}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.eficiencia === 'Alta'
                              ? 'default'
                              : item.eficiencia === 'Media'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {item.eficiencia}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AssistantFab onClick={() => setAbiertoAsistente(true)} />
      <AssistantPanel open={abiertoAsistente} onClose={() => setAbiertoAsistente(false)} />
    </div>
  )
}
