'use client';

import { Contacto, EstadoLead, Prioridad } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  FileText,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  Target,
  Activity,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SelectorEtiquetas } from './SelectorEtiquetas';
import { ClientesAsociados } from './ClientesAsociados';

interface DialogoDetallesLeadProps {
  lead: Contacto | null;
  abierto: boolean;
  onCerrar: () => void;
}

export function DialogoDetallesLead({
  lead,
  abierto,
  onCerrar
}: DialogoDetallesLeadProps) {
  if (!lead) return null;

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'No especificada';
    try {
      return format(new Date(fecha), "dd 'de' MMMM, yyyy", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const obtenerColorEstado = (estado?: EstadoLead): string => {
    const colores: Record<string, string> = {
      'NUEVO': 'bg-blue-100 text-blue-800',
      'CONTACTADO': 'bg-purple-100 text-purple-800',
      'CALIFICADO': 'bg-green-100 text-green-800',
      'NEGOCIACION': 'bg-yellow-100 text-yellow-800',
      'PROPUESTA': 'bg-orange-100 text-orange-800',
      'GANADO': 'bg-emerald-100 text-emerald-800',
      'PERDIDO': 'bg-red-100 text-red-800',
      'EN_ESPERA': 'bg-gray-100 text-gray-800',
    };
    return estado ? colores[estado] : 'bg-gray-100 text-gray-800';
  };

  const obtenerColorPrioridad = (prioridad?: Prioridad): string => {
    const colores: Record<string, string> = {
      'BAJA': 'bg-gray-100 text-gray-800',
      'MEDIA': 'bg-blue-100 text-blue-800',
      'ALTA': 'bg-orange-100 text-orange-800',
      'URGENTE': 'bg-red-100 text-red-800',
    };
    return prioridad ? colores[prioridad] : 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" />
            {lead.nombre} {lead.apellido}
          </DialogTitle>
          <DialogDescription>
            Información detallada del lead
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="comercial">Comercial</TabsTrigger>
            <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="etiquetas">Etiquetas</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
          </TabsList>

          {/* Tab: Información Personal */}
          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Correo electrónico</span>
                </div>
                <p className="text-sm">{lead.correo || 'No especificado'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">Teléfono</span>
                </div>
                <p className="text-sm">{lead.telefono || 'No especificado'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="font-medium">DNI</span>
                </div>
                <p className="text-sm">{lead.dni || 'No especificado'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Sexo</span>
                </div>
                <p className="text-sm">{lead.sexo || 'No especificado'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Fecha de nacimiento</span>
                </div>
                <p className="text-sm">{formatearFecha(lead.fechaNacimiento)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Ciudad</span>
                </div>
                <p className="text-sm">{lead.ciudad || 'No especificada'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Dirección completa</span>
              </div>
              <p className="text-sm">{lead.direccion || 'No especificada'}</p>
            </div>

            {(lead.departamento || lead.provincia || lead.distrito) && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Departamento</p>
                  <p className="text-sm">{lead.departamento || '-'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Provincia</p>
                  <p className="text-sm">{lead.provincia || '-'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Distrito</p>
                  <p className="text-sm">{lead.distrito || '-'}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-medium">Empresa</span>
                </div>
                <p className="text-sm">{lead.empresa || 'No especificada'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-medium">Cargo</span>
                </div>
                <p className="text-sm">{lead.cargo || 'No especificado'}</p>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Información Comercial */}
          <TabsContent value="comercial" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span className="font-medium">Estado del Lead</span>
                </div>
                <Badge className={obtenerColorEstado(lead.estadoLead)}>
                  {lead.estadoLead?.replace('_', ' ') || 'No definido'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">Prioridad</span>
                </div>
                <Badge className={obtenerColorPrioridad(lead.prioridad)}>
                  {lead.prioridad || 'No definida'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Presupuesto estimado</span>
                </div>
                <p className="text-sm">
                  {lead.presupuesto 
                    ? `S/ ${lead.presupuesto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                    : 'No especificado'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">Probabilidad de cierre</span>
                </div>
                <p className="text-sm">
                  {lead.probabilidad !== undefined && lead.probabilidad !== null 
                    ? `${lead.probabilidad}%` 
                    : 'No especificada'}
                </p>
              </div>

              <div className="space-y-2 col-span-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span className="font-medium">Fuente de origen</span>
                </div>
                <p className="text-sm">{lead.fuente || 'No especificada'}</p>
              </div>
            </div>

            {lead.intereses && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">Intereses</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{lead.intereses}</p>
              </div>
            )}
          </TabsContent>

          {/* Tab: Seguimiento */}
          <TabsContent value="seguimiento" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Fecha de creación</span>
                </div>
                <p className="text-sm">{formatearFecha(lead.creadoEn)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Última actualización</span>
                </div>
                <p className="text-sm">{formatearFecha(lead.actualizadoEn)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Próximo seguimiento</span>
                </div>
                <p className="text-sm">{formatearFecha(lead.fechaSeguimiento)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Fecha de conversión</span>
                </div>
                <p className="text-sm">{formatearFecha(lead.fechaConversion)}</p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Línea de tiempo</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creado como lead</span>
                  <span>{formatearFecha(lead.creadoEn)}</span>
                </div>
                {lead.fechaSeguimiento && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Último seguimiento</span>
                    <span>{formatearFecha(lead.fechaSeguimiento)}</span>
                  </div>
                )}
                {lead.fechaConversion && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Convertido a cliente</span>
                    <span>{formatearFecha(lead.fechaConversion)}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab: Clientes Asociados */}
          <TabsContent value="clientes" className="space-y-4">
            <ClientesAsociados leadId={lead.id} />
          </TabsContent>

          {/* Tab: Etiquetas */}
          <TabsContent value="etiquetas" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Tag className="h-4 w-4" />
                <span className="font-medium">Programas y etiquetas</span>
              </div>
              <SelectorEtiquetas
                contactoId={lead.id}
                etiquetasSeleccionadas={lead.etiquetas?.map(e => e.etiqueta.id) || []}
                modo="checkbox"
              />
            </div>
          </TabsContent>

          {/* Tab: Notas */}
          <TabsContent value="notas" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Notas generales</span>
              </div>
              {lead.notas ? (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{lead.notas}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No hay notas registradas</p>
              )}
            </div>

            {lead.intereses && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">Intereses del lead</span>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{lead.intereses}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
