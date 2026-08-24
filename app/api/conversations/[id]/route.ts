import { NextResponse } from "next/server"
import { isDemoMode, sql } from "@/lib/db"
import { getSession } from "@/lib/session"
import { DEMO_CONVERSATIONS } from "@/lib/demo-data"

let _hasConversationCommentsColumn: boolean | null = null

async function hasConversationCommentsColumn(): Promise<boolean> {
  if (_hasConversationCommentsColumn !== null) return _hasConversationCommentsColumn
  try {
    const rows = await sql!`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name = 'comments'
      LIMIT 1
    `
    _hasConversationCommentsColumn = Array.isArray(rows) && rows.length > 0
  } catch {
    _hasConversationCommentsColumn = false
  }
  return _hasConversationCommentsColumn
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const tenantId = user.tenant_id
    if (!tenantId) return NextResponse.json({ error: "Missing tenant" }, { status: 401 })

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 })
    }

    if (isDemoMode) {
      const demoConversation = DEMO_CONVERSATIONS.find((conversation) => String(conversation.id) === String(id))
      if (!demoConversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      return NextResponse.json({
        id: demoConversation.id,
        status: demoConversation.status,
        priority: demoConversation.priority,
        comments: JSON.stringify([]),
        created_at: demoConversation.created_at,
        last_message_at: demoConversation.last_message_at,
        contact_name: demoConversation.contact.name,
        phone_number: demoConversation.contact.phone_number,
        agent_name: demoConversation.assigned_agent?.name || null,
      })
    }

    const includeComments = await hasConversationCommentsColumn()

    // SELECT * keeps this route compatible with older deployments where optional
    // columns may not exist yet. Required values are read defensively below.
    const result: any = await sql!`
      SELECT *
      FROM conversations
      WHERE id::text = ${id} AND tenant_id = ${tenantId}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const conversation = result[0]
    const role = normalizeRole((user as any).role)

    // Check permissions based on user role
    if (role === "agent") {
      // Agents can only access conversations assigned to them
      if (String(conversation.assigned_agent_id || "") !== String(user.id)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
    } else if (role !== "admin" && role !== "supervisor") {
      // Non-admin users (regular contacts/users) can only access their own conversations
      let contactCheck: any[] = []
      try {
        contactCheck = await sql!`
          SELECT id
          FROM contacts
          WHERE id::text = ${String(conversation.contact_id || "")}
            AND created_by_user_id::text = ${String(user.id)}
          LIMIT 1
        `
      } catch (error) {
        console.warn("[Conversations GET] Could not validate contact ownership:", error)
      }
      if (!contactCheck.length) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
    }
    // Admins and supervisors can access all conversations

    // Fetch contact info
    let contactResult: any = []
    if (conversation.contact_id) {
      try {
        contactResult = await sql!`
          SELECT name, phone_number
          FROM contacts
          WHERE id::text = ${String(conversation.contact_id)}
          LIMIT 1
        `
      } catch (error) {
        console.warn("[Conversations GET] Could not load contact info:", error)
      }
    }

    const contact = contactResult.length > 0 ? contactResult[0] : { name: "Unknown", phone_number: "" }

    // Fetch agent info if assigned
    let agentResult: any = []
    if (conversation.assigned_agent_id) {
      try {
        agentResult = await sql!`
          SELECT name
          FROM users
          WHERE id::text = ${String(conversation.assigned_agent_id)}
          LIMIT 1
        `
      } catch (error) {
        console.warn("[Conversations GET] Could not load agent info:", error)
      }
    }

    const agent = agentResult.length > 0 ? agentResult[0] : null

    // Convert old text comments to JSON array if needed
    let comments = includeComments ? conversation.comments : null
    if (comments) {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(comments)
        if (!Array.isArray(parsed)) {
          // If it's not an array, set to empty
          comments = JSON.stringify([])
        }
      } catch {
        // If it's not JSON, it's old format text - convert to JSON array
        if (typeof comments === "string" && comments.trim()) {
          const textComments = comments.split("\n").filter((line: string) => line.trim())
          const jsonArray = textComments.map((text: string, index: number) => ({
            id: `${Date.now()}-${index}`,
            text: text.trim(),
            created_at: new Date(conversation.created_at).toISOString(),
          }))
          comments = JSON.stringify(jsonArray)
        } else {
          comments = JSON.stringify([])
        }
      }
    } else {
      comments = JSON.stringify([])
    }

    return NextResponse.json({
      id: conversation.id,
      status: conversation.status || "active",
      priority: conversation.priority || "low",
      comments: comments,
      created_at: conversation.created_at || null,
      last_message_at: conversation.last_message_at || conversation.updated_at || conversation.created_at || null,
      contact_name: contact.name,
      phone_number: contact.phone_number,
      agent_name: agent?.name || null,
    })
  } catch (error) {
    console.error("[Conversations GET] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function normalizeRole(role: string | undefined | null): "admin" | "supervisor" | "agent" | "other" {
  const r = String(role || "").trim()
  const roleMap: Record<string, "admin" | "supervisor" | "agent"> = {
    Administrador: "admin",
    Supervisor: "supervisor",
    Agente: "agent",
    admin: "admin",
    supervisor: "supervisor",
    agent: "agent",
  }
  return roleMap[r] || "other"
}

async function findConversationId(tx: typeof sql, id: string, tenantId: string): Promise<{ id: any } | null> {
  // Prefer text comparison for UUID/int compatibility
  let rows: any[] = []
  try {
    rows = await tx`
      SELECT id
      FROM conversations
      WHERE id::text = ${id} AND tenant_id = ${tenantId}
      LIMIT 1
    `
  } catch {
    // ignore and fallback
  }
  if (rows?.length) return rows[0]

  if (!isNaN(Number(id))) {
    const intId = Number.parseInt(id)
    rows = await tx`
      SELECT id
      FROM conversations
      WHERE id = ${intId} AND tenant_id = ${tenantId}
      LIMIT 1
    `
    if (rows?.length) return rows[0]
  }

  return null
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 })
    }

    const role = normalizeRole((user as any).role)
    if (role !== "admin" && role !== "supervisor") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    const tenantId = user.tenant_id
    if (!tenantId) return NextResponse.json({ error: "Missing tenant" }, { status: 401 })

    if (isDemoMode) {
      return NextResponse.json({ ok: true, deleted: id, demo: true })
    }

    const deletedId = await sql.begin(async (tx) => {
      const conv = await findConversationId(tx as any, id, tenantId)
      if (!conv) {
        return null
      }

      // Best-effort deletes for dependent tables (some deployments may not have all tables/columns)
      const tryDelete = async (fn: () => Promise<any>) => {
        try {
          await fn()
        } catch {
          // ignore
        }
      }

      await tryDelete(() => (tx as any)`DELETE FROM messages WHERE conversation_id::text = ${id}`)
      await tryDelete(() => (tx as any)`DELETE FROM conversation_tags WHERE conversation_id::text = ${id}`)

      // In case the schema doesn't allow ::text comparisons
      if (!isNaN(Number(id))) {
        const intId = Number.parseInt(id)
        await tryDelete(() => (tx as any)`DELETE FROM messages WHERE conversation_id = ${intId}`)
        await tryDelete(() => (tx as any)`DELETE FROM conversation_tags WHERE conversation_id = ${intId}`)
      }

      // Finally delete the conversation row
      let delRows: any[] = []
      try {
        delRows = await (tx as any)`DELETE FROM conversations WHERE id::text = ${id} RETURNING id`
      } catch {
        if (!isNaN(Number(id))) {
          const intId = Number.parseInt(id)
          delRows = await (tx as any)`DELETE FROM conversations WHERE id = ${intId} RETURNING id`
        } else {
          throw new Error("Failed to delete conversation")
        }
      }

      return delRows?.[0]?.id ?? null
    })

    if (!deletedId) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, deleted: deletedId })
  } catch (error) {
    console.error("[Conversations DELETE] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
