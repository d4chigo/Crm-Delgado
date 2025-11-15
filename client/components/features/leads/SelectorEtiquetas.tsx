'use client';

import { useState, useEffect } from 'react';
import { Etiqueta } from '@/types/etiqueta.types';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SelectorEtiquetasProps {
  contactoId: string;
  etiquetasSeleccionadas?: string[]; // IDs de etiquetas ya asignadas (solo una)
  onCambio?: (etiquetasIds: string[]) => void;
  modo?: 'radio' | 'badge-only'; // radio: permite editar una sola, badge-only: solo muestra
}

export function SelectorEtiquetas({
  contactoId,
  etiquetasSeleccionadas = [],
  onCambio,
  modo = 'radio'
}: SelectorEtiquetasProps) {
  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState<Etiqueta[]>([]);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState<string>(etiquetasSeleccionadas[0] || '');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

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
        console.error('No hay token de autenticación');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return;
      }

      console.log('Cargando etiquetas desde:', `${process.env.NEXT_PUBLIC_API_URL}/etiquetas`);
      
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/etiquetas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Respuesta etiquetas:', respuesta.status);

      // Si el token expiró o es inválido
      if (respuesta.status === 401) {
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
        toast({
          title: 'Sesión expirada',
          description: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          variant: 'destructive',
        });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return;
      }

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
    // Si la etiqueta ya está seleccionada, deseleccionar (permitir sin etiqueta)
    const nuevaEtiqueta = etiquetaSeleccionada === etiquetaId ? '' : etiquetaId;
    setEtiquetaSeleccionada(nuevaEtiqueta);

    // Si hay callback, notificar el cambio
    if (onCambio) {
      onCambio(nuevaEtiqueta ? [nuevaEtiqueta] : []);
    }

    // Guardar automáticamente en el servidor
    await guardarEtiquetas(nuevaEtiqueta ? [nuevaEtiqueta] : []);
  };

  const guardarEtiquetas = async (etiquetaIds: string[]) => {
    setGuardando(true);
    try {
      const token = localStorage.getItem('crm_token');
      if (!token) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return;
      }

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

      // Si el token expiró
      if (respuesta.status === 401) {
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
        toast({
          title: 'Sesión expirada',
          description: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          variant: 'destructive',
        });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return;
      }

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
      setEtiquetaSeleccionada(etiquetasSeleccionadas[0] || '');
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
    const etiquetaMostrar = etiquetasDisponibles.find(e =>
      etiquetasSeleccionadas.includes(e.id)
    );

    if (!etiquetaMostrar) {
      return (
        <p className="text-sm text-muted-foreground italic">Sin etiqueta asignada</p>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        <Badge
          key={etiquetaMostrar.id}
          style={{
            backgroundColor: etiquetaMostrar.color + '20',
            color: etiquetaMostrar.color,
            borderColor: etiquetaMostrar.color,
          }}
          className="border"
        >
          {etiquetaMostrar.icono && <span className="mr-1">{etiquetaMostrar.icono}</span>}
          {etiquetaMostrar.nombre}
        </Badge>
      </div>
    );
  }

  // Modo con radio buttons (selección única, editable)
  return (
    <div className="space-y-3">
      {guardando && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Guardando...</span>
        </div>
      )}

      <div className="space-y-2">
        {/* Opción para sin etiqueta */}
        <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
          <input
            type="radio"
            id="etiqueta-ninguna"
            name="etiqueta"
            value=""
            checked={etiquetaSeleccionada === ''}
            onChange={() => toggleEtiqueta('')}
            disabled={guardando}
            className="mt-1"
          />
          <div className="flex-1">
            <Label
              htmlFor="etiqueta-ninguna"
              className="cursor-pointer text-muted-foreground"
            >
              Sin etiqueta
            </Label>
          </div>
        </div>

        {/* Opciones de etiquetas */}
        {etiquetasDisponibles.map(etiqueta => {
          const estaSeleccionada = etiquetaSeleccionada === etiqueta.id;

          return (
            <div
              key={etiqueta.id}
              className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <input
                type="radio"
                id={`etiqueta-${etiqueta.id}`}
                name="etiqueta"
                value={etiqueta.id}
                checked={estaSeleccionada}
                onChange={() => toggleEtiqueta(etiqueta.id)}
                disabled={guardando}
                className="mt-1"
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
