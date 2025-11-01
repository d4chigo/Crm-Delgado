'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText, ArrowRight, Loader2, User, Mail, Phone, DollarSign, MapPin, Edit, MessageSquare, Calendar, Globe } from "lucide-react"
import type { Contacto, EstadoLead, Prioridad } from "@/types/contacto.types"

interface LeadCardProps {
  lead: Contacto
  isConverting: boolean
  onVerDetalles: (lead: Contacto) => void
  onCotizar: (lead: Contacto) => void
  onConvertir: (id: string) => void
  onEditar: (lead: Contacto) => void
  onWhatsApp: (telefono: string) => void
  onScheduleMeeting: (nombre: string, correo: string, telefono?: string) => void
  onCrearAccesoWeb?: (lead: Contacto) => void
}

const obtenerColorEstado = (estado?: string): string => {
    const colores: Record<string, string> = {
      'NUEVO': 'bg-blue-100 text-blue-800 border-blue-200',
      'CONTACTADO': 'bg-purple-100 text-purple-800 border-purple-200',
      'CALIFICADO': 'bg-green-100 text-green-800 border-green-200',
      'NEGOCIACION': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PROPUESTA': 'bg-orange-100 text-orange-800 border-orange-200',
      'GANADO': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'PERDIDO': 'bg-red-100 text-red-800 border-red-200',
      'EN_ESPERA': 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return estado ? colores[estado] : 'bg-gray-100 text-gray-800 border-gray-200'
}

const obtenerColorPrioridad = (prioridad?: string): string => {
    const colores: Record<string, string> = {
      'BAJA': 'bg-gray-100 text-gray-700 border-gray-200',
      'MEDIA': 'bg-blue-100 text-blue-700 border-blue-200',
      'ALTA': 'bg-orange-100 text-orange-700 border-orange-200',
      'URGENTE': 'bg-red-100 text-red-700 border-red-200',
    }
    return prioridad ? colores[prioridad] : 'bg-gray-100 text-gray-700 border-gray-200'
}

export function LeadCard({ lead, isConverting, onVerDetalles, onCotizar, onConvertir, onEditar, onWhatsApp, onScheduleMeeting, onCrearAccesoWeb }: LeadCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {lead.nombre} {lead.apellido}
            </CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                LEAD
              </Badge>
              {lead.estadoLead && (
                <Badge className={obtenerColorEstado(lead.estadoLead)}>
                  {lead.estadoLead.replace('_', ' ')}
                </Badge>
              )}
              {lead.prioridad && (
                <Badge className={obtenerColorPrioridad(lead.prioridad)}>
                  {lead.prioridad}
                </Badge>
              )}
            </div>
          </div>
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {lead.empresa && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">🏢 {lead.empresa}</span>
            </div>
          )}

          {lead.cargo && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{lead.cargo}</span>
            </div>
          )}

          {lead.correo && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate min-w-0 flex-1" title={lead.correo}>{lead.correo}</span>
            </div>
          )}
          
          {lead.telefono && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{lead.telefono}</span>
            </div>
          )}

          {lead.presupuesto && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>S/ {lead.presupuesto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          
          {lead.ciudad && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{lead.ciudad}</span>
            </div>
          )}

          {/* Etiquetas */}
          {lead.etiquetas && lead.etiquetas.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex flex-wrap gap-1">
                {lead.etiquetas.map((ce) => (
                  <Badge
                    key={ce.etiqueta.id}
                    variant="outline"
                    style={{
                      backgroundColor: ce.etiqueta.color + '20',
                      color: ce.etiqueta.color,
                      borderColor: ce.etiqueta.color,
                    }}
                    className="text-xs"
                  >
                    {ce.etiqueta.icono && <span className="mr-1">{ce.etiqueta.icono}</span>}
                    {ce.etiqueta.nombre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 mt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Creado: {new Date(lead.creadoEn).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {(() => {
              // Normalizar teléfono y default Perú (+51) -> wa.me requiere sin '+'
              const raw = (lead.telefono || '').replace(/\D/g, '');
              const phone = raw.length === 9 ? `51${raw}` : raw;

              // Mismo rango horario por defecto que el botón "Agendar"
              const start = new Date();
              start.setHours(9, 0, 0, 0);
              const fecha = start.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
              const hora = start.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

              const msgLines = [
                `Hola${lead.nombre ? ` ${lead.nombre}` : ''}, ¿qué tal?`,
                `Te escribo de CRM Delgado para confirmar nuestra reunión.`,
                `Fecha: ${fecha}`,
                `Hora: ${hora}`,
                lead.correo ? `Te envié la invitación al correo: ${lead.correo}` : undefined,
                `Si necesitas reprogramar, avísame por este medio. ¡Gracias!`
              ].filter(Boolean);
              const msg = msgLines.join('\n');
              const waUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : '';

              return (
                <Button asChild variant="outline" size="sm" className="cursor-pointer" disabled={!phone}>
                  <a
                    href={waUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!phone) return;
                      try { window.open(waUrl, '_blank'); } catch (_) { /* ignore */ }
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    WhatsApp Cita
                  </a>
                </Button>
              );
            })()}
            {(() => {
              const asunto = `Reunión con ${lead.nombre} - CRM Delgado`;
              const descripcion = `Reunión de seguimiento con ${lead.nombre} ${lead.apellido || ''}. Email: ${lead.correo || ''}`;
              const start = new Date();
              start.setHours(9, 0, 0, 0);
              const end = new Date(start);
              end.setHours(10, 0, 0, 0);
              const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
              const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(asunto)}&details=${encodeURIComponent(descripcion)}&dates=${fmt(start)}%2F${fmt(end)}${lead.correo ? `&add=${encodeURIComponent(lead.correo)}` : ''}`;
              return (
                <Button asChild variant="outline" size="sm" className="cursor-pointer">
                  <a
                    href={calUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try { window.open(calUrl, '_blank'); } catch (_) { /* ignore */ }
                      // Notificar al padre para abrir el modal de WhatsApp con datos prellenados
                      onScheduleMeeting(lead.nombre || '', lead.correo || '', lead.telefono || undefined);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Agendar
                  </a>
                </Button>
              );
            })()}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVerDetalles(lead)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditar(lead)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCotizar(lead)}
              className="col-span-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-1" />
              Cotizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCrearAccesoWeb?.(lead)}
              className="col-span-2 border-green-600 text-green-700 hover:bg-green-50"
            >
              <Globe className="h-4 w-4 mr-1" />
              Crear Acceso Web
            </Button>
            <Button
              size="sm"
              onClick={() => onConvertir(lead.id)}
              disabled={isConverting}
              className="col-span-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {isConverting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Convertir a Cliente
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
