'use client';

import { useState, useCallback } from 'react';
import { cotizacionService } from '@/services/api/cotizacion.service';
import type { 
  Cotizacion, 
  CrearCotizacionDTO,
  ActualizarCotizacionDTO,
  FiltrosCotizacion,
  EstadoCotizacion 
} from '@/types/cotizacion.types';

interface UseCotizacionesReturn {
  cotizaciones: Cotizacion[];
  cotizacionActual: Cotizacion | null;
  loading: boolean;
  error: string | null;
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
  cargar: (filtros?: FiltrosCotizacion) => Promise<void>;
  cargarPorContacto: (contactoId: string) => Promise<void>;
  cargarPorId: (id: string) => Promise<void>;
  crear: (datos: CrearCotizacionDTO) => Promise<Cotizacion>;
  actualizar: (id: string, datos: ActualizarCotizacionDTO) => Promise<Cotizacion>;
  cambiarEstado: (id: string, estado: EstadoCotizacion) => Promise<Cotizacion>;
  eliminar: (id: string) => Promise<void>;
  setCotizacionActual: (cotizacion: Cotizacion | null) => void;
  limpiarError: () => void;
}

export const useCotizaciones = (): UseCotizacionesReturn => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cotizacionActual, setCotizacionActual] = useState<Cotizacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
    totalPaginas: 0
  });

  /**
   * Cargar cotizaciones con filtros y paginación
   */
  const cargar = useCallback(async (filtros: FiltrosCotizacion = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cotizacionService.obtener(filtros);
      setCotizaciones(data.cotizaciones);
      setPaginacion(data.paginacion);
    } catch (err: any) {
      setError(err.message);
      console.error('Error al cargar cotizaciones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar todas las cotizaciones de un contacto específico
   */
  const cargarPorContacto = useCallback(async (contactoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cotizacionService.obtenerPorContacto(contactoId);
      setCotizaciones(data);
      setPaginacion({
        pagina: 1,
        limite: data.length,
        total: data.length,
        totalPaginas: 1
      });
    } catch (err: any) {
      setError(err.message);
      console.error('Error al cargar cotizaciones del contacto:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar una cotización específica por ID
   */
  const cargarPorId = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cotizacionService.obtenerPorId(id);
      setCotizacionActual(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error al cargar cotización:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear una nueva cotización
   */
  const crear = useCallback(async (datos: CrearCotizacionDTO): Promise<Cotizacion> => {
    setLoading(true);
    setError(null);
    try {
      const nueva = await cotizacionService.crear(datos);
      setCotizaciones(prev => [nueva, ...prev]);
      return nueva;
    } catch (err: any) {
      setError(err.message);
      console.error('Error al crear cotización:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar cotización existente (solo BORRADOR)
   */
  const actualizar = useCallback(async (
    id: string, 
    datos: ActualizarCotizacionDTO
  ): Promise<Cotizacion> => {
    setLoading(true);
    setError(null);
    try {
      const actualizada = await cotizacionService.actualizar(id, datos);
      setCotizaciones(prev => 
        prev.map(c => c.id === id ? actualizada : c)
      );
      if (cotizacionActual?.id === id) {
        setCotizacionActual(actualizada);
      }
      return actualizada;
    } catch (err: any) {
      setError(err.message);
      console.error('Error al actualizar cotización:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cotizacionActual]);

  /**
   * Cambiar estado de la cotización
   */
  const cambiarEstado = useCallback(async (
    id: string, 
    estado: EstadoCotizacion
  ): Promise<Cotizacion> => {
    setLoading(true);
    setError(null);
    try {
      const actualizada = await cotizacionService.cambiarEstado(id, estado);
      setCotizaciones(prev => 
        prev.map(c => c.id === id ? actualizada : c)
      );
      if (cotizacionActual?.id === id) {
        setCotizacionActual(actualizada);
      }
      return actualizada;
    } catch (err: any) {
      setError(err.message);
      console.error('Error al cambiar estado:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cotizacionActual]);

  /**
   * Eliminar cotización
   */
  const eliminar = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await cotizacionService.eliminar(id);
      setCotizaciones(prev => prev.filter(c => c.id !== id));
      if (cotizacionActual?.id === id) {
        setCotizacionActual(null);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error al eliminar cotización:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cotizacionActual]);

  /**
   * Limpiar mensaje de error
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    cotizaciones,
    cotizacionActual,
    loading,
    error,
    paginacion,
    cargar,
    cargarPorContacto,
    cargarPorId,
    crear,
    actualizar,
    cambiarEstado,
    eliminar,
    setCotizacionActual,
    limpiarError
  };
};
