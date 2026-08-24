import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { isDemoMode, sql } from "@/lib/db"
import { DEMO_CONVERSATIONS } from "@/lib/demo-data"

let _hasConversationChannelColumns: boolean | null = null
let _hasConversationExternalConversationIdColumn: boolean | null = null
let _conversationStatusOpenValue: string | null = null
let _conversationStatusClosedValue: string | null = null

function normalizeDigits(value: unknown): string {
  return String(value || "").replace(/\D/g, "")
}

async function hasConversationChannelColumns(): Promise<boolean> {
  if (_hasConversationChannelColumns !== null) return _hasConversationChannelColumns
  try {
    const rows = await sql!`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name IN ('channel', 'external_user_id')
      ORDER BY column_name
    `
    _hasConversationChannelColumns = Array.isArray(rows) && rows.length === 2
  } catch {
    _hasConversationChannelColumns = false
  }
  return _hasConversationChannelColumns
}

async function hasConversationExternalConversationIdColumn(): Promise<boolean> {
  if (_hasConversationExternalConversationIdColumn !== null) return _hasConversationExternalConversationIdColumn
  try {
    const rows = await sql!`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name = 'external_conversation_id'
      LIMIT 1
    `
    _hasConversationExternalConversationIdColumn = Array.isArray(rows) && rows.length > 0
  } catch {
    _hasConversationExternalConversationIdColumn = false
  }
  return _hasConversationExternalConversationIdColumn
}

async function getConversationStatusValues(): Promise<{ openValue: string; closedValue: string | null }> {
  if (_conversationStatusOpenValue !== null) {
    return { openValue: _conversationStatusOpenValue, closedValue: _conversationStatusClosedValue }
  }

  // Defaults for non-enum schemas
  let openValue = "open"
  let closedValue: string | null = "closed"

  try {
    const cols: any[] = await sql!`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name = 'status'
      LIMIT 1
    `

    const dataType = String(cols?.[0]?.data_type || "")
    const udtName = String(cols?.[0]?.udt_name || "")

    if (dataType.toUpperCase() === "USER-DEFINED" && udtName) {
      const labels: any[] = await sql!`
        SELECT e.enumlabel
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = ${udtName}
        ORDER BY e.enumsortorder
      `
      const enumLabels = (labels || []).map((r) => String(r.enumlabel))

      const pickFirst = (candidates: string[]) => enumLabels.find((l) => candidates.includes(l))
      openValue =
        pickFirst(["open", "active", "new", "pending"]) ||
        enumLabels[0] ||
        openValue

      // Closed can vary by schema
      closedValue =
        pickFirst(["closed", "resolved", "archived"]) ||
        null
    }
  } catch {
    // keep defaults
  }

  _conversationStatusOpenValue = openValue
  _conversationStatusClosedValue = closedValue
  return { openValue, closedValue }
}

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    const tenantId = user.tenant_id
    if (!tenantId) return NextResponse.json({ error: "Missing tenant" }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const contactIdRaw = body?.contactId ?? body?.contact_id
    const contactIdText = String(contactIdRaw ?? "").trim()

    if (!contactIdText) {
      return NextResponse.json({ error: "contactId is required" }, { status: 400 })
    }

    if (isDemoMode) {
      const existing = DEMO_CONVERSATIONS.find((c) => String(c.contact_id) === contactIdText && c.status !== "closed")
      if (!existing) {
        return NextResponse.json({
          conversation: { id: Date.now(), contact_id: contactIdText, status: "open", priority: "medium" },
          contact: { id: contactIdText },
          demo: true,
        })
      }
      return NextResponse.json({
        conversation: { id: existing.id, contact_id: existing.contact_id, status: existing.status, priority: existing.priority, channel: "whatsapp" },
        contact: { id: existing.contact_id, name: existing.contact.name, phone_number: existing.contact.phone_number, channel: "whatsapp" },
        demo: true,
      })
    }

    // Load contact
    const contactRows: any[] = await sql!`
      SELECT *
      FROM contacts
      WHERE id::text = ${contactIdText} AND tenant_id = ${tenantId}
      LIMIT 1
    `

    if (!contactRows.length) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    const contact = contactRows[0]

    const { openValue: statusOpenValue, closedValue: statusClosedValue } = await getConversationStatusValues()

    // Find latest conversation for this exact contact. Reuse history even if it was closed.
    let conversationRows: any[] = []
    let created = false
    try {
      conversationRows = await sql!`
        SELECT *
        FROM conversations
        WHERE contact_id = ${contact.id} AND tenant_id = ${tenantId}
        ORDER BY last_message_at DESC NULLS LAST, updated_at DESC NULLS LAST, created_at DESC
        LIMIT 1
      `
    } catch {
      conversationRows = []
    }

    const includeChannelCols = await hasConversationChannelColumns()
    const includeExternalConvId = await hasConversationExternalConversationIdColumn()

    if (!conversationRows.length) {
      const contactExternalUserId = String(contact?.external_user_id || "").trim()
      const contactPhoneDigits = normalizeDigits(contact?.phone_number || contactExternalUserId)
      try {
        if (includeChannelCols && (contactExternalUserId || contactPhoneDigits)) {
          conversationRows = await sql!`
            SELECT c.*
            FROM conversations c
            LEFT JOIN contacts ct ON c.contact_id = ct.id
            WHERE c.tenant_id = ${tenantId}
              AND (
              (${contactExternalUserId} <> '' AND c.external_user_id = ${contactExternalUserId})
              OR (${contactPhoneDigits} <> '' AND regexp_replace(COALESCE(ct.phone_number, ''), '[^0-9]', '', 'g') = ${contactPhoneDigits})
              OR (${contactPhoneDigits} <> '' AND regexp_replace(COALESCE(c.external_user_id, ''), '[^0-9]', '', 'g') = ${contactPhoneDigits})
            )
            ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC NULLS LAST, c.created_at DESC
            LIMIT 1
          `
        } else if (contactPhoneDigits) {
          conversationRows = await sql!`
            SELECT c.*
            FROM conversations c
            LEFT JOIN contacts ct ON c.contact_id = ct.id
            WHERE c.tenant_id = ${tenantId}
              AND regexp_replace(COALESCE(ct.phone_number, ''), '[^0-9]', '', 'g') = ${contactPhoneDigits}
            ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC NULLS LAST, c.created_at DESC
            LIMIT 1
          `
        }
      } catch {
        conversationRows = []
      }
    }

    if (conversationRows.length && statusClosedValue && String(conversationRows[0]?.status || "") === statusClosedValue) {
      try {
        const reopenedRows: any[] = await sql!`
          UPDATE conversations
          SET status = ${statusOpenValue}, updated_at = NOW()
          WHERE id = ${conversationRows[0].id} AND tenant_id = ${tenantId}
          RETURNING *
        `
        if (reopenedRows.length) conversationRows = reopenedRows
      } catch {
        // If this schema does not allow reopening, keep the existing conversation anyway.
      }
    }

    if (!conversationRows.length) {
      created = true
      const channel = (String(contact?.channel || "whatsapp").toLowerCase() === "facebook") ? "facebook" : "whatsapp"
      const externalUserId = String(contact?.external_user_id || "").trim() || null

      // Insert conversation (compatible with schemas missing channel columns)
      if (includeChannelCols && includeExternalConvId) {
        conversationRows = await sql!`
          INSERT INTO conversations (
            contact_id,
            status,
            priority,
            channel,
            external_user_id,
            external_conversation_id,
            tenant_id,
            created_at,
            updated_at,
            last_message_at
          )
          VALUES (
            ${contact.id},
            ${statusOpenValue},
            'medium',
            ${channel},
            ${externalUserId},
            ${externalUserId ? `${channel}_${externalUserId}` : null},
            ${tenantId},
            NOW(),
            NOW(),
            NOW()
          )
          RETURNING *
        `
      } else if (includeChannelCols) {
        conversationRows = await sql!`
          INSERT INTO conversations (
            contact_id,
            status,
            priority,
            channel,
            external_user_id,
            tenant_id,
            created_at,
            updated_at,
            last_message_at
          )
          VALUES (
            ${contact.id},
            ${statusOpenValue},
            'medium',
            ${channel},
            ${externalUserId},
            ${tenantId},
            NOW(),
            NOW(),
            NOW()
          )
          RETURNING *
        `
      } else {
        conversationRows = await sql!`
          INSERT INTO conversations (
            contact_id,
            status,
            priority,
            tenant_id,
            created_at,
            updated_at,
            last_message_at
          )
          VALUES (
            ${contact.id},
            ${statusOpenValue},
            'medium',
            ${tenantId},
            NOW(),
            NOW(),
            NOW()
          )
          RETURNING *
        `
      }
    }

    const conversation = conversationRows[0]

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        contact_id: conversation.contact_id,
        status: conversation.status,
        priority: conversation.priority,
        channel: (conversation as any).channel || (contact as any).channel || "whatsapp",
        external_user_id: (conversation as any).external_user_id || (contact as any).external_user_id || null,
      },
      contact: {
        id: contact.id,
        name: contact.name,
        phone_number: contact.phone_number,
        channel: (contact as any).channel || "whatsapp",
        external_user_id: (contact as any).external_user_id || null,
      },
      created,
    })
  } catch (error) {
    console.error("[Conversations Ensure] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
