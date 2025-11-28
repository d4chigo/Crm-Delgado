import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Permitir página de login
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next()
  }

  // Proteger rutas del dashboard y otras rutas privadas
  if (request.nextUrl.pathname.startsWith("/dashboard") || 
      request.nextUrl.pathname.startsWith("/contactos") ||
      request.nextUrl.pathname.startsWith("/oportunidades") ||
      request.nextUrl.pathname.startsWith("/proyectos") ||
      request.nextUrl.pathname.startsWith("/pipeline")) {
    
    // Verificar si hay token en localStorage (verificado en el cliente)
    // El middleware de Next.js no puede acceder a localStorage, así que solo verificamos cookies
    const tokenCookie = request.cookies.get("crm_token")
    
    // Si no hay token en cookie, permitir que el cliente lo maneje
    // El cliente verificará localStorage y redirigirá si es necesario
    if (!tokenCookie) {
      // Dejar que el cliente maneje la redirección
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/contactos/:path*",
    "/oportunidades/:path*",
    "/proyectos/:path*",
    "/pipeline/:path*",
  ],
}
