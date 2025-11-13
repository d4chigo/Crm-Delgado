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
import { obtenerEstadisticas, obtenerMetricas, type MetricasResponse, type EstadisticasResponse, obtenerReporteConversionPorOrigen, obtenerReporteDesempenoAsesor, type ReporteConversionOrigenItem, type ReporteDesempenoAsesorItem } from "@/services/api/analytics.service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

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
  const [desempenoAsesor, setDesempenoAsesor] = useState<ReporteDesempenoAsesorItem[]>([])
  const [cargandoReportes, setCargandoReportes] = useState(false)
  const [programas, setProgramas] = useState<MetricasResponse["ventasPorPrograma"]>([])

  // Refs para capturar gráficos (SVG) y embebidos en PDF
  const refChartConversion = useRef<HTMLDivElement>(null)
  const refChartDesempeno = useRef<HTMLDivElement>(null)

  const currentYear = String(new Date().getFullYear())
  const isPastYear = anioSeleccionado !== currentYear

  function handlePeriodoChange(value: string) {
    if (isPastYear) return
    setPeriodoSeleccionado(value)
  }

  async function ensureJsPDF(): Promise<any> {
    if (typeof window === 'undefined') return null
    if ((window as any).jspdf?.jsPDF && (window as any).jspdf) return (window as any).jspdf
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('No se pudo cargar jsPDF'))
      document.body.appendChild(s)
    })
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js'
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('No se pudo cargar jsPDF-AutoTable'))
      document.body.appendChild(s)
    })
    return (window as any).jspdf
  }

  async function imageToDataUrl(src: string): Promise<string> {
    const res = await fetch(src)
    const blob = await res.blob()
    return await new Promise<string>((resolve) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result as string)
      fr.readAsDataURL(blob)
    })
  }

  async function descargarPDFJsPDF(nombre: string, titulo: string, columnas: Array<{ key: string; titulo: string }>, filas: Array<Record<string, any>>, imagenes?: string[]) {
    const jspdf = await ensureJsPDF()
    if (!jspdf) return
    const { jsPDF } = jspdf
    const doc = new jsPDF('l', 'pt', 'a4')

    const pageW = doc.internal.pageSize.getWidth()
    // Header
    doc.setFillColor(255, 248, 224)
    doc.rect(24, 24, pageW - 48, 54, 'F')
    try {
      const logo = await imageToDataUrl('/logodelgado.png')
      doc.addImage(logo, 'PNG', 36, 30, 44, 44)
    } catch {}
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('CRM Inmobiliario Delgado', 90, 45)
    doc.setFontSize(20)
    doc.text(titulo, 90, 68)

    let y = 96
    if (imagenes && imagenes.length) {
      for (const img of imagenes) {
        try {
          const data = img.startsWith('data:') ? img : await imageToDataUrl(img)
          const w = pageW - 72
          const h = 180
          doc.addImage(data, 'PNG', 36, y, w, h, undefined, 'FAST')
          y += h + 10
        } catch {}
      }
    }

    const head = [columnas.map(c => c.titulo)]
    const body = filas.map(f => columnas.map(c => f[c.key] ?? ''))
    ;(doc as any).autoTable({
      head,
      body,
      startY: y,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [17, 24, 39], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 36, right: 36 },
    })

    doc.save(nombre)
  }

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
        :root { --brand:#FCBA00; --ink:#0f172a; --muted:#64748b; --line:#e5e7eb; --bg:#ffffff; --bg-soft:#f8fafc; }
        * { box-sizing: border-box; }
        body { font-family: Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: var(--ink); padding: 28px; background: var(--bg); }
        .topbar { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; background: linear-gradient(90deg, #fff 0%, #fff8e0 60%, #fff 100%); border:1px solid var(--line); border-radius:12px; margin-bottom:18px; }
        .brand { display:flex; align-items:center; gap:14px; }
        .brand img { height: 44px; }
        h1 { font-size: 22px; margin: 0; font-weight: 800; letter-spacing: 0.2px; }
        .cards { display: grid; grid-template-columns: 1fr; gap: 16px; margin: 16px 0; }
        .card { border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); overflow: hidden; }
        .card-header { padding: 12px 16px; background: var(--bg-soft); font-weight: 700; color:#1f2937; }
        .card-content { padding: 16px; }
        table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12px; border-radius: 10px; overflow: hidden; }
        thead th { background: #1f2937; color:#fff; text-align: left; font-weight:700; padding: 10px 12px; border-right:1px solid #334155; }
        thead th:last-child { border-right:0 }
        tbody td { padding: 10px 12px; border-bottom:1px solid var(--line); }
        tbody tr:nth-child(2n) td { background:#fafafa; }
        tbody tr:hover td { background:#fff7de; }
        .badge { display:inline-block; background: var(--brand); color:#1f2937; font-weight:700; font-size:11px; border-radius:999px; padding:4px 10px; }
        .nota { margin-top: 14px; font-size: 11px; color: var(--muted); display:flex; justify-content:space-between; align-items:center; }
        .charts { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .chart img { width: 100%; height: auto; border:1px solid var(--line); border-radius:10px; }
      </style>
    `
    const thead = `<tr>${columnas.map(c => `<th>${c.titulo}</th>`).join('')}</tr>`
    const tbody = filas.map(f => `<tr>${columnas.map(c => `<td>${(f[c.key] ?? '')}</td>`).join('')}</tr>`).join('')
    const html = `
      <!DOCTYPE html><html><head><meta charSet="utf-8" />${estilo}</head>
      <body>
        <div class="topbar">
          <div class="brand">
            <img src="/logodelgado.png" alt="Logo" />
            <div>
              <div class="badge">CRM Inmobiliario Delgado</div>
              <h1>${titulo}</h1>
            </div>
          </div>
          <div style="text-align:right;font-size:12px;color:#6b7280">${new Date().toLocaleString()}</div>
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
            <table>
              <thead>${thead}</thead>
              <tbody>${tbody}</tbody>
            </table>
          </div>
        </div>
        <div class="nota">
          <span>Generado por CRM Inmobiliario Delgado</span>
          <img src="/logodelgado.png" alt="Logo" style="height:20px;opacity:0.7" />
        </div>
        <script>window.addEventListener('load', () => { window.print(); });</script>
      </body></html>
    `
    win.document.open()
    win.document.write(html)
    win.document.close()
  }

  function descargarExcelHtml(nombre: string, titulo: string, columnas: Array<{ key: string; titulo: string }>, filas: Array<Record<string, any>>) {
    const estilo = `
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
      <style>
        .logo { height:40px; }
        .title { font-family: Segoe UI, Roboto, Arial; font-size:16pt; font-weight:700; color:#1f2937; }
        .meta { font-family: Segoe UI, Roboto, Arial; font-size:10pt; color:#6b7280; }
        table { border-collapse: collapse; font-family: Segoe UI, Roboto, Arial; }
        th, td { border:1px solid #d1d5db; padding:8px 10px; }
        th { background:#111827; color:#fff; }
        tr:nth-child(2n) td { background:#f9fafb; }
      </style>
    `
    const header = `
      <table style="width:100%; margin-bottom:12px; border:none">
        <tr style="border:none">
          <td style="border:none"><img class="logo" src="/logodelgado.png" /></td>
          <td style="border:none; text-align:right">
            <div class="title">${titulo}</div>
            <div class="meta">${new Date().toLocaleString()}</div>
          </td>
        </tr>
      </table>
    `
    const thead = `<tr>${columnas.map(c => `<th>${c.titulo}</th>`).join('')}</tr>`
    const tbody = filas.map(f => `<tr>${columnas.map(c => `<td>${(f[c.key] ?? '')}</td>`).join('')}</tr>`).join('')
    const html = `<!DOCTYPE html><html><head>${estilo}</head><body>${header}<table>${thead}${tbody}</table></body></html>`
    const blob = new Blob(["\ufeff" + html], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombre.endsWith('.xls') ? nombre : nombre.replace(/\.csv$/i,'') + '.xls'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    async function cargar() {
      try {
        const datos = await obtenerEstadisticas({ period: periodoSeleccionado, year: anioSeleccionado })
        // Siempre mostrar las estadísticas devueltas por el backend, incluso para años pasados
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

  // Si se selecciona un año pasado, forzar periodo a 'year'
  useEffect(() => {
    if (anioSeleccionado !== currentYear && periodoSeleccionado !== 'year') {
      setPeriodoSeleccionado('year')
    }
  }, [anioSeleccionado])

  useEffect(() => {
    async function cargarReportes() {
      try {
        setCargandoReportes(true)
        // Limpiar datasets para reflejar el cambio inmediato en la UI
        setConversionOrigen([])
        setDesempenoAsesor([])
        setProgramas([])
        const [r1, r2, m] = await Promise.all([
          obtenerReporteConversionPorOrigen({ period: periodoSeleccionado, year: anioSeleccionado }),
          obtenerReporteDesempenoAsesor({ period: periodoSeleccionado, year: anioSeleccionado }),
          obtenerMetricas({ period: periodoSeleccionado, year: anioSeleccionado }),
        ])
        if (isPastYear) {
          // Si es un año pasado, mostramos vacío para evitar confusión
          setConversionOrigen([])
          setDesempenoAsesor([])
          setProgramas([])
        } else {
          setConversionOrigen(r1)
          setDesempenoAsesor(r2)
          setProgramas(m.ventasPorPrograma || [])
        }
      } catch (e) {
        console.error('Error cargando reportes:', e)
      } finally {
        setCargandoReportes(false)
      }
    }
    cargarReportes()
  }, [periodoSeleccionado, anioSeleccionado])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Análisis accionable para gerencia y supervisión"
      >
        <div className="flex gap-3">
          <Select value={periodoSeleccionado} onValueChange={handlePeriodoChange}>
            <SelectTrigger className="w-[150px]" disabled={isPastYear}>
              <IconoCalendario className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {isPastYear ? (
                <SelectItem value="year">Este Año</SelectItem>
              ) : (
                <>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                  <SelectItem value="year">Este Año</SelectItem>
                </>
              )}
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

      {/* Reportes (primero) */}
      <div className="space-y-4">

        <Tabs defaultValue="conversion" className="w-full">
          <TabsList>
            <TabsTrigger value="conversion">Conversión por Origen</TabsTrigger>
            <TabsTrigger value="desempeno">Desempeño del Asesor</TabsTrigger>
            <TabsTrigger value="programas">Ventas por Programa</TabsTrigger>
          </TabsList>

          {/* Conversión por Origen */}
          <TabsContent value="conversion" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#303030]">Tabla</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => descargarExcelHtml(
                      `conversion_por_origen_${new Date().toISOString().slice(0,10)}.xls`,
                      'Reporte: Conversión por Origen',
                      [
                        { key: 'origen', titulo: 'Origen' },
                        { key: 'leads', titulo: 'Leads' },
                        { key: 'ganadas', titulo: 'Ganadas' },
                        { key: 'conversion', titulo: 'Conversión (%)' },
                        { key: 'valorGanado', titulo: 'Valor Ganado (S/)' },
                      ],
                      conversionOrigen.map(r => ({ origen: r.origen, leads: r.leads, ganadas: r.ganadas, conversion: `${r.conversion}%`, valorGanado: Math.round(r.valorGanado).toLocaleString('es-PE') }))
                    )}>Exportar Excel</Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                      const img = svgDataUrlFromRef(refChartConversion)
                      descargarPDFJsPDF(
                      `conversion_por_origen_${new Date().toISOString().slice(0,10)}.pdf`,
                      'Reporte: Conversión por Origen',
                      [
                        { key: 'origen', titulo: 'Origen' },
                        { key: 'leads', titulo: 'Leads' },
                        { key: 'ganadas', titulo: 'Ganadas' },
                        { key: 'conversion', titulo: 'Conversión (%)' },
                        { key: 'valorGanado', titulo: 'Valor Ganado (S/)' },
                      ],
                      conversionOrigen.map(r => ({ origen: r.origen, leads: r.leads, ganadas: r.ganadas, conversion: `${r.conversion}%`, valorGanado: Math.round(r.valorGanado).toLocaleString('es-PE') })),
                      img ? [img] : undefined
                    )
                    }}>
                      Exportar PDF
                    </Button>
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

          {/* Desempeño del Asesor */}
          <TabsContent value="desempeno" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#303030]">Tabla</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => descargarExcelHtml(
                      `desempeno_asesor_${new Date().toISOString().slice(0,10)}.xls`,
                      'Reporte: Desempeño del Asesor',
                      [
                        { key: 'asesor', titulo: 'Asesor' },
                        { key: 'leadsAsignados', titulo: 'Leads' },
                        { key: 'oportunidadesActivas', titulo: 'Oportunidades' },
                        { key: 'valorPipeline', titulo: 'Valor Pipeline (S/)' },
                      ],
                      desempenoAsesor.map(r => ({ asesor: r.asesor, leadsAsignados: r.leadsAsignados, oportunidadesActivas: r.oportunidadesActivas, valorPipeline: Math.round(r.valorPipeline).toLocaleString('es-PE') }))
                    )}>Exportar Excel</Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                      const img = svgDataUrlFromRef(refChartDesempeno)
                      descargarPDFJsPDF(
                      `desempeno_asesor_${new Date().toISOString().slice(0,10)}.pdf`,
                      'Reporte: Desempeño del Asesor',
                      [
                        { key: 'asesor', titulo: 'Asesor' },
                        { key: 'leadsAsignados', titulo: 'Leads' },
                        { key: 'oportunidadesActivas', titulo: 'Oportunidades' },
                        { key: 'valorPipeline', titulo: 'Valor Pipeline (S/)' },
                      ],
                      desempenoAsesor.map(r => ({ asesor: r.asesor, leadsAsignados: r.leadsAsignados, oportunidadesActivas: r.oportunidadesActivas, valorPipeline: Math.round(r.valorPipeline).toLocaleString('es-PE') })),
                      img ? [img] : undefined
                    )
                    }}>
                      Exportar PDF
                    </Button>
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

          {/* Ventas por Programa */}
          <TabsContent value="programas" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#303030]">Tabla</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => descargarExcelHtml(
                      `ventas_por_programa_${new Date().toISOString().slice(0,10)}.xls`,
                      'Reporte: Ventas por Programa',
                      [
                        { key: 'programa', titulo: 'Programa' },
                        { key: 'cantidad', titulo: 'Cantidad' },
                        { key: 'participacion', titulo: 'Participación (%)' },
                      ],
                      programas.map(p => ({ programa: p.program, cantidad: p.count, participacion: `${p.percentage}%` }))
                    )}>Exportar Excel</Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                      const img: string | null = null
                      descargarPDFJsPDF(
                      `ventas_por_programa_${new Date().toISOString().slice(0,10)}.pdf`,
                      'Reporte: Ventas por Programa',
                      [
                        { key: 'programa', titulo: 'Programa' },
                        { key: 'cantidad', titulo: 'Cantidad' },
                        { key: 'participacion', titulo: 'Participación (%)' },
                      ],
                      programas.map(p => ({ programa: p.program, cantidad: p.count, participacion: `${p.percentage}%` })),
                      img ? [img] : undefined
                    )
                    }}>
                      Exportar PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Programa</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Participación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {programas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Sin datos</TableCell>
                        </TableRow>
                      ) : (
                        programas.map((p, i) => (
                          <TableRow key={i}>
                            <TableCell>{p.program}</TableCell>
                            <TableCell>{p.count}</TableCell>
                            <TableCell>{p.percentage}%</TableCell>
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
                  <ChartContainer config={{ cantidad: { label: 'Cantidad', color: '#303030' }, porcentaje: { label: 'Participación (%)', color: '#FCBA00' } }}>
                    <BarChart data={programas.map(p => ({ programa: p.program, cantidad: p.count, porcentaje: p.percentage }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="programa" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="cantidad" fill="#303030" name="Cantidad" />
                      <Bar dataKey="porcentaje" fill="#FCBA00" name="Participación (%)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Estadísticas (debajo) */}
      <div>
        <h2 className="text-xl font-bold text-[#303030] mb-2">Estadísticas</h2>
      </div>
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
                      <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full">
                        <div className="w-full h-full flex items-end">
                          <div
                            title={`${grupo.cantidad} clientes`}
                            className="w-full bg-[#FCBA00] rounded-t-lg hover:bg-[#E0A800] transition-colors cursor-pointer"
                            style={{ height: `${altura}%` }}
                          />
                        </div>
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

