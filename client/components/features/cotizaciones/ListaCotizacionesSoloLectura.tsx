'use client';

import type { Cotizacion } from '@/types/cotizacion.types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ListaCotizacionesSoloLecturaProps {
  cotizaciones: Cotizacion[];
  loading: boolean;
}

export function ListaCotizacionesSoloLectura({ cotizaciones, loading }: ListaCotizacionesSoloLecturaProps) {

  const getEstadoColor = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case 'creado': return 'bg-blue-100 text-blue-800';
      case 'enviado': return 'bg-purple-100 text-purple-800';
      case 'aceptado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'vencido': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(valor);
  };

  if (loading) {
    return <p>Cargando cotizaciones...</p>;
  }

  if (cotizaciones.length === 0) {
    return <p>No hay cotizaciones para este contacto.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Cotizaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proyecto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cotizaciones.map((cotizacion) => (
              <TableRow key={cotizacion.id}>
                <TableCell>{cotizacion.nombreProyecto}</TableCell>
                <TableCell>{format(new Date(cotizacion.creadoEn), "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell>{formatearMoneda(cotizacion.precioInmueble)}</TableCell>
                <TableCell>
                  <Badge className={getEstadoColor(cotizacion.estado)}>{cotizacion.estado}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
