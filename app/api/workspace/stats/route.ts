import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { isDemoMode, sql } from "@/lib/db"

export const runtime = "nodejs"

type Db = NonNullable<typeof sql>

const TREND_DAYS = 14

/*
 * Cómo se clasifican los mensajes:
 *
 * - Enviado vs. recibido sale de sender_type. La columna `direction` no sirve: tiene
 *   'inbound' por defecto y el backend nunca la asigna, así que todos los mensajes
 *   (también los que manda la campaña) aparecían como recibidos.
 * - El estado de entrega sale de lo que reporta el proveedor: metadata.delivery_status
 *   (status callback de Twilio) o metadata.whatsappStatus (webhook de Meta). No se usa
 *   read_at: el backend lo llena en todos los mensajes de la conversación cuando un
 *   agente la abre, así que no significa "lo leyó el cliente".
 */

async function hasTable(db: Db, name: string) {
  try {
    const rows: any[] = await db`SELECT to_regclass(${`public.${name}`}) AS tabla`
    return Boolean(rows?.[0]?.tabla)
  } catch {
    return false
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

    const stats = {
      messagesSent: 0,
      messagesDelivered: 0,
      messagesRead: 0,
      messagesFailed: 0,
      repliesReceived: 0,
      contactsReached: 0,
      contactsReplied: 0,
      campaignRecipients: 0,
      campaignFailed: 0,
      totalValue: 0,
      trend: [] as { date: string; sent: number; received: number }[],
    }

    try {
      const rows: any[] = await db`
        WITH m AS (
          SELECT
            m.conversation_id,
            m.created_at,
            m.sender_type IN ('agent', 'user') AS outbound,
            m.sender_type IN ('contact', 'customer') AS inbound,
            LOWER(COALESCE(
              NULLIF(m.metadata->>'delivery_status', ''),
              NULLIF(m.metadata->>'whatsappStatus', ''),
              ''
            )) AS status,
            COALESCE(m.metadata->'send'->>'ok', '') = 'false'
              AND COALESCE(m.metadata->'send'->>'skipped', 'false') != 'true' AS send_failed
          FROM messages m
          WHERE m.tenant_id = ${tenantId}
        )
        SELECT
          COUNT(*) FILTER (WHERE outbound) AS sent,
          COUNT(*) FILTER (WHERE outbound AND status IN ('delivered', 'read')) AS delivered,
          COUNT(*) FILTER (WHERE outbound AND status = 'read') AS read,
          COUNT(*) FILTER (WHERE outbound AND (status IN ('failed', 'undelivered') OR send_failed)) AS failed,
          COUNT(*) FILTER (WHERE inbound) AS received,
          COUNT(DISTINCT conversation_id) FILTER (WHERE outbound) AS reached,
          COUNT(DISTINCT conversation_id) FILTER (WHERE inbound) AS replied
        FROM m
      `
      const r = rows?.[0] || {}
      stats.messagesSent = Number(r.sent || 0)
      stats.messagesDelivered = Number(r.delivered || 0)
      stats.messagesRead = Number(r.read || 0)
      stats.messagesFailed = Number(r.failed || 0)
      stats.repliesReceived = Number(r.received || 0)
      stats.contactsReached = Number(r.reached || 0)
      stats.contactsReplied = Number(r.replied || 0)
    } catch (error) {
      console.warn("[workspace/stats] messages query failed", error)
    }

    try {
      const rows: any[] = await db`
        WITH days AS (
          SELECT generate_series(
            (CURRENT_DATE - ${TREND_DAYS - 1}::int)::date,
            CURRENT_DATE,
            INTERVAL '1 day'
          )::date AS day
        )
        SELECT
          TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
          COUNT(m.id) FILTER (WHERE m.sender_type IN ('agent', 'user')) AS sent,
          COUNT(m.id) FILTER (WHERE m.sender_type IN ('contact', 'customer')) AS received
        FROM days d
        LEFT JOIN messages m
          ON m.tenant_id = ${tenantId}
          AND m.created_at::date = d.day
        GROUP BY d.day
        ORDER BY d.day
      `
      stats.trend = (rows || []).map((row) => ({
        date: String(row.date),
        sent: Number(row.sent || 0),
        received: Number(row.received || 0),
      }))
    } catch (error) {
      console.warn("[workspace/stats] trend query failed", error)
    }

    // La bitácora sobrevive a que se borren conversaciones, así que da el total real
    // de destinatarios de campañas aunque sus mensajes ya no existan.
    if (await hasTable(db, "campaign_recipients")) {
      try {
        const rows: any[] = await db`
          SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'failed') AS failed
          FROM campaign_recipients
          WHERE tenant_id = ${tenantId}
        `
        stats.campaignRecipients = Number(rows?.[0]?.total || 0)
        stats.campaignFailed = Number(rows?.[0]?.failed || 0)
      } catch {
        // ignore
      }
    }

    try {
      const rows: any[] = await db`
        SELECT COALESCE(SUM(total_amount), 0) AS total
        FROM orders
        WHERE tenant_id = ${tenantId}
          AND status != 'cancelled'
      `
      stats.totalValue = Number(rows?.[0]?.total || 0)
    } catch {
      // ignore
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[workspace/stats] error", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
