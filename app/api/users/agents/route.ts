import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql, isDemoMode } from "@/lib/db"

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }


    const agents = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.status,
        u.avatar_url,
        r.name as role
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.role_id IS NOT NULL
      ORDER BY u.name ASC
    `

    return NextResponse.json(agents)
  } catch (error) {
    console.error("[v0] Get agents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
