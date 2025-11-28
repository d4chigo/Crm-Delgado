import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Edit2,
  Trash2,
  Download,
  ArrowUpDown
} from 'lucide-react';
import { STAGE_LABELS, STAGE_COLORS } from '@/lib/pipeline-stages';

interface Oportunidad {
  id: string;
  titulo: string;
  etapa: string;
  valor?: number;
  probabilidad: number;
  proyecto?: string;
  proximaAccion?: string;
  creadoEn: string;
  cliente?: {
    nombre: string;
    apellido?: string;
    correo?: string;
    telefono?: string;
    empresa?: string;
    etiquetasRel?: Array<{
      etiqueta: {
        nombre: string;
        color?: string;
      };
    }>;
  };
}

interface TablaPipelineProps {
  oportunidades: Oportunidad[];
  total: number;
  pagina: number;
  totalPaginas: number;
  cargando?: boolean;
  onPaginaChange?: (pagina: number) => void;
  onEditar?: (oportunidad: Oportunidad) => void;
  onEliminar?: (id: string) => void;
  onVer?: (oportunidad: Oportunidad) => void;
}

type SortField = 'titulo' | 'etapa' | 'valor' | 'probabilidad' | 'creadoEn';
type SortOrder = 'asc' | 'desc';

/**
 * Tabla de Oportunidades del Pipeline con opciones de ordenamiento y acciones
 */
export const TablaPipeline: React.FC<TablaPipelineProps> = ({
  oportunidades,
  total,
  pagina,
  totalPaginas,
  cargando = false,
  onPaginaChange,
  onEditar,
  onEliminar,
  onVer
}) => {
  const [sortField, setSortField] = useState<SortField>('creadoEn');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="opacity-30" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatearValor = (valor?: number) => {
    if (!valor) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(valor);
  };

  if (cargando) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Cargando oportunidades...</p>
        </div>
      </div>
    );
  }

  if (!oportunidades || oportunidades.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No se encontraron oportunidades</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Intenta ajustar los filtros</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => toggleSort('titulo')}
                  className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Oportunidad
                  <SortIcon field="titulo" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => toggleSort('etapa')}
                  className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Etapa
                  <SortIcon field="etapa" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => toggleSort('valor')}
                  className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Valor
                  <SortIcon field="valor" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => toggleSort('probabilidad')}
                  className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Probabilidad
                  <SortIcon field="probabilidad" />
                </button>
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Cliente
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Etiquetas
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => toggleSort('creadoEn')}
                  className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Fecha
                  <SortIcon field="creadoEn" />
                </button>
              </th>
              <th className="px-6 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {oportunidades.map((opp, index) => (
              <tr
                key={opp.id}
                className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                }`}
              >
                {/* Título */}
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                    {opp.titulo}
                  </div>
                  {opp.proyecto && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {opp.proyecto}
                    </div>
                  )}
                </td>

                {/* Etapa */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: STAGE_COLORS[opp.etapa] }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {STAGE_LABELS[opp.etapa] || opp.etapa}
                    </span>
                  </div>
                </td>

                {/* Valor */}
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatearValor(opp.valor)}
                  </span>
                </td>

                {/* Probabilidad */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-xs">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${opp.probabilidad}%`,
                          backgroundColor: opp.probabilidad >= 75 ? '#10b981' : opp.probabilidad >= 50 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-fit">
                      {opp.probabilidad}%
                    </span>
                  </div>
                </td>

                {/* Cliente */}
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {opp.cliente?.nombre} {opp.cliente?.apellido}
                    </div>
                    {opp.cliente?.empresa && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {opp.cliente.empresa}
                      </div>
                    )}
                  </div>
                </td>

                {/* Etiquetas */}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {opp.cliente?.etiquetasRel && opp.cliente.etiquetasRel.length > 0 ? (
                      opp.cliente.etiquetasRel.slice(0, 2).map((rel, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs font-medium text-white rounded-full"
                          style={{
                            backgroundColor: rel.etiqueta.color || '#6b7280'
                          }}
                        >
                          {rel.etiqueta.nombre}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
                    )}
                    {opp.cliente?.etiquetasRel && opp.cliente.etiquetasRel.length > 2 && (
                      <span className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                        +{opp.cliente.etiquetasRel.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* Fecha */}
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {formatearFecha(opp.creadoEn)}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onVer?.(opp)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEditar?.(opp)}
                      className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onEliminar?.(opp.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pie de Página con Paginación */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando <span className="font-semibold">{(pagina - 1) * 20 + 1}</span> a{' '}
          <span className="font-semibold">
            {Math.min(pagina * 20, total)}
          </span>{' '}
          de <span className="font-semibold">{total}</span> oportunidades
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPaginaChange?.(pagina - 1)}
            disabled={pagina === 1}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPaginas > 5 && pagina > 3) {
                pageNum = pagina - 2 + i;
              }
              if (pageNum > totalPaginas) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPaginaChange?.(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pageNum === pagina
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPaginaChange?.(pagina + 1)}
            disabled={pagina === totalPaginas}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablaPipeline;
