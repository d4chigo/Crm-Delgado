"use client"

import React, { useState, useCallback, useEffect } from 'react';
import {
  ChevronDown,
  X,
  Filter,
  RotateCcw,
  Calendar,
  DollarSign,
  Percent,
  Tag,
  Search,
  MapPin,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { etiquetaService } from '@/services/api/etiqueta.service';
import type { Etiqueta } from '@/types/etiqueta.types';

export interface FiltrosLeadsAvanzados {
  busqueda?: string;
  estado?: string[];
  fuente?: string[];
  fechaInicio?: string;
  fechaFin?: string;
  ciudad?: string;
  empresa?: string;
  telefono?: string;
  correo?: string;
  etiquetas?: string[];
  probabilidadMin?: number;
  probabilidadMax?: number;
  valorMin?: number;
  valorMax?: number;
  ordenarPor?: 'reciente' | 'nombre' | 'valor' | 'probabilidad';
  pagina?: number;
  limite?: number;
}

interface FiltrosLeadsAvanzadosProps {
  onAplicar?: (filtros: FiltrosLeadsAvanzados) => void;
  cargando?: boolean;
}

const ESTADOS_LEAD = ['NUEVO', 'CONTACTADO', 'CALIFICADO', 'DESCALIFICADO', 'CONVERTIDO'];
const FUENTES_LEAD = ['TikTok', 'YouTube', 'Instagram', 'Facebook', 'Recomendación'];

/**
 * Componente de Filtros Avanzados Profesional para Leads
 * Permite filtrar leads por múltiples criterios con interfaz moderna
 */
export const FiltrosLeadsAvanzados: React.FC<FiltrosLeadsAvanzadosProps> = ({
  onAplicar,
  cargando = false
}) => {
  const [filtros, setFiltros] = useState<FiltrosLeadsAvanzados>({
    limite: 20,
    pagina: 1,
    ordenarPor: 'reciente'
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [estadosSeleccionados, setEstadosSeleccionados] = useState<string[]>([]);
  const [fuentesSeleccionadas, setFuentesSeleccionadas] = useState<string[]>([]);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([]);
  const [mostrarAvanzados, setMostrarAvanzados] = useState(false);
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

  // Contar filtros activos
  const filtrosActivos = Object.values(filtros).filter(v => v && v !== 20 && v !== 1 && v !== 'reciente').length;

  // Manejar búsqueda
  const handleBusqueda = (valor: string) => {
    setFiltros({ ...filtros, busqueda: valor || undefined, pagina: 1 });
  };

  // Toggle estado
  const toggleEstado = (estado: string) => {
    const nuevos = estadosSeleccionados.includes(estado)
      ? estadosSeleccionados.filter(e => e !== estado)
      : [...estadosSeleccionados, estado];
    setEstadosSeleccionados(nuevos);
    setFiltros({ ...filtros, estado: nuevos.length > 0 ? nuevos : undefined, pagina: 1 });
  };

  // Toggle fuente
  const toggleFuente = (fuente: string) => {
    const nuevas = fuentesSeleccionadas.includes(fuente)
      ? fuentesSeleccionadas.filter(f => f !== fuente)
      : [...fuentesSeleccionadas, fuente];
    setFuentesSeleccionadas(nuevas);
    setFiltros({ ...filtros, fuente: nuevas.length > 0 ? nuevas : undefined, pagina: 1 });
  };

  // Toggle etiqueta
  const toggleEtiqueta = (etiqueta: string) => {
    const nuevas = etiquetasSeleccionadas.includes(etiqueta)
      ? etiquetasSeleccionadas.filter(e => e !== etiqueta)
      : [...etiquetasSeleccionadas, etiqueta];
    setEtiquetasSeleccionadas(nuevas);
    setFiltros({ ...filtros, etiquetas: nuevas.length > 0 ? nuevas : undefined, pagina: 1 });
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({ limite: 20, pagina: 1, ordenarPor: 'reciente' });
    setEstadosSeleccionados([]);
    setFuentesSeleccionadas([]);
    setEtiquetasSeleccionadas([]);
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    onAplicar?.(filtros);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filtros Avanzados</h2>
          {filtrosActivos > 0 && (
            <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
              {filtrosActivos} activos
            </span>
          )}
        </div>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronDown size={20} className={`transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {mostrarFiltros && (
        <>
          {/* Búsqueda Principal */}
          <div className="mb-6">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo, teléfono..."
                value={filtros.busqueda || ''}
                onChange={(e) => handleBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtros Básicos - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Estados */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {ESTADOS_LEAD.map((estado) => (
                  <label key={estado} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={estadosSeleccionados.includes(estado)}
                      onChange={() => toggleEstado(estado)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{estado}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fuentes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Fuente
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {FUENTES_LEAD.map((fuente) => (
                  <label key={fuente} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fuentesSeleccionadas.includes(fuente)}
                      onChange={() => toggleFuente(fuente)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {fuente.replace(/_/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Etiquetas */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
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

            {/* Ordenar Por */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ordenar Por
              </label>
              <select
                value={filtros.ordenarPor || 'reciente'}
                onChange={(e) => setFiltros({ ...filtros, ordenarPor: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="reciente">Más Recientes</option>
                <option value="nombre">Nombre (A-Z)</option>
                <option value="valor">Valor (Mayor)</option>
                <option value="probabilidad">Probabilidad (Mayor)</option>
              </select>
            </div>
          </div>

          {/* Filtros Avanzados */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
            <button
              onClick={() => setMostrarAvanzados(!mostrarAvanzados)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <TrendingUp size={16} />
              Filtros Avanzados
              <ChevronDown size={16} className={`transition-transform ${mostrarAvanzados ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {mostrarAvanzados && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {/* Fecha Inicio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar size={14} className="inline mr-1" />
                  Desde
                </label>
                <input
                  type="date"
                  value={filtros.fechaInicio || ''}
                  onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar size={14} className="inline mr-1" />
                  Hasta
                </label>
                <input
                  type="date"
                  value={filtros.fechaFin || ''}
                  onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin size={14} className="inline mr-1" />
                  Ciudad
                </label>
                <input
                  type="text"
                  placeholder="Ej: Bogotá"
                  value={filtros.ciudad || ''}
                  onChange={(e) => setFiltros({ ...filtros, ciudad: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Building2 size={14} className="inline mr-1" />
                  Empresa
                </label>
                <input
                  type="text"
                  placeholder="Nombre de empresa"
                  value={filtros.empresa || ''}
                  onChange={(e) => setFiltros({ ...filtros, empresa: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Phone size={14} className="inline mr-1" />
                  Teléfono
                </label>
                <input
                  type="text"
                  placeholder="Ej: 3001234567"
                  value={filtros.telefono || ''}
                  onChange={(e) => setFiltros({ ...filtros, telefono: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Mail size={14} className="inline mr-1" />
                  Correo
                </label>
                <input
                  type="email"
                  placeholder="Ej: usuario@email.com"
                  value={filtros.correo || ''}
                  onChange={(e) => setFiltros({ ...filtros, correo: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Valor Mínimo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign size={14} className="inline mr-1" />
                  Valor Mínimo
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filtros.valorMin || ''}
                  onChange={(e) => setFiltros({ ...filtros, valorMin: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Valor Máximo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign size={14} className="inline mr-1" />
                  Valor Máximo
                </label>
                <input
                  type="number"
                  placeholder="999999"
                  value={filtros.valorMax || ''}
                  onChange={(e) => setFiltros({ ...filtros, valorMax: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Probabilidad Mínima */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Percent size={14} className="inline mr-1" />
                  Probabilidad Mín (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={filtros.probabilidadMin || ''}
                  onChange={(e) => setFiltros({ ...filtros, probabilidadMin: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Probabilidad Máxima */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Percent size={14} className="inline mr-1" />
                  Probabilidad Máx (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={filtros.probabilidadMax || ''}
                  onChange={(e) => setFiltros({ ...filtros, probabilidadMax: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Limpiar Filtros
            </button>
            <button
              onClick={aplicarFiltros}
              disabled={cargando}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
            >
              <Filter size={16} />
              {cargando ? 'Aplicando...' : 'Aplicar Filtros'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FiltrosLeadsAvanzados;
