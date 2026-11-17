import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { ensureLastLoginColumns, isDemoMode, sql } from "@/lib/db"

/**
 * Listado global de usuarios para el super-admin de plataforma.
 *
 * A diferencia de /api/users/agents, este endpoint NO filtra por tenant: devuelve a
 * todos los usuarios de todos los espacios con el detalle de su espacio, su rol, su
 * sesión y su último ingreso. Por eso exige `is_platform_admin` en la sesión.
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    if (session.is_platform_admin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (isDemoMode) {
      return NextResponse.json({ users: [], summary: emptySummary() })
    }

    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_key TEXT`
    await ensureLastLoginColumns()

    const rows = (await sql`
      SELECT
        u.id,
        u.name,
        u.email,
        u.status,
        u.avatar_url,
        u.is_platform_admin,
        u.created_at,
        u.updated_at,
        u.last_login_at,
        u.last_login_ip,
        (u.session_key IS NOT NULL AND u.status = 'available') AS has_active_session,
        u.role_id,
        r.name AS role_name,
        r.description AS role_description,
        r.permissions AS role_permissions,
        u.tenant_id,
        t.name AS tenant_name,
        t.slug AS tenant_slug,
        t.status AS tenant_status,
        t.plan AS tenant_plan,
        t.legal_name AS tenant_legal_name,
        t.created_at AS tenant_created_at,
        t.bulk_messaging_enabled,
        t.wa_templates_enabled,
        t.module_citas_enabled,
        t.module_agentes_enabled,
        t.module_leads_enabled,
        t.module_docs_api_enabled,
        COALESCE(c.total, 0)::int AS conversations_total,
        COALESCE(c.active, 0)::int AS conversations_active,
        COALESCE(c.resolved, 0)::int AS conversations_resolved,
        COALESCE(m.total, 0)::int AS messages_sent,
        m.last_message_at
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      LEFT JOIN tenants t ON t.id = u.tenant_id
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE conv.status = 'active') AS active,
          COUNT(*) FILTER (WHERE conv.status = 'resolved') AS resolved
        FROM conversations conv
        WHERE conv.assigned_agent_id = u.id
      ) c ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS total, MAX(msg.created_at) AS last_message_at
        FROM messages msg
        WHERE msg.sender_id = u.id
      ) m ON TRUE
      ORDER BY u.last_login_at DESC NULLS LAST, u.created_at DESC
    `) as unknown as Array<Record<string, any>>

    const users = rows.map((row) => ({
      id: String(row.id),
      name: row.name || "",
      email: row.email || "",
      status: row.status || "offline",
      avatarUrl: row.avatar_url || null,
      isPlatformAdmin: row.is_platform_admin === true,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      lastLoginIp: row.last_login_ip || null,
      hasActiveSession: row.has_active_session === true,
      role: {
        id: row.role_id ? String(row.role_id) : null,
        name: row.role_name || null,
        description: row.role_description || null,
        permissions: row.role_permissions || null,
      },
      tenant: {
        id: row.tenant_id ? String(row.tenant_id) : null,
        name: row.tenant_name || null,
        slug: row.tenant_slug || null,
        status: row.tenant_status || null,
        plan: row.tenant_plan || null,
        legalName: row.tenant_legal_name || null,
        createdAt: row.tenant_created_at || null,
        features: {
          bulkMessaging: row.bulk_messaging_enabled === true,
          waTemplates: row.wa_templates_enabled === true,
          citas: row.module_citas_enabled === true,
          agentes: row.module_agentes_enabled === true,
          leads: row.module_leads_enabled === true,
          docsApi: row.module_docs_api_enabled === true,
        },
      },
      activity: {
        conversationsTotal: Number(row.conversations_total || 0),
        conversationsActive: Number(row.conversations_active || 0),
        conversationsResolved: Number(row.conversations_resolved || 0),
        messagesSent: Number(row.messages_sent || 0),
        lastMessageAt: row.last_message_at || null,
      },
    }))

    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const summary = {
      totalUsers: users.length,
      totalTenants: new Set(users.map((u) => u.tenant.id).filter(Boolean)).size,
      activeSessions: users.filter((u) => u.hasActiveSession).length,
      platformAdmins: users.filter((u) => u.isPlatformAdmin).length,
      neverLoggedIn: users.filter((u) => !u.lastLoginAt).length,
      loggedInLast7Days: users.filter(
        (u) => u.lastLoginAt && now - new Date(u.lastLoginAt).getTime() <= 7 * dayMs,
      ).length,
    }

    return NextResponse.json({ users, summary })
  } catch (error) {
    console.error("platform users error", error)
    return NextResponse.json({ error: "No se pudo cargar el listado de usuarios" }, { status: 500 })
  }
}

function emptySummary() {
  return {
    totalUsers: 0,
    totalTenants: 0,
    activeSessions: 0,
    platformAdmins: 0,
    neverLoggedIn: 0,
    loggedInLast7Days: 0,
  }
}
