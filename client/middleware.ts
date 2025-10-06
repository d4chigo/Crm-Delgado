import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Allow login page
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next()
  }

  // For now, just redirect to login if accessing protected routes
  // In production, check for valid session token
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Check if user has session (this is simplified - use proper auth in production)
    const hasSession = request.cookies.get("crm_session")

    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
