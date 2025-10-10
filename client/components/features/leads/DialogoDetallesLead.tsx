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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header con fondo amarillo */}
        <div className="bg-[#FCBA00] px-6 py-5 rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/90 p-3 rounded-xl w-16 h-16 flex items-center justify-center">
              <span className="text-3xl font-bold text-[#303030]">
                {lead.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-[#303030] mb-1">
                {lead.nombre} {lead.apellido}
              </DialogTitle>
              <div className="flex gap-2 flex-wrap">
                {lead.estadoLead && (
                  <Badge className={obtenerColorEstado(lead.estadoLead)}>
                    {lead.estadoLead.replace('_', ' ')}
                  </Badge>
                )}
                <Badge className="bg-white/20 text-[#303030] backdrop-blur-sm">
                  <Target className="h-3 w-3 mr-1" />
                  Score: 85
                </Badge>
                {lead.etiquetas && lead.etiquetas.length > 0 && lead.etiquetas.slice(0, 2).map((et, idx) => (
                  <Badge key={idx} className="bg-white/20 text-[#303030] backdrop-blur-sm">
                    {et.etiqueta.nombre}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido con padding */}
        <div className="px-6 py-5">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="inline-flex w-auto gap-3 bg-transparent p-0 mb-5">
              <TabsTrigger 
                value="info"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FCBA00] rounded-none px-4 py-2 border-b-2 border-transparent"
              >
                Información
              </TabsTrigger>
              <TabsTrigger 
                value="comercial"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FCBA00] rounded-none px-4 py-2 border-b-2 border-transparent"
              >
                Comercial
              </TabsTrigger>
              <TabsTrigger 
                value="seguimiento"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FCBA00] rounded-none px-4 py-2 border-b-2 border-transparent"
              >
                Seguimiento
              </TabsTrigger>
              <TabsTrigger 
                value="clientes"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FCBA00] rounded-none px-4 py-2 border-b-2 border-transparent"
              >
                Clientes
              </TabsTrigger>
              <TabsTrigger 
                value="etiquetas"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FCBA00] rounded-none px-4 py-2 border-b-2 border-transparent"
              >
                Etiquetas
              </TabsTrigger>
              <TabsTrigger 
                value="notas"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FCBA00] rounded-none px-4 py-2 border-b-2 border-transparent"
              >
                Notas
              </TabsTrigger>
            </TabsList>

          {/* Tab: Información Personal */}
          <TabsContent value="info" className="space-y-4">
            {/* Card: Información de Contacto */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-base font-bold text-[#303030]">
                  Información de Contacto
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Mail className="h-4 w-4 text-[#FCBA00]" />
                    <span className="text-xs font-semibold uppercase text-gray-400">Correo electrónico</span>
                  </div>
                  <p className="text-base text-[#303030] font-medium">{lead.correo || 'No especificado'}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Phone className="h-4 w-4 text-[#FCBA00]" />
                    <span className="text-xs font-semibold uppercase text-gray-400">Teléfono</span>
                  </div>
                  <p className="text-base text-[#303030] font-medium">{lead.telefono || 'No especificado'}</p>
                </div>
              </div>
            </div>

            {/* Card: Datos Personales */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-base font-bold text-[#303030]">
                  Datos Personales
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <User className="h-4 w-4 text-[#FCBA00]" />
                    <span className="text-xs font-semibold uppercase text-gray-400">DNI</span>
                  </div>
                  <p className="text-base text-[#303030] font-medium">{lead.dni || 'No especificado'}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <User className="h-4 w-4 text-[#FCBA00]" />
                    <span className="text-xs font-semibold uppercase text-gray-400">Sexo</span>
                  </div>
                  <p className="text-base text-[#303030] font-medium">{lead.sexo || 'No especificado'}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 text-[#FCBA00]" />
                    <span className="text-xs font-semibold uppercase text-gray-400">Fecha de nacimiento</span>
                  </div>
                  <p className="text-base text-[#303030] font-medium">{formatearFecha(lead.fechaNacimiento)}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 text-[#FCBA00]" />
                    <span className="text-xs font-semibold uppercase text-gray-400">Ciudad</span>
                  </div>
                  <p className="text-base text-[#303030] font-medium">{lead.ciudad || 'No especificada'}</p>
                </div>
              </div>
            </div>

            {/* Card: Ubicación */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-base font-bold text-[#303030]">
                  Ubicación
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 text-[#FCBA00]" />
                    <span className="text-xs font-semibold uppercase text-gray-400">Dirección completa</span>
                  </div>
                  <p className="text-base text-[#303030] font-medium">{lead.direccion || 'No especificada'}</p>
                </div>

                {(lead.departamento || lead.provincia || lead.distrito) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-gray-100">
                    <div className="pt-3">
                      <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Departamento</p>
                      <p className="text-base text-[#303030] font-medium">{lead.departamento || '-'}</p>
                    </div>
                    <div className="pt-3">
                      <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Provincia</p>
                      <p className="text-base text-[#303030] font-medium">{lead.provincia || '-'}</p>
                    </div>
                    <div className="pt-3">
                      <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Distrito</p>
                      <p className="text-base text-[#303030] font-medium">{lead.distrito || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card: Información Laboral */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#FCBA00] rounded-full" />
                <h3 className="text-base font-bold text-[#303030]">
                  Información Laboral
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Briefcase className="h-4 w-4 text-[#FCBA00]" />
                    <span className="text-xs font-semibold uppercase text-gray-400">Empresa</span>
                  </div>
                  <p className="text-base text-[#303030] font-medium">{lead.empresa || 'No especificada'}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Briefcase className="h-4 w-4 text-[#FCBA00]" />
                    <span className="text-xs font-semibold uppercase text-gray-400">Cargo</span>
                  </div>
                  <p className="text-base text-[#303030] font-medium">{lead.cargo || 'No especificado'}</p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
