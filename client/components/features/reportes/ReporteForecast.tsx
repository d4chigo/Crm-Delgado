"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Calendar } from 'lucide-react'

interface ForecastData {
  forecast30: number
  forecast60: number
  forecast90: number
  totalGeneral: number
  porEtapa: Array<{
    etapa: string
    forecast: number
    oportunidades: number
    promedioPorOportunidad: number
  }>
}

export function ReporteForecast() {
  const [data, setData] = useState<ForecastData | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem('crm_token')
        if (!token) throw new Error('No autenticado')

        const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/reports/forecast`, {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Próximos 30 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.forecast30)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((data.forecast30 / data.totalGeneral) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Próximos 60 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.forecast60)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((data.forecast60 / data.totalGeneral) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Próximos 90 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(data.forecast90)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((data.forecast90 / data.totalGeneral) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FCBA00]">
              {formatCurrency(data.totalGeneral)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ingresos esperados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forecast por Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.porEtapa.map((etapa) => (
              <div key={etapa.etapa} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{etapa.etapa}</h3>
                  <p className="text-sm text-muted-foreground">
                    {etapa.oportunidades} oportunidades
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#FCBA00]">
                    {formatCurrency(etapa.forecast)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Promedio: {formatCurrency(etapa.promedioPorOportunidad)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
