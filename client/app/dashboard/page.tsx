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
} from "lucide-react"

export default function PaginaDashboard() {
  const enrutador = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [metricas, setMetricas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leadsRecientes, setLeadsRecientes] = useState<any[]>([])
  const [cargandoLeads, setCargandoLeads] = useState(false)

  useEffect(() => {
    const usuarioActual = obtenerUsuario()
    if (!usuarioActual) {
      enrutador.push("/login")
    } else {
      setUsuario(usuarioActual)
      cargarMetricas()
      cargarLeadsRecientes()
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
          <p className="text-muted-foreground mt-1">Cargando métricas...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCBA00]"></div>
        </div>
      </div>
    )
  }

  const obtenerIcono = (iconName: string) => {
    const iconos: { [key: string]: any } = {
      building: IconoEdificio,
      dollar: IconoDolar,
      trending: IconoTendencia,
    }
    return iconos[iconName] || IconoTendencia
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#303030]">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Bienvenido de vuelta, {usuario.name}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={cargarMetricas}
            className="border-[#FCBA00] text-[#FCBA00] hover:bg-[#FCBA00]/10"
          >
            <IconoActualizar className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
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



      {/* Leads Recientes y Link Delgado lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Recientes */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-[#303030] flex items-center gap-2">
                <IconoUsuarios className="w-5 h-5 text-[#FCBA00]" />
                Leads Recientes
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={cargarLeadsRecientes}
                className="bg-[#FCBA00] text-[#303030] border-[#FCBA00] hover:shadow-lg hover:shadow-[#FCBA00]/30 transition-all duration-200"
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
              <div className="text-center py-8 text-muted-foreground">
                <IconoUsuarios className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No hay leads recientes</p>
                <p className="text-xs mt-1">Los nuevos leads aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leadsRecientes.slice(0, 5).map((lead, indice) => (
                  <div
                    key={lead.id || indice}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#FCBA00]/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-[#FCBA00]/10 rounded-full flex items-center justify-center">
                      <span className="text-[#FCBA00] font-semibold text-sm">
                        {lead.nombre ? lead.nombre.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-[#303030] truncate">
                        {lead.nombre || 'Sin nombre'}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {lead.email || lead.telefono || 'Sin información de contacto'}
                      </p>
                      {lead.empresa && (
                        <p className="text-xs text-muted-foreground truncate">
                          {lead.empresa}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">
                        {lead.fechaCreacion ? new Date(lead.fechaCreacion).toLocaleDateString() : 'Reciente'}
                      </span>
                      {lead.estado && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          lead.estado === 'activo' 
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {lead.estado}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {leadsRecientes.length > 5 && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <Button
                  variant="outline"
                  onClick={() => enrutador.push('/dashboard/leads')}
                  className="bg-[#FCBA00] text-[#303030] border-[#FCBA00] hover:shadow-lg hover:shadow-[#FCBA00]/30 transition-all duration-200"
                >
                  Ver todos los leads
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Link Delgado */}
        <WebPreview
          url="https://linkdelgado.netlify.app/"
          title="Link Delgado"
          description="Portal principal de servicios digitales"
        />
      </div>

    </div>
  )
}
