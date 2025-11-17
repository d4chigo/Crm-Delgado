'use client';

import { useState, useEffect } from 'react';
import { Contacto, Cotizacion } from '@/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Building2, Briefcase, DollarSign, Calendar, IdCard, Cake, FileText, Tag, TrendingUp, ChevronDown, X } from 'lucide-react';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCotizaciones } from '@/hooks/useCotizaciones';
import { ListaCotizacionesSoloLectura } from '@/components/features/cotizaciones/ListaCotizacionesSoloLectura';
import { DialogoCambiarEstado } from './DialogoCambiarEstado';
import { ESTADOS_LEAD_DISPLAY } from '@/types/estadoLead.types';

// Componente para mostrar un campo de información
const InfoField = ({ icon: Icon, label, value, color = 'text-gray-600' }: { icon: any; label: string; value?: string | number; color?: string }) => (
    <div className="flex gap-3">
        <Icon className={`h-5 w-5 ${color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-sm text-gray-900 font-medium break-words mt-1">{value || '-'}</p>
        </div>
    </div>
);

interface DialogoDetallesLeadProps {
  lead: Contacto | null;
  abierto: boolean;
  onCerrar: () => void;
  onActualizado?: () => void;
}

export function DialogoDetallesLead({ lead, abierto, onCerrar, onActualizado }: DialogoDetallesLeadProps) {
  const { cotizaciones, loading: loadingCotizaciones, cargarPorContacto } = useCotizaciones();
  const [dialogoCambiarEstadoAbierto, setDialogoCambiarEstadoAbierto] = useState(false);

  useEffect(() => {
    if (abierto && lead) {
      cargarPorContacto(lead.id);
    }
  }, [abierto, lead, cargarPorContacto]);

  if (!lead) return null;

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="!max-w-6xl w-[95vw] !max-h-[90vh] !p-0 bg-white border-0 rounded-lg overflow-hidden flex flex-col">
        
        {/* Título oculto (requerido por Radix UI) */}
        <VisuallyHidden>
          <DialogTitle>{lead.nombre} {lead.apellido}</DialogTitle>
        </VisuallyHidden>

        {/* Header - Formal */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-2xl font-bold text-white">{lead.nombre?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{lead.nombre} {lead.apellido}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className="bg-yellow-500 text-slate-900 border-0">{lead.tipo}</Badge>
                {lead.estadoLead && (
                  <Badge className="bg-blue-500 text-white border-0">
                    {ESTADOS_LEAD_DISPLAY[lead.estadoLead as keyof typeof ESTADOS_LEAD_DISPLAY]?.label || lead.estadoLead}
                  </Badge>
                )}
                {lead.prioridad && (
                  <Badge className="bg-purple-500 text-white border-0">{lead.prioridad}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              onClick={() => setDialogoCambiarEstadoAbierto(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold"
            >
              <ChevronDown className="h-4 w-4 mr-2" />
              Cambiar Estado
            </Button>
            <Button
              onClick={onCerrar}
              variant="ghost"
              size="sm"
              className="hover:bg-slate-700"
            >
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-0 divide-x divide-gray-200">
            
            {/* Column 1 - Información Personal y Comercial */}
            <div className="p-6 space-y-6">
              {/* Sección Personal */}
              <section>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b-2 border-yellow-500">
                  Información Personal
                </h2>
                <div className="space-y-4">
                  <InfoField icon={Mail} label="Correo" value={lead.correo} color="text-blue-500" />
                  <InfoField icon={Phone} label="Teléfono" value={lead.telefono} color="text-green-500" />
                  <InfoField icon={IdCard} label="DNI" value={lead.dni} color="text-indigo-500" />
                  <InfoField icon={MapPin} label="Dirección" value={lead.direccion} color="text-red-500" />
                  <InfoField icon={MapPin} label="Ciudad" value={lead.ciudad} color="text-orange-500" />
                  <InfoField 
                    icon={MapPin} 
                    label="Departamento" 
                    value={lead.departamento} 
                    color="text-teal-500" 
                  />
                  <InfoField 
                    icon={MapPin} 
                    label="Provincia" 
                    value={lead.provincia} 
                    color="text-cyan-500" 
                  />
                  <InfoField 
                    icon={MapPin} 
                    label="Distrito" 
                    value={lead.distrito} 
                    color="text-sky-500" 
                  />
                  <InfoField 
                    icon={Cake} 
                    label="Fecha de Nacimiento" 
                    value={lead.fechaNacimiento 
                      ? new Date(lead.fechaNacimiento).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
                      : undefined}
                    color="text-pink-500"
                  />
                  <InfoField icon={Calendar} label="Edad" value={lead.edad?.toString()} color="text-purple-500" />
                  <InfoField 
                    icon={User} 
                    label="Sexo" 
                    value={lead.sexo} 
                    color="text-violet-500" 
                  />
                </div>
              </section>

              {/* Sección Comercial */}
              <section>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b-2 border-blue-500">
                  Información Comercial
                </h2>
                <div className="space-y-4">
                  <InfoField icon={Building2} label="Empresa" value={lead.empresa} color="text-yellow-600" />
                  <InfoField icon={Briefcase} label="Cargo" value={lead.cargo} color="text-slate-600" />
                  <InfoField 
                    icon={DollarSign} 
                    label="Presupuesto" 
                    value={lead.presupuesto ? `S/ ${lead.presupuesto.toLocaleString('es-PE')}` : undefined}
                    color="text-green-600"
                  />
                  <InfoField icon={Tag} label="Fuente" value={lead.fuente} color="text-cyan-600" />
                  <InfoField icon={FileText} label="Intereses" value={lead.intereses} color="text-purple-600" />
                </div>
              </section>

              {/* Sección de Seguimiento */}
              <section>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b-2 border-green-500">
                  Seguimiento
                </h2>
                <div className="space-y-4">
                  <InfoField 
                    icon={Calendar} 
                    label="Próximo Seguimiento" 
                    value={lead.fechaSeguimiento 
                      ? new Date(lead.fechaSeguimiento).toLocaleDateString('es-PE')
                      : undefined}
                    color="text-green-600"
                  />
                  <InfoField 
                    icon={TrendingUp} 
                    label="Probabilidad" 
                    value={lead.probabilidad !== undefined ? `${lead.probabilidad}%` : undefined}
                    color="text-blue-600"
                  />
                  <InfoField 
                    icon={Calendar} 
                    label="Fecha de Conversión" 
                    value={lead.fechaConversion 
                      ? new Date(lead.fechaConversion).toLocaleDateString('es-PE')
                      : undefined}
                    color="text-indigo-600"
                  />
                </div>
              </section>
            </div>

            {/* Column 2 - Etiquetas y Notas */}
            <div className="p-6 space-y-6 bg-gray-50">
              {/* Etiquetas */}
              <section>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b-2 border-amber-500">
                  Etiquetas
                </h2>
                {lead.etiquetas && lead.etiquetas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {lead.etiquetas.map(et => (
                      <Badge
                        key={et.etiqueta.id}
                        className="text-xs"
                        style={{
                          backgroundColor: et.etiqueta.color + '20',
                          color: et.etiqueta.color,
                          border: `1px solid ${et.etiqueta.color}`
                        }}
                      >
                        {et.etiqueta.icono && <span className="mr-1">{et.etiqueta.icono}</span>}
                        {et.etiqueta.nombre}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No hay etiquetas.</p>
                )}
              </section>

              {/* Notas */}
              <section>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b-2 border-amber-500">
                  Notas
                </h2>
                <div className="bg-white p-3 rounded border border-gray-200 min-h-24">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {lead.notas || 'No hay notas.'}
                  </p>
                </div>
              </section>

              {/* Metadatos */}
              <section>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b-2 border-amber-500">
                  Información del Sistema
                </h2>
                <div className="text-xs space-y-2 text-gray-600">
                  <p><span className="font-semibold">Tipo:</span> {lead.tipo}</p>
                  <p><span className="font-semibold">Creado:</span> {new Date(lead.creadoEn).toLocaleDateString('es-PE')}</p>
                  <p><span className="font-semibold">Actualizado:</span> {new Date(lead.actualizadoEn).toLocaleDateString('es-PE')}</p>
                  <p><span className="font-semibold">ID:</span> <span className="font-mono text-xs">{lead.id}</span></p>
                </div>
              </section>
            </div>

            {/* Column 3 - Cotizaciones */}
            <div className="p-6 space-y-4 bg-white">
              <section>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b-2 border-violet-500">
                  Historial de Cotizaciones
                </h2>
                <div className="bg-gray-50 rounded p-3">
                  <ListaCotizacionesSoloLectura cotizaciones={cotizaciones} loading={loadingCotizaciones} />
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Dialog para cambiar estado */}
        {lead && (
          <DialogoCambiarEstado
            abierto={dialogoCambiarEstadoAbierto}
            onCerrar={() => setDialogoCambiarEstadoAbierto(false)}
            leadId={lead.id}
            estadoActual={lead.estadoLead}
            nombreLead={`${lead.nombre} ${lead.apellido || ''}`}
            onActualizado={() => {
              onActualizado?.();
              setDialogoCambiarEstadoAbierto(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
