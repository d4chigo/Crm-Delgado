/**
 * Componente BarraLateral - Barra lateral de navegación
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PerfilUsuario } from "./PerfilUsuario"
import type { ElementoNavegacion } from "@/types/dashboard.types"

interface PropsBarraLateral {
  estaAbierta: boolean
  alCerrar: () => void
  navegacion: ElementoNavegacion[]
}

export function BarraLateral({ estaAbierta, alCerrar, navegacion }: PropsBarraLateral) {
  const rutaActual = usePathname()

  return (
    <>
      {/* Fondo móvil */}
      {estaAbierta && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={alCerrar} 
        />
      )}

      {/* Barra lateral */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-[#303030] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          estaAbierta ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FCBA00] rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#303030]" />
              </div>
              <div>
                <h1 className="font-bold text-lg">CRM</h1>
                <p className="text-xs text-white/60">Inmobiliario</p>
              </div>
            </div>
            <button 
              onClick={alCerrar} 
              className="lg:hidden text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navegacion.map((elemento) => {
              const Icono = elemento.icono
              const estaActivo = rutaActual === elemento.href
              return (
                <Link
                  key={elemento.nombre}
                  href={elemento.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    estaActivo
                      ? "bg-[#FCBA00] text-[#303030] font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                  onClick={alCerrar}
                >
                  <Icono className="w-5 h-5" />
                  <span>{elemento.nombre}</span>
                </Link>
              )
            })}
          </nav>

          {/* Perfil de usuario */}
          <PerfilUsuario />
        </div>
      </aside>
    </>
  )
}
