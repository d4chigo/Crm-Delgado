'use client';

import { useState, useEffect } from 'react';
import { Users, Loader2, Pencil, Trash2, UserPlus, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import contactoService from '@/services/api/contacto.service';
import { useToast } from '@/hooks/use-toast';
import type { LeadCliente } from '@/types/contacto.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DialogoAsociarCliente } from './DialogoAsociarCliente';

interface ClientesAsociadosProps {
  leadId: string;
}

export function ClientesAsociados({ leadId }: ClientesAsociadosProps) {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<LeadCliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [dialogoAsociar, setDialogoAsociar] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [dialogoEliminar, setDialogoEliminar] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<LeadCliente | null>(null);
  const [notasEdicion, setNotasEdicion] = useState('');
  const [estadoEdicion, setEstadoEdicion] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, [leadId]);

  const cargarClientes = async () => {
    try {
      setCargando(true);
      const data = await contactoService.obtenerClientesDeLeads(leadId);
      setClientes(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar los clientes',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  const handleAbrirEditar = (cliente: LeadCliente) => {
    setClienteSeleccionado(cliente);
    setNotasEdicion(cliente.notas || '');
    setEstadoEdicion(cliente.estado || 'En proceso');
    setDialogoEditar(true);
  };

  const handleGuardarEdicion = async () => {
    if (!clienteSeleccionado) return;

    try {
      setGuardando(true);
      await contactoService.actualizarAsociacion(
        leadId,
        clienteSeleccionado.clienteId,
        {
          notas: notasEdicion || undefined,
          estado: estadoEdicion,
        }
      );

      toast({
        title: 'Asociación actualizada',
        description: 'Los cambios se guardaron correctamente',
      });

      setDialogoEditar(false);
      cargarClientes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la asociación',
        variant: 'destructive',
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleAbrirEliminar = (cliente: LeadCliente) => {
    setClienteSeleccionado(cliente);
    setDialogoEliminar(true);
  };

  const handleEliminar = async () => {
    if (!clienteSeleccionado) return;

    try {
      await contactoService.desasociarCliente(leadId, clienteSeleccionado.clienteId);

      toast({
        title: 'Cliente desasociado',
        description: 'El cliente ha sido removido del lead',
      });

      setDialogoEliminar(false);
      cargarClientes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo desasociar el cliente',
        variant: 'destructive',
      });
    }
  };

  const getEstadoColor = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case 'completado':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'en proceso':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'pendiente':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'en espera':
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'cancelado':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes Asociados
              </CardTitle>
              <CardDescription>
                Clientes vinculados a este lead para seguimiento
              </CardDescription>
            </div>
            <Button onClick={() => setDialogoAsociar(true)} size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Asociar Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : clientes.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-sm font-medium">No hay clientes asociados</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Comienza asociando un cliente a este lead
              </p>
              <Button
                onClick={() => setDialogoAsociar(true)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Asociar Cliente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {clientes.map((cliente) => (
                <div
                  key={cliente.clienteId}
                  className="group rounded-lg border p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {cliente.cliente?.nombre} {cliente.cliente?.apellido}
                        </h4>
                        <Badge className={getEstadoColor(cliente.estado)}>
                          {cliente.estado || 'En proceso'}
                        </Badge>
                      </div>

                      {cliente.cliente?.correo && (
                        <p className="text-sm text-muted-foreground">
                          {cliente.cliente.correo}
                        </p>
                      )}

                      {cliente.cliente?.empresa && (
                        <p className="text-xs text-muted-foreground">
                          {cliente.cliente.empresa}
                          {cliente.cliente.cargo && ` • ${cliente.cliente.cargo}`}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(cliente.asociadoEn), "d 'de' MMMM, yyyy", {
                            locale: es,
                          })}
                        </span>
                      </div>

                      {cliente.notas && (
                        <div className="rounded-md bg-muted/50 p-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <p className="flex-1 text-muted-foreground">{cliente.notas}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAbrirEditar(cliente)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAbrirEliminar(cliente)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para asociar cliente */}
      <DialogoAsociarCliente
        abierto={dialogoAsociar}
        onCerrar={() => setDialogoAsociar(false)}
        leadId={leadId}
        onClienteAsociado={cargarClientes}
      />

      {/* Diálogo para editar asociación */}
      <Dialog open={dialogoEditar} onOpenChange={setDialogoEditar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Asociación</DialogTitle>
            <DialogDescription>
              Actualiza el estado o las notas de la asociación con{' '}
              {clienteSeleccionado?.cliente?.nombre}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="estado-edit">Estado del Proceso</Label>
              <Select value={estadoEdicion} onValueChange={setEstadoEdicion}>
                <SelectTrigger id="estado-edit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="En proceso">En proceso</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                  <SelectItem value="En espera">En espera</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas-edit">Notas</Label>
              <Textarea
                id="notas-edit"
                placeholder="Agrega notas sobre esta asociación..."
                value={notasEdicion}
                onChange={(e) => setNotasEdicion(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoEditar(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarEdicion} disabled={guardando}>
              {guardando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={dialogoEliminar} onOpenChange={setDialogoEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desasociar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción removerá la asociación de{' '}
              <strong>
                {clienteSeleccionado?.cliente?.nombre}{' '}
                {clienteSeleccionado?.cliente?.apellido}
              </strong>{' '}
              con este lead. No se eliminará el cliente, solo la asociación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminar} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Desasociar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
