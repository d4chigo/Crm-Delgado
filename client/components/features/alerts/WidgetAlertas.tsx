'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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

  // Obtener estadísticas de alertas
  const obtenerEstadisticas = async () => {
    try {
      setCargando(true);
      const response = await fetch(`/api/alertas/estadisticas/${usuarioId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }

      const data = await response.json();
      setEstadisticas(data.estadisticas);
    } catch (error) {
      console.error('Error:', error);
      setEstadisticas(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuarioId) {
      obtenerEstadisticas();
      // Recargar cada 5 minutos
      const intervalo = setInterval(obtenerEstadisticas, 5 * 60 * 1000);
      return () => clearInterval(intervalo);
    }
  }, [usuarioId]);

  if (cargando) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="h-20 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!estadisticas || estadisticas.activas === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">Alertas de Leads</h3>
          <AlertCircle className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-sm text-gray-600 mt-2">Todas las alertas completadas ✅</p>
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
