// Debug: log the request and backend response for troubleshooting
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crm-mibobackend-production.up.railway.app"
    // Log the outgoing request
    console.log("[send-wa-template] Request body:", body)
    console.log("[send-wa-template] Backend URL:", backendUrl)
    const res = await fetch(`${backendUrl}/api/twilio/send-wa-template`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    let data
    try {
      data = await res.json()
    } catch (e) {
      data = { error: "No JSON response from backend" }
    }
    // Log the backend response
    console.log("[send-wa-template] Backend response status:", res.status)
    console.log("[send-wa-template] Backend response data:", data)
    if (!res.ok) return NextResponse.json({ error: data?.error || "Error enviando plantilla" }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    console.error("[send-wa-template] Handler error:", error)
    return NextResponse.json({ error: (error as Error).message || "Error interno" }, { status: 500 })
  }
}
