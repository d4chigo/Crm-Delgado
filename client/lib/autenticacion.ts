/**
 * Utilidades de autenticación
 */

import type { Usuario } from "@/types/autenticacion.types"

// Re-exportar Usuario para compatibilidad
export type { Usuario } from "@/types/autenticacion.types"

export function obtenerUsuario(): Usuario | null {
  if (typeof window === "undefined") return null

  const usuarioStr = localStorage.getItem("crm_user")
  if (!usuarioStr) return null

  try {
    // Obtener el usuario completo guardado desde auth.service.ts
    // que ya contiene el id real
    const usuario = JSON.parse(usuarioStr)
    
    // Si tiene id, es del usuario real
    if (usuario.id) {
      return usuario
    }
    
    // Fallback por si acaso
    return null
  } catch (error) {
    console.error('Error al parsear usuario:', error)
    return null
  }
}

export function cerrarSesion() {
  localStorage.removeItem("crm_user")
  localStorage.removeItem("crm_token")
  document.cookie = "crm_token=; path=/; max-age=0" // Eliminar cookie
  window.location.href = "/login"
}

export function estaAutenticado(): boolean {
  return obtenerUsuario() !== null
}

export function obtenerToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("crm_token")
}
