"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 as IconoEdificio, Lock as IconoCandado, Mail as IconoCorreo } from "lucide-react"
import authService from "@/services/api/auth.service"

export default function PaginaLogin() {
  const enrutador = useRouter()
  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [estaCargando, setEstaCargando] = useState(false)
  const [error, setError] = useState("")
  const [exito, setExito] = useState(false)

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setExito(false)
    setEstaCargando(true)

    try {
      // Login real contra el backend
      const respuesta = await authService.login({
        email: correo,
        password: contrasena,
      })

      // Mostrar mensaje de éxito
      setExito(true)

      // Crear cookie de sesión para middleware
      document.cookie = "crm_session=true; path=/; max-age=86400" // 24 horas

      // Redirigir al dashboard después de un breve delay
      setTimeout(() => {
        enrutador.push("/dashboard")
      }, 500)
    } catch (error: any) {
      setError(error.message || "Error al iniciar sesión. Verifica tus credenciales.")
      setEstaCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#303030] via-[#404040] to-[#303030] p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-[#FCBA00] rounded-2xl flex items-center justify-center shadow-lg">
            <IconoEdificio className="w-9 h-9 text-[#303030]" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-[#303030]">CRM Inmobiliario</CardTitle>
            <CardDescription className="text-base mt-2">Ingresa tus credenciales para acceder</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#303030]">
                Correo Electrónico
              </Label>
              <div className="relative">
                <IconoCorreo className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
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
                <IconoCandado className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="pl-10 h-11 border-border focus:border-[#FCBA00] focus:ring-[#FCBA00]"
                  required
                />
              </div>
            </div>

            {exito && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-300 rounded-lg p-3.5 flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>¡Login exitoso! Redirigiendo...</span>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-300 rounded-lg p-3.5 flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={estaCargando}
              className="w-full h-11 bg-[#FCBA00] hover:bg-[#E0A800] text-[#303030] font-semibold text-base shadow-md transition-all"
            >
              {estaCargando ? "Ingresando..." : "Iniciar Sesión"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
