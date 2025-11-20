"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBadge } from "@/components/NotificationBadge"
import { PerfilUsuario } from "./PerfilUsuario"

interface PropiedadesEncabezado {
  alClickMenu: () => void
}

export function Encabezado({ alClickMenu }: PropiedadesEncabezado) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-8">
        {/* Botón de menú móvil */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={alClickMenu}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menú</span>
        </Button>

        {/* Espacio flexible */}
        <div className="flex-1" />

        {/* Notificaciones y perfil */}
        <div className="flex items-center gap-2">
          <NotificationBadge />
          <PerfilUsuario />
        </div>
      </div>
    </header>
  )
}
