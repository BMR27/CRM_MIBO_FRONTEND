import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("session")?.value
  if (!token) return false
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authenticated = await hasValidSession(request)

  if (pathname.startsWith("/inbox") && !authenticated) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // No redirigimos automáticamente /login -> /inbox aquí: el middleware solo valida
  // la firma del JWT, no si la sesión sigue activa en la base de datos (session_key,
  // status). Si ambos chequeos no coinciden (ej. sesión cerrada en otro dispositivo),
  // esto causaba un loop infinito: /inbox detecta sesión inválida y manda a /login,
  // el middleware la ve "válida" y rebota de vuelta a /inbox. El login exitoso ya
  // redirige a /inbox del lado del cliente, así que esta regla no hace falta.

  return NextResponse.next()
}

export const config = {
  matcher: ["/inbox/:path*", "/login", "/signup-company"],
}
