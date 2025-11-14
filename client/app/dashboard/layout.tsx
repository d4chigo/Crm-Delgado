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
  Calendar as IconoCalendario,
  Home as IconoHome,
  MessageSquare as IconoMessage,
  Layers as IconoLayers,
  CreditCard as IconoCredit,
} from "lucide-react"
import { BarraLateral, Encabezado } from "@/components/layout"
import type { ElementoNavegacion } from "@/types/dashboard.types"

const navegacion: ElementoNavegacion[] = [
  { nombre: "Dashboard", href: "/dashboard", icono: IconoDashboard },
  { nombre: "Leads", href: "/dashboard/leads", icono: IconoUsuarios },
  { nombre: "Clientes", href: "/dashboard/clientes", icono: IconoEdificio },
  // Grupo: Panel Admin Web
  {
    nombre: 'Panel Admin Web',
    icono: IconoEdificio,
    children: [
      { nombre: 'Testimonios', href: '/dashboard/admin/testimonios', icono: IconoMessage },
      { nombre: 'Equipo', href: '/dashboard/admin/team', icono: IconoUsuarios },
      { nombre: 'Otros Servicios', href: '/dashboard/admin/otros-servicios', icono: IconoLayers },
      { nombre: 'Proyectos', href: '/dashboard/projects', icono: IconoLayers },
    ]
  },
  { nombre: "Pipeline", href: "/dashboard/pipeline", icono: IconoKanban },
  { nombre: "Actividades", href: "/dashboard/actividades", icono: IconoCalendario },
  { nombre: "Reportes", href: "/dashboard/reports", icono: IconoGrafico },
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
