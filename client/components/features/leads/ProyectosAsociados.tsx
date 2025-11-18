'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, X, Building2, MapPin, DollarSign, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useProyectos } from '@/hooks/useProyectos';
import { Proyecto, EstadoProyecto } from '@/types/proyecto.types';
import { proyectoService } from '@/services/api/proyecto.service';
import { etiquetaService } from '@/services/api/etiqueta.service';
import { validacionService, RelacionesProyectoCliente } from '@/services/api/validacion.service';
import { useToast } from '@/hooks/use-toast';

interface ProyectosAsociadosProps {
  clienteId: string;
  onActualizado?: () => void;
}

export function ProyectosAsociados({ clienteId, onActualizado }: ProyectosAsociadosProps) {
  const { proyectos, cargarProyectos } = useProyectos();
  const [proyectosAsociados, setProyectosAsociados] = useState<Proyecto[]>([]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('');
  const [cargando, setCargando] = useState(false);
  const [proyectoAEliminar, setProyectoAEliminar] = useState<Proyecto | null>(null);
  const [relacionesProyecto, setRelacionesProyecto] = useState<RelacionesProyectoCliente | null>(null);
  const [confirmoConsecuencias, setConfirmoConsecuencias] = useState(false);
  const [verificandoRelaciones, setVerificandoRelaciones] = useState(false);
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
      // 1. VALIDACIÓN: Verificar duplicados
      const esDuplicado = validacionService.verificarProyectoDuplicado(
        proyectoSeleccionado,
        proyectosAsociados
      );

      if (esDuplicado) {
        toast({
          variant: 'destructive',
          title: 'Proyecto ya asociado',
          description: 'Este proyecto ya está asociado al cliente',
        });
        setCargando(false);
        return;
      }

      // 2. VALIDACIÓN: Verificar disponibilidad del proyecto
      const infoProyecto = await validacionService.verificarDisponibilidadProyecto(
        proyectoSeleccionado
      );

      if (!infoProyecto.puedeAsociarMas) {
        toast({
          variant: 'destructive',
          title: 'Proyecto no disponible',
          description: infoProyecto.razon || 'Este proyecto no puede ser asociado',
        });
        setCargando(false);
        return;
      }

      // 3. VALIDACIÓN: Verificar estado del proyecto
      const proyectoCompleto = await proyectoService.obtenerPorId(proyectoSeleccionado);

      if (proyectoCompleto.estado === EstadoProyecto.VENDIDO) {
        toast({
          variant: 'destructive',
          title: 'Proyecto no disponible',
          description: 'No se pueden asociar proyectos con estado VENDIDO',
        });
        setCargando(false);
        return;
      }

      if (!proyectoCompleto.activo) {
        toast({
          variant: 'destructive',
          title: 'Proyecto inactivo',
          description: 'No se pueden asociar proyectos inactivos',
        });
        setCargando(false);
        return;
      }

      // 4. ADVERTENCIA: Proyecto reservado
      if (proyectoCompleto.estado === EstadoProyecto.RESERVADO) {
        toast({
          title: 'Proyecto reservado',
          description: 'Este proyecto está reservado. Verifica antes de continuar.',
          variant: 'default',
        });
      }

      // 5. Asociar el proyecto al cliente
      await proyectoService.asociarCliente(proyectoSeleccionado, {
        clienteId,
        notas: 'Asociación desde detalles del cliente'
      });

      let etiquetasAsignadas = 0;

      // 6. Si el proyecto tiene etiquetas, asignarlas al cliente con ROLLBACK
      if (proyectoCompleto.etiquetas && proyectoCompleto.etiquetas.length > 0) {
        try {
          // Obtener las etiquetas actuales del cliente
          const etiquetasActuales = await etiquetaService.obtenerDeContacto(clienteId);
          const etiquetasActualesIds = etiquetasActuales.map(e => e.id);
          
          // Combinar las etiquetas actuales con las del proyecto (sin duplicar)
          const etiquetasDelProyecto = proyectoCompleto.etiquetas.map(pe => pe.etiquetaId);
          const etiquetasFinales = [...new Set([...etiquetasActualesIds, ...etiquetasDelProyecto])];
          
          // Asignar todas las etiquetas al cliente
          await etiquetaService.asignarAContacto(clienteId, etiquetasFinales);
          etiquetasAsignadas = proyectoCompleto.etiquetas.length;
        } catch (errorEtiquetas: any) {
          // ROLLBACK: Si falla asignar etiquetas, desasociar el proyecto
          console.error('Error al asignar etiquetas, realizando rollback:', errorEtiquetas);
          
          try {
            await proyectoService.desasociarCliente(proyectoSeleccionado, clienteId);
          } catch (rollbackError) {
            console.error('Error crítico en rollback:', rollbackError);
          }

          toast({
            variant: 'destructive',
            title: 'Error al asignar etiquetas',
            description: 'Se canceló la asociación del proyecto. Intenta nuevamente.',
          });
          setCargando(false);
          return;
        }
      }

      // 7. Recargar proyectos asociados
      await cargarProyectosAsociados();
      setProyectoSeleccionado('');

      // 8. Notificar al componente padre que se actualizó
      if (onActualizado) {
        onActualizado();
      }

      // 9. Notificación de éxito
      toast({
        title: '✅ Proyecto asociado exitosamente',
        description: etiquetasAsignadas > 0 
          ? `Se asignó el proyecto y ${etiquetasAsignadas} etiqueta(s) al cliente`
          : 'El proyecto se asoció correctamente al cliente',
      });

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
        try {
          // Obtener las etiquetas actuales del cliente
          const etiquetasActuales = await etiquetaService.obtenerDeContacto(clienteId);
          const etiquetasDelProyecto = proyectoCompleto.etiquetas.map(pe => pe.etiquetaId);
          
          // Filtrar las etiquetas del proyecto
          const etiquetasFinales = etiquetasActuales
            .map(e => e.id)
            .filter(id => !etiquetasDelProyecto.includes(id));
          
          // Asignar las etiquetas restantes al cliente
          await etiquetaService.asignarAContacto(clienteId, etiquetasFinales);
        } catch (errorEtiquetas) {
          console.warn('No se pudieron actualizar las etiquetas:', errorEtiquetas);
          // Continuar aunque falle la actualización de etiquetas
        }
      }

      await cargarProyectosAsociados();
      setProyectoAEliminar(null);
      setRelacionesProyecto(null);
      setConfirmoConsecuencias(false);

      // Notificar al componente padre que se actualizó
      if (onActualizado) {
        onActualizado();
      }

      const mensaje = relacionesProyecto && 
        (relacionesProyecto.oportunidadesActivas > 0 || relacionesProyecto.cotizacionesPendientes > 0)
        ? `Proyecto desasociado. Se afectaron ${relacionesProyecto.oportunidadesActivas} oportunidad(es) y ${relacionesProyecto.cotizacionesPendientes} cotización(es)`
        : 'El proyecto se desasoció correctamente del cliente';

      toast({
        title: '✅ Proyecto desasociado',
        description: mensaje,
      });

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

  const prepararDesasociacion = async (proyecto: Proyecto) => {
    setProyectoAEliminar(proyecto);
    setVerificandoRelaciones(true);
    setConfirmoConsecuencias(false);

    try {
      // Verificar relaciones del proyecto con el cliente
      const relaciones = await validacionService.verificarRelacionesProyecto(
        proyecto.id,
        clienteId
      );
      setRelacionesProyecto(relaciones);
    } catch (error) {
      console.error('Error al verificar relaciones:', error);
      setRelacionesProyecto(null);
    } finally {
      setVerificandoRelaciones(false);
    }
  };

  const confirmarDesasociacion = async () => {
    if (!proyectoAEliminar) return;
    await desasociarProyecto(proyectoAEliminar.id);
  };

  // Filtrar proyectos: no mostrar ya asociados, vendidos o inactivos
  const proyectosDisponibles = proyectos.filter(
    (p) => 
      !proyectosAsociados.some((pa) => pa.id === p.id) &&  // No duplicados
      p.activo &&                                           // Solo activos
      p.estado !== EstadoProyecto.VENDIDO                  // No vendidos
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
                onClick={() => prepararDesasociacion(proyecto)}
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
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{proyecto.nombre}</span>
                        {proyecto.estado === EstadoProyecto.RESERVADO && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                            RESERVADO
                          </Badge>
                        )}
                        {proyecto.estado === EstadoProyecto.CONSTRUCCION && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                            EN CONSTRUCCIÓN
                          </Badge>
                        )}
                      </div>
                      {proyecto.ubicacion && (
                        <span className="text-xs text-gray-500">{proyecto.ubicacion}</span>
                      )}
                    </div>
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
      <AlertDialog 
        open={!!proyectoAEliminar} 
        onOpenChange={(open) => {
          if (!open) {
            setProyectoAEliminar(null);
            setRelacionesProyecto(null);
            setConfirmoConsecuencias(false);
          }
        }}
      >
        <AlertDialogContent size="lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              ¿Desasociar proyecto?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {proyectoAEliminar && (
                  <>
                    {/* Información del proyecto */}
                    <div className="bg-gray-50 p-3 rounded-md border">
                      <p className="font-semibold text-gray-900">
                        Proyecto: {proyectoAEliminar.nombre}
                      </p>
                      {proyectoAEliminar.ubicacion && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {proyectoAEliminar.ubicacion}
                        </p>
                      )}
                    </div>

                    {/* Estado de verificación */}
                    {verificandoRelaciones && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                        <span className="text-sm">Verificando relaciones...</span>
                      </div>
                    )}

                    {/* Relaciones encontradas */}
                    {!verificandoRelaciones && relacionesProyecto && (
                      <div className="space-y-3">
                        {/* Etiquetas */}
                        {proyectoAEliminar.etiquetas && proyectoAEliminar.etiquetas.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm">
                                <p className="font-medium text-yellow-900">
                                  Se removerán {proyectoAEliminar.etiquetas.length} etiqueta(s)
                                </p>
                                <p className="text-yellow-700 mt-1">
                                  Las etiquetas del proyecto serán desasignadas del cliente
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Oportunidades */}
                        {relacionesProyecto.oportunidadesActivas > 0 && (
                          <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm">
                                <p className="font-medium text-red-900">
                                  ⚠️ {relacionesProyecto.oportunidadesActivas} oportunidad(es) activa(s)
                                </p>
                                <p className="text-red-700 mt-1">
                                  Estas oportunidades perderán la referencia al proyecto
                                </p>
                                {relacionesProyecto.detalles.oportunidades.length > 0 && (
                                  <ul className="mt-2 space-y-1">
                                    {relacionesProyecto.detalles.oportunidades.map((op) => (
                                      <li key={op.id} className="text-xs text-red-600">
                                        • {op.titulo} ({op.etapa})
                                        {op.valor && ` - S/ ${op.valor.toLocaleString()}`}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Cotizaciones */}
                        {relacionesProyecto.cotizacionesPendientes > 0 && (
                          <div className="bg-orange-50 border border-orange-200 p-3 rounded-md">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm">
                                <p className="font-medium text-orange-900">
                                  ⚠️ {relacionesProyecto.cotizacionesPendientes} cotización(es) pendiente(s)
                                </p>
                                <p className="text-orange-700 mt-1">
                                  Estas cotizaciones perderán la referencia al proyecto
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sin relaciones críticas */}
                        {relacionesProyecto.oportunidadesActivas === 0 && 
                         relacionesProyecto.cotizacionesPendientes === 0 && (
                          <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <p className="text-sm text-green-800">
                                No hay oportunidades ni cotizaciones asociadas
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Checkbox de confirmación para casos críticos */}
                        {(relacionesProyecto.oportunidadesActivas > 0 || 
                          relacionesProyecto.cotizacionesPendientes > 0) && (
                          <div className="flex items-start gap-2 pt-2">
                            <Checkbox
                              id="confirmar"
                              checked={confirmoConsecuencias}
                              onCheckedChange={(checked) => setConfirmoConsecuencias(checked === true)}
                            />
                            <label
                              htmlFor="confirmar"
                              className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              Entiendo las consecuencias y deseo continuar
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cargando || verificandoRelaciones}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDesasociacion}
              disabled={
                cargando || 
                verificandoRelaciones ||
                (relacionesProyecto !== null && 
                 (relacionesProyecto.oportunidadesActivas > 0 || relacionesProyecto.cotizacionesPendientes > 0) && 
                 !confirmoConsecuencias)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {cargando ? 'Desasociando...' : 'Desasociar proyecto'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
