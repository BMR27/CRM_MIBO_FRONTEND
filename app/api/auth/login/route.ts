import { NextResponse } from "next/server"
import { ensureLastLoginColumns, isDemoMode, sql } from "@/lib/db"
import type { User } from "@/lib/auth"
import { randomUUID } from "crypto"

// La IP real llega en el header que pone el proxy (Railway/Vercel); el primer valor
// de x-forwarded-for es el cliente, el resto son los saltos intermedios.
function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first.slice(0, 100)
  }
  const realIp = request.headers.get("x-real-ip")?.trim()
  return realIp ? realIp.slice(0, 100) : null
}

export async function POST(request: Request) {
  try {
    const { email, password, forceNewSession } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      )
    }

    // Autenticar contra el backend NestJS: única fuente de verdad para credenciales,
    // rol y tenant. Reemplaza la verificación local que hacía SQL directo + bcrypt.
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app"
    let backendResponse: Response
    try {
      backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
    } catch (err) {
      return NextResponse.json(
        { error: "No se pudo conectar con el servidor de autenticación." },
        { status: 500 },
      )
    }

    const backendData = await backendResponse.json().catch(() => ({}))

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: backendData?.message || "Invalid email or password" },
        { status: 401 },
      )
    }

    const backendUser: User = backendData.user

    if (!isDemoMode) {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_key TEXT`
      await ensureLastLoginColumns()

      const [state] = (await sql`
        SELECT status, session_key
        FROM users
        WHERE id = ${backendUser.id}
        LIMIT 1
      `) as unknown as Array<{ status: string | null; session_key: string | null }>

      const hasActiveSession = state?.status === "available" && Boolean(state?.session_key)
      if (hasActiveSession && !forceNewSession) {
        return NextResponse.json(
          {
            error: "Ya existe una sesión activa para este usuario.",
            code: "ACTIVE_SESSION_EXISTS",
            requiresSessionTakeover: true,
          },
          { status: 409 },
        )
      }
    }

    const sessionKey = randomUUID()

    if (!isDemoMode) {
      // Se sella el último ingreso aquí, que es por donde pasan todos los logins de la
      // interfaz (incluido el que reemplaza una sesión activa).
      await sql`
        UPDATE users
        SET status = 'available',
            session_key = ${sessionKey},
            last_login_at = NOW(),
            last_login_ip = ${getClientIp(request)}
        WHERE id = ${backendUser.id}
      `
    }

    const userWithSession: User & { session_key: string } = {
      ...backendUser,
      status: "available",
      session_key: sessionKey,
    }

    return NextResponse.json(
      {
        // El access_token es el JWT real del backend (incluye role y tenantId),
        // no uno generado localmente.
        access_token: backendData.access_token,
        token_type: backendData.token_type,
        expires_in: backendData.expires_in,
        user: userWithSession,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Login error:", error)

    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        return NextResponse.json(
          {
            error: "Cannot connect to database. Verify DATABASE_URL and that PostgreSQL is running.",
          },
          { status: 500 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
