import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { isDemoMode, sql } from "@/lib/db"

export const runtime = "nodejs"

type Db = NonNullable<typeof sql>

async function getMessagesColumns(db: Db): Promise<Set<string>> {
  try {
    const rows: any[] = await db`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name IN ('direction', 'metadata', 'read_at', 'sender_type')
      ORDER BY column_name
    `
    return new Set((rows || []).map((r) => String(r?.column_name || "").trim()).filter(Boolean))
  } catch {
    return new Set()
  }
}

export async function GET() {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    const tenantId = user.tenant_id
    if (!tenantId) return NextResponse.json({ error: "Missing tenant" }, { status: 401 })

    if (isDemoMode) {
      return NextResponse.json({ error: "Stats not available in demo mode" }, { status: 400 })
    }

    if (!sql) {
      return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 })
    }

    const db = sql
    const cols = await getMessagesColumns(db)
    const hasDirection = cols.has("direction")
    const hasSenderType = cols.has("sender_type")
    const hasReadAt = cols.has("read_at")
    const hasMetadata = cols.has("metadata")

    let messagesSent = 0
    let messagesRead = 0
    let repliesReceived = 0

    try {
      if (hasDirection && hasReadAt) {
        const rows: any[] = await db`
          SELECT
            COUNT(*) FILTER (WHERE direction = 'outbound') AS sent_count,
            COUNT(*) FILTER (WHERE direction = 'outbound' AND read_at IS NOT NULL) AS read_count,
            COUNT(*) FILTER (WHERE direction = 'inbound') AS inbound_count
          FROM messages
          WHERE tenant_id = ${tenantId}
        `
        messagesSent = Number(rows?.[0]?.sent_count || 0)
        messagesRead = Number(rows?.[0]?.read_count || 0)
        repliesReceived = Number(rows?.[0]?.inbound_count || 0)
      } else if (hasDirection && hasMetadata) {
        const rows: any[] = await db`
          SELECT
            COUNT(*) FILTER (WHERE direction = 'outbound') AS sent_count,
            COUNT(*) FILTER (WHERE direction = 'outbound' AND (metadata->>'whatsappStatus') = 'read') AS read_count,
            COUNT(*) FILTER (WHERE direction = 'inbound') AS inbound_count
          FROM messages
          WHERE tenant_id = ${tenantId}
        `
        messagesSent = Number(rows?.[0]?.sent_count || 0)
        messagesRead = Number(rows?.[0]?.read_count || 0)
        repliesReceived = Number(rows?.[0]?.inbound_count || 0)
      } else if (hasDirection) {
        const rows: any[] = await db`
          SELECT
            COUNT(*) FILTER (WHERE direction = 'outbound') AS sent_count,
            COUNT(*) FILTER (WHERE direction = 'inbound') AS inbound_count
          FROM messages
          WHERE tenant_id = ${tenantId}
        `
        messagesSent = Number(rows?.[0]?.sent_count || 0)
        repliesReceived = Number(rows?.[0]?.inbound_count || 0)
      } else if (hasSenderType && hasMetadata) {
        const rows: any[] = await db`
          SELECT
            COUNT(*) FILTER (WHERE sender_type = 'agent') AS sent_count,
            COUNT(*) FILTER (WHERE sender_type = 'agent' AND (metadata->>'whatsappStatus') = 'read') AS read_count,
            COUNT(*) FILTER (WHERE sender_type IN ('customer','contact')) AS inbound_count
          FROM messages
          WHERE tenant_id = ${tenantId}
        `
        messagesSent = Number(rows?.[0]?.sent_count || 0)
        messagesRead = Number(rows?.[0]?.read_count || 0)
        repliesReceived = Number(rows?.[0]?.inbound_count || 0)
      } else if (hasSenderType) {
        const rows: any[] = await db`
          SELECT
            COUNT(*) FILTER (WHERE sender_type = 'agent') AS sent_count,
            COUNT(*) FILTER (WHERE sender_type IN ('customer','contact')) AS inbound_count
          FROM messages
          WHERE tenant_id = ${tenantId}
        `
        messagesSent = Number(rows?.[0]?.sent_count || 0)
        repliesReceived = Number(rows?.[0]?.inbound_count || 0)
      }
    } catch {
      // ignore
    }

    let totalValue = 0
    try {
      const rows: any[] = await db`
        SELECT COALESCE(SUM(total_amount), 0) AS total
        FROM orders
        WHERE tenant_id = ${tenantId}
          AND status != 'cancelled'
      `
      totalValue = Number(rows?.[0]?.total || 0)
    } catch {
      // ignore
    }

    return NextResponse.json({ messagesSent, messagesRead, repliesReceived, totalValue })
  } catch (error) {
    console.error("[workspace/stats] error", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
