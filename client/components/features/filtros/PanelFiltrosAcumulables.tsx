'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter, Plus } from 'lucide-react';
import type { FiltroActivo, ConfiguracionFiltro } from '@/types/filtros.types';

interface PanelFiltrosAcumulablesProps {
  filtrosActivos: FiltroActivo[];
  onAgregarFiltro: (filtro: FiltroActivo) => void;
  onEliminarFiltro: (id: string) => void;
  onLimpiarTodos: () => void;
  configuracionFiltros: ConfiguracionFiltro[];
}

export function PanelFiltrosAcumulables({
  filtrosActivos,
  onAgregarFiltro,
  onEliminarFiltro,
  onLimpiarTodos,
  configuracionFiltros
}: PanelFiltrosAcumulablesProps) {
  const [tipoFiltroSeleccionado, setTipoFiltroSeleccionado] = useState<string>('');
  const [valorFiltro, setValorFiltro] = useState<string>('');

  const configuracionSeleccionada = configuracionFiltros.find(
    c => c.tipo === tipoFiltroSeleccionado
  );

  const handleAgregarFiltro = () => {
    if (!tipoFiltroSeleccionado || !valorFiltro) return;

    const config = configuracionSeleccionada;
    if (!config) return;

    const nuevoFiltro: FiltroActivo = {
      id: `${tipoFiltroSeleccionado}-${Date.now()}`,
      tipo: config.tipo as any,
      label: config.label,
      valor: valorFiltro
    };

    onAgregarFiltro(nuevoFiltro);
    setTipoFiltroSeleccionado('');
    setValorFiltro('');
  };

  const obtenerLabelValor = (filtro: FiltroActivo): string => {
    const config = configuracionFiltros.find(c => c.tipo === filtro.tipo);
    if (config?.opciones) {
      const opcion = config.opciones.find(o => o.valor === filtro.valor);
      return opcion?.label || filtro.valor;
    }
    return filtro.valor;
  };

  return (
    <div className="space-y-4 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Selector de filtros */}
      <div className="space-y-3">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Tipo de filtro
            </label>
            <Select value={tipoFiltroSeleccionado} onValueChange={setTipoFiltroSeleccionado}>
              <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
                <SelectValue placeholder="Selecciona un filtro" />
              </SelectTrigger>
              <SelectContent>
                {configuracionFiltros.map(config => (
                  <SelectItem key={config.tipo} value={config.tipo}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input o Select para el valor */}
          {tipoFiltroSeleccionado && (
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-semibold text-gray-900 mb-2 block">
                Valor
              </label>
              {configuracionSeleccionada?.esInput ? (
                <Input
                  placeholder={configuracionSeleccionada.placeholder}
                  value={valorFiltro}
                  onChange={(e) => setValorFiltro(e.target.value)}
                  className="bg-gray-50 border-gray-300 text-gray-900 rounded-xl placeholder:text-gray-500 hover:bg-gray-100 transition-colors"
                />
              ) : (
                <Select value={valorFiltro} onValueChange={setValorFiltro}>
                  <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
                    <SelectValue placeholder={configuracionSeleccionada?.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {configuracionSeleccionada?.opciones?.map(opcion => (
                      <SelectItem key={opcion.valor} value={opcion.valor}>
                        {opcion.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <Button
            onClick={handleAgregarFiltro}
            disabled={!tipoFiltroSeleccionado || !valorFiltro}
            className="gap-2 bg-[#FCBA00] hover:bg-[#e0a800] text-gray-900 font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </div>
      </div>

      {/* Filtros activos */}
      {filtrosActivos.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Filter className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Filtros activos ({filtrosActivos.length})
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {filtrosActivos.map(filtro => (
              <div
                key={filtro.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">
                  {filtro.label}:
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {obtenerLabelValor(filtro)}
                </span>
                <button
                  onClick={() => onEliminarFiltro(filtro.id)}
                  className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                  title="Eliminar filtro"
                >
                  <X className="h-3.5 w-3.5 text-blue-600" />
                </button>
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLimpiarTodos}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium rounded-lg transition-colors"
          >
            Limpiar todos los filtros
          </Button>
        </div>
      )}
    </div>
  );
}
