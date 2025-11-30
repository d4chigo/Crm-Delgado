"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock as IconoCandado, Mail as IconoCorreo, Check as IconoCheck } from "lucide-react"
import authService from "@/services/api/auth.service"
import Image from "next/image"

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
      console.log('[Login] Iniciando login con:', { email: correo })
      
      // Login real contra el backend
      const respuesta = await authService.login({
        email: correo,
        password: contrasena,
      })

      console.log('[Login] ✅ Login exitoso')
      console.log('[Login] Token recibido:', respuesta.token.token.substring(0, 20) + '...')
      console.log('[Login] Token en localStorage:', localStorage.getItem('crm_token')?.substring(0, 20) + '...')
      console.log('[Login] Usuario guardado:', localStorage.getItem('crm_user'))

      // Mostrar mensaje de éxito
      setExito(true)

      // Crear cookie de token para middleware (7 días)
      const fechaExpiracion = new Date()
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 7)
      document.cookie = `crm_token=${respuesta.token.token}; path=/; expires=${fechaExpiracion.toUTCString()}; SameSite=Lax`

      // Esperar a que se guarde el token en localStorage
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('[Login] Verificando token antes de redirigir:', localStorage.getItem('crm_token')?.substring(0, 20) + '...')

      // Redirigir al dashboard
      console.log('[Login] Redirigiendo a /dashboard')
      enrutador.push("/dashboard")
    } catch (error: any) {
      console.log('[Login] Error en login:', error.message)
      
      // Mensajes de error más específicos
      let mensajeError = "Error al iniciar sesión. Verifica tus credenciales."
      
      if (error.message) {
        // Remover prefijo [API] si existe
        let mensaje = error.message.replace(/^\[API\]\s*/, '').trim()
        
        if (mensaje.includes('Credenciales inválidas')) {
          mensajeError = "Email o contraseña incorrectos. Por favor intenta de nuevo."
        } else if (mensaje.includes('Usuario inactivo')) {
          mensajeError = "Tu cuenta está desactivada. Contacta con el administrador."
        } else if (mensaje.includes('Acceso denegado') || mensaje.includes('Acceso desactivado')) {
          mensajeError = "Tu cuenta no tiene acceso activo. Por favor, contacta con el administrador."
        } else if (mensaje.includes('No se puede conectar')) {
          mensajeError = "No se puede conectar con el servidor. Verifica tu conexión."
        } else if (mensaje.includes('Datos inválidos')) {
          mensajeError = "Email o contraseña incorrectos. Por favor intenta de nuevo."
        } else if (mensaje.includes('Error del servidor')) {
          mensajeError = "Error del servidor. Intenta más tarde."
        } else if (mensaje) {
          // Si hay un mensaje específico, usarlo
          mensajeError = mensaje
        }
      }
      
      setError(mensajeError)
      setEstaCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FCBA00] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FCBA00] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Lado izquierdo - Información */}
          <div className="hidden lg:block text-white space-y-8">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                <span className="text-white">Bienvenido a</span>
                <br />
                <span className="bg-gradient-to-r from-[#FCBA00] to-[#FFD700] bg-clip-text text-transparent">CRM Delgado Propiedades</span>
              </h1>
              <p className="text-lg text-slate-300">Gestiona tu cartera de propiedades y clientes de manera profesional</p>
            </div>

            {/* Características */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-[#FCBA00] to-[#E0A800]">
                    <IconoCheck className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Gestión Integral</h3>
                  <p className="text-slate-400">Administra leads, clientes y proyectos en un solo lugar</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-[#FCBA00] to-[#E0A800]">
                    <IconoCheck className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Análisis Avanzado</h3>
                  <p className="text-slate-400">Reportes y dashboards para tomar decisiones informadas</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-[#FCBA00] to-[#E0A800]">
                    <IconoCheck className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Seguridad Premium</h3>
                  <p className="text-slate-400">Tus datos protegidos con encriptación de nivel empresarial</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho - Formulario */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10 backdrop-blur-sm">
              {/* Header del formulario */}
              <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-20">
                    <Image
                      src="/logodelgado.png"
                      alt="Delgado Propiedades"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Iniciar Sesión</h2>
                <p className="text-slate-500">Accede a tu cuenta de CRM</p>
              </div>

              {/* Formulario */}
              <form onSubmit={manejarLogin} className="space-y-6">
                {/* Campo Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                    Correo Electrónico
                  </Label>
                  <div className="relative group">
                    <IconoCorreo className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FCBA00] transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      className="pl-12 h-12 border-2 border-slate-200 rounded-lg focus:border-[#FCBA00] focus:ring-0 focus:ring-[#FCBA00]/10 transition-all placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                    Contraseña
                  </Label>
                  <div className="relative group">
                    <IconoCandado className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FCBA00] transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      className="pl-12 h-12 border-2 border-slate-200 rounded-lg focus:border-[#FCBA00] focus:ring-0 focus:ring-[#FCBA00]/10 transition-all placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Mensaje de éxito */}
                {exito && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex-shrink-0">
                      <IconoCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900">¡Login exitoso!</h3>
                      <p className="text-sm text-emerald-700">Redirigiendo al dashboard...</p>
                    </div>
                  </div>
                )}

                {/* Mensaje de error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-900">Error de autenticación</h3>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Botón de login */}
                <Button
                  type="submit"
                  disabled={estaCargando}
                  className="w-full h-12 bg-gradient-to-r from-[#FCBA00] to-[#E0A800] hover:from-[#E0A800] hover:to-[#C98F00] text-slate-900 font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                >
                  {estaCargando ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Ingresando...</span>
                    </div>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-center text-sm text-slate-500">
                  <span>¿Problemas para iniciar sesión? Contacta con </span>
                  <span className="font-semibold text-slate-700">Soporte Técnico</span>
                </p>
              </div>
            </div>

            {/* Texto de copyright */}
            <p className="text-center text-slate-400 text-sm mt-6">
              2025 Delgado Propiedades. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }
        
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animate-in {
          animation: slideInFromTop 0.3s ease-out;
        }

        .fade-in {
          animation: slideInFromTop 0.3s ease-out;
        }

        .slide-in-from-top-2 {
          animation-delay: 0s;
        }
      `}</style>
    </div>
  )
}
