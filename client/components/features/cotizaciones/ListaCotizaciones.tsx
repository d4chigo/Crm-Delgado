'use client';

import { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Send,
  Check,
  X,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import type { Cotizacion, EstadoCotizacion } from '@/types/cotizacion.types';
import { 
  ESTADOS_COTIZACION_LABELS,
  ESTADOS_COTIZACION_STYLES,
  TIPOS_CUOTA_LABELS
} from '@/types/cotizacion.types';

interface ListaCotizacionesProps {
  cotizaciones: Cotizacion[];
  loading?: boolean;
  onNueva?: () => void;
  onEditar?: (cotizacion: Cotizacion) => void;
  onEliminar?: (id: string) => void;
  onCambiarEstado?: (id: string, estado: EstadoCotizacion) => void;
  onVerDetalle?: (cotizacion: Cotizacion) => void;
  mostrarContacto?: boolean;
}

export const ListaCotizaciones = ({
  cotizaciones,
  loading = false,
  onNueva,
  onEditar,
  onEliminar,
  onCambiarEstado,
  onVerDetalle,
  mostrarContacto = false
}: ListaCotizacionesProps) => {
  const [cotizacionAEliminar, setCotizacionAEliminar] = useState<string | null>(null);

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(valor);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEliminar = () => {
    if (cotizacionAEliminar && onEliminar) {
      onEliminar(cotizacionAEliminar);
      setCotizacionAEliminar(null);
    }
  };

  const getIconoEstado = (estado: EstadoCotizacion) => {
    switch (estado) {
      case 'BORRADOR':
        return <Edit className="h-3 w-3" />;
      case 'ENVIADA':
        return <Send className="h-3 w-3" />;
      case 'ACEPTADA':
        return <Check className="h-3 w-3" />;
      case 'RECHAZADA':
        return <X className="h-3 w-3" />;
      case 'VENCIDA':
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cotizaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          No hay cotizaciones
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando una nueva cotización.
        </p>
        {onNueva && (
          <div className="mt-6">
            <Button onClick={onNueva}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cotización
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referencia</TableHead>
                <TableHead>Proyecto</TableHead>
                {mostrarContacto && <TableHead>Contacto</TableHead>}
                <TableHead>Tipo Cuota</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Cuota Mensual</TableHead>
                <TableHead className="text-right">Plazo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cotizaciones.map((cotizacion) => (
                <TableRow 
                  key={cotizacion.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onVerDetalle?.(cotizacion)}
                >
                  <TableCell className="font-medium">
                    {cotizacion.numeroReferencia}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{cotizacion.nombreProyecto}</div>
                      {cotizacion.tipoInmueble && (
                        <div className="text-sm text-gray-500">
                          {cotizacion.tipoInmueble}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {mostrarContacto && cotizacion.contacto && (
                    <TableCell>
                      {cotizacion.contacto.nombre} {cotizacion.contacto.apellido}
                    </TableCell>
                  )}
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {TIPOS_CUOTA_LABELS[cotizacion.tipoCuota]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatearMoneda(cotizacion.precioInmueble)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatearMoneda(cotizacion.cuotaMensualEstimada)}
                  </TableCell>
                  <TableCell className="text-right">
                    {cotizacion.plazoMeses} meses
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={ESTADOS_COTIZACION_STYLES[cotizacion.estado].badge}
                    >
                      <span className="flex items-center gap-1">
                        {getIconoEstado(cotizacion.estado)}
                        {ESTADOS_COTIZACION_LABELS[cotizacion.estado]}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatearFecha(cotizacion.creadoEn)}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {cotizacion.estado === 'BORRADOR' && onEditar && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditar(cotizacion)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {cotizacion.estado === 'BORRADOR' && onCambiarEstado && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCambiarEstado(cotizacion.id, 'ENVIADA')}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {onEliminar && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCotizacionAEliminar(cotizacion.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog 
        open={!!cotizacionAEliminar} 
        onOpenChange={() => setCotizacionAEliminar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cotización será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminar}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
