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

  if ((pathname === "/login" || pathname === "/signup-company") && authenticated) {
    return NextResponse.redirect(new URL("/inbox", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/inbox/:path*", "/login", "/signup-company"],
}
