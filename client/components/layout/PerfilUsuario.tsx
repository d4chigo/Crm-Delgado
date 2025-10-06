/**
 * Componente PerfilUsuario - Perfil de usuario en el sidebar
 */

"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronDown, LogOut } from "lucide-react"
import { cerrarSesion, obtenerUsuario, type Usuario } from "@/lib/autenticacion"

interface PropsPerfilUsuario {
  usuario?: Usuario | null
}

export function PerfilUsuario({ usuario: usuarioProp }: PropsPerfilUsuario) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    // Solo obtener usuario en el cliente
    if (!usuarioProp) {
      setUsuario(obtenerUsuario())
    } else {
      setUsuario(usuarioProp)
    }
  }, [usuarioProp])

  const manejarCierreSesion = () => {
    cerrarSesion()
  }

  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
        <Avatar className="w-10 h-10 bg-[#FCBA00]">
          <AvatarFallback className="bg-[#FCBA00] text-[#303030] font-bold">
            {usuario?.nombre?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {usuario?.nombre || "Usuario"}
          </p>
          <p className="text-xs text-white/60 truncate">
            {usuario?.rol || "Agente"}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 text-white/60" />
      </div>
      <Button
        onClick={manejarCierreSesion}
        variant="ghost"
        className="w-full mt-2 text-white/80 hover:text-white hover:bg-white/10 justify-start"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Cerrar Sesión
      </Button>
    </div>
  )
}
