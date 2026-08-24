import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    const tenantId = user.tenant_id
    if (!tenantId) return NextResponse.json({ error: "Missing tenant" }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { priority } = body

    if (!id) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 })
    }

    if (!priority) {
      return NextResponse.json({ error: "Priority required" }, { status: 400 })
    }

    const validPriorities = ["low", "medium", "high"]
    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
    }

    // Try to update as UUID first, then as integer
    let result: any = await sql!`
      UPDATE conversations
      SET priority = ${priority}, updated_at = NOW()
      WHERE id::text = ${id} AND tenant_id = ${tenantId}
      RETURNING id, priority
    `

    if (result.length === 0 && !isNaN(Number(id))) {
      result = await sql!`
        UPDATE conversations
        SET priority = ${priority}, updated_at = NOW()
        WHERE id = ${Number.parseInt(id)} AND tenant_id = ${tenantId}
        RETURNING id, priority
      `
    }

    if (result.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: result[0].id,
      priority: result[0].priority,
      message: "Priority updated successfully",
    })
  } catch (error) {
    console.error("[Conversations Priority] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
