import { useState, useCallback, useMemo } from 'react';
import type { FiltroActivo } from '@/types/filtros.types';

interface UseFiltrosAcumulablesProps {
  datos: any[];
  mapeoFiltros?: {
    [key: string]: (item: any, valor: string) => boolean;
  };
}

export function useFiltrosAcumulables({ datos, mapeoFiltros = {} }: UseFiltrosAcumulablesProps) {
  const [filtrosActivos, setFiltrosActivos] = useState<FiltroActivo[]>([]);
  const [busqueda, setBusqueda] = useState('');

  const agregarFiltro = useCallback((filtro: FiltroActivo) => {
    setFiltrosActivos(prev => [...prev, filtro]);
  }, []);

  const eliminarFiltro = useCallback((id: string) => {
    setFiltrosActivos(prev => prev.filter(f => f.id !== id));
  }, []);

  const limpiarTodos = useCallback(() => {
    setFiltrosActivos([]);
    setBusqueda('');
  }, []);

  // Aplicar filtros a los datos
  const datosFiltrados = useMemo(() => {
    let resultado = datos;

    // Aplicar filtros acumulables
    if (filtrosActivos.length > 0) {
      resultado = resultado.filter(item => {
        return filtrosActivos.every(filtro => {
          const funcionFiltro = mapeoFiltros[filtro.tipo];
          if (!funcionFiltro) return true;
          return funcionFiltro(item, filtro.valor);
        });
      });
    }

    return resultado;
  }, [datos, filtrosActivos, mapeoFiltros]);

  return {
    filtrosActivos,
    busqueda,
    datosFiltrados,
    agregarFiltro,
    eliminarFiltro,
    limpiarTodos,
    setBusqueda
  };
}
