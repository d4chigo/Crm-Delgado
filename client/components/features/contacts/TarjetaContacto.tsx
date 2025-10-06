/**
 * Componente TarjetaContacto - Tarjeta individual de contacto
 */

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, MapPin } from "lucide-react"
import type { Contacto, FuenteContacto } from "@/types/contacto.types"

interface PropsTarjetaContacto {
  contacto: Contacto
  estaSeleccionado: boolean
  alAlternarSeleccion: (id: string) => void
}

const obtenerBadgeFuente = (fuente: FuenteContacto) => {
  const badges = {
    manual: { etiqueta: "Manual", className: "bg-blue-100 text-blue-700" },
    google: { etiqueta: "Google", className: "bg-green-100 text-green-700" },
    import: { etiqueta: "Importado", className: "bg-purple-100 text-purple-700" },
    form: { etiqueta: "Formulario", className: "bg-orange-100 text-orange-700" },
    referral: { etiqueta: "Referido", className: "bg-pink-100 text-pink-700" },
    social: { etiqueta: "Redes Sociales", className: "bg-indigo-100 text-indigo-700" },
  }
  return badges[fuente]
}

export function TarjetaContacto({ contacto, estaSeleccionado, alAlternarSeleccion }: PropsTarjetaContacto) {
  const badgeFuente = obtenerBadgeFuente(contacto.fuente)

  return (
    <Card
      className={`border-border hover:shadow-md transition-all cursor-pointer ${
        estaSeleccionado ? "ring-2 ring-[#FCBA00] bg-[#FCBA00]/5" : ""
      }`}
      onClick={() => alAlternarSeleccion(contacto.id)}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 bg-[#FCBA00]">
              <AvatarFallback className="bg-[#FCBA00] text-[#303030] font-bold">
                {contacto.nombre.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-[#303030]">{contacto.nombre}</h3>
              {contacto.empresa && (
                <p className="text-xs text-muted-foreground">{contacto.empresa}</p>
              )}
            </div>
          </div>
          <Badge className={badgeFuente.className}>{badgeFuente.etiqueta}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="truncate">{contacto.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{contacto.telefono}</span>
          </div>
          {contacto.ubicacion && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{contacto.ubicacion}</span>
            </div>
          )}
        </div>

        {contacto.notas && (
          <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t border-border">
            {contacto.notas}
          </p>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          Agregado: {contacto.creadoEn.toLocaleDateString('es-PE')}
        </div>
      </CardContent>
    </Card>
  )
}
