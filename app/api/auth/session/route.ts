import { NextResponse } from "next/server"
import { createSession, setSessionCookie } from "@/lib/session"
import type { User } from "@/lib/auth"
import { isDemoMode, sql } from "@/lib/db"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const { user } = (await request.json()) as { user: User & { session_key?: string | null } }
    if (!user) {
      return NextResponse.json({ error: "Missing user" }, { status: 400 })
    }

    const activeUser: User & { session_key?: string } = { ...user, status: "available" }
    if (!isDemoMode && sql && activeUser.id) {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_key TEXT`

      const rows = (await sql`
        SELECT session_key
        FROM users
        WHERE id = ${activeUser.id}
        LIMIT 1
      `) as unknown as Array<{ session_key: string | null }>

      let sessionKey = String(activeUser.session_key || "").trim()
      if (!sessionKey) {
        sessionKey = String(rows[0]?.session_key || "").trim()
      }
      if (!sessionKey) {
        sessionKey = randomUUID()
      }

      await sql`
        UPDATE users
        SET status = 'available', session_key = ${sessionKey}
        WHERE id = ${activeUser.id}
      `

      activeUser.session_key = sessionKey
    }

    const token = await createSession(activeUser)
    await setSessionCookie(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("session set error", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
