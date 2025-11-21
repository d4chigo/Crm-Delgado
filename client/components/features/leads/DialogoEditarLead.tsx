'use client';

import { useState, useEffect } from 'react';
import { Contacto, ActualizarContactoDTO, EstadoLead } from '@/types';
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
import { 
  Loader2, 
  User, 
  Briefcase, 
  TrendingUp, 
  FolderOpen, 
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Share2
} from 'lucide-react';
import { SelectorEtiquetas } from './SelectorEtiquetas';
import { ProyectosAsociados } from './ProyectosAsociados';
import { ESTADOS_LEAD_DISPLAY } from '@/types/estadoLead.types';
import { validarTexto, validarDNI, validarTelefono, calcularEdad, obtenerFechaMaxima, esMayorDeEdad } from '@/lib/validaciones';
import { dniService } from '@/services/api/dni.service';

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
  const [consultandoDNI, setConsultandoDNI] = useState(false);

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
        fuente: lead.fuente || '',
        fechaSeguimiento: lead.fechaSeguimiento || '',
        notas: lead.notas || '',
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

  const handleConsultarDNI = async () => {
    const dniLimpio = (datos.dni || '').replace(/\D/g, '');
    
    if (!dniLimpio || dniLimpio.length !== 8) {
      toast({
        title: 'Error',
        description: 'Ingresa un DNI válido (8 dígitos)',
        variant: 'destructive',
      });
      return;
    }

    setConsultandoDNI(true);
    try {
      const resultado = await dniService.consultarDNI(dniLimpio);
      
      setDatos({
        ...datos,
        nombre: resultado.nombre || datos.nombre,
        apellido: resultado.apellido || datos.apellido,
      });

      toast({
        title: 'DNI consultado',
        description: `Datos encontrados para ${resultado.nombre} ${resultado.apellido}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error al consultar DNI',
        description: error.message || 'No se pudo obtener los datos del DNI',
        variant: 'destructive',
      });
    } finally {
      setConsultandoDNI(false);
    }
  };

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
          // Limpiar teléfono: solo dígitos
          if (key === 'telefono' && typeof value === 'string') {
            const telefonoLimpio = value.replace(/\D/g, ''); // Eliminar todo lo que no sea dígito
            if (telefonoLimpio) {
              datosLimpios[key] = telefonoLimpio;
            }
          }
          // Limpiar DNI: solo dígitos
          else if (key === 'dni' && typeof value === 'string') {
            const dniLimpio = value.replace(/\D/g, '');
            if (dniLimpio) {
              datosLimpios[key] = dniLimpio;
            }
          }
          // Convertir fechas al formato ISO datetime
          else if (key === 'fechaNacimiento' && value) {
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

      let resultado: any = {};
      try {
        resultado = await respuesta.json();
      } catch (parseError) {
        console.warn('No se pudo parsear la respuesta como JSON:', parseError);
        resultado = { mensaje: respuesta.statusText || 'Error desconocido' };
      }

      console.log('Resultado:', resultado);

      if (!respuesta.ok) {
        // Log del error completo para debug
        console.error('Error response:', {
          status: respuesta.status,
          statusText: respuesta.statusText,
          resultado
        });

        // Mostrar detalles específicos de validación
        if (resultado.detalles && Array.isArray(resultado.detalles)) {
          console.error('Detalles de validación COMPLETOS:', JSON.stringify(resultado.detalles, null, 2));
          const errores = resultado.detalles.map((d: any) => {
            const campo = d.campo || d.path || (d.path && Array.isArray(d.path) ? d.path.join('.') : 'campo desconocido');
            const mensaje = d.mensaje || d.message || d.msg || 'error desconocido';
            return `${campo}: ${mensaje}`;
          }).join(', ');
          throw new Error(`Error de validación: ${errores}`);
        }

        // Manejo específico de errores de duplicidad (409)
        if (respuesta.status === 409) {
          const mensajeDuplicado = resultado.mensaje || 'Este dato ya existe en el sistema';
          // Log explícito del error de duplicidad
          console.error('⚠️ DUPLICIDAD DETECTADA:', mensajeDuplicado);
          throw new Error(`⚠️ ${mensajeDuplicado}`);
        }

        throw new Error(resultado.mensaje || resultado.error || 'Error al actualizar lead');
      }

      toast({
        title: '✅ Lead actualizado',
        description: 'Los cambios se han guardado exitosamente',
      });

      onActualizado();
      onCerrar();
    } catch (error: any) {
      console.error('❌ Error al guardar lead:', error);
      
      // Extraer el mensaje de error de diferentes fuentes
      let mensajeError = 'No se pudo actualizar el lead. Intenta nuevamente.';
      
      if (error?.message) {
        mensajeError = error.message;
      } else if (typeof error === 'string') {
        mensajeError = error;
      }

      // Mostrar el error de forma prominente en una notificación
      toast({
        title: '❌ Error al actualizar lead',
        description: mensajeError,
        variant: 'destructive',
        duration: 6000,
      });
    } finally {
      setGuardando(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <DialogContent size="2xl" className="max-h-[90vh] overflow-y-auto border-[#FCBA00]/30">
        <DialogHeader className="border-b border-[#FCBA00]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FCBA00] rounded-lg flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-[#303030]" />
            </div>
            <div>
              <DialogTitle className="text-xl">Editar Lead</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                {lead.nombre} {lead.apellido} • Actualiza la información de este contacto
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-[#FCBA00]/5 to-transparent border-b border-[#FCBA00]/20 rounded-none p-0">
            <TabsTrigger 
              value="personal" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FCBA00] data-[state=active]:bg-[#FCBA00]/5 transition-all"
            >
              <User className="w-4 h-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger 
              value="profesional" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FCBA00] data-[state=active]:bg-[#FCBA00]/5 transition-all"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Profesional
            </TabsTrigger>
            <TabsTrigger 
              value="comercial" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FCBA00] data-[state=active]:bg-[#FCBA00]/5 transition-all"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Comercial
            </TabsTrigger>
            <TabsTrigger 
              value="proyectos" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FCBA00] data-[state=active]:bg-[#FCBA00]/5 transition-all"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Proyectos
            </TabsTrigger>
            <TabsTrigger 
              value="adicional" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FCBA00] data-[state=active]:bg-[#FCBA00]/5 transition-all"
            >
              <FileText className="w-4 h-4 mr-2" />
              Adicional
            </TabsTrigger>
          </TabsList>

          {/* Tab: Información Personal */}
          <TabsContent value="personal" className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                  <User className="w-4 h-4 text-[#FCBA00]" />
                  Nombre *
                </Label>
                <Input
                  id="nombre"
                  value={datos.nombre || ''}
                  onChange={(e) => setDatos({ ...datos, nombre: validarTexto(e.target.value) })}
                  placeholder="Nombre del lead"
                  className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                  <User className="w-4 h-4 text-[#FCBA00]" />
                  Apellido
                </Label>
                <Input
                  id="apellido"
                  value={datos.apellido || ''}
                  onChange={(e) => setDatos({ ...datos, apellido: validarTexto(e.target.value) })}
                  placeholder="Apellido del lead"
                  className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                  <Mail className="w-4 h-4 text-[#FCBA00]" />
                  Correo electrónico
                </Label>
                <Input
                  id="correo"
                  type="text"
                  value={datos.correo || ''}
                  onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                  <Phone className="w-4 h-4 text-[#FCBA00]" />
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  value={datos.telefono || ''}
                  onChange={(e) => setDatos({ ...datos, telefono: validarTelefono(e.target.value) })}
                  placeholder="+51 999 999 999"
                  className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dni" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                  <FileText className="w-4 h-4 text-[#FCBA00]" />
                  DNI
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="dni"
                    value={datos.dni || ''}
                    onChange={(e) => setDatos({ ...datos, dni: validarDNI(e.target.value) })}
                    placeholder="12345678"
                    maxLength={8}
                    className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                  />
                  <Button
                    type="button"
                    onClick={handleConsultarDNI}
                    disabled={consultandoDNI || !datos.dni}
                    className="bg-[#FCBA00] hover:bg-[#E5A200] text-[#303030] font-semibold px-4"
                  >
                    {consultandoDNI ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Consultar'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexo" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                  <User className="w-4 h-4 text-[#FCBA00]" />
                  Sexo
                </Label>
                <Select
                  value={datos.sexo || ''}
                  onValueChange={(value) => setDatos({ ...datos, sexo: value as any })}
                >
                  <SelectTrigger className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]">
                    <SelectValue placeholder="Seleccionar sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMENINO">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                  <Calendar className="w-4 h-4 text-[#FCBA00]" />
                  Fecha de nacimiento
                  {edad !== null && <span className="text-xs text-muted-foreground ml-1">({edad} años)</span>}
                </Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  max={obtenerFechaMaxima()}
                  value={datos.fechaNacimiento?.split('T')[0] || ''}
                  onChange={(e) => {
                    setDatos({ ...datos, fechaNacimiento: e.target.value });
                    setEdad(calcularEdad(e.target.value));
                  }}
                  className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                />
                {edad !== null && edad < 18 && (
                  <p className="text-xs text-destructive font-semibold">⚠️ El lead debe ser mayor de 18 años</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ciudad" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                  <MapPin className="w-4 h-4 text-[#FCBA00]" />
                  Ciudad
                </Label>
                <Input
                  id="ciudad"
                  value={datos.ciudad || ''}
                  onChange={(e) => setDatos({ ...datos, ciudad: e.target.value })}
                  placeholder="Lima"
                  className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                <MapPin className="w-4 h-4 text-[#FCBA00]" />
                Dirección completa
              </Label>
              <Input
                id="direccion"
                value={datos.direccion || ''}
                onChange={(e) => setDatos({ ...datos, direccion: e.target.value })}
                placeholder="Av. Principal 123, Distrito"
                className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departamento" className="text-xs font-semibold text-[#303030]">Departamento</Label>
                <Input
                  id="departamento"
                  value={datos.departamento || ''}
                  onChange={(e) => setDatos({ ...datos, departamento: e.target.value })}
                  placeholder="Lima"
                  className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provincia" className="text-xs font-semibold text-[#303030]">Provincia</Label>
                <Input
                  id="provincia"
                  value={datos.provincia || ''}
                  onChange={(e) => setDatos({ ...datos, provincia: e.target.value })}
                  placeholder="Lima"
                  className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distrito" className="text-xs font-semibold text-[#303030]">Distrito</Label>
                <Input
                  id="distrito"
                  value={datos.distrito || ''}
                  onChange={(e) => setDatos({ ...datos, distrito: e.target.value })}
                  placeholder="Miraflores"
                  className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab: Información Profesional */}
          <TabsContent value="profesional" className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                  <Briefcase className="w-4 h-4 text-[#FCBA00]" />
                  Empresa
                </Label>
                <Input
                  id="empresa"
                  value={datos.empresa || ''}
                  onChange={(e) => setDatos({ ...datos, empresa: e.target.value })}
                  placeholder="Nombre de la empresa"
                  className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                  <Briefcase className="w-4 h-4 text-[#FCBA00]" />
                  Cargo
                </Label>
                <Input
                  id="cargo"
                  value={datos.cargo || ''}
                  onChange={(e) => setDatos({ ...datos, cargo: e.target.value })}
                  placeholder="Gerente, Director, etc."
                  className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                />
              </div>
            </div>

            <div className="space-y-3 bg-gradient-to-br from-[#FCBA00]/5 to-[#FCBA00]/0 border border-[#FCBA00]/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-[#FCBA00] rounded-full"></div>
                <Label className="text-sm font-bold text-[#303030]">Etiquetas y programas</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Selecciona los programas o categorías que aplican a este lead
              </p>
              <SelectorEtiquetas
                contactoId={lead.id}
                etiquetasSeleccionadas={lead.etiquetas?.map(e => e.etiqueta.id) || []}
                modo="radio"
              />
            </div>
          </TabsContent>

          {/* Tab: Información Comercial */}
          <TabsContent value="comercial" className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="presupuesto" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                  <DollarSign className="w-4 h-4 text-[#FCBA00]" />
                  Presupuesto estimado
                </Label>
                <div className="relative">
                  <Input
                    id="presupuesto"
                    type="number"
                    step="0.01"
                    min="0"
                    value={datos.presupuesto || ''}
                    onChange={(e) => setDatos({ ...datos, presupuesto: parseFloat(e.target.value) || undefined })}
                    placeholder="0.00"
                    className="pl-8 border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                  />
                  <span className="absolute left-3 top-3 text-[#FCBA00] font-semibold">S/</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuente" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                  <Share2 className="w-4 h-4 text-[#FCBA00]" />
                  Fuente de origen
                </Label>
                <Select
                  value={datos.fuente || ''}
                  onValueChange={(value) => setDatos({ ...datos, fuente: value })}
                >
                  <SelectTrigger className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]">
                    <SelectValue placeholder="Seleccionar fuente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TikTok">📱 TikTok</SelectItem>
                    <SelectItem value="YouTube">▶️ YouTube</SelectItem>
                    <SelectItem value="Instagram">📷 Instagram</SelectItem>
                    <SelectItem value="Facebook">👥 Facebook</SelectItem>
                    <SelectItem value="Recomendación">⭐ Recomendación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaSeguimiento" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                <Calendar className="w-4 h-4 text-[#FCBA00]" />
                Fecha de próximo seguimiento
              </Label>
              <Input
                id="fechaSeguimiento"
                type="datetime-local"
                value={datos.fechaSeguimiento?.substring(0, 16) || ''}
                onChange={(e) => setDatos({ ...datos, fechaSeguimiento: e.target.value })}
                className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
              />
            </div>
          </TabsContent>

          {/* Tab: Proyectos */}
          <TabsContent value="proyectos" className="space-y-4 pt-4">
            <div className="space-y-4 bg-gradient-to-br from-[#FCBA00]/5 to-[#FCBA00]/0 border border-[#FCBA00]/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#FCBA00]" />
                <Label className="text-sm font-bold text-[#303030]">Proyectos asociados</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Gestiona los proyectos o propiedades asociados a este cliente
              </p>
              <ProyectosAsociados clienteId={lead.id} onActualizado={onActualizado} />
            </div>
          </TabsContent>

          {/* Tab: Información Adicional */}
          <TabsContent value="adicional" className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label htmlFor="notas" className="flex items-center gap-2 text-sm font-semibold text-[#303030]">
                <FileText className="w-4 h-4 text-[#FCBA00]" />
                Notas generales
              </Label>
              <Textarea
                id="notas"
                value={datos.notas || ''}
                onChange={(e) => setDatos({ ...datos, notas: e.target.value })}
                placeholder="Notas, observaciones, comentarios sobre el lead..."
                rows={8}
                className="border-[#FCBA00]/20 focus:border-[#FCBA00] focus:ring-[#FCBA00]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t border-[#FCBA00]/20 pt-4 mt-4">
          <Button 
            variant="outline" 
            onClick={onCerrar} 
            disabled={guardando}
            className="border-[#FCBA00]/30 hover:bg-[#FCBA00]/5"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleGuardar} 
            disabled={guardando}
            className="bg-[#FCBA00] hover:bg-[#E5A200] text-[#303030] font-bold shadow-lg shadow-[#FCBA00]/20"
          >
            {guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
