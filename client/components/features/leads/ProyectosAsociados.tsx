'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, X, Building2, MapPin, DollarSign } from 'lucide-react';
import { useProyectos } from '@/hooks/useProyectos';
import { Proyecto } from '@/types/proyecto.types';
import { proyectoService } from '@/services/api/proyecto.service';
import { etiquetaService } from '@/services/api/etiqueta.service';
import { useToast } from '@/hooks/use-toast';

interface ProyectosAsociadosProps {
  clienteId: string;
}

export function ProyectosAsociados({ clienteId }: ProyectosAsociadosProps) {
  const { proyectos, cargarProyectos } = useProyectos();
  const [proyectosAsociados, setProyectosAsociados] = useState<Proyecto[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');
  const [cargando, setCargando] = useState(false);
  const [proyectoAEliminar, setProyectoAEliminar] = useState<Proyecto | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    cargarProyectos({ activo: true });
    cargarProyectosAsociados();
  }, [clienteId]);

  const cargarProyectosAsociados = async () => {
    try {
      const proyectos = await proyectoService.obtenerPorCliente(clienteId);
      setProyectosAsociados(proyectos);
    } catch (error) {
      console.error('Error al cargar proyectos asociados:', error);
    }
  };

  const asociarProyecto = async () => {
    if (!proyectoSeleccionado) return;

    setCargando(true);
    try {
      // Obtener el proyecto completo para acceder a sus etiquetas
      const proyectoCompleto = await proyectoService.obtenerPorId(proyectoSeleccionado);
      
      // Asociar el proyecto al cliente
      await proyectoService.asociarCliente(proyectoSeleccionado, {
        clienteId,
        notas: 'Asociación desde detalles del cliente'
      });

      // Si el proyecto tiene etiquetas, asignarlas al cliente
      if (proyectoCompleto.etiquetas && proyectoCompleto.etiquetas.length > 0) {
        // Obtener las etiquetas actuales del cliente
        const etiquetasActuales = await etiquetaService.obtenerDeContacto(clienteId);
        const etiquetasActualesIds = etiquetasActuales.map(e => e.id);
        
        // Combinar las etiquetas actuales con las del proyecto (sin duplicar)
        const etiquetasDelProyecto = proyectoCompleto.etiquetas.map(pe => pe.etiquetaId);
        const etiquetasFinales = [...new Set([...etiquetasActualesIds, ...etiquetasDelProyecto])];
        
        // Asignar todas las etiquetas al cliente
        await etiquetaService.asignarAContacto(clienteId, etiquetasFinales);
        
        toast({
          title: 'Proyecto asociado',
          description: `Se asignó el proyecto y ${proyectoCompleto.etiquetas.length} etiqueta(s) al cliente`,
        });
      } else {
        toast({
          title: 'Proyecto asociado',
          description: 'El proyecto se asoció correctamente al cliente',
        });
      }

      await cargarProyectosAsociados();
      setProyectoSeleccionado('');
    } catch (error: any) {
      console.error('Error al asociar proyecto:', error);
      toast({
        variant: 'destructive',
        title: 'Error al asociar proyecto',
        description: error?.message || 'No se pudo asociar el proyecto al cliente',
      });
    } finally {
      setCargando(false);
    }
  };

  const desasociarProyecto = async (proyectoId: string) => {
    setCargando(true);
    try {
      // Obtener el proyecto para acceder a sus etiquetas
      const proyectoCompleto = await proyectoService.obtenerPorId(proyectoId);
      
      // Desasociar el proyecto del cliente
      await proyectoService.desasociarCliente(proyectoId, clienteId);

      // Si el proyecto tiene etiquetas, removerlas del cliente
      if (proyectoCompleto.etiquetas && proyectoCompleto.etiquetas.length > 0) {
        // Obtener las etiquetas actuales del cliente
        const etiquetasActuales = await etiquetaService.obtenerDeContacto(clienteId);
        const etiquetasDelProyecto = proyectoCompleto.etiquetas.map(pe => pe.etiquetaId);
        
        // Filtrar las etiquetas del proyecto
        const etiquetasFinales = etiquetasActuales
          .map(e => e.id)
          .filter(id => !etiquetasDelProyecto.includes(id));
        
        // Asignar las etiquetas restantes al cliente
        await etiquetaService.asignarAContacto(clienteId, etiquetasFinales);
        
        toast({
          title: 'Proyecto desasociado',
          description: `Se removió el proyecto y ${proyectoCompleto.etiquetas.length} etiqueta(s) del cliente`,
        });
      } else {
        toast({
          title: 'Proyecto desasociado',
          description: 'El proyecto se desasoció correctamente del cliente',
        });
      }

      await cargarProyectosAsociados();
      setProyectoAEliminar(null);
    } catch (error: any) {
      console.error('Error al desasociar proyecto:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.message || 'No se pudo desasociar el proyecto del cliente',
      });
    } finally {
      setCargando(false);
    }
  };

  const confirmarDesasociacion = async () => {
    if (!proyectoAEliminar) return;
    await desasociarProyecto(proyectoAEliminar.id);
  };

  const proyectosDisponibles = proyectos.filter(
    (p) => !proyectosAsociados.some((pa) => pa.id === p.id)
  );

  return (
    <div className="space-y-4">
      {/* Proyectos asociados */}
      {proyectosAsociados.length > 0 && (
        <div className="space-y-3">
          {proyectosAsociados.map((proyecto) => (
            <div
              key={proyecto.id}
              className="flex items-start justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-[#FCBA00]" />
                  <h4 className="font-semibold text-[#303030]">{proyecto.nombre}</h4>
                  <Badge variant="outline" className="text-xs">
                    {proyecto.estado}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  {proyecto.ubicacion && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{proyecto.ubicacion}</span>
                    </div>
                  )}
                  {proyecto.precio && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>S/ {proyecto.precio.toLocaleString('es-PE')}</span>
                    </div>
                  )}
                  {proyecto.descripcion && (
                    <p className="text-xs text-gray-500 mt-1">{proyecto.descripcion}</p>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProyectoAEliminar(proyecto)}
                disabled={cargando}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Agregar nuevo proyecto */}
      <div className="flex gap-2">
        <Select value={proyectoSeleccionado} onValueChange={setProyectoSeleccionado}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Seleccionar proyecto..." />
          </SelectTrigger>
          <SelectContent>
            {proyectosDisponibles.length === 0 ? (
              <div className="p-2 text-sm text-gray-500 text-center">
                No hay proyectos disponibles
              </div>
            ) : (
              proyectosDisponibles.map((proyecto) => (
                <SelectItem key={proyecto.id} value={proyecto.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{proyecto.nombre}</span>
                    {proyecto.ubicacion && (
                      <span className="text-xs text-gray-500">{proyecto.ubicacion}</span>
                    )}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button
          onClick={asociarProyecto}
          disabled={!proyectoSeleccionado || cargando}
          className="bg-[#FCBA00] hover:bg-[#e5a800] text-[#303030]"
        >
          <Plus className="h-4 w-4 mr-1" />
          Asociar
        </Button>
      </div>

      {proyectosAsociados.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay proyectos asociados</p>
          <p className="text-xs">Selecciona un proyecto para asociarlo</p>
        </div>
      )}

      {/* Diálogo de confirmación para desasociar */}
      <AlertDialog open={!!proyectoAEliminar} onOpenChange={(open) => !open && setProyectoAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desasociar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              {proyectoAEliminar && (
                <>
                  ¿Estás seguro de desasociar el proyecto <strong>{proyectoAEliminar.nombre}</strong>?
                  {proyectoAEliminar.etiquetas && proyectoAEliminar.etiquetas.length > 0 && (
                    <span className="block mt-2 text-yellow-600">
                      También se removerán {proyectoAEliminar.etiquetas.length} etiqueta(s) asociada(s) al proyecto.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cargando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDesasociacion}
              disabled={cargando}
              className="bg-red-600 hover:bg-red-700"
            >
              {cargando ? 'Desasociando...' : 'Desasociar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
