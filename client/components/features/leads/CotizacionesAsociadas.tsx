'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cotizacionService } from '@/services/api/cotizacion.service';
import { Cotizacion } from '@/types/cotizacion.types';
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

interface CotizacionesAsociadasProps {
  clienteId: string;
  onActualizado?: () => void;
  onAgregar?: () => void;
}

export function CotizacionesAsociadas({ 
  clienteId, 
  onActualizado,
  onAgregar
}: CotizacionesAsociadasProps) {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cotizacionAEliminar, setCotizacionAEliminar] = useState<Cotizacion | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    cargarCotizaciones();
  }, [clienteId]);

  const cargarCotizaciones = async () => {
    try {
      setCargando(true);
      const resultado = await cotizacionService.obtenerPorContacto(clienteId);
      setCotizaciones(resultado || []);
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las cotizaciones',
      });
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (cotizacion: Cotizacion) => {
    try {
      await cotizacionService.eliminar(cotizacion.id);
      toast({
        title: 'Cotización eliminada',
        description: `La cotización ${cotizacion.numeroReferencia} fue eliminada`,
      });
      cargarCotizaciones();
      onActualizado?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar la cotización',
      });
    }
  };

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      BORRADOR: 'bg-gray-100 text-gray-700',
      ENVIADA: 'bg-blue-100 text-blue-700',
      ACEPTADA: 'bg-green-100 text-green-700',
      RECHAZADA: 'bg-red-100 text-red-700',
      VENCIDA: 'bg-orange-100 text-orange-700',
    };
    return colores[estado] || 'bg-gray-100 text-gray-700';
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Cargando cotizaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {cotizaciones.length === 0 
            ? 'Sin cotizaciones registradas' 
            : `${cotizaciones.length} cotización(es) registrada(s)`}
        </p>
        <Button
          onClick={onAgregar}
          size="sm"
          className="bg-[#FCBA00] hover:bg-[#E5A200] text-[#303030] font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva cotización
        </Button>
      </div>

      {cotizaciones.length > 0 ? (
        <div className="space-y-3">
          {cotizaciones.map((cot) => (
            <div
              key={cot.id}
              className="flex items-start justify-between p-4 border border-[#FCBA00]/20 rounded-lg hover:bg-[#FCBA00]/5 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FCBA00]" />
                  <span className="font-semibold text-[#303030]">{cot.numeroReferencia}</span>
                  <Badge className={getEstadoColor(cot.estado)}>
                    {cot.estado}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{cot.nombreProyecto}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Precio: S/ {cot.precioInmueble?.toFixed(2) || '0.00'}</span>
                  <span>Total a pagar: S/ {cot.totalPagar?.toFixed(2) || '0.00'}</span>
                  {cot.fechaValidez && (
                    <span>Válida hasta: {new Date(cot.fechaValidez).toLocaleDateString('es-PE')}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  title="Ver detalles"
                  className="hover:text-[#FCBA00]"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title="Eliminar"
                  className="hover:text-red-500"
                  onClick={() => setCotizacionAEliminar(cot)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No hay cotizaciones para este cliente</p>
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!cotizacionAEliminar} onOpenChange={(open) => !open && setCotizacionAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cotización</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la cotización {cotizacionAEliminar?.numeroReferencia}? 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cotizacionAEliminar) {
                  handleEliminar(cotizacionAEliminar);
                  setCotizacionAEliminar(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
