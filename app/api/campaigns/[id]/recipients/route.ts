import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { isDemoMode, sql } from "@/lib/db"

export const runtime = "nodejs"

type Db = NonNullable<typeof sql>

async function getMessagesColumns(db: Db) {
  try {
    const rows: any[] = await db`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name IN ('id', 'content', 'metadata', 'created_at', 'conversation_id', 'direction', 'sender_type')
    `
    return new Set((rows || []).map((row) => String(row?.column_name || "").trim()).filter(Boolean))
  } catch {
    return new Set<string>()
  }
}

async function hasCampaignRecipientsTable(db: Db) {
  try {
    const rows: any[] = await db`
      SELECT to_regclass('public.campaign_recipients') AS tabla
    `
    return Boolean(rows?.[0]?.tabla)
  } catch {
    return false
  }
}

function normalizeStatus(metadata: any) {
  const send = metadata?.send || {}
  if (String(send?.skipped || "false") === "true") return "skipped"
  if (send?.ok === false || String(send?.ok || "").toLowerCase() === "false") return "failed"
  return "sent"
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    const tenantId = user.tenant_id
    if (!tenantId) return NextResponse.json({ error: "Missing tenant" }, { status: 401 })

    const { id } = await params
    if (!id) return NextResponse.json({ error: "Campaign ID required" }, { status: 400 })

    if (isDemoMode || !sql) {
      return NextResponse.json({ recipients: [] })
    }

    const db = sql

    // Fuente principal: la bitácora de la campaña. Incluye los envíos fallidos y no se
    // pierde aunque después se borre la conversación o el contacto.
    if (await hasCampaignRecipientsTable(db)) {
      const logged: any[] = await db`
        SELECT id, contact_name, phone_number, status, error, content, created_at
        FROM campaign_recipients
        WHERE (campaign_id = ${id} OR campaign_code = ${id})
          AND tenant_id = ${tenantId}
        ORDER BY created_at DESC
        LIMIT 1000
      `
      if (logged.length > 0) {
        return NextResponse.json({
          source: "log",
          recipients: logged.map((row) => ({
            id: String(row.id),
            contactName: String(row.contact_name || ""),
            phoneNumber: String(row.phone_number || ""),
            message: String(row.content || ""),
            error: row.error ? String(row.error) : "",
            status: String(row.status || "sent"),
            createdAt: row.created_at || "",
          })),
        })
      }
    }

    // Respaldo para campañas anteriores a la bitácora: reconstruir desde los mensajes.
    const cols = await getMessagesColumns(db)
    if (!cols.has("metadata")) {
      return NextResponse.json({ recipients: [] })
    }

    const outboundPredicate = cols.has("direction")
      ? db`m.direction = 'outbound'`
      : cols.has("sender_type")
        ? db`m.sender_type = 'agent'`
        : db`TRUE`

    const rows: any[] = await db`
      SELECT
        m.id,
        m.content,
        m.metadata,
        m.created_at,
        contacts.name AS contact_name,
        contacts.phone_number
      FROM messages m
      LEFT JOIN conversations c ON c.id = m.conversation_id
      LEFT JOIN contacts ON contacts.id = c.contact_id
      WHERE (m.metadata->>'campaignId' = ${id} OR m.metadata->>'campaignCode' = ${id})
        AND COALESCE((m.metadata->>'source'), '') = 'bulk'
        AND m.tenant_id = ${tenantId}
        AND ${outboundPredicate}
      ORDER BY m.created_at DESC
      LIMIT 500
    `

    const recipients = (rows || []).map((row) => {
      const metadata = row?.metadata || {}
      return {
        id: String(row?.id || `${metadata?.campaignId || id}-${metadata?.phone || row?.phone_number || Math.random()}`),
        contactName: String(metadata?.contactName || metadata?.name || row?.contact_name || ""),
        phoneNumber: String(metadata?.phone || metadata?.to || row?.phone_number || ""),
        message: String(row?.content || metadata?.message || metadata?.templateName || ""),
        error: "",
        status: normalizeStatus(metadata),
        createdAt: row?.created_at || "",
      }
    })

    return NextResponse.json({ source: "messages", recipients })
  } catch (error) {
    console.error("[Campaign Recipients] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
