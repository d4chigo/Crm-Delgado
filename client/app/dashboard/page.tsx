"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { obtenerUsuario } from "@/lib/autenticacion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users as IconoUsuarios,
  Building2 as IconoEdificio,
  TrendingUp as IconoTendencia,
  DollarSign as IconoDolar,
  Phone as IconoTelefono,
  Mail as IconoCorreo,
  Calendar as IconoCalendario,
  ArrowUpRight as FlechaArriba,
  ArrowDownRight as FlechaAbajo,
} from "lucide-react"

export default function PaginaDashboard() {
  const enrutador = useRouter()
  const [usuario, setUsuario] = useState<any>(null)

  useEffect(() => {
    const usuarioActual = obtenerUsuario()
    if (!usuarioActual) {
      enrutador.push("/login")
    } else {
      setUsuario(usuarioActual)
    }
  }, [enrutador])

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCBA00]"></div>
      </div>
    )
  }

  const kpis: Array<{
    title: string
    value: string
    change: string
    trend: string
    icon: any
    color: string
    bgColor: string
  }> = []

  const leadsRecientes: Array<{
    name: string
    email: string
    phone: string
    project: string
    score: number
    status: string
    date: string
  }> = []

  const actividadesProximas: Array<{
    type: string
    client: string
    project: string
    time: string
    icon: any
  }> = []

  const obtenerColorPuntaje = (puntaje: number) => {
    if (puntaje >= 70) return "text-green-600 bg-green-50"
    if (puntaje >= 50) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const obtenerEstiloBadge = (estado: string) => {
    const estilos = {
      hot: "bg-red-100 text-red-700 border-red-200",
      warm: "bg-yellow-100 text-yellow-700 border-yellow-200",
      cold: "bg-blue-100 text-blue-700 border-blue-200",
    }
    return estilos[estado as keyof typeof estilos] || estilos.cold
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#303030]">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Bienvenido de vuelta, {usuario.name}</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-border">
              <CardContent className="p-12">
                <div className="text-center text-muted-foreground">
                  <IconoTendencia className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No hay métricas disponibles</p>
                  <p className="text-xs mt-1">Las estadísticas aparecerán cuando haya datos en el sistema</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          kpis.map((kpi, indice) => {
          const Icono = kpi.icon
          return (
            <Card key={indice} className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-3xl font-bold text-[#303030]">{kpi.value}</p>
                    <div className="flex items-center gap-1">
                      {kpi.trend === "up" ? (
                        <FlechaArriba className="w-4 h-4 text-green-600" />
                      ) : (
                        <FlechaAbajo className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {kpi.change}
                      </span>
                      <span className="text-sm text-muted-foreground">vs mes anterior</span>
                    </div>
                  </div>
                  <div className={`${kpi.bgColor} p-3 rounded-xl`}>
                    <Icono className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#303030]">Leads Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadsRecientes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No hay leads recientes</p>
                  <p className="text-xs mt-1">Los nuevos leads aparecerán aquí</p>
                </div>
              ) : (
                leadsRecientes.map((lead, indice) => (
                <div
                  key={indice}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-[#303030]">{lead.name}</h4>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full border ${obtenerEstiloBadge(lead.status)}`}
                      >
                        {lead.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{lead.project}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IconoCorreo className="w-3 h-3" />
                        {lead.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconoTelefono className="w-3 h-3" />
                        {lead.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${obtenerColorPuntaje(lead.score)}`}>
                      Score: {lead.score}
                    </div>
                    <span className="text-xs text-muted-foreground">{lead.date}</span>
                  </div>
                </div>
              ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Activities */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#303030]">Próximas Actividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actividadesProximas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No hay actividades programadas</p>
                  <p className="text-xs mt-1">Las próximas actividades aparecerán aquí</p>
                </div>
              ) : (
                actividadesProximas.map((actividad, indice) => {
                const Icono = actividad.icon
                return (
                  <div
                    key={indice}
                    className="flex gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="bg-[#FCBA00] p-2 rounded-lg h-fit">
                      <Icono className="w-4 h-4 text-[#303030]" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-sm text-[#303030]">{actividad.type}</h4>
                      <p className="text-sm text-muted-foreground">{actividad.client}</p>
                      <p className="text-xs text-muted-foreground">{actividad.project}</p>
                      <div className="flex items-center gap-1 text-xs text-[#FCBA00] font-medium pt-1">
                        <IconoCalendario className="w-3 h-3" />
                        {actividad.time}
                      </div>
                    </div>
                  </div>
                )
              })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
