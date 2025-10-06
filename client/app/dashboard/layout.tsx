"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Users,
  Building2,
  Kanban,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserCircle,
} from "lucide-react"
import { logout, getUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = getUser()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Contactos", href: "/dashboard/contacts", icon: UserCircle },
    { name: "Leads", href: "/dashboard/leads", icon: Users },
    { name: "Proyectos", href: "/dashboard/projects", icon: Building2 },
    { name: "Pipeline", href: "/dashboard/pipeline", icon: Kanban },
    { name: "Cotizaciones", href: "/dashboard/quotes", icon: FileText },
    { name: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-[#303030] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
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
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#FCBA00] text-[#303030] font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <Avatar className="w-10 h-10 bg-[#FCBA00]">
                <AvatarFallback className="bg-[#FCBA00] text-[#303030] font-bold">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || "Usuario"}</p>
                <p className="text-xs text-white/60 truncate">{user?.role || "Agente"}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-white/60" />
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full mt-2 text-white/80 hover:text-white hover:bg-white/10 justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#303030] hover:text-[#FCBA00] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  )
}
