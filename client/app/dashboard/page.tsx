"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { obtenerUsuario } from "@/lib/autenticacion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchAPI } from "@/services/api/config"
import WebPreview from "@/components/WebPreview"
import {
  Building2 as IconoEdificio,
  TrendingUp as IconoTendencia,
  DollarSign as IconoDolar,
  Calendar as IconoCalendario,
  ArrowUpRight as FlechaArriba,
  ArrowDownRight as FlechaAbajo,
  RefreshCcw as IconoActualizar,
  Eye as IconoVer,
  Users as IconoUsuarios,
  BarChart3 as IconoGrafico,
  Target as IconoObjetivo,
  CheckCircle2 as IconoExito,
  AlertCircle as IconoAlerta,
} from "lucide-react"
import AssistantFab from "@/components/assistant/AssistantFab"
import AssistantPanel from "@/components/assistant/AssistantPanel"

export default function PaginaDashboard() {
  const enrutador = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [metricas, setMetricas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leadsRecientes, setLeadsRecientes] = useState<any[]>([])
  const [cargandoLeads, setCargandoLeads] = useState(false)
  const [abiertoAsistente, setAbiertoAsistente] = useState(false)
  const [resumenStats, setResumenStats] = useState({
    leadsActivos: 0,
    clientesActivos: 0,
    oportunidadesAbiertas: 0,
    tasaConversion: 0,
  })

  useEffect(() => {
    const usuarioActual = obtenerUsuario()
    if (!usuarioActual) {
      enrutador.push("/login")
    } else {
      setUsuario(usuarioActual)
      cargarMetricas()
      cargarLeadsRecientes()
      cargarResumenStats()
    }
  }, [enrutador])

  async function cargarMetricas() {
    try {
      setCargando(true)
      setError(null)
      const datos = await fetchAPI<any>('/analytics/metrics')
      setMetricas(datos.metricas || [])
    } catch (err: any) {
      console.error('Error cargando métricas:', err)
      setError('Error cargando métricas del dashboard')
    } finally {
      setCargando(false)
    }
  }

  async function cargarLeadsRecientes() {
    try {
      setCargandoLeads(true)
      const datos = await fetchAPI<any>('/contactos/recientes?tipo=LEAD')
      setLeadsRecientes(datos.contactos || [])
    } catch (err: any) {
      console.error('Error cargando leads recientes:', err)
    } finally {
      setCargandoLeads(false)
    }
  }

  async function cargarResumenStats() {
    try {
      const datos = await fetchAPI<any>('/analytics/metrics')
      if (datos && datos.estadisticas) {
        setResumenStats({
          leadsActivos: datos.estadisticas.leadsActivos || 0,
          clientesActivos: datos.estadisticas.clientesActivos || 0,
          oportunidadesAbiertas: datos.estadisticas.oportunidadesAbiertas || 0,
          tasaConversion: datos.estadisticas.tasaConversion || 0,
        })
      }
    } catch (err: any) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCBA00]"></div>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Cargando tu panel de control...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCBA00]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header mejorado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#303030] to-[#555] bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Bienvenido de vuelta, <span className="font-semibold text-[#303030]">{usuario.name}</span></p>
        </div>
        <Button
          variant="outline"
          onClick={cargarMetricas}
          className="border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00]/10 hover:text-[#FCBA00] transition-all duration-200 shadow-sm"
        >
          <IconoActualizar className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <IconoAlerta className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={cargarMetricas}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Sección principal: Leads Recientes y Link Delgado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Recientes - más ancho */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-[#303030] flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <IconoUsuarios className="w-5 h-5 text-blue-600" />
                  </div>
                  Leads Recientes
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cargarLeadsRecientes}
                  className="bg-[#FCBA00] text-[#303030] border-[#FCBA00] hover:bg-[#E5A200] transition-all duration-200"
                >
                  <IconoActualizar className="w-4 h-4 mr-1" />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {cargandoLeads ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCBA00]"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Cargando leads...</span>
                </div>
              ) : leadsRecientes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <IconoUsuarios className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-medium">No hay leads recientes</p>
                  <p className="text-xs mt-1">Los nuevos leads aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leadsRecientes.slice(0, 6).map((lead, indice) => (
                    <div
                      key={lead.id || indice}
                      className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-transparent border border-gray-200 hover:border-[#FCBA00]/50 hover:shadow-md hover:bg-[#FCBA00]/5 transition-all duration-200 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FCBA00] to-[#E5A200] rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <span className="text-white font-bold text-sm">
                          {lead.nombre ? lead.nombre.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-[#303030] truncate group-hover:text-[#FCBA00] transition-colors">
                          {lead.nombre || 'Sin nombre'}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {lead.correo || lead.telefono || 'Sin información de contacto'}
                        </p>
                        {lead.empresa && (
                          <p className="text-xs text-muted-foreground truncate">
                            📍 {lead.empresa}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {lead.creadoEn ? new Date(lead.creadoEn).toLocaleDateString('es-ES') : 'Reciente'}
                        </span>
                        {lead.estadoLead && (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                            lead.estadoLead === 'NUEVO'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : lead.estadoLead === 'CONTACTADO'
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {lead.estadoLead}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {leadsRecientes.length > 6 && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                  <Button
                    onClick={() => enrutador.push('/dashboard/leads')}
                    className="bg-[#FCBA00] text-[#303030] hover:bg-[#E5A200] transition-all duration-200 font-semibold"
                  >
                    Ver todos los leads ({leadsRecientes.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Link Delgado - columna lateral */}
        <div className="lg:col-span-1">
          <WebPreview
            url="https://linkdelgado.netlify.app/"
            title="Link Delgado"
            description="Portal principal de servicios digitales"
          />
        </div>
      </div>

      <AssistantFab onClick={() => setAbiertoAsistente(true)} />
      <AssistantPanel open={abiertoAsistente} onClose={() => setAbiertoAsistente(false)} />
    </div>
  )
}
