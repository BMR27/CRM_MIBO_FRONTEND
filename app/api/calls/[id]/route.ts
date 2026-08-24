import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"

const ensureCallsTable = async () => {
  if (!sql) throw new Error("Database not configured")

  await sql!`
    CREATE TABLE IF NOT EXISTS calls (
      id SERIAL PRIMARY KEY,
      agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
      contact_name TEXT,
      phone_number TEXT,
      scheduled_at TIMESTAMP NOT NULL,
      call_type VARCHAR(20) DEFAULT 'phone',
      meet_link TEXT,
      notes TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
  await sql!`CREATE INDEX IF NOT EXISTS idx_calls_agent ON calls(agent_id)`
  await sql!`CREATE INDEX IF NOT EXISTS idx_calls_conversation ON calls(conversation_id)`
  await sql!`CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status)`
  await sql!`ALTER TABLE calls ADD COLUMN IF NOT EXISTS meet_link TEXT`
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const tenantId = user.tenant_id
  if (!tenantId) return NextResponse.json({ error: "Missing tenant" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const {
    contact_name,
    phone_number,
    conversation_id,
    scheduled_at,
    call_type,
    meet_link,
    notes,
    status,
  } = body
  const hasMeetLink = Object.prototype.hasOwnProperty.call(body, "meet_link")

  try {
    await ensureCallsTable()
    const result = await sql!`
      UPDATE calls 
      SET 
        contact_name = COALESCE(NULLIF(${contact_name || ""}, ''), contact_name),
        phone_number = COALESCE(NULLIF(${phone_number || ""}, ''), phone_number),
        conversation_id = COALESCE(${conversation_id || null}, conversation_id),
        scheduled_at = COALESCE(${scheduled_at || null}, scheduled_at),
        call_type = COALESCE(NULLIF(${call_type || ""}, ''), call_type),
        meet_link = CASE WHEN ${hasMeetLink} THEN ${meet_link || null} ELSE meet_link END,
        notes = COALESCE(NULLIF(${notes || ""}, ''), notes),
        status = COALESCE(NULLIF(${status || ""}, ''), status),
        updated_at = NOW()
      WHERE id = ${id} AND tenant_id = ${tenantId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 })
    }

    return NextResponse.json({ call: result[0] })
  } catch (error) {
    console.error("[PUT Call] Error:", error)
    return NextResponse.json({
      error: "Failed to update call",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const tenantId = user.tenant_id
  if (!tenantId) return NextResponse.json({ error: "Missing tenant" }, { status: 401 })

  const { id } = await params

  try {
    await ensureCallsTable()
    const result = await sql!`
      DELETE FROM calls
      WHERE id = ${id} AND tenant_id = ${tenantId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE Call] Error:", error)
    return NextResponse.json({
      error: "Failed to delete call",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}
