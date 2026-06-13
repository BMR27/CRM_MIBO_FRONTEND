import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql, isDemoMode } from "@/lib/db"

function normalizeRole(role: string | undefined | null): "admin" | "supervisor" | "agent" | "other" {
  const value = String(role || "").trim().toLowerCase()
  const roleMap: Record<string, "admin" | "supervisor" | "agent"> = {
    administrador: "admin",
    admin: "admin",
    supervisor: "supervisor",
    agente: "agent",
    agent: "agent",
  }

  return roleMap[value] || "other"
}

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userRole = normalizeRole((user as any).role)

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
        AND (
          ${userRole} = 'admin'
          OR COALESCE(LOWER(r.name), '') NOT IN ('admin', 'administrador')
        )
      ORDER BY u.name ASC
    `

    return NextResponse.json(agents)
  } catch (error) {
    console.error("[v0] Get agents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
