import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { serviceSid } = await req.json()
  if (!serviceSid) return NextResponse.json({ error: "serviceSid requerido" }, { status: 400 })

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crm-mibo-backend-production.up.railway.app"
  const res = await fetch(`${backendUrl}/api/twilio/wa-templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serviceSid })
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data?.error || "Error consultando plantillas" }, { status: 500 })
  return NextResponse.json(data)
}
