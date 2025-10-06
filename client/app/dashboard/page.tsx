"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/login")
    } else {
      setUser(currentUser)
    }
  }, [router])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCBA00]"></div>
      </div>
    )
  }

  const kpis = [
    {
      title: "Leads Activos",
      value: "248",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Propiedades Disponibles",
      value: "87",
      change: "-3.2%",
      trend: "down",
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Ventas del Mes",
      value: "S/ 2.4M",
      change: "+18.7%",
      trend: "up",
      icon: DollarSign,
      color: "text-[#FCBA00]",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Tasa de Conversión",
      value: "34.2%",
      change: "+5.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const recentLeads = [
    {
      name: "María González",
      email: "maria.g@email.com",
      phone: "+51 987 654 321",
      project: "Proyecto Los Olivos",
      score: 85,
      status: "hot",
      date: "Hoy, 10:30 AM",
    },
    {
      name: "Carlos Ramírez",
      email: "carlos.r@email.com",
      phone: "+51 987 654 322",
      project: "Condominio San Isidro",
      score: 72,
      status: "warm",
      date: "Hoy, 09:15 AM",
    },
    {
      name: "Ana Torres",
      email: "ana.t@email.com",
      phone: "+51 987 654 323",
      project: "Edificio Miraflores",
      score: 45,
      status: "cold",
      date: "Ayer, 04:20 PM",
    },
  ]

  const upcomingActivities = [
    {
      type: "Visita",
      client: "María González",
      project: "Proyecto Los Olivos",
      time: "Hoy, 3:00 PM",
      icon: Building2,
    },
    {
      type: "Llamada",
      client: "Carlos Ramírez",
      project: "Condominio San Isidro",
      time: "Hoy, 5:30 PM",
      icon: Phone,
    },
    {
      type: "Email",
      client: "Ana Torres",
      project: "Edificio Miraflores",
      time: "Mañana, 10:00 AM",
      icon: Mail,
    },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-50"
    if (score >= 50) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      hot: "bg-red-100 text-red-700 border-red-200",
      warm: "bg-yellow-100 text-yellow-700 border-yellow-200",
      cold: "bg-blue-100 text-blue-700 border-blue-200",
    }
    return styles[status as keyof typeof styles] || styles.cold
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#303030]">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Bienvenido de vuelta, {user.name}</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-3xl font-bold text-[#303030]">{kpi.value}</p>
                    <div className="flex items-center gap-1">
                      {kpi.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {kpi.change}
                      </span>
                      <span className="text-sm text-muted-foreground">vs mes anterior</span>
                    </div>
                  </div>
                  <div className={`${kpi.bgColor} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#303030]">Leads Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-[#303030]">{lead.name}</h4>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadge(lead.status)}`}
                      >
                        {lead.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{lead.project}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(lead.score)}`}>
                      Score: {lead.score}
                    </div>
                    <span className="text-xs text-muted-foreground">{lead.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Activities */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#303030]">Próximas Actividades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingActivities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div
                    key={index}
                    className="flex gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="bg-[#FCBA00] p-2 rounded-lg h-fit">
                      <Icon className="w-4 h-4 text-[#303030]" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-sm text-[#303030]">{activity.type}</h4>
                      <p className="text-sm text-muted-foreground">{activity.client}</p>
                      <p className="text-xs text-muted-foreground">{activity.project}</p>
                      <div className="flex items-center gap-1 text-xs text-[#FCBA00] font-medium pt-1">
                        <Calendar className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
