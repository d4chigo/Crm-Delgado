'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText, TrendingUp, User, Mail, Phone, DollarSign, MapPin, Edit, MessageSquare, Calendar, Globe, Trash2, Building2, IdCard, Cake } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Contacto, EstadoLead, Prioridad } from "@/types/contacto.types"

interface ClientCardProps {
  cliente: Contacto
  onVerDetalles: (cliente: Contacto) => void
  onCotizar: (cliente: Contacto) => void
  onAgregarOportunidad: (cliente: Contacto) => void
  onEditar: (cliente: Contacto) => void
  onWhatsApp: (telefono: string) => void
  onScheduleMeeting?: (nombre: string, correo: string, telefono?: string) => void
  onCrearAccesoWeb?: (cliente: Contacto) => void
  onEliminar?: (cliente: Contacto) => void
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

export function ClientCard({ cliente, onVerDetalles, onCotizar, onAgregarOportunidad, onEditar, onWhatsApp, onScheduleMeeting, onCrearAccesoWeb, onEliminar }: ClientCardProps) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/20">
      {/* Header con nombre y acciones rápidas */}
      <CardHeader className="pb-3 overflow-hidden">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 min-w-0">
              <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <CardTitle className="text-lg truncate">
                {cliente.nombre} {cliente.apellido}
              </CardTitle>
            </div>
            
            {/* Estado */}
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
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

          {/* Acciones rápidas en el header */}
          <TooltipProvider>
            <div className="flex gap-0 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditar(cliente)}
                    className="hover:bg-blue-100"
                  >
                    <Edit className="h-5 w-5 text-blue-700" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </CardHeader>

      {/* Contenido principal */}
      <CardContent className="space-y-3">
        {/* Info de contacto con iconos */}
        <div className="space-y-2">
          {cliente.empresa && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">{cliente.empresa}</span>
            </div>
          )}

          {cliente.cargo && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span className="text-gray-600">{cliente.cargo}</span>
            </div>
          )}

          {cliente.correo && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <a href={`mailto:${cliente.correo}`} className="text-blue-600 hover:underline truncate">
                {cliente.correo}
              </a>
            </div>
          )}
          
          {cliente.telefono && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
              <a href={`tel:${cliente.telefono}`} className="text-green-600 hover:underline">
                {cliente.telefono}
              </a>
            </div>
          )}

          {cliente.ciudad && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-gray-600">{cliente.ciudad}</span>
            </div>
          )}

          {cliente.dni && (
            <div className="flex items-center gap-2 text-sm">
              <IdCard className="h-4 w-4 text-indigo-500 flex-shrink-0" />
              <span className="text-gray-600 font-mono">{cliente.dni}</span>
            </div>
          )}

          {cliente.fechaNacimiento && (
            <div className="flex items-center gap-2 text-sm">
              <Cake className="h-4 w-4 text-pink-500 flex-shrink-0" />
              <span className="text-gray-600">{new Date(cliente.fechaNacimiento).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          )}
        </div>

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

        {/* Fecha de creación */}
        <p className="text-xs text-muted-foreground pt-2 border-t">
          Creado: {new Date(cliente.creadoEn).toLocaleDateString('es-PE')}
        </p>

        {/* Botones de acción - ICONOS */}
        <TooltipProvider>
          <div className="flex gap-2 pt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => onWhatsApp(cliente.telefono || '')}
                  disabled={!cliente.telefono}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>WhatsApp</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onScheduleMeeting?.(cliente.nombre || '', cliente.correo || '', cliente.telefono || undefined)}
                  disabled={!cliente.correo}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Calendar className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Agendar reunión</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCotizar(cliente)}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <FileText className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cotizar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAgregarOportunidad(cliente)}
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <TrendingUp className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Agregar al Pipeline</TooltipContent>
            </Tooltip>
            {onCrearAccesoWeb && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCrearAccesoWeb(cliente)}
                    className="border-amber-300 text-amber-600 hover:bg-amber-50"
                  >
                    <Globe className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Crear acceso web</TooltipContent>
              </Tooltip>
            )}
            {onEliminar && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEliminar(cliente)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eliminar</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
