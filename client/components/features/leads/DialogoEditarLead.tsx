'use client';

import { useState, useEffect } from 'react';
import { Contacto, ActualizarContactoDTO, EstadoLead, Prioridad } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { SelectorEtiquetas } from './SelectorEtiquetas';
import { validarTexto, validarDNI, validarTelefono, calcularEdad, obtenerFechaMaxima, esMayorDeEdad } from '@/lib/validaciones';

interface DialogoEditarLeadProps {
  lead: Contacto | null;
  abierto: boolean;
  onCerrar: () => void;
  onActualizado: () => void;
}

export function DialogoEditarLead({
  lead,
  abierto,
  onCerrar,
  onActualizado
}: DialogoEditarLeadProps) {
  const [guardando, setGuardando] = useState(false);
  const [datos, setDatos] = useState<ActualizarContactoDTO>({});
  const [edad, setEdad] = useState<number | null>(null);

  // Inicializar datos cuando el lead cambia o el diálogo se abre
  useEffect(() => {
    if (abierto && lead) {
      setDatos({
        nombre: lead.nombre,
        apellido: lead.apellido || '',
        correo: lead.correo || '',
        telefono: lead.telefono || '',
        direccion: lead.direccion || '',
        ciudad: lead.ciudad || '',
        dni: lead.dni || '',
        sexo: lead.sexo,
        fechaNacimiento: lead.fechaNacimiento || '',
        empresa: lead.empresa || '',
        cargo: lead.cargo || '',
        presupuesto: lead.presupuesto || undefined,
        estadoLead: lead.estadoLead,
        prioridad: lead.prioridad,
        fuente: lead.fuente || '',
        probabilidad: lead.probabilidad || undefined,
        fechaSeguimiento: lead.fechaSeguimiento || '',
        notas: lead.notas || '',
        intereses: lead.intereses || '',
        departamento: lead.departamento || '',
        provincia: lead.provincia || '',
        distrito: lead.distrito || '',
      });
      
      // Calcular edad si hay fecha de nacimiento
      if (lead.fechaNacimiento) {
        setEdad(calcularEdad(lead.fechaNacimiento));
      } else {
        setEdad(null);
      }
    }
  }, [lead, abierto]);

  const handleGuardar = async () => {
    if (!lead) return;

    // Validar edad mínima
    if (datos.fechaNacimiento && !esMayorDeEdad(datos.fechaNacimiento)) {
      toast({
        title: 'Validación fallida',
        description: 'El lead debe ser mayor de 18 años',
        variant: 'destructive',
      });
      return;
    }

    setGuardando(true);
    try {
      const token = localStorage.getItem('crm_token');
      if (!token) {
        toast({
          title: 'Sesión expirada',
          description: 'Por favor inicia sesión nuevamente',
          variant: 'destructive',
        });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return;
      }

      // Limpiar datos vacíos y convertir fechas
      const datosLimpios: any = {};
      Object.entries(datos).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          // Convertir fechas al formato ISO datetime
          if (key === 'fechaNacimiento' && value) {
            // Si es solo fecha (YYYY-MM-DD), agregar hora 00:00:00
            if (typeof value === 'string' && !value.includes('T')) {
              datosLimpios[key] = `${value}T00:00:00.000Z`;
            } else {
              datosLimpios[key] = value;
            }
          } else if (key === 'fechaSeguimiento' && value) {
            // Si es datetime-local, convertir a ISO
            if (typeof value === 'string' && value.length === 16) {
              // datetime-local format: YYYY-MM-DDTHH:mm
              datosLimpios[key] = `${value}:00.000Z`;
            } else if (typeof value === 'string' && !value.endsWith('Z')) {
              datosLimpios[key] = `${value}.000Z`;
            } else {
              datosLimpios[key] = value;
            }
          } else {
            datosLimpios[key] = value;
          }
        }
      });

      console.log('Guardando lead:', lead.id);
      console.log('Datos a enviar:', datosLimpios);

      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contactos/${lead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosLimpios),
      });

      console.log('Respuesta status:', respuesta.status);

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

      const resultado = await respuesta.json();

      console.log('Resultado:', resultado);

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || resultado.error || 'Error al actualizar lead');
      }

      toast({
        title: 'Lead actualizado',
        description: 'Los cambios se han guardado exitosamente',
      });

      onActualizado();
      onCerrar();
    } catch (error: any) {
      console.error('Error al guardar lead:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el lead',
        variant: 'destructive',
      });
    } finally {
      setGuardando(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
          <DialogDescription>
            Modifica la información del lead
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="profesional">Profesional</TabsTrigger>
            <TabsTrigger value="comercial">Comercial</TabsTrigger>
            <TabsTrigger value="etiquetas">Etiquetas</TabsTrigger>
            <TabsTrigger value="adicional">Adicional</TabsTrigger>
          </TabsList>

          {/* Tab: Información Personal */}
          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={datos.nombre || ''}
                  onChange={(e) => setDatos({ ...datos, nombre: validarTexto(e.target.value) })}
                  placeholder="Nombre del lead"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={datos.apellido || ''}
                  onChange={(e) => setDatos({ ...datos, apellido: validarTexto(e.target.value) })}
                  placeholder="Apellido del lead"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo">Correo electrónico (Opcional)</Label>
                <Input
                  id="correo"
                  type="text"
                  value={datos.correo || ''}
                  onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
                  placeholder="correo@ejemplo.com (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={datos.telefono || ''}
                  onChange={(e) => setDatos({ ...datos, telefono: validarTelefono(e.target.value) })}
                  placeholder="+51 999 999 999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={datos.dni || ''}
                  onChange={(e) => setDatos({ ...datos, dni: validarDNI(e.target.value) })}
                  placeholder="12345678"
                  maxLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Select
                  value={datos.sexo || ''}
                  onValueChange={(value) => setDatos({ ...datos, sexo: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMENINO">Femenino</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">
                  Fecha de nacimiento
                  {edad !== null && <span className="text-muted-foreground ml-2">({edad} años)</span>}
                </Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  max={obtenerFechaMaxima()} // No permitir fechas futuras
                  value={datos.fechaNacimiento?.split('T')[0] || ''}
                  onChange={(e) => {
                    setDatos({ ...datos, fechaNacimiento: e.target.value });
                    setEdad(calcularEdad(e.target.value));
                  }}
                />
                {edad !== null && edad < 18 && (
                  <p className="text-sm text-destructive">El lead debe ser mayor de 18 años</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={datos.ciudad || ''}
                  onChange={(e) => setDatos({ ...datos, ciudad: e.target.value })}
                  placeholder="Lima"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección completa</Label>
              <Input
                id="direccion"
                value={datos.direccion || ''}
                onChange={(e) => setDatos({ ...datos, direccion: e.target.value })}
                placeholder="Av. Principal 123, Distrito"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  value={datos.departamento || ''}
                  onChange={(e) => setDatos({ ...datos, departamento: e.target.value })}
                  placeholder="Lima"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provincia">Provincia</Label>
                <Input
                  id="provincia"
                  value={datos.provincia || ''}
                  onChange={(e) => setDatos({ ...datos, provincia: e.target.value })}
                  placeholder="Lima"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distrito">Distrito</Label>
                <Input
                  id="distrito"
                  value={datos.distrito || ''}
                  onChange={(e) => setDatos({ ...datos, distrito: e.target.value })}
                  placeholder="Miraflores"
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab: Información Profesional */}
          <TabsContent value="profesional" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={datos.empresa || ''}
                  onChange={(e) => setDatos({ ...datos, empresa: e.target.value })}
                  placeholder="Nombre de la empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={datos.cargo || ''}
                  onChange={(e) => setDatos({ ...datos, cargo: e.target.value })}
                  placeholder="Gerente, Director, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intereses">Intereses</Label>
              <Textarea
                id="intereses"
                value={datos.intereses || ''}
                onChange={(e) => setDatos({ ...datos, intereses: e.target.value })}
                placeholder="¿Qué productos o servicios le interesan?"
                rows={4}
              />
            </div>
          </TabsContent>

          {/* Tab: Información Comercial */}
          <TabsContent value="comercial" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estadoLead">Estado del Lead</Label>
                <Select
                  value={datos.estadoLead || ''}
                  onValueChange={(value) => setDatos({ ...datos, estadoLead: value as EstadoLead })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NUEVO">Nuevo</SelectItem>
                    <SelectItem value="CONTACTADO">Contactado</SelectItem>
                    <SelectItem value="CALIFICADO">Calificado</SelectItem>
                    <SelectItem value="NEGOCIACION">Negociación</SelectItem>
                    <SelectItem value="PROPUESTA">Propuesta Enviada</SelectItem>
                    <SelectItem value="GANADO">Ganado</SelectItem>
                    <SelectItem value="PERDIDO">Perdido</SelectItem>
                    <SelectItem value="EN_ESPERA">En Espera</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={datos.prioridad || ''}
                  onValueChange={(value) => setDatos({ ...datos, prioridad: value as Prioridad })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BAJA">Baja</SelectItem>
                    <SelectItem value="MEDIA">Media</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="URGENTE">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="presupuesto">Presupuesto estimado (S/)</Label>
                <Input
                  id="presupuesto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={datos.presupuesto || ''}
                  onChange={(e) => setDatos({ ...datos, presupuesto: parseFloat(e.target.value) || undefined })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="probabilidad">Probabilidad de cierre (%)</Label>
                <Input
                  id="probabilidad"
                  type="number"
                  min="0"
                  max="100"
                  value={datos.probabilidad || ''}
                  onChange={(e) => setDatos({ ...datos, probabilidad: parseInt(e.target.value) || undefined })}
                  placeholder="0 - 100"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="fuente">Fuente de origen</Label>
                <Input
                  id="fuente"
                  value={datos.fuente || ''}
                  onChange={(e) => setDatos({ ...datos, fuente: e.target.value })}
                  placeholder="Redes sociales, Recomendación, Web, etc."
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="fechaSeguimiento">Fecha de próximo seguimiento</Label>
                <Input
                  id="fechaSeguimiento"
                  type="datetime-local"
                  value={datos.fechaSeguimiento?.substring(0, 16) || ''}
                  onChange={(e) => setDatos({ ...datos, fechaSeguimiento: e.target.value })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab: Etiquetas */}
          <TabsContent value="etiquetas" className="space-y-4">
            <div className="space-y-2">
              <Label>Programas y etiquetas</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Selecciona los programas o categorías que aplican a este lead
              </p>
              <SelectorEtiquetas
                contactoId={lead.id}
                etiquetasSeleccionadas={lead.etiquetas?.map(e => e.etiqueta.id) || []}
                modo="checkbox"
              />
            </div>
          </TabsContent>

          {/* Tab: Información Adicional */}
          <TabsContent value="adicional" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notas">Notas generales</Label>
              <Textarea
                id="notas"
                value={datos.notas || ''}
                onChange={(e) => setDatos({ ...datos, notas: e.target.value })}
                placeholder="Notas, observaciones, comentarios sobre el lead..."
                rows={8}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={guardando}>
            {guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
