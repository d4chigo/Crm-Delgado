'use client';

import { useState, useEffect } from 'react';
import { Etiqueta } from '@/types/etiqueta.types';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Tag } from 'lucide-react';

interface SelectorEtiquetasCreacionProps {
  etiquetasSeleccionadas: string[]; // IDs de etiquetas seleccionadas (solo una)
  onCambio: (etiquetasIds: string[]) => void; // Callback cuando cambian las selecciones
}

/**
 * Componente para seleccionar una única etiqueta al crear un contacto
 * No guarda automáticamente, solo notifica los cambios al componente padre
 */
export function SelectorEtiquetasCreacion({
  etiquetasSeleccionadas,
  onCambio
}: SelectorEtiquetasCreacionProps) {
  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState<Etiqueta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState<string>(etiquetasSeleccionadas[0] || '');

  useEffect(() => {
    cargarEtiquetas();
  }, []);

  useEffect(() => {
    setEtiquetaSeleccionada(etiquetasSeleccionadas[0] || '');
  }, [etiquetasSeleccionadas]);

  const cargarEtiquetas = async () => {
    try {
      const token = localStorage.getItem('crm_token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/etiquetas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const resultado = await response.json();
        setEtiquetasDisponibles(resultado.datos || []);
      }
    } catch (error) {
      console.error('Error al cargar etiquetas:', error);
    } finally {
      setCargando(false);
    }
  };

  const toggleEtiqueta = (etiquetaId: string) => {
    // Si la etiqueta ya está seleccionada, deseleccionar
    const nuevaEtiqueta = etiquetaSeleccionada === etiquetaId ? '' : etiquetaId;
    setEtiquetaSeleccionada(nuevaEtiqueta);
    onCambio(nuevaEtiqueta ? [nuevaEtiqueta] : []);
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Cargando etiquetas...</span>
      </div>
    );
  }

  if (etiquetasDisponibles.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No hay etiquetas disponibles</p>
        <p className="text-xs">Crea etiquetas desde la configuración</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="h-3.5 w-3.5 text-[#FCBA00]" />
        <Label className="text-sm font-medium text-gray-700">
          Etiqueta (Opcional)
        </Label>
      </div>

      {/* Etiqueta seleccionada (badge compacto) */}
      {etiquetaSeleccionada && (
        <div className="flex flex-wrap gap-1.5">
          {(() => {
            const etiqueta = etiquetasDisponibles.find(e => e.id === etiquetaSeleccionada);
            if (!etiqueta) return null;
            
            return (
              <Badge
                key={etiqueta.id}
                variant="secondary"
                style={{ backgroundColor: etiqueta.color }}
                className="text-white text-xs py-0 px-2"
              >
                {etiqueta.icono && <span className="mr-1">{etiqueta.icono}</span>}
                {etiqueta.nombre}
              </Badge>
            );
          })()}
        </div>
      )}

      {/* Lista de radio buttons compacta */}
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {/* Opción para sin etiqueta */}
        <div className="flex items-center space-x-2 text-sm">
          <input
            type="radio"
            id="etiqueta-ninguna"
            name="etiqueta"
            value=""
            checked={etiquetaSeleccionada === ''}
            onChange={() => toggleEtiqueta('')}
            className="h-4 w-4"
          />
          <Label
            htmlFor="etiqueta-ninguna"
            className="cursor-pointer text-sm leading-none text-muted-foreground"
          >
            Sin etiqueta
          </Label>
        </div>

        {/* Opciones de etiquetas */}
        {etiquetasDisponibles.map((etiqueta) => (
          <div
            key={etiqueta.id}
            className="flex items-center space-x-2 text-sm"
          >
            <input
              type="radio"
              id={`etiqueta-${etiqueta.id}`}
              name="etiqueta"
              value={etiqueta.id}
              checked={etiquetaSeleccionada === etiqueta.id}
              onChange={() => toggleEtiqueta(etiqueta.id)}
              className="h-4 w-4"
            />
            <Label
              htmlFor={`etiqueta-${etiqueta.id}`}
              className="flex items-center gap-1.5 cursor-pointer text-sm leading-none"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: etiqueta.color }}
              />
              {etiqueta.icono && <span className="text-xs">{etiqueta.icono}</span>}
              <span className="text-xs">{etiqueta.nombre}</span>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
