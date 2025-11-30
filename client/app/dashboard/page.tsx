"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { obtenerUsuario, obtenerToken } from "@/lib/autenticacion"
import { useProtectedRoute } from "@/hooks/useProtectedRoute"
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
import { WidgetAlertas } from "@/components/features/alerts"

export default function PaginaDashboard() {
  const enrutador = useRouter()
  useProtectedRoute()
  
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
    if (usuarioActual) {
      setUsuario(usuarioActual)
      cargarMetricas()
      cargarLeadsRecientes()
      cargarResumenStats()
    }
  }, [])

  // Polling para actualizar leads recientes en tiempo real cada 10 segundos (optimizado, sin lag)
  useEffect(() => {
    const intervalo = setInterval(() => {
      verificarNuevosLeadsRecientes()
    }, 10000) // 10 segundos

    return () => clearInterval(intervalo)
  }, [])

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

  // Función optimizada para verificar nuevos leads sin mostrar loading
  async function verificarNuevosLeadsRecientes() {
    try {
      const datos = await fetchAPI<any>('/contactos/recientes?tipo=LEAD')
      const nuevosLeads = datos.contactos || []
      
      // Solo actualizar si hay cambios
      setLeadsRecientes(prevLeads => {
        if (JSON.stringify(prevLeads) !== JSON.stringify(nuevosLeads)) {
          console.log('✨ Nuevos leads en dashboard detectados')
          return nuevosLeads
        }
        return prevLeads
      })
    } catch (err: any) {
      console.log('Error verificando leads recientes:', err.message)
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
      {/* Hero Section - Elegante y Minimalista */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FCBA00]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Contenido */}
        <div className="relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Bienvenido de vuelta
            </h1>
            <p className="text-lg text-slate-300">
              <span className="font-semibold text-[#FCBA00]">{usuario.name}</span>
            </p>
          </div>
        </div>
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

      {/* Grid de contenido principal - Proporcional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
        {/* Sección izquierda - Leads Recientes */}
        <Card className="border-0 shadow-lg overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 px-6 py-4 border-b border-blue-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <IconoUsuarios className="w-5 h-5 text-white" />
              </div>
              Últimos Leads
            </h2>
          </div>
          
          <CardContent className="p-6 flex-1 overflow-y-auto">
            {cargandoLeads ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCBA00]"></div>
                <span className="ml-3 text-sm text-muted-foreground">Cargando leads...</span>
              </div>
            ) : leadsRecientes.length === 0 ? (
              <div className="text-center h-full flex flex-col items-center justify-center">
                <IconoUsuarios className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 font-medium">Sin leads aún</p>
                <p className="text-slate-500 text-sm mt-1">Los nuevos leads aparecerán aquí automáticamente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leadsRecientes.slice(0, 6).map((lead, indice) => (
                  <div
                    key={lead.id || indice}
                    onClick={() => enrutador.push(`/dashboard/leads?id=${lead.id}`)}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-[#FCBA00]/50 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-[#FCBA00] to-[#E5A200] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {lead.nombre ? lead.nombre.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-slate-900 truncate">
                        {lead.nombre || 'Sin nombre'}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {lead.correo || lead.telefono || 'Sin contacto'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lead.estadoLead && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          lead.estadoLead === 'NUEVO'
                            ? 'bg-blue-100 text-blue-700'
                            : lead.estadoLead === 'CONTACTADO'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {lead.estadoLead}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          {leadsRecientes.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 text-center bg-slate-50">
              <Button
                onClick={() => enrutador.push('/dashboard/leads')}
                className="bg-[#FCBA00] hover:bg-[#E5A200] text-slate-900 font-semibold w-full"
              >
                Ver todos los leads
              </Button>
            </div>
          )}
        </Card>

        {/* Sección derecha - Link Delgado */}
        <div className="flex flex-col">
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
