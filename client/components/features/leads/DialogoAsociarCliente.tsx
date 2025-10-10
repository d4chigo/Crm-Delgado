'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import contactoService from '@/services/api/contacto.service';
import { useToast } from '@/hooks/use-toast';
import type { Contacto, TipoContacto } from '@/types/contacto.types';

interface DialogoAsociarClienteProps {
  abierto: boolean;
  onCerrar: () => void;
  leadId: string;
  onClienteAsociado?: () => void;
}

export function DialogoAsociarCliente({
  abierto,
  onCerrar,
  leadId,
  onClienteAsociado,
}: DialogoAsociarClienteProps) {
  const { toast } = useToast();
  const [busqueda, setBusqueda] = useState('');
  const [clientes, setClientes] = useState<Contacto[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [notas, setNotas] = useState('');
  const [estado, setEstado] = useState('En proceso');
  const [cargando, setCargando] = useState(false);
  const [asociando, setAsociando] = useState(false);

  // Cargar clientes cuando se abre el diálogo
  useEffect(() => {
    if (abierto) {
      cargarClientes();
    }
  }, [abierto, busqueda]);

  const cargarClientes = async () => {
    try {
      setCargando(true);
      const resultado = await contactoService.obtenerContactos({
        tipo: 'CLIENTE' as TipoContacto,
        busqueda: busqueda || undefined,
        limite: 50,
      });
      setClientes(resultado.contactos);
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

  const handleAsociar = async () => {
    if (!clienteSeleccionado) {
      toast({
        title: 'Cliente requerido',
        description: 'Debes seleccionar un cliente',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAsociando(true);
      await contactoService.asociarCliente(leadId, {
        clienteId: clienteSeleccionado,
        notas: notas || undefined,
        estado,
      });

      toast({
        title: 'Cliente asociado',
        description: 'El cliente ha sido asociado al lead exitosamente',
      });

      // Resetear formulario
      setClienteSeleccionado(null);
      setNotas('');
      setEstado('En proceso');
      
      onClienteAsociado?.();
      onCerrar();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo asociar el cliente',
        variant: 'destructive',
      });
    } finally {
      setAsociando(false);
    }
  };

  const clienteInfo = clienteSeleccionado
    ? clientes.find(c => c.id === clienteSeleccionado)
    : null;

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Asociar Cliente al Lead
          </DialogTitle>
          <DialogDescription>
            Selecciona un cliente existente para asociarlo a este lead y hacer seguimiento del proceso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Buscador de clientes */}
          <div className="space-y-2">
            <Label htmlFor="buscar">Buscar Cliente</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="buscar"
                placeholder="Buscar por nombre, correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Lista de clientes */}
          <div className="space-y-2">
            <Label>Seleccionar Cliente</Label>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              {cargando ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : clientes.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No se encontraron clientes
                </div>
              ) : (
                <div className="space-y-2">
                  {clientes.map((cliente) => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => setClienteSeleccionado(cliente.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                        clienteSeleccionado === cliente.id
                          ? 'border-primary bg-accent'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">
                            {cliente.nombre} {cliente.apellido}
                          </div>
                          {cliente.correo && (
                            <div className="text-sm text-muted-foreground">
                              {cliente.correo}
                            </div>
                          )}
                          {cliente.empresa && (
                            <div className="text-xs text-muted-foreground">
                              {cliente.empresa}
                            </div>
                          )}
                        </div>
                        {clienteSeleccionado === cliente.id && (
                          <Badge variant="default">Seleccionado</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Cliente seleccionado */}
          {clienteInfo && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="mb-2 text-sm font-medium">Cliente Seleccionado:</div>
              <div className="space-y-1 text-sm">
                <div className="font-medium">
                  {clienteInfo.nombre} {clienteInfo.apellido}
                </div>
                {clienteInfo.correo && (
                  <div className="text-muted-foreground">{clienteInfo.correo}</div>
                )}
                {clienteInfo.telefono && (
                  <div className="text-muted-foreground">{clienteInfo.telefono}</div>
                )}
              </div>
            </div>
          )}

          {/* Estado de la asociación */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado del Proceso</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger id="estado">
                <SelectValue placeholder="Seleccionar estado" />
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

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (Opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Agrega notas sobre esta asociación..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar} disabled={asociando}>
            Cancelar
          </Button>
          <Button onClick={handleAsociar} disabled={!clienteSeleccionado || asociando}>
            {asociando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asociando...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Asociar Cliente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
