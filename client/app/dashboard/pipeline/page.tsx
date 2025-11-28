"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import useFiltrosPipeline from "@/hooks/useFiltrosPipeline"
import { FiltrosPipeline, TablaPipeline, PipelineKanban } from "@/components/features/opportunities"
import { BarChart3, TrendingUp, DollarSign, Percent, Download, LayoutGrid, List } from "lucide-react"
import { ErrorDisplay } from "@/components/ErrorDisplay"
import type { FiltrosAvanzados } from "@/components/features/opportunities/FiltrosPipeline"

export default function PaginaPipeline() {
  const { toast } = useToast()
  const router = useRouter()
  const [vista, setVista] = useState<'tabla' | 'kanban'>('kanban')
  
  const {
    filtros,
    oportunidades,
    estadisticas,
    cargando,
    error,
    total,
    totalPaginas,
    aplicarFiltros,
    cambiarPagina,
    exportarACSV
  } = useFiltrosPipeline()

  // Cargar datos iniciales cuando el componente se monta
  useEffect(() => {
    aplicarFiltros({
      limite: 20,
      pagina: 1
    })
  }, [])


  const handleEditar = (oportunidad: any) => {
    console.log('Editar:', oportunidad)
  }

  const handleEliminar = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta oportunidad?')) {
      console.log('Eliminar:', id)
    }
  }

  const handleVer = (oportunidad: any) => {
    console.log('Ver detalles:', oportunidad)
  }

  // Mostrar pantalla de carga mientras se cargan los datos
  if (cargando && (!oportunidades || oportunidades.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Pipeline de Oportunidades
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestiona y filtra tus oportunidades de venta con filtros avanzados
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setVista('kanban')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  vista === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <LayoutGrid size={18} />
                Kanban
              </button>
              <button
                onClick={() => setVista('tabla')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  vista === 'tabla'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <List size={18} />
                Tabla
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Total de Oportunidades */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Total Oportunidades
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {estadisticas.total}
                  </p>
                </div>
                <BarChart3 size={32} className="text-blue-500 opacity-20" />
              </div>
            </div>

            {/* Valor Total */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Valor Total
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0
                    }).format(estadisticas.valorTotal)}
                  </p>
                </div>
                <DollarSign size={32} className="text-green-500 opacity-20" />
              </div>
            </div>

            {/* Probabilidad Promedio */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Probabilidad Promedio
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {estadisticas.probabilidadPromedio.toFixed(1)}%
                  </p>
                </div>
                <Percent size={32} className="text-amber-500 opacity-20" />
              </div>
            </div>

            {/* Oportunidades Ganadas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Ganadas
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {estadisticas.porEtapa.find((e: any) => e.etapa === 'CIERRE_GANADO')?.cantidad || 0}
                  </p>
                </div>
                <TrendingUp size={32} className="text-purple-500 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Vista Kanban */}
        {vista === 'kanban' && (
          <>
            {/* Filtros */}
            <div className="mb-6">
              <FiltrosPipeline
                onAplicar={aplicarFiltros}
                cargando={cargando}
              />
            </div>

            {/* Kanban Board */}
            <div className="mb-6">
              <PipelineKanban
                columnas={[
                  {
                    id: 'CONTACTO_INICIAL',
                    titulo: 'Contacto Inicial',
                    color: 'bg-blue-500',
                    tarjetas: oportunidades?.filter(o => o.etapa === 'CONTACTO_INICIAL').map(o => ({
                      id: o.id,
                      titulo: o.titulo,
                      valor: o.valor,
                      cliente: o.cliente?.nombre,
                      probabilidad: o.probabilidad
                    })) || []
                  },
                  {
                    id: 'AGENDAMIENTO',
                    titulo: 'Agendamiento',
                    color: 'bg-purple-500',
                    tarjetas: oportunidades?.filter(o => o.etapa === 'AGENDAMIENTO').map(o => ({
                      id: o.id,
                      titulo: o.titulo,
                      valor: o.valor,
                      cliente: o.cliente?.nombre,
                      probabilidad: o.probabilidad
                    })) || []
                  },
                  {
                    id: 'SEPARACION',
                    titulo: 'Separación',
                    color: 'bg-yellow-500',
                    tarjetas: oportunidades?.filter(o => o.etapa === 'SEPARACION').map(o => ({
                      id: o.id,
                      titulo: o.titulo,
                      valor: o.valor,
                      cliente: o.cliente?.nombre,
                      probabilidad: o.probabilidad
                    })) || []
                  },
                  {
                    id: 'CIERRE_GANADO',
                    titulo: 'Cierre Ganado',
                    color: 'bg-green-500',
                    tarjetas: oportunidades?.filter(o => o.etapa === 'CIERRE_GANADO').map(o => ({
                      id: o.id,
                      titulo: o.titulo,
                      valor: o.valor,
                      cliente: o.cliente?.nombre,
                      probabilidad: o.probabilidad
                    })) || []
                  },
                  {
                    id: 'CIERRE_PERDIDO',
                    titulo: 'Cierre Perdido',
                    color: 'bg-red-500',
                    tarjetas: oportunidades?.filter(o => o.etapa === 'CIERRE_PERDIDO').map(o => ({
                      id: o.id,
                      titulo: o.titulo,
                      valor: o.valor,
                      cliente: o.cliente?.nombre,
                      probabilidad: o.probabilidad
                    })) || []
                  },
                ]}
                onMoverTarjeta={(tarjetaId, columnaDesde, columnHasta) => {
                  console.log(`Mover ${tarjetaId} de ${columnaDesde} a ${columnHasta}`);
                  // Aquí iría la lógica para actualizar la etapa en el servidor
                }}
                onEliminarTarjeta={(tarjetaId) => {
                  console.log(`Eliminar ${tarjetaId}`);
                  // Aquí iría la lógica para eliminar en el servidor
                }}
              />
            </div>
          </>
        )}

        {/* Vista Tabla */}
        {vista === 'tabla' && (
          <>
            {/* Filtros */}
            <div className="mb-6">
              <FiltrosPipeline
                onAplicar={aplicarFiltros}
                cargando={cargando}
              />
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
                <p className="font-medium">Error al cargar datos</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Tabla de Oportunidades */}
            <div className="mb-6">
              <TablaPipeline
                oportunidades={oportunidades}
                total={total}
                pagina={filtros.pagina || 1}
                totalPaginas={totalPaginas}
                cargando={cargando}
                onPaginaChange={cambiarPagina}
                onEditar={handleEditar}
                onEliminar={handleEliminar}
                onVer={handleVer}
              />
            </div>

            {/* Botón de Exportación */}
            {oportunidades && oportunidades.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={exportarACSV}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-md"
                >
                  <Download size={18} />
                  Exportar a CSV
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <ErrorDisplay />
    </div>
  )
}
