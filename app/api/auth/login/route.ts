import { NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"
import { isDemoMode, sql } from "@/lib/db"
import jwt from "jsonwebtoken"
import type { Secret, SignOptions } from "jsonwebtoken"
import { randomUUID } from "crypto"

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

    if (!isDemoMode) {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_key TEXT`
    }

    // Authenticate user
    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      )
    }

    if (!isDemoMode && user?.id) {
      const [state] = (await sql`
        SELECT status, session_key
        FROM users
        WHERE id = ${user.id}
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

    if (!isDemoMode && user?.id) {
      await sql`
        UPDATE users
        SET status = 'available', session_key = ${sessionKey}
        WHERE id = ${user.id}
      `
    }

    // Generate JWT token
    const secret = (process.env.JWT_SECRET || "secret") as Secret
    const expiresIn = (process.env.JWT_EXPIRATION || "7d") as SignOptions["expiresIn"]
    const token = jwt.sign(
      { email: user.email, sub: user.id, session_key: sessionKey },
      secret,
      { expiresIn },
    )

    const userWithSession = {
      ...user,
      session_key: sessionKey,
      status: "available",
    }

    return NextResponse.json(
      {
        access_token: token,
        token_type: "Bearer",
        expires_in: process.env.JWT_EXPIRATION || "7d",
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
