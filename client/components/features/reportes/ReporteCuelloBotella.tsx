"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface Etapa {
  etapa: string
  tiempoPromedioDias: number
  oportunidades: number
  esCuelloBotella: boolean
  severidad: 'NORMAL' | 'ALTO' | 'CRÍTICO'
}

interface CuelloBotellasData {
  etapas: Etapa[]
  cuellosBotella: Etapa[]
  resumen: {
    totalEtapas: number
    etapasConCuelloBotella: number
    tiempoPromedioGlobal: number
  }
}

export function ReporteCuelloBotella() {
  const [data, setData] = useState<CuelloBotellasData | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem('crm_token')
        if (!token) throw new Error('No autenticado')

        const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/reports/cuello-botella`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!respuesta.ok) throw new Error('Error al cargar reporte')

        const resultado = await respuesta.json()
        setData(resultado.datos)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [])

  if (cargando) return <div className="text-center py-8">Cargando...</div>
  if (error) return <div className="text-red-600 py-8">{error}</div>
  if (!data) return <div className="text-center py-8">Sin datos</div>

  const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
      case 'CRÍTICO':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'ALTO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-green-100 text-green-800 border-green-300'
    }
  }

  const getSeveridadIcon = (severidad: string) => {
    switch (severidad) {
      case 'CRÍTICO':
        return <AlertCircle className="h-4 w-4" />
      case 'ALTO':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Etapas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.resumen.totalEtapas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cuellos de Botella
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${data.resumen.etapasConCuelloBotella > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {data.resumen.etapasConCuelloBotella}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tiempo Promedio Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#FCBA00]">
              {data.resumen.tiempoPromedioGlobal.toFixed(1)} días
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Cuellos de Botella */}
      {data.cuellosBotella.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              ⚠️ Cuellos de Botella Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.cuellosBotella.map((cuello) => (
                <div key={cuello.etapa} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                  <div>
                    <h4 className="font-semibold text-red-900">{cuello.etapa}</h4>
                    <p className="text-sm text-red-700">
                      {cuello.tiempoPromedioDias.toFixed(1)} días promedio ({cuello.oportunidades} oportunidades)
                    </p>
                  </div>
                  <Badge className={`${getSeveridadColor(cuello.severidad)}`}>
                    {cuello.severidad}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todas las Etapas */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis por Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.etapas.map((etapa) => (
              <div
                key={etapa.etapa}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  etapa.esCuelloBotella ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">
                    {getSeveridadIcon(etapa.severidad)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{etapa.etapa}</h4>
                    <p className="text-sm text-muted-foreground">
                      {etapa.oportunidades} oportunidades en esta etapa
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {etapa.tiempoPromedioDias.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">días promedio</p>

                  {etapa.esCuelloBotella && (
                    <Badge className={`mt-2 ${getSeveridadColor(etapa.severidad)}`}>
                      {etapa.severidad}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-[#FCBA00]">•</span>
              <span>
                Enfócate en las etapas con severidad CRÍTICO (más de 30 días) para optimizar el pipeline
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#FCBA00]">•</span>
              <span>
                Revisa los procesos en etapas con severidad ALTO (15-30 días) para identificar mejoras
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#FCBA00]">•</span>
              <span>
                El tiempo promedio global es de {data.resumen.tiempoPromedioGlobal.toFixed(1)} días
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#FCBA00]">•</span>
              <span>
                Asigna más recursos a las etapas con cuellos de botella para acelerar el cierre
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
