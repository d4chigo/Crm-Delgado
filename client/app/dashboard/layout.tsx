"use client"

import { useState } from "react"
import {
  LayoutDashboard as IconoDashboard,
  Users2 as IconoLeads,
  Building2 as IconoClientes,
  Kanban as IconoPipeline,
  MessageSquare as IconoTestimonios,
  Users as IconoEquipo,
  Briefcase as IconoServicios,
  Home as IconoProyectos,
  Calendar as IconoActividades,
  BarChart3 as IconoReportes,
  Settings as IconoConfiguracion,
} from "lucide-react"
import { BarraLateral, Encabezado } from "@/components/layout"
import type { ElementoNavegacion } from "@/types/dashboard.types"

const navegacion: ElementoNavegacion[] = [
  { nombre: "Dashboard", href: "/dashboard", icono: IconoDashboard },
  { nombre: "Leads", href: "/dashboard/leads", icono: IconoLeads },
  { nombre: "Clientes", href: "/dashboard/clientes", icono: IconoClientes },
  // Grupo: Panel Admin Web
  {
    nombre: 'Panel Admin Web',
    icono: IconoConfiguracion,
    children: [
      { nombre: 'Testimonios', href: '/dashboard/admin/testimonios', icono: IconoTestimonios },
      { nombre: 'Equipo', href: '/dashboard/admin/team', icono: IconoEquipo },
      { nombre: 'Otros Servicios', href: '/dashboard/admin/otros-servicios', icono: IconoServicios },
      { nombre: 'Proyectos', href: '/dashboard/projects', icono: IconoProyectos },
    ]
  },
  { nombre: "Pipeline", href: "/dashboard/pipeline", icono: IconoPipeline },
  { nombre: "Actividades", href: "/dashboard/actividades", icono: IconoActividades },
  { nombre: "Reportes", href: "/dashboard/reports", icono: IconoReportes },
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
