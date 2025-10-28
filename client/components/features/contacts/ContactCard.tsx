'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ArrowRightCircle, MessageSquare, Calendar } from "lucide-react"
import type { Contacto } from "@/types/contacto.types"

interface ContactCardProps {
  contacto: Contacto
  isSelected: boolean
  onSeleccionar: (id: string) => void
  onConvertir: (contacto: Contacto) => void
  onEditar: (contacto: Contacto) => void
  onEliminar: (contacto: Contacto) => void
  onWhatsApp?: (telefono: string, nombre: string) => void
  onScheduleMeeting?: (nombre: string, correo: string) => void
}

export function ContactCard({
  contacto,
  isSelected,
  onSeleccionar,
  onConvertir,
  onEditar,
  onEliminar,
  onWhatsApp,
  onScheduleMeeting,
}: ContactCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow max-w-full overflow-hidden">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Checkbox
            id={`contacto-${contacto.id}`}
            checked={isSelected}
            onCheckedChange={() => onSeleccionar(contacto.id)}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <CardTitle className="text-lg">
              {contacto.nombre} {contacto.apellido}
            </CardTitle>
            
            {/* Etiquetas */}
            {contacto.etiquetas && contacto.etiquetas.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {contacto.etiquetas.slice(0, 3).map((et) => (
                  <Badge
                    key={et.etiqueta.id}
                    variant="secondary"
                    style={{ backgroundColor: et.etiqueta.color }}
                    className="text-white text-xs py-0 px-2"
                  >
                    {et.etiqueta.icono && <span className="mr-1">{et.etiqueta.icono}</span>}
                    {et.etiqueta.nombre}
                  </Badge>
                ))}
                {contacto.etiquetas.length > 3 && (
                  <Badge variant="outline" className="text-xs py-0 px-2">
                    +{contacto.etiquetas.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="w-full max-w-full overflow-hidden">
              <p 
                className="text-sm text-muted-foreground truncate w-full" 
                title={contacto.correo}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  whiteSpace: 'nowrap'
                }}
              >
                {contacto.correo}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {contacto.telefono && (
            <p className="text-muted-foreground">📞 {contacto.telefono}</p>
          )}
          {contacto.ciudad && (
            <p className="text-muted-foreground">📍 {contacto.ciudad}</p>
          )}
          {contacto.edad && (
            <p className="text-muted-foreground">🎂 {contacto.edad} años</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
              {contacto.tipo}
            </span>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {/* Botón convertir a lead */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConvertir(contacto)}
              className="w-full bg-[#FCBA00] hover:bg-[#e0a800] text-[#303030] border-[#FCBA00]"
            >
              <ArrowRightCircle className="w-3 h-3 mr-1" />
              Convertir a Lead
            </Button>
            
            {/* Botones WhatsApp y Agendar */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWhatsApp?.(contacto.telefono, `${contacto.nombre} ${contacto.apellido}`)}
                className="flex-1"
                disabled={!contacto.telefono}
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScheduleMeeting?.(`${contacto.nombre} ${contacto.apellido}`, contacto.correo)}
                className="flex-1"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Agendar
              </Button>
            </div>
            
            {/* Botones editar/eliminar */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditar(contacto)}
                className="flex-1"
              >
                <Edit className="w-3 h-3 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEliminar(contacto)}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}