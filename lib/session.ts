import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import type { User } from "./auth"
import { isDemoMode, sql } from "./db"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")
let sessionSchemaReady = false

async function ensureSessionSchema() {
  if (sessionSchemaReady || isDemoMode) return
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_key TEXT`
  sessionSchemaReady = true
}

async function validateSessionState(user: (User & { session_key?: string }) | null) {
  if (!user) return null
  if (isDemoMode) return user

  await ensureSessionSchema()

  const rows = (await sql`
    SELECT status, session_key
    FROM users
    WHERE id = ${user.id}
    LIMIT 1
  `) as unknown as Array<{ status: string | null; session_key: string | null }>

  const current = rows[0]
  if (!current) return null
  if (current.status !== "available") return null

  const tokenSessionKey = String(user.session_key || "").trim()
  const dbSessionKey = String(current.session_key || "").trim()

  if (!tokenSessionKey || !dbSessionKey || tokenSessionKey !== dbSessionKey) {
    return null
  }

  return user
}

export async function createSession(user: User): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)

  return token
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const sessionUser = payload.user as User & { session_key?: string }
    return (await validateSessionState(sessionUser)) as User | null
  } catch (error) {
    return null
  }
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    const sessionUser = payload.user as User & { session_key?: string }
    return (await validateSessionState(sessionUser)) as User | null
  } catch (error) {
    return null
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
