import { NextResponse } from "next/server"
import { createSession, setSessionCookie } from "@/lib/session"
import type { User } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { user } = (await request.json()) as { user: User }
    if (!user) {
      return NextResponse.json({ error: "Missing user" }, { status: 400 })
    }

    const activeUser = { ...user, status: "available" }
    if (sql && activeUser.id) {
      await sql`
        UPDATE users
        SET status = 'available'
        WHERE id = ${activeUser.id}
      `
    }

    const token = await createSession(activeUser)
    await setSessionCookie(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("session set error", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
