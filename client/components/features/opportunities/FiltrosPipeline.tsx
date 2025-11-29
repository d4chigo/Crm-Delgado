import React, { useState, useCallback, useEffect } from 'react';
import {
  ChevronDown,
  X,
  Filter,
  RotateCcw,
  Download,
  Calendar,
  DollarSign,
  Percent,
  Tag,
  Search,
  Layers
} from 'lucide-react';
import { STAGE_LABELS, STAGE_COLORS, STAGES_ORDER } from '@/lib/pipeline-stages';
import { etiquetaService } from '@/services/api/etiqueta.service';
import type { Etiqueta } from '@/types/etiqueta.types';

interface FiltrosPipelineProps {
  onFiltrosChange?: (filtros: FiltrosAvanzados) => void;
  onAplicar?: (filtros: FiltrosAvanzados) => void;
  cargando?: boolean;
}

export interface FiltrosAvanzados {
  etapas?: string[];
  estados?: string[];
  etiquetas?: string[];
  fechaInicio?: string;
  fechaFin?: string;
  mes?: number;
  anio?: number;
  proyecto?: string;
  busqueda?: string;
  probabilidadMin?: number;
  probabilidadMax?: number;
  valorMin?: number;
  valorMax?: number;
  pagina?: number;
  limite?: number;
}

const ESTADOS_LEAD = ['NUEVO', 'CONTACTADO', 'CONVERTIDO', 'DESCALIFICADO'];

/**
 * Componente de Filtros Avanzados estilo Excel para el Pipeline
 * Permite filtrar oportunidades por múltiples criterios
 */
export const FiltrosPipeline: React.FC<FiltrosPipelineProps> = ({
  onFiltrosChange,
  onAplicar,
  cargando = false
}) => {
  const [filtros, setFiltros] = useState<FiltrosAvanzados>({
    limite: 20,
    pagina: 1
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [etapasSeleccionadas, setEtapasSeleccionadas] = useState<string[]>([]);
  const [estadosSeleccionados, setEstadosSeleccionados] = useState<string[]>([]);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [cargandoEtiquetas, setCargandoEtiquetas] = useState(true);

  // Cargar etiquetas de la BD
  useEffect(() => {
    const cargarEtiquetas = async () => {
      try {
        setCargandoEtiquetas(true);
        const etiquetasObtenidas = await etiquetaService.obtenerTodas();
        if (Array.isArray(etiquetasObtenidas)) {
          setEtiquetas(etiquetasObtenidas);
        }
      } catch (error) {
        console.error('Error al cargar etiquetas:', error);
        setEtiquetas([]);
      } finally {
        setCargandoEtiquetas(false);
      }
    };

    cargarEtiquetas();
  }, []);

  // Actualizar filtros cuando cambian
  const actualizarFiltros = useCallback((nuevosFiltros: FiltrosAvanzados) => {
    setFiltros(nuevosFiltros);
    onFiltrosChange?.(nuevosFiltros);
  }, [onFiltrosChange]);

  // Manejar cambios en etapas
  const toggleEtapa = (etapa: string) => {
    const nuevasEtapas = etapasSeleccionadas.includes(etapa)
      ? etapasSeleccionadas.filter(e => e !== etapa)
      : [...etapasSeleccionadas, etapa];
    
    setEtapasSeleccionadas(nuevasEtapas);
    actualizarFiltros({ ...filtros, etapas: nuevasEtapas.length > 0 ? nuevasEtapas : undefined });
  };

  // Manejar cambios en estados
  const toggleEstado = (estado: string) => {
    const nuevosEstados = estadosSeleccionados.includes(estado)
      ? estadosSeleccionados.filter(e => e !== estado)
      : [...estadosSeleccionados, estado];
    
    setEstadosSeleccionados(nuevosEstados);
    actualizarFiltros({ ...filtros, estados: nuevosEstados.length > 0 ? nuevosEstados : undefined });
  };

  // Manejar cambios en etiquetas
  const toggleEtiqueta = (etiqueta: string) => {
    const nuevasEtiquetas = etiquetasSeleccionadas.includes(etiqueta)
      ? etiquetasSeleccionadas.filter(e => e !== etiqueta)
      : [...etiquetasSeleccionadas, etiqueta];
    
    setEtiquetasSeleccionadas(nuevasEtiquetas);
    actualizarFiltros({ ...filtros, etiquetas: nuevasEtiquetas.length > 0 ? nuevasEtiquetas : undefined });
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltros({ limite: 20, pagina: 1 });
    setEtapasSeleccionadas([]);
    setEstadosSeleccionados([]);
    setEtiquetasSeleccionadas([]);
    onFiltrosChange?.({ limite: 20, pagina: 1 });
  };

  // Contar filtros activos
  const contarFiltrosActivos = () => {
    let count = 0;
    if (etapasSeleccionadas.length > 0) count++;
    if (estadosSeleccionados.length > 0) count++;
    if (etiquetasSeleccionadas.length > 0) count++;
    if (filtros.busqueda) count++;
    if (filtros.mes || filtros.anio) count++;
    if (filtros.proyecto) count++;
    if (filtros.probabilidadMin || filtros.probabilidadMax) count++;
    if (filtros.valorMin || filtros.valorMax) count++;
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      {/* Barra de Filtros */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-4">
          {/* Botón de Filtros */}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              mostrarFiltros
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter size={18} />
            <span>Filtros</span>
            {filtrosActivos > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                {filtrosActivos}
              </span>
            )}
            <ChevronDown size={16} className={`transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
          </button>

          {/* Búsqueda Rápida */}
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={filtros.busqueda || ''}
                onChange={(e) => actualizarFiltros({ ...filtros, busqueda: e.target.value || undefined })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2">
            {filtrosActivos > 0 && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Limpiar filtros"
              >
                <RotateCcw size={16} />
              </button>
            )}
            <button
              onClick={() => onAplicar?.(filtros)}
              disabled={cargando}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? (
                <>
                  <div className="animate-spin">⏳</div>
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Aplicar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Filtros Expandible */}
      {mostrarFiltros && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Filtro de Etapas */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Layers size={16} />
                Etapas
              </label>
              <div className="space-y-2">
                {STAGES_ORDER.map((etapa) => (
                  <label key={etapa} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={etapasSeleccionadas.includes(etapa)}
                      onChange={() => toggleEtapa(etapa)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: STAGE_COLORS[etapa] }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {STAGE_LABELS[etapa]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro de Estados */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Tag size={16} />
                Estados
              </label>
              <div className="space-y-2">
                {ESTADOS_LEAD.map((estado) => (
                  <label key={estado} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={estadosSeleccionados.includes(estado)}
                      onChange={() => toggleEstado(estado)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{estado}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro de Etiquetas */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Tag size={16} />
                Etiquetas
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cargandoEtiquetas ? (
                  <p className="text-sm text-gray-500">Cargando etiquetas...</p>
                ) : etiquetas.length > 0 ? (
                  etiquetas.map((etiqueta: Etiqueta) => (
                    <label key={etiqueta.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={etiquetasSeleccionadas.includes(etiqueta.id)}
                        onChange={() => toggleEtiqueta(etiqueta.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: etiqueta.color }} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{etiqueta.nombre}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No hay etiquetas disponibles</p>
                )}
              </div>
            </div>

            {/* Filtro de Fechas */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Calendar size={16} />
                Período
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Mes</label>
                  <select
                    value={filtros.mes || ''}
                    onChange={(e) => actualizarFiltros({ ...filtros, mes: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2025, i).toLocaleString('es-ES', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Año</label>
                  <select
                    value={filtros.anio || ''}
                    onChange={(e) => actualizarFiltros({ ...filtros, anio: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    {Array.from({ length: 11 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Filtro de Probabilidad */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Percent size={16} />
                Probabilidad (%)
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Mínima</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filtros.probabilidadMin || ''}
                    onChange={(e) => actualizarFiltros({ ...filtros, probabilidadMin: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Máxima</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filtros.probabilidadMax || ''}
                    onChange={(e) => actualizarFiltros({ ...filtros, probabilidadMax: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Filtro de Valor */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <DollarSign size={16} />
                Valor
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Mínimo</label>
                  <input
                    type="number"
                    value={filtros.valorMin || ''}
                    onChange={(e) => actualizarFiltros({ ...filtros, valorMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Máximo</label>
                  <input
                    type="number"
                    value={filtros.valorMax || ''}
                    onChange={(e) => actualizarFiltros({ ...filtros, valorMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="999999"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Filtro de Proyecto */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Layers size={16} />
                Proyecto
              </label>
              <input
                type="text"
                value={filtros.proyecto || ''}
                onChange={(e) => actualizarFiltros({ ...filtros, proyecto: e.target.value || undefined })}
                placeholder="Nombre del proyecto..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botones de Acción del Panel */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={() => setMostrarFiltros(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Limpiar Todo
            </button>
            <button
              onClick={() => {
                onAplicar?.(filtros);
                setMostrarFiltros(false);
              }}
              disabled={cargando}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrosPipeline;
