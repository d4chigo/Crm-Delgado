"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Calendar } from 'lucide-react'

interface ForecastData {
  totalEsperado: number
  mensual: Array<{
    mes: number
    valor: number
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

        const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/reports/forecast`, {
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

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Ingresos Esperados (Forecast)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#FCBA00]">
            {formatCurrency(data.totalEsperado)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total esperado basado en probabilidades
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Forecast Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.mensual && data.mensual.length > 0 ? (
              data.mensual.map((item) => (
                <div key={item.mes} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{meses[item.mes - 1]}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#FCBA00]">
                      {formatCurrency(item.valor)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Sin datos de forecast mensual
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
