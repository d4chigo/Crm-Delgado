'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { AlertasLead } from '@/components/features/alerts';
import { obtenerUsuario } from '@/lib/autenticacion';
import { useToast } from '@/components/ui/use-toast';

/**
 * Página de alertas de leads para el dashboard
 */
export default function AlertasPage() {
  const enrutador = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const { toast } = useToast();
  const [cargandoAlertas, setCargandoAlertas] = useState(false);

  useEffect(() => {
    const usuarioActual = obtenerUsuario();
    if (!usuarioActual) {
      enrutador.push('/login');
    } else {
      setUsuario(usuarioActual);
    }
  }, [enrutador]);

  // Generar alertas manualmente
  const generarAlertas = async () => {
    try {
      setCargandoAlertas(true);
      const response = await fetch('/api/alertas/generar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar alertas');
      }

      const data = await response.json();

      toast({
        title: '✅ Alertas generadas',
        description: data.mensaje,
      });

      // Recargar la página para mostrar nuevas alertas
      window.location.reload();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: '❌ Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCargandoAlertas(false);
    }
  };

  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCBA00]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Alertas de Leads</h1>
                <p className="text-gray-600 mt-1">
                  Leads que no han sido contactados en las últimas 24 horas
                </p>
              </div>
            </div>

            {/* Botón para generar alertas */}
            <button
              onClick={generarAlertas}
              disabled={cargandoAlertas}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
            >
              <RefreshCw className={`w-4 h-4 ${cargandoAlertas ? 'animate-spin' : ''}`} />
              {cargandoAlertas ? 'Generando...' : 'Generar Alertas'}
            </button>
          </div>

          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Este sistema genera automáticamente alertas para todos los leads creados hace más de 24 horas
              que aún no han sido contactados. Puedes generar alertas manualmente haciendo clic en el botón anterior.
            </p>
          </div>
        </div>

        {/* Lista de alertas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <AlertasLead usuarioId={usuario.id} compact={false} maxItems={100} />
        </div>

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Información 1 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Límite de contacto</h3>
            </div>
            <p className="text-sm text-gray-600">
              Cada alerta tiene un límite de 24 horas desde su creación para contactar al lead.
            </p>
          </div>

          {/* Información 2 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Alertas urgentes</h3>
            </div>
            <p className="text-sm text-gray-600">
              Las alertas en rojo tienen menos de 6 horas para ser completadas.
            </p>
          </div>

          {/* Información 3 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✅</span>
              <h3 className="font-semibold text-gray-900">Completar alerta</h3>
            </div>
            <p className="text-sm text-gray-600">
              Haz clic en "Marcar como contactado" cuando completes el contacto con el lead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
