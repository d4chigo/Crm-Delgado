import React, { useEffect } from 'react';
import { FiltrosPipeline, TablaPipeline } from '@/components/features/opportunities';
import useFiltrosPipeline from '@/hooks/useFiltrosPipeline';
import { BarChart3, TrendingUp, DollarSign, Percent } from 'lucide-react';

/**
 * Página de Pipeline Avanzado con Filtros estilo Excel
 * Muestra oportunidades con filtros avanzados, estadísticas y tabla interactiva
 */
export const PipelineAvanzado: React.FC = () => {
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
  } = useFiltrosPipeline();

  // Cargar datos iniciales
  useEffect(() => {
    aplicarFiltros({
      limite: 20,
      pagina: 1
    });
  }, []);

  const handleEditar = (oportunidad: any) => {
    console.log('Editar:', oportunidad);
    // Implementar lógica de edición
  };

  const handleEliminar = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta oportunidad?')) {
      console.log('Eliminar:', id);
      // Implementar lógica de eliminación
    }
  };

  const handleVer = (oportunidad: any) => {
    console.log('Ver detalles:', oportunidad);
    // Implementar lógica de ver detalles
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pipeline de Oportunidades
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona y filtra tus oportunidades de venta con filtros avanzados
          </p>
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
                    {estadisticas.porEtapa.find(e => e.etapa === 'CIERRE_GANADO')?.cantidad || 0}
                  </p>
                </div>
                <TrendingUp size={32} className="text-purple-500 opacity-20" />
              </div>
            </div>
          </div>
        )}

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
        {oportunidades.length > 0 && (
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
      </div>
    </div>
  );
};

// Importar Download icon
import { Download } from 'lucide-react';

export default PipelineAvanzado;
