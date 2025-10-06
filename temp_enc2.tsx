/**
 * Componente Encabezado - Barra superior del dashboard
 */

"use client"

import { Menu } from "lucide-react"

interface PropsEncabezado {
  alClickMenu: () => void
}

export function Encabezado({ alClickMenu }: PropsEncabezado) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border">
      <div className="flex items-center justify-between px-4 py-4 lg:px-8">
        <button
          onClick={alClickMenu}
          className="lg:hidden text-[#303030] hover:text-[#FCBA00] transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Espacio para agregar más elementos en el encabezado */}
        <div className="flex items-center gap-4">
          {/* Aquí se pueden agregar notificaciones, búsqueda, etc. */}
        </div>
      </div>
    </header>
  )
}
