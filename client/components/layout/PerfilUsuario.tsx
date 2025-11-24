/**
 * Componente PerfilUsuario - Perfil de usuario en el sidebar
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronDown, LogOut, User, Settings } from "lucide-react"
import { cerrarSesion, obtenerUsuario, type Usuario } from "@/lib/autenticacion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PropsPerfilUsuario {
  usuario?: Usuario | null
}

export function PerfilUsuario({ usuario: usuarioProp }: PropsPerfilUsuario) {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [abierto, setAbierto] = useState(false)

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

  const handleEditarPerfil = () => {
    router.push("/dashboard/perfil")
    setAbierto(false)
  }

  return (
    <div className="p-4 border-t border-white/10">
      <DropdownMenu open={abierto} onOpenChange={setAbierto}>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
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
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{usuario?.nombre || "Usuario"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{usuario?.rol || "Agente"}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEditarPerfil} className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            <span>Editar Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={manejarCierreSesion}
            variant="destructive"
            className="cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
