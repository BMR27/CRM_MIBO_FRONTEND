import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crm-mibobackend-production.up.railway.app"
    const res = await fetch(`${backendUrl}/api/twilio/send-wa-template`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data?.error || "Error enviando plantilla" }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Error interno" }, { status: 500 })
  }
}
