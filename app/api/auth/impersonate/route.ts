import { NextResponse } from "next/server"
import { createSession, setSessionCookie, getSession } from "@/lib/session"
import type { User } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.is_platform_admin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { tenantId, accessToken } = (await request.json()) as { tenantId?: string; accessToken?: string }
    if (!tenantId || !accessToken) {
      return NextResponse.json({ error: "tenantId y accessToken son requeridos" }, { status: 400 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app"
    const backendResponse = await fetch(`${backendUrl}/api/auth/impersonate/${tenantId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const backendData = await backendResponse.json().catch(() => ({}))
    if (!backendResponse.ok) {
      return NextResponse.json({ error: backendData?.message || "No se pudo cambiar de espacio" }, { status: backendResponse.status })
    }

    const impersonatedUser: User & { session_key?: string } = {
      ...session,
      tenant_id: backendData.tenant?.id || tenantId,
      role: "admin",
      is_platform_admin: true,
      status: "available",
      session_key: (session as any).session_key,
    }

    const token = await createSession(impersonatedUser)
    await setSessionCookie(token)

    return NextResponse.json({ access_token: backendData.access_token, tenant: backendData.tenant })
  } catch (error) {
    console.error("impersonate error", error)
    return NextResponse.json({ error: "Failed to impersonate tenant" }, { status: 500 })
  }
}
