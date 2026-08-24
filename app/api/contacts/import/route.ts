import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { isDemoMode, sql } from "@/lib/db"

export const runtime = "nodejs"

let _hasContactChannelColumns: boolean | null = null

async function hasContactChannelColumns(): Promise<boolean> {
  if (_hasContactChannelColumns !== null) return _hasContactChannelColumns
  try {
    const rows = await sql!`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'contacts'
        AND column_name IN ('channel', 'external_user_id')
      ORDER BY column_name
    `
    _hasContactChannelColumns = Array.isArray(rows) && rows.length === 2
  } catch {
    _hasContactChannelColumns = false
  }
  return _hasContactChannelColumns
}

function normalizePhoneToDigits(value: string) {
  const digits = String(value || "").replace(/^whatsapp:/i, "").replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("521") && digits.length === 13) return `52${digits.slice(-10)}`
  if (digits.length === 10) return `52${digits}`
  return digits
}

function normalizeContact(row: any) {
  const channel = String(row?.channel || row?.canal || "whatsapp").trim().toLowerCase() === "facebook"
    ? "facebook"
    : "whatsapp"
  const rawName = String(row?.name || row?.nombre || row?.CLIENTE || "").trim()
  let phoneNumber = String(row?.phone_number || row?.telefono || row?.PHONE_A || row?.phone || "").trim()
  let externalUserId = String(row?.external_user_id || row?.externalUserId || "").trim()
  let name = rawName

  if (channel === "whatsapp") {
    const digits = normalizePhoneToDigits(phoneNumber || externalUserId)
    if (!digits) throw new Error("phone_number is required")
    phoneNumber = `whatsapp:+${digits}`
    externalUserId = digits
    if (!name) name = `+${digits}`
  } else {
    if (!externalUserId) throw new Error("external_user_id is required for facebook")
    if (!phoneNumber) phoneNumber = `fb_${externalUserId}`
    if (!name) name = `Facebook User ${externalUserId.slice(-8)}`
  }

  return {
    name,
    channel,
    phone_number: phoneNumber,
    external_user_id: externalUserId,
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    const tenantId = user.tenant_id
    if (!tenantId) return NextResponse.json({ error: "Missing tenant" }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const contacts = Array.isArray(body?.contacts) ? body.contacts : []

    if (contacts.length === 0) {
      return NextResponse.json({ error: "contacts must be a non-empty array" }, { status: 400 })
    }

    if (contacts.length > 1000) {
      return NextResponse.json({ error: "Maximum 1000 contacts per import" }, { status: 400 })
    }

    if (isDemoMode) {
      return NextResponse.json({
        ok: true,
        imported: contacts.length,
        updated: 0,
        failed: 0,
        demo: true,
      })
    }

    if (!sql) return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 500 })

    const includeChannelCols = await hasContactChannelColumns()
    const results: any[] = []
    let imported = 0
    let updated = 0
    let failed = 0

    for (let index = 0; index < contacts.length; index++) {
      try {
        const contact = normalizeContact(contacts[index])
        const existing: any[] = await sql`
          SELECT id
          FROM contacts
          WHERE phone_number = ${contact.phone_number} AND tenant_id = ${tenantId}
          LIMIT 1
        `

        if (existing.length) {
          const rows = includeChannelCols
            ? await sql`
                UPDATE contacts
                SET name = COALESCE(NULLIF(${contact.name}, ''), name),
                    channel = ${contact.channel},
                    external_user_id = COALESCE(NULLIF(${contact.external_user_id}, ''), external_user_id)
                WHERE id = ${existing[0].id}
                RETURNING id, name, phone_number, channel, external_user_id, created_at
              `
            : await sql`
                UPDATE contacts
                SET name = COALESCE(NULLIF(${contact.name}, ''), name)
                WHERE id = ${existing[0].id}
                RETURNING id, name, phone_number, NULL::varchar as channel, NULL::varchar as external_user_id, created_at
              `
          updated += 1
          results.push({ ok: true, action: "updated", contact: rows[0] })
          continue
        }

        const rows = includeChannelCols
          ? await sql`
              INSERT INTO contacts (name, phone_number, channel, external_user_id, tenant_id, created_at)
              VALUES (${contact.name}, ${contact.phone_number}, ${contact.channel}, ${contact.external_user_id}, ${tenantId}, NOW())
              RETURNING id, name, phone_number, channel, external_user_id, created_at
            `
          : await sql`
              INSERT INTO contacts (name, phone_number, tenant_id, created_at)
              VALUES (${contact.name}, ${contact.phone_number}, ${tenantId}, NOW())
              RETURNING id, name, phone_number, NULL::varchar as channel, NULL::varchar as external_user_id, created_at
            `
        imported += 1
        results.push({ ok: true, action: "created", contact: rows[0] })
      } catch (error) {
        failed += 1
        results.push({
          ok: false,
          index,
          error: error instanceof Error ? error.message : "Import failed",
        })
      }
    }

    return NextResponse.json({
      ok: failed === 0,
      imported,
      updated,
      failed,
      total: contacts.length,
      results,
    })
  } catch (error) {
    console.error("[Contacts Import] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
