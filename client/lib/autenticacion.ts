/**
 * Utilidades de autenticación
 */

import type { Usuario } from "@/types/autenticacion.types"

// Re-exportar Usuario para compatibilidad
export type { Usuario } from "@/types/autenticacion.types"

// Interfaz simplificada para el localStorage (temporal)
interface UsuarioSimple {
  email: string
  name: string
  role: string
}

export function obtenerUsuario(): Usuario | null {
  if (typeof window === "undefined") return null

  const usuarioStr = localStorage.getItem("crm_user")
  if (!usuarioStr) return null

  try {
    const usuarioSimple: UsuarioSimple = JSON.parse(usuarioStr)
    // Convertir de formato simple a Usuario completo
    return {
      id: "temp-id",
      email: usuarioSimple.email,
      nombre: usuarioSimple.name,
      rol: usuarioSimple.role as any,
      creadoEn: new Date(),
    }
  } catch {
    return null
  }
}

export function cerrarSesion() {
  localStorage.removeItem("crm_user")
  document.cookie = "crm_session=; path=/; max-age=0" // Eliminar cookie
  window.location.href = "/login"
}

export function estaAutenticado(): boolean {
  return obtenerUsuario() !== null
}

export function obtenerToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("crm_token")
}
