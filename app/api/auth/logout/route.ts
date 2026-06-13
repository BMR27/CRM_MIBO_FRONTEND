import { NextResponse } from "next/server"
import { clearSession, getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export async function POST() {
  try {
    const user = await getSession()
    if (sql && user?.id) {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_key TEXT`
      await sql`
        UPDATE users
        SET status = 'offline', session_key = NULL
        WHERE id = ${user.id}
      `
    }

    await clearSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
