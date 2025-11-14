'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { EstadoLead, ESTADOS_LEAD_DISPLAY } from '@/types/estadoLead.types';
import contactoService from '@/services/api/contacto.service';

interface DialogoCambiarEstadoProps {
  abierto: boolean;
  onCerrar: () => void;
  leadId: string;
  estadoActual?: string;
  nombreLead: string;
  onActualizado?: () => void;
}

export function DialogoCambiarEstado({
  abierto,
  onCerrar,
  leadId,
  estadoActual,
  nombreLead,
  onActualizado
}: DialogoCambiarEstadoProps) {
  const [nuevoEstado, setNuevoEstado] = useState<string>(estadoActual || EstadoLead.NUEVO);
  const [nota, setNota] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleCambiarEstado = async () => {
    if (!nota.trim()) {
      toast({
        title: 'Nota requerida',
        description: 'Por favor ingresa el motivo del cambio de estado',
        variant: 'destructive'
      });
      return;
    }

    setCargando(true);
    try {
      const token = localStorage.getItem('crm_token');
      if (!token) {
        toast({
          title: 'Sesión expirada',
          description: 'Por favor inicia sesión nuevamente',
          variant: 'destructive'
        });
        return;
      }

      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contactos/${leadId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            estadoLead: nuevoEstado,
            notas: `[${new Date().toLocaleString('es-PE')}] Estado cambiado a ${ESTADOS_LEAD_DISPLAY[nuevoEstado as EstadoLead]?.label}: ${nota}`
          })
        }
      );

      if (respuesta.status === 401) {
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
        toast({
          title: 'Sesión expirada',
          description: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          variant: 'destructive'
        });
        return;
      }

      if (!respuesta.ok) {
        const error = await respuesta.json();
        throw new Error(error.mensaje || 'Error al cambiar estado');
      }

      toast({
        title: 'Éxito',
        description: `Estado actualizado a ${ESTADOS_LEAD_DISPLAY[nuevoEstado as EstadoLead]?.label}`
      });

      setNota('');
      onCerrar();
      onActualizado?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cambiar el estado',
        variant: 'destructive'
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Estado del Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Lead: {nombreLead}</p>
            <p className="text-sm text-gray-600">
              Estado actual: <span className="font-semibold">{ESTADOS_LEAD_DISPLAY[estadoActual as EstadoLead]?.label || 'Sin definir'}</span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nuevo Estado</label>
            <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EstadoLead.NUEVO}>
                  {ESTADOS_LEAD_DISPLAY[EstadoLead.NUEVO].icon} {ESTADOS_LEAD_DISPLAY[EstadoLead.NUEVO].label}
                </SelectItem>
                <SelectItem value={EstadoLead.CONTACTADO}>
                  {ESTADOS_LEAD_DISPLAY[EstadoLead.CONTACTADO].icon} {ESTADOS_LEAD_DISPLAY[EstadoLead.CONTACTADO].label}
                </SelectItem>
                <SelectItem value={EstadoLead.CALIFICADO}>
                  {ESTADOS_LEAD_DISPLAY[EstadoLead.CALIFICADO].icon} {ESTADOS_LEAD_DISPLAY[EstadoLead.CALIFICADO].label}
                </SelectItem>
                <SelectItem value={EstadoLead.PERDIDO}>
                  {ESTADOS_LEAD_DISPLAY[EstadoLead.PERDIDO].icon} {ESTADOS_LEAD_DISPLAY[EstadoLead.PERDIDO].label}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Motivo del cambio <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Describe por qué cambias el estado de este lead..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="min-h-24 resize-none"
            />
            <p className="text-xs text-gray-500">
              Esta nota se agregará al historial del lead
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </Button>
          <Button
            onClick={handleCambiarEstado}
            disabled={cargando || !nota.trim()}
            className="bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030]"
          >
            {cargando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Cambiar Estado'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
