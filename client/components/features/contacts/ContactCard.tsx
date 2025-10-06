/**
 * Componente ContactCard - Tarjeta individual de contacto
 */

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, MapPin } from "lucide-react"
import type { Contacto, FuenteContacto } from "@/types/contacto.types"

interface ContactCardProps {
  contact: Contacto
  isSelected: boolean
  onToggleSelection: (id: string) => void
}

const getSourceBadge = (source: FuenteContacto) => {
  const badges = {
    manual: { label: "Manual", className: "bg-blue-100 text-blue-700" },
    google: { label: "Google", className: "bg-green-100 text-green-700" },
    import: { label: "Importado", className: "bg-purple-100 text-purple-700" },
    form: { label: "Formulario", className: "bg-orange-100 text-orange-700" },
    referral: { label: "Referido", className: "bg-pink-100 text-pink-700" },
    social: { label: "Redes Sociales", className: "bg-indigo-100 text-indigo-700" },
  }
  return badges[source]
}

export function ContactCard({ contact, isSelected, onToggleSelection }: ContactCardProps) {
  const sourceBadge = getSourceBadge(contact.fuente)

  return (
    <Card
      className={`border-border hover:shadow-md transition-all cursor-pointer ${
        isSelected ? "ring-2 ring-[#FCBA00] bg-[#FCBA00]/5" : ""
      }`}
      onClick={() => onToggleSelection(contact.id)}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 bg-[#FCBA00]">
              <AvatarFallback className="bg-[#FCBA00] text-[#303030] font-bold">
                {contact.nombre.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-[#303030]">{contact.nombre}</h3>
              {contact.empresa && (
                <p className="text-xs text-muted-foreground">{contact.empresa}</p>
              )}
            </div>
          </div>
          <Badge className={sourceBadge.className}>{sourceBadge.label}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="truncate">{contact.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{contact.telefono}</span>
          </div>
          {contact.ubicacion && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{contact.ubicacion}</span>
            </div>
          )}
        </div>

        {contact.notas && (
          <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t border-border">
            {contact.notas}
          </p>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          Agregado: {contact.creadoEn.toLocaleDateString('es-PE')}
        </div>
      </CardContent>
    </Card>
  )
}
