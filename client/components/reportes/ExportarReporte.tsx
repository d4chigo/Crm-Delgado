'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, File } from 'lucide-react';
import { toast } from 'sonner';

interface ExportarReporteProps {
  tipoReporte: 'leads' | 'conversion' | 'actividad' | 'ventas-cerradas' | 'clientes-activos' | 'tiempo-eficiencia' | 'fuente-leads';
  nombreReporte: string;
  filtros?: {
    usuarioId?: string;
    fechaInicio?: string;
    fechaFin?: string;
  };
}

export function ExportarReporte({ tipoReporte, nombreReporte, filtros = {} }: ExportarReporteProps) {
  const [cargando, setCargando] = useState(false);

  const construirURL = (formato: 'pdf' | 'excel') => {
    const baseURL = `/api/reportes/${tipoReporte}/exportar/${formato}`;
    const params = new URLSearchParams();

    if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);

    return `${baseURL}${params.toString() ? '?' + params.toString() : ''}`;
  };

  const descargarReporte = async (formato: 'pdf' | 'excel') => {
    try {
      setCargando(true);
      const url = construirURL(formato);
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al descargar reporte');
      }

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;

      const timestamp = new Date().toISOString().split('T')[0];
      const nombreArchivo = `${nombreReporte.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.setAttribute('download', nombreArchivo);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      toast.success(`Reporte ${formato.toUpperCase()} descargado exitosamente`);
    } catch (error: any) {
      console.error('Error descargando reporte:', error);
      toast.error(error.message || 'Error al descargar reporte');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => descargarReporte('pdf')}
        disabled={cargando}
        variant="outline"
        size="sm"
        className="gap-2"
        title={`Descargar ${nombreReporte} en PDF`}
      >
        <FileText className="w-4 h-4" />
        PDF
      </Button>
      <Button
        onClick={() => descargarReporte('excel')}
        disabled={cargando}
        variant="outline"
        size="sm"
        className="gap-2"
        title={`Descargar ${nombreReporte} en Excel`}
      >
        <File className="w-4 h-4" />
        Excel
      </Button>
    </div>
  );
}

/**
 * Componente de ejemplo para usar en la página de reportes
 * 
 * Uso:
 * <ExportarReporte 
 *   tipoReporte="leads"
 *   nombreReporte="Reporte de Leads"
 *   filtros={{
 *     usuarioId: "user123",
 *     fechaInicio: "2024-01-01",
 *     fechaFin: "2024-12-31"
 *   }}
 * />
 */
