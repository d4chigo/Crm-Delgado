'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { fetchAPI } from '@/services/api/config';

interface EstadisticasAlertas {
  total: number;
  activas: number;
  urgentes: number;
  completadas: number;
}

interface WidgetAlertasProps {
  usuarioId: string;
}

/**
 * Widget compacto de alertas para mostrar en el dashboard
 */
export const WidgetAlertas: React.FC<WidgetAlertasProps> = ({ usuarioId }) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasAlertas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener estadísticas de alertas
  const obtenerEstadisticas = async () => {
    try {
      console.log('🔍 WidgetAlertas: Obteniendo estadísticas para usuarioId:', usuarioId);
      setCargando(true);
      setError(null);
      
      // Usar fetchAPI que está configurado correctamente para hacer requests al backend
      const response = await fetchAPI<any>(`/alertas/estadisticas/${usuarioId}`);
      
      console.log('✅ Respuesta obtenida:', response);
      
      // La respuesta debería tener estructura: { exito: true, estadisticas: {...} }
      if (response && response.estadisticas) {
        setEstadisticas(response.estadisticas);
      } else {
        console.warn('⚠️ Respuesta no tiene estadisticas:', response);
        setEstadisticas(null);
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas:', error.message);
      setError(error.message);
      setEstadisticas(null);
    } finally {
      setCargando(false);
    }
  };

  // Generar alertas automáticamente
  const generarAlertas = async () => {
    try {
      console.log('⚡ Generando alertas manualmente...');
      setGenerando(true);
      setError(null);
      
      const data = await fetchAPI(
        `/alertas/generar`,
        { method: 'POST' }
      );
      
      console.log('✅ Alertas generadas:', data);
      
      // Recargar estadísticas después de generar
      await obtenerEstadisticas();
    } catch (error: any) {
      console.error('❌ Error generando alertas:', error.message);
      setError(error.message);
    } finally {
      setGenerando(false);
    }
  };

  useEffect(() => {
    // Validar que el usuarioId es válido (no es placeholder o temporal)
    // Los UUIDs tienen 36 caracteres (incluyendo guiones)
    // Los placeholders como "temp-id" son mucho más cortos
    console.log('📋 WidgetAlertas useEffect:', { usuarioId, length: usuarioId?.length });
    
    const esUuidValido = usuarioId && usuarioId.length >= 20 && !usuarioId.includes('temp');
    console.log('🔐 Es UUID válido:', esUuidValido);
    
    if (esUuidValido) {
      console.log('✨ Iniciando fetch de estadísticas');
      obtenerEstadisticas();
      // Recargar cada 5 minutos
      const intervalo = setInterval(obtenerEstadisticas, 5 * 60 * 1000);
      return () => clearInterval(intervalo);
    } else {
      console.log('⏸️ UUID no válido, esperando...');
      // Si no es válido, mostrar cargando hasta que sea válido
      setCargando(true);
    }
  }, [usuarioId]);

  if (cargando) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FCBA00]"></div>
          <h3 className="font-semibold text-gray-700">Alertas de Leads</h3>
        </div>
        <div className="h-16 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="bg-white rounded-lg border-2 border-red-300 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Alertas de Leads
          </h3>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-red-600">⚠️ Error: {error}</p>
          <button
            onClick={(e) => {
              e.preventDefault();
              obtenerEstadisticas();
            }}
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-sm font-medium text-white rounded-lg transition-all duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!estadisticas || estadisticas.activas === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-green-500" />
            Alertas de Leads
          </h3>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">✅ Todas las alertas completadas</p>
          <p className="text-xs text-gray-500">Las alertas se generan automáticamente cada hora para leads sin contactar en 24+ horas</p>
        </div>
      </div>
    );
  }

  const esUrgente = estadisticas.urgentes > 0;

  return (
    <Link href="/dashboard/alertas">
      <div className={`rounded-lg border p-4 cursor-pointer transition hover:shadow-md ${
        esUrgente
          ? 'border-red-300 bg-red-50'
          : 'border-yellow-300 bg-yellow-50'
      }`}>
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-semibold ${
            esUrgente ? 'text-red-700' : 'text-yellow-700'
          }`}>
            ⏰ Alertas de Leads
          </h3>
          <AlertCircle className={`w-5 h-5 ${
            esUrgente ? 'text-red-600' : 'text-yellow-600'
          }`} />
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white bg-opacity-50 p-2 rounded">
            <p className="text-xs text-gray-600">Pendientes</p>
            <p className={`text-lg font-bold ${
              esUrgente ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {estadisticas.activas}
            </p>
          </div>
          <div className="bg-white bg-opacity-50 p-2 rounded">
            <p className="text-xs text-gray-600">Urgentes</p>
            <p className="text-lg font-bold text-red-600">
              {estadisticas.urgentes}
            </p>
          </div>
        </div>

        {/* Mensaje */}
        {esUrgente && (
          <div className="text-xs text-red-700 bg-white bg-opacity-50 p-2 rounded mb-2">
            🚨 {estadisticas.urgentes} alerta{estadisticas.urgentes !== 1 ? 's' : ''} a punto de vencer
          </div>
        )}

        {/* Botón */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-opacity-20">
          <span className={`font-medium ${
            esUrgente ? 'text-red-700' : 'text-yellow-700'
          }`}>
            Ver detalles
          </span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
};

export default WidgetAlertas;
