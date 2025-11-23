'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2, Target } from 'lucide-react';
import Link from 'next/link';
import { useLeadPipeline } from '@/hooks/useLeadPipeline';

interface WidgetConversionLeadProps {
  usuarioId: string;
}

/**
 * Widget que muestra estadísticas de conversión lead → oportunidad
 */
export const WidgetConversionLead: React.FC<WidgetConversionLeadProps> = ({ usuarioId }) => {
  const { cargando, error, estadisticasConversion, obtenerEstadisticasConversion } = useLeadPipeline();
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      // Validar que el usuarioId es válido
      const esUuidValido = usuarioId && usuarioId.length >= 20 && !usuarioId.includes('temp');
      
      if (esUuidValido) {
        await obtenerEstadisticasConversion();
      }
    };

    cargarEstadisticas();
    
    // Actualizar cada 5 minutos
    const intervalo = setInterval(cargarEstadisticas, 5 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, [usuarioId, obtenerEstadisticasConversion]);

  if (cargando) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FCBA00]"></div>
          <h3 className="font-semibold text-gray-700">Conversión Lead → Oportunidad</h3>
        </div>
        <div className="h-16 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (error || !estadisticasConversion) {
    return (
      <div className="bg-white rounded-lg border-2 border-red-300 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-red-700">Error</h3>
        </div>
        <p className="text-sm text-red-600">{error || 'No se pudieron cargar las estadísticas'}</p>
      </div>
    );
  }

  const { totalLeads, leadsConOportunidad, leadsSinOportunidad, tazaConversion, oportunidadesGanadasDesdeLead, valorGanado } = estadisticasConversion;

  const esCritico = leadsSinOportunidad > 0;

  return (
    <Link href="/dashboard/leads">
      <div className={`rounded-lg border p-4 cursor-pointer transition hover:shadow-md ${
        esCritico
          ? 'border-blue-300 bg-blue-50'
          : 'border-green-300 bg-green-50'
      }`}>
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold flex items-center gap-2 ${
            esCritico ? 'text-blue-700' : 'text-green-700'
          }`}>
            <Target className="w-5 h-5" />
            Conversión de Leads
          </h3>
          <div className={`text-2xl font-bold ${
            esCritico ? 'text-blue-600' : 'text-green-600'
          }`}>
            {tazaConversion.toFixed(1)}%
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white bg-opacity-50 p-2 rounded">
            <p className="text-xs text-gray-600">Leads Totales</p>
            <p className="text-lg font-bold text-gray-700">{totalLeads}</p>
          </div>
          <div className="bg-white bg-opacity-50 p-2 rounded">
            <p className="text-xs text-gray-600">Convertidos</p>
            <p className="text-lg font-bold text-green-600">{leadsConOportunidad}</p>
          </div>
          <div className="bg-white bg-opacity-50 p-2 rounded">
            <p className="text-xs text-gray-600">Sin Convertir</p>
            <p className="text-lg font-bold text-blue-600">{leadsSinOportunidad}</p>
          </div>
          <div className="bg-white bg-opacity-50 p-2 rounded">
            <p className="text-xs text-gray-600">Ganados</p>
            <p className="text-lg font-bold text-green-600">{oportunidadesGanadasDesdeLead}</p>
          </div>
        </div>

        {/* Valor ganado */}
        {valorGanado > 0 && (
          <div className="bg-white bg-opacity-50 p-2 rounded mb-2">
            <p className="text-xs text-gray-600">Valor Ganado</p>
            <p className="text-sm font-bold text-green-700">
              S/ {(valorGanado / 1000).toFixed(0)}K
            </p>
          </div>
        )}

        {/* Alerta si hay leads sin convertir */}
        {esCritico && (
          <div className="text-xs text-blue-700 bg-white bg-opacity-50 p-2 rounded mb-2">
            🎯 {leadsSinOportunidad} lead{leadsSinOportunidad !== 1 ? 's' : ''} pendiente{leadsSinOportunidad !== 1 ? 's' : ''} de convertir
          </div>
        )}

        {/* Botón/enlace */}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-opacity-20">
          <span className={`font-medium ${
            esCritico ? 'text-blue-700' : 'text-green-700'
          }`}>
            Ver detalles
          </span>
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
};

export default WidgetConversionLead;
