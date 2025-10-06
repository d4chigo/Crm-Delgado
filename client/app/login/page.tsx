"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate login - replace with real authentication later
    setTimeout(() => {
      if (email && password) {
        localStorage.setItem(
          "crm_user",
          JSON.stringify({
            email,
            name: "Usuario Demo",
            role: "Agente",
          }),
        )

        // Create session cookie for middleware
        document.cookie = "crm_session=true; path=/; max-age=86400" // 24 hours

        router.push("/dashboard")
      } else {
        setError("Por favor ingresa email y contraseña")
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#303030] via-[#404040] to-[#303030] p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-[#FCBA00] rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 className="w-9 h-9 text-[#303030]" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-[#303030]">CRM Inmobiliario</CardTitle>
            <CardDescription className="text-base mt-2">Ingresa tus credenciales para acceder</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#303030]">
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-border focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[#303030]">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 border-border focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                  required
                />
              </div>
            </div>

            {error && <div className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold text-base shadow-md transition-all"
            >
              {isLoading ? "Ingresando..." : "Iniciar Sesión"}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              <button type="button" className="text-[#FCBA00] hover:text-[#E0A800] font-medium transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
