"use client"

import { useState } from 'react'
import { PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReporteForecast, ReporteCuelloBotella } from '@/components/features/reportes'
import { TrendingUp, AlertCircle, BarChart3 } from 'lucide-react'

export default function PaginaReportes() {
  const [activeTab, setActiveTab] = useState('forecast')

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reportes Avanzados" 
        description="Análisis financiero y de eficiencia del pipeline de ventas"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Previsión Financiera
          </TabsTrigger>
          <TabsTrigger value="cuello-botella" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Cuello de Botella
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-6">
          <Card className="border-[#FCBA00] bg-gradient-to-r from-yellow-50 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#FCBA00]" />
                Reporte de Previsión Financiera (Forecast)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Este reporte muestra los ingresos esperados en los próximos 30, 60 y 90 días basado en:
              </p>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex gap-2">
                  <span className="text-[#FCBA00]">✓</span>
                  <span>Valor de cada oportunidad en el pipeline</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#FCBA00]">✓</span>
                  <span>Probabilidad de cierre según la etapa</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#FCBA00]">✓</span>
                  <span>Distribución temporal estimada</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground italic">
                Fórmula: Forecast = SUMA (Valor de Oportunidad × Probabilidad de Etapa)
              </p>
            </CardContent>
          </Card>

          <ReporteForecast />
        </TabsContent>

        <TabsContent value="cuello-botella" className="space-y-6">
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Reporte de Velocidad y Eficiencia (Cuello de Botella)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Este reporte identifica dónde se atascan las oportunidades en el pipeline:
              </p>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex gap-2">
                  <span className="text-red-600">✓</span>
                  <span>Tiempo promedio de permanencia por etapa</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">✓</span>
                  <span>Identificación automática de cuellos de botella (>15 días)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">✓</span>
                  <span>Severidad: NORMAL, ALTO (15-30 días), CRÍTICO (>30 días)</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground italic">
                Ayuda a optimizar procesos y acelerar el cierre de ventas
              </p>
            </CardContent>
          </Card>

          <ReporteCuelloBotella />
        </TabsContent>
      </Tabs>

      {/* Información General */}
      <Card>
        <CardHeader>
          <CardTitle>Cómo usar estos reportes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">📊 Previsión Financiera</h4>
            <p className="text-sm text-muted-foreground">
              Usa este reporte para planificación financiera. Muestra cuánto dinero esperas cerrar en los próximos 30, 60 y 90 días. Perfecto para presentaciones a la gerencia y planificación de recursos.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">⚠️ Cuello de Botella</h4>
            <p className="text-sm text-muted-foreground">
              Usa este reporte para identificar etapas lentas. Si una etapa tiene severidad CRÍTICO, significa que las oportunidades se quedan ahí más de 30 días. Esto requiere atención inmediata para optimizar procesos.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🎯 Acciones Recomendadas</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Revisa los reportes semanalmente</li>
              <li>• Prioriza las etapas con severidad CRÍTICO</li>
              <li>• Compara el forecast con tus objetivos de ingresos</li>
              <li>• Asigna más recursos a cuellos de botella</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
