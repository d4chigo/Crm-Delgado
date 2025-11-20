'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Alerta {
  id: string;
  contactoId: string;
  usuarioId: string;
  fechaCreada: string;
  fechaLimite: string;
  completada: boolean;
  completadaEn?: string;
  notas?: string;
  contacto: {
    id: string;
    nombre: string;
    apellido: string;
    correo?: string;
    telefono?: string;
    estadoLead?: string;
  };
  tiempoRestante?: {
    ms: number;
    horas: number;
    urgente: boolean;
  };
  horasDesdeCreacion?: number;
}

interface AlertasLeadProps {
  usuarioId?: string;
  compact?: boolean;
  maxItems?: number;
}

/**
 * Componente para mostrar alertas de leads no contactados
 */
export const AlertasLead: React.FC<AlertasLeadProps> = ({
  usuarioId,
  compact = false,
  maxItems = 5,
}) => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState(false);
  const [expandido, setExpandido] = useState(!compact);
  const { toast } = useToast();

  // Obtener alertas del usuario
  const obtenerAlertas = async () => {
    try {
      setCargando(true);
      const response = await fetch('/api/alertas', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener alertas');
      }

      const data = await response.json();
      setAlertas(data.alertas || []);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las alertas',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  // Completar alerta
  const completarAlerta = async (alertaId: string) => {
    try {
      const response = await fetch(`/api/alertas/${alertaId}/completar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          notas: 'Completada desde el dashboard',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al completar alerta');
      }

      // Remover alerta de la lista
      setAlertas(alertas.filter((a) => a.id !== alertaId));

      toast({
        title: '✅ Alerta completada',
        description: 'Lead marcado como contactado',
      });

      // Recargar después de 1 segundo
      setTimeout(obtenerAlertas, 1000);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: '❌ Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Cargar alertas al montar el componente
  useEffect(() => {
    obtenerAlertas();
    // Recargar cada 5 minutos
    const intervalo = setInterval(obtenerAlertas, 5 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, [usuarioId]);

  if (cargando && alertas.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Clock className="w-5 h-5 mx-auto mb-2 animate-spin" />
        Cargando alertas...
      </div>
    );
  }

  if (alertas.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <CheckCircle2 className="w-5 h-5 mx-auto mb-2 text-green-500" />
        Todas las alertas completadas
      </div>
    );
  }

  const alertasVisibles = expandido ? alertas : alertas.slice(0, maxItems);
  const hayMas = alertas.length > maxItems && !expandido;

  return (
    <div className="space-y-2">
      {/* Encabezado */}
      {compact && (
        <div
          className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition"
          onClick={() => setExpandido(!expandido)}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-700">
              {alertas.length} Alerta{alertas.length !== 1 ? 's' : ''} Pendiente{alertas.length !== 1 ? 's' : ''}
            </span>
          </div>
          <span className="text-sm text-red-600">
            {expandido ? 'Ocultar' : 'Mostrar'}
          </span>
        </div>
      )}

      {/* Lista de alertas */}
      {expandido && (
        <div className="space-y-2">
          {alertasVisibles.map((alerta) => (
            <div
              key={alerta.id}
              className={`p-3 rounded-lg border ${
                alerta.tiempoRestante?.urgente
                  ? 'border-red-300 bg-red-50'
                  : 'border-yellow-300 bg-yellow-50'
              }`}
            >
              {/* Encabezado de alerta */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {alerta.contacto.nombre} {alerta.contacto.apellido}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Lead creado hace {alerta.horasDesdeCreacion} horas
                  </p>
                </div>

                {/* Ícono de urgencia */}
                {alerta.tiempoRestante?.urgente && (
                  <div className="ml-2">
                    <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-red-600 rounded">
                      URGENTE
                    </span>
                  </div>
                )}
              </div>

              {/* Tiempo restante */}
              <div className="flex items-center gap-2 mb-3 text-sm">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">
                  {alerta.tiempoRestante?.horas && alerta.tiempoRestante.horas > 0
                    ? `${alerta.tiempoRestante.horas} hora${alerta.tiempoRestante.horas !== 1 ? 's' : ''} restantes`
                    : 'Tiempo límite alcanzado'}
                </span>
              </div>

              {/* Información de contacto */}
              {(alerta.contacto.correo || alerta.contacto.telefono) && (
                <div className="bg-white p-2 rounded mb-3 text-sm space-y-1">
                  {alerta.contacto.correo && (
                    <div className="text-gray-700">
                      📧 <a href={`mailto:${alerta.contacto.correo}`} className="text-blue-600 hover:underline">
                        {alerta.contacto.correo}
                      </a>
                    </div>
                  )}
                  {alerta.contacto.telefono && (
                    <div className="text-gray-700">
                      📱 <a href={`tel:${alerta.contacto.telefono}`} className="text-blue-600 hover:underline">
                        {alerta.contacto.telefono}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Botón para completar */}
              <button
                onClick={() => completarAlerta(alerta.id)}
                className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition"
              >
                ✅ Marcar como contactado
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mostrar más */}
      {hayMas && (
        <button
          onClick={() => setExpandido(true)}
          className="w-full p-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver {alertas.length - maxItems} alerta{alertas.length - maxItems !== 1 ? 's' : ''} más
        </button>
      )}
    </div>
  );
};

export default AlertasLead;
