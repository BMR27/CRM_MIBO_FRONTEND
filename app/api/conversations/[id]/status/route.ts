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
    const { status } = body

    if (!id) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 })
    }

    const validStatuses = ["active", "resolved"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status. Use 'active' or 'resolved'" }, { status: 400 })
    }

    // Try to update as UUID first, then as integer
    // Status is VARCHAR, no casting needed
    let result: any = []
    try {
      result = await sql!`
        UPDATE conversations
        SET status = ${status}, updated_at = NOW()
        WHERE id::text = ${id} AND tenant_id = ${tenantId}
        RETURNING id, status
      `
    } catch (e) {
      // Try as integer
      if (!isNaN(Number(id))) {
        result = await sql!`
          UPDATE conversations
          SET status = ${status}, updated_at = NOW()
          WHERE id = ${Number.parseInt(id)} AND tenant_id = ${tenantId}
          RETURNING id, status
        `
      } else {
        throw e
      }
    }

    if (result.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: result[0].id,
      status: result[0].status,
      message: "Status updated successfully",
    })
  } catch (error) {
    console.error("[Conversations Status] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
