'use client';

import { useState, useEffect } from 'react';
import { Etiqueta } from '@/types/etiqueta.types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SelectorEtiquetasProps {
  contactoId: string;
  etiquetasSeleccionadas?: string[]; // IDs de etiquetas ya asignadas
  onCambio?: (etiquetasIds: string[]) => void;
  modo?: 'checkbox' | 'badge-only'; // checkbox: permite editar, badge-only: solo muestra
}

export function SelectorEtiquetas({
  contactoId,
  etiquetasSeleccionadas = [],
  onCambio,
  modo = 'checkbox'
}: SelectorEtiquetasProps) {
  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState<Etiqueta[]>([]);
  const [etiquetasActuales, setEtiquetasActuales] = useState<string[]>(etiquetasSeleccionadas);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarEtiquetas();
  }, []);

  useEffect(() => {
    setEtiquetasActuales(etiquetasSeleccionadas);
  }, [etiquetasSeleccionadas]);

  const cargarEtiquetas = async () => {
    try {
      const token = localStorage.getItem('crm_token');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      console.log('Cargando etiquetas desde:', `${process.env.NEXT_PUBLIC_API_URL}/etiquetas`);
      
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/etiquetas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Respuesta etiquetas:', respuesta.status);

      if (respuesta.ok) {
        const resultado = await respuesta.json();
        console.log('Etiquetas recibidas:', resultado);
        setEtiquetasDisponibles(resultado.datos || []);
      } else {
        const error = await respuesta.json();
        console.error('Error al cargar etiquetas:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las etiquetas',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al cargar etiquetas:', error);
      toast({
        title: 'Error',
        description: 'No se pudo conectar con el servidor',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  const toggleEtiqueta = async (etiquetaId: string) => {
    const nuevasEtiquetas = etiquetasActuales.includes(etiquetaId)
      ? etiquetasActuales.filter(id => id !== etiquetaId)
      : [...etiquetasActuales, etiquetaId];

    setEtiquetasActuales(nuevasEtiquetas);

    // Si hay callback, notificar el cambio
    if (onCambio) {
      onCambio(nuevasEtiquetas);
    }

    // Guardar automáticamente en el servidor
    await guardarEtiquetas(nuevasEtiquetas);
  };

  const guardarEtiquetas = async (etiquetaIds: string[]) => {
    setGuardando(true);
    try {
      const token = localStorage.getItem('crm_token');
      if (!token) return;

      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/etiquetas/contacto/${contactoId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ etiquetaIds }),
        }
      );

      if (!respuesta.ok) {
        throw new Error('Error al guardar etiquetas');
      }

      toast({
        title: 'Etiquetas actualizadas',
        description: 'Los cambios se guardaron exitosamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las etiquetas',
        variant: 'destructive',
      });
      // Revertir cambios en caso de error
      setEtiquetasActuales(etiquetasSeleccionadas);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Modo solo visualización (badges)
  if (modo === 'badge-only') {
    const etiquetasMostrar = etiquetasDisponibles.filter(e =>
      etiquetasActuales.includes(e.id)
    );

    if (etiquetasMostrar.length === 0) {
      return (
        <p className="text-sm text-muted-foreground italic">Sin etiquetas asignadas</p>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {etiquetasMostrar.map(etiqueta => (
          <Badge
            key={etiqueta.id}
            style={{
              backgroundColor: etiqueta.color + '20',
              color: etiqueta.color,
              borderColor: etiqueta.color,
            }}
            className="border"
          >
            {etiqueta.icono && <span className="mr-1">{etiqueta.icono}</span>}
            {etiqueta.nombre}
          </Badge>
        ))}
      </div>
    );
  }

  // Modo con checkboxes (editable)
  return (
    <div className="space-y-3">
      {guardando && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Guardando...</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {etiquetasDisponibles.map(etiqueta => {
          const estaSeleccionada = etiquetasActuales.includes(etiqueta.id);

          return (
            <div
              key={etiqueta.id}
              className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                id={`etiqueta-${etiqueta.id}`}
                checked={estaSeleccionada}
                onCheckedChange={() => toggleEtiqueta(etiqueta.id)}
                disabled={guardando}
              />
              <div className="flex-1">
                <Label
                  htmlFor={`etiqueta-${etiqueta.id}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Badge
                    style={{
                      backgroundColor: etiqueta.color + '20',
                      color: etiqueta.color,
                      borderColor: etiqueta.color,
                    }}
                    className="border"
                  >
                    {etiqueta.icono && <span className="mr-1">{etiqueta.icono}</span>}
                    {etiqueta.nombre}
                  </Badge>
                </Label>
                {etiqueta.descripcion && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {etiqueta.descripcion}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {etiquetasDisponibles.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay etiquetas disponibles
        </p>
      )}
    </div>
  );
}
