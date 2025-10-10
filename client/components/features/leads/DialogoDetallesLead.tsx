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
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="bg-[#FCBA00] p-2 rounded-lg">
              <User className="h-5 w-5 text-[#303030]" />
            </div>
            {lead.nombre} {lead.apellido}
          </DialogTitle>
          <DialogDescription className="text-base pt-1">
            Información detallada del lead
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-6 h-11">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="comercial">Comercial</TabsTrigger>
            <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="etiquetas">Etiquetas</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
          </TabsList>

          {/* Tab: Información Personal */}
          <TabsContent value="info" className="space-y-6 mt-6">
            {/* Sección: Contacto */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                  Información de Contacto
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Correo electrónico</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{lead.correo || 'No especificado'}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">Teléfono</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{lead.telefono || 'No especificado'}</p>
                </div>
              </div>
            </div>

            {/* Sección: Datos Personales */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                  Datos Personales
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">DNI</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{lead.dni || 'No especificado'}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Sexo</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{lead.sexo || 'No especificado'}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Fecha de nacimiento</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{formatearFecha(lead.fechaNacimiento)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Ciudad</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{lead.ciudad || 'No especificada'}</p>
                </div>
              </div>
            </div>

            {/* Sección: Ubicación */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                  Ubicación
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Dirección completa</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{lead.direccion || 'No especificada'}</p>
                </div>

                {(lead.departamento || lead.provincia || lead.distrito) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Departamento</p>
                      <p className="text-base text-[#303030]">{lead.departamento || '-'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Provincia</p>
                      <p className="text-base text-[#303030]">{lead.provincia || '-'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Distrito</p>
                      <p className="text-base text-[#303030]">{lead.distrito || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección: Información Laboral */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                  Información Laboral
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm font-medium">Empresa</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{lead.empresa || 'No especificada'}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm font-medium">Cargo</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{lead.cargo || 'No especificado'}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Información Comercial */}
          <TabsContent value="comercial" className="space-y-6 mt-6">
            {/* Sección: Estado y Prioridad */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                  Estado y Prioridad
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm font-medium">Estado del Lead</span>
                  </div>
                  <div className="pl-6">
                    <Badge className={obtenerColorEstado(lead.estadoLead)}>
                      {lead.estadoLead?.replace('_', ' ') || 'No definido'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">Prioridad</span>
                  </div>
                  <div className="pl-6">
                    <Badge className={obtenerColorPrioridad(lead.prioridad)}>
                      {lead.prioridad || 'No definida'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección: Información Financiera */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                  Información Financiera
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Presupuesto estimado</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">
                    {lead.presupuesto 
                      ? `S/ ${lead.presupuesto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                      : 'No especificado'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Probabilidad de cierre</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">
                    {lead.probabilidad !== undefined && lead.probabilidad !== null 
                      ? `${lead.probabilidad}%` 
                      : 'No especificada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sección: Origen */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                  Origen
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">Fuente de origen</span>
                </div>
                <p className="text-base text-[#303030] pl-6">{lead.fuente || 'No especificada'}</p>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Seguimiento */}
          <TabsContent value="seguimiento" className="space-y-6 mt-6">
            {/* Sección: Fechas Importantes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                  Fechas Importantes
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Fecha de creación</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{formatearFecha(lead.creadoEn)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Última actualización</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{formatearFecha(lead.actualizadoEn)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Próximo seguimiento</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{formatearFecha(lead.fechaSeguimiento)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Fecha de conversión</span>
                  </div>
                  <p className="text-base text-[#303030] pl-6">{formatearFecha(lead.fechaConversion)}</p>
                </div>
              </div>
            </div>

            {/* Sección: Línea de Tiempo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                  Línea de Tiempo
                </h3>
              </div>

              <div className="p-6 bg-muted/30 rounded-lg border border-border/40">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="text-sm text-muted-foreground font-medium">Creado como lead</span>
                    <span className="text-base text-[#303030] font-medium">{formatearFecha(lead.creadoEn)}</span>
                  </div>
                  {lead.fechaSeguimiento && (
                    <div className="flex justify-between items-center py-2 border-b border-border/20">
                      <span className="text-sm text-muted-foreground font-medium">Último seguimiento</span>
                      <span className="text-base text-[#303030] font-medium">{formatearFecha(lead.fechaSeguimiento)}</span>
                    </div>
                  )}
                  {lead.fechaConversion && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground font-medium">Convertido a cliente</span>
                      <span className="text-base text-[#303030] font-medium">{formatearFecha(lead.fechaConversion)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Clientes Asociados */}
          <TabsContent value="clientes" className="space-y-4 mt-6">
            <ClientesAsociados leadId={lead.id} />
          </TabsContent>

          {/* Tab: Etiquetas */}
          <TabsContent value="etiquetas" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                  Programas y Etiquetas
                </h3>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg border border-border/40">
                <SelectorEtiquetas
                  contactoId={lead.id}
                  etiquetasSeleccionadas={lead.etiquetas?.map(e => e.etiqueta.id) || []}
                  modo="checkbox"
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab: Notas */}
          <TabsContent value="notas" className="space-y-6 mt-6">
            {/* Sección: Notas Generales */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                  Notas Generales
                </h3>
              </div>
              
              {lead.notas ? (
                <div className="p-6 bg-muted/30 rounded-lg border border-border/40">
                  <p className="text-base text-[#303030] whitespace-pre-wrap leading-relaxed">
                    {lead.notas}
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-muted/30 rounded-lg border border-border/40 border-dashed">
                  <p className="text-base text-muted-foreground italic text-center">
                    No hay notas registradas
                  </p>
                </div>
              )}
            </div>

            {/* Sección: Intereses */}
            {lead.intereses && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                  <h3 className="text-sm font-semibold text-[#303030] uppercase tracking-wide">
                    Intereses del Lead
                  </h3>
                </div>
                
                <div className="p-6 bg-muted/30 rounded-lg border border-border/40">
                  <p className="text-base text-[#303030] whitespace-pre-wrap leading-relaxed">
                    {lead.intereses}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
