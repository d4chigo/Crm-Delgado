'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText, TrendingUp, User, Mail, Phone, DollarSign, MapPin, Edit, MessageSquare, Calendar } from "lucide-react"
import type { Contacto, EstadoLead, Prioridad } from "@/types/contacto.types"

interface ClientCardProps {
  cliente: Contacto
  onVerDetalles: (cliente: Contacto) => void
  onCotizar: (cliente: Contacto) => void
  onAgregarOportunidad: (cliente: Contacto) => void
  onEditar: (cliente: Contacto) => void
  onWhatsApp: (telefono: string) => void
  onScheduleMeeting: (nombre: string, correo: string) => void
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

export function ClientCard({ cliente, onVerDetalles, onCotizar, onAgregarOportunidad, onEditar, onWhatsApp, onScheduleMeeting }: ClientCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-green-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {cliente.nombre} {cliente.apellido}
            </CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                CLIENTE
              </Badge>
              {cliente.estadoLead && (
                <Badge className={obtenerColorEstado(cliente.estadoLead)}>
                  {cliente.estadoLead.replace('_', ' ')}
                </Badge>
              )}
              {cliente.prioridad && (
                <Badge className={obtenerColorPrioridad(cliente.prioridad)}>
                  {cliente.prioridad}
                </Badge>
              )}
            </div>
          </div>
          <User className="h-5 w-5 text-green-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {cliente.empresa && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">🏢 {cliente.empresa}</span>
            </div>
          )}

          {cliente.cargo && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{cliente.cargo}</span>
            </div>
          )}

          {cliente.correo && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate min-w-0 flex-1" title={cliente.correo}>{cliente.correo}</span>
            </div>
          )}
          
          {cliente.telefono && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{cliente.telefono}</span>
            </div>
          )}

          {cliente.presupuesto && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>S/ {cliente.presupuesto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          
          {cliente.ciudad && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{cliente.ciudad}</span>
            </div>
          )}

          {/* Etiquetas */}
          {cliente.etiquetas && cliente.etiquetas.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex flex-wrap gap-1">
                {cliente.etiquetas.map((ce) => (
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
              Creado: {new Date(cliente.creadoEn).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Botones de acción para clientes */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {(() => {
              const raw = (cliente.telefono || '').replace(/\D/g, '');
              const phone = raw.length === 9 ? `51${raw}` : raw;
              const msg = `Hola ${cliente.nombre || ''}, te contacto desde CRM Delgado para hacer seguimiento.`.trim();
              const waUrl = `https://wa.me/${phone}${phone ? `?text=${encodeURIComponent(msg)}` : ''}`;
              return (
                <Button asChild variant="outline" size="sm" className="cursor-pointer">
                  <a href={waUrl} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    WhatsApp
                  </a>
                </Button>
              );
            })()}
            {(() => {
              const asunto = `Reunión con ${cliente.nombre} - CRM Delgado`;
              const descripcion = `Reunión de seguimiento con ${cliente.nombre} ${cliente.apellido || ''}. Email: ${cliente.correo || ''}`;
              const start = new Date();
              start.setHours(9, 0, 0, 0);
              const end = new Date(start);
              end.setHours(10, 0, 0, 0);
              const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
              const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(asunto)}&details=${encodeURIComponent(descripcion)}&dates=${fmt(start)}%2F${fmt(end)}${cliente.correo ? `&add=${encodeURIComponent(cliente.correo)}` : ''}`;
              return (
                <Button asChild variant="outline" size="sm" className="cursor-pointer">
                  <a href={calUrl} target="_blank" rel="noopener noreferrer">
                    <Calendar className="h-4 w-4 mr-1" />
                    Agendar
                  </a>
                </Button>
              );
            })()}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVerDetalles(cliente)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditar(cliente)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCotizar(cliente)}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-1" />
              Cotizar
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => onAgregarOportunidad(cliente)}
            className="w-full mt-2 bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Agregar al Pipeline
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
