"use client"

import { useState } from "react"
import {
  LayoutDashboard as IconoDashboard,
  Users as IconoUsuarios,
  Building2 as IconoEdificio,
  Kanban as IconoKanban,
  FileText as IconoArchivo,
  BarChart3 as IconoGrafico,
  UserCircle as IconoContacto,
} from "lucide-react"
import { BarraLateral, Encabezado } from "@/components/layout"
import type { ElementoNavegacion } from "@/types/dashboard.types"

const navegacion: ElementoNavegacion[] = [
  { nombre: "Dashboard", href: "/dashboard", icono: IconoDashboard },
  { nombre: "Contactos", href: "/dashboard/contacts", icono: IconoContacto },
  { nombre: "Leads", href: "/dashboard/leads", icono: IconoUsuarios },
  { nombre: "Proyectos", href: "/dashboard/projects", icono: IconoEdificio },
  { nombre: "Pipeline", href: "/dashboard/pipeline", icono: IconoKanban },
  { nombre: "Reportes", href: "/dashboard/reports", icono: IconoGrafico },
  { nombre: "Ayuda", href: "/dashboard/help", icono: IconoArchivo },
]

export default function LayoutDashboard({ children }: { children: React.ReactNode }) {
  const [barraLateralAbierta, setBarraLateralAbierta] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <BarraLateral 
        estaAbierta={barraLateralAbierta} 
        alCerrar={() => setBarraLateralAbierta(false)} 
        navegacion={navegacion}
      />

      <div className="lg:pl-64">
        <Encabezado alClickMenu={() => setBarraLateralAbierta(true)} />
        <main className="px-4 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  )
}
