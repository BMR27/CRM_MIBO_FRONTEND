import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ messageSid: string }> },
) {
  const user = await getSession()
  const { messageSid } = await params
  const { searchParams } = new URL(request.url)
  const filename = (searchParams.get("filename") || "").trim()
  const tokenFromQuery = (searchParams.get("token") || "").trim()

  if (!user && !tokenFromQuery) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "")
  if (!backendUrl) {
    return NextResponse.json({ error: "BACKEND_URL not configured" }, { status: 500 })
  }

  const upstreamUrl = new URL(`${backendUrl}/api/twilio/media-by-message/${encodeURIComponent(messageSid)}`)
  if (filename) upstreamUrl.searchParams.set("filename", filename)

  const upstreamResp = await fetch(upstreamUrl.toString(), {
    method: "GET",
    headers: {
      ...(tokenFromQuery ? { Authorization: `Bearer ${tokenFromQuery}` } : {}),
    },
    cache: "no-store",
  })

  if (!upstreamResp.ok) {
    const details = await upstreamResp.text().catch(() => "")
    return NextResponse.json(
      { error: "Failed to fetch media from backend", details },
      { status: upstreamResp.status },
    )
  }

  const headers = new Headers()
  headers.set("Content-Type", upstreamResp.headers.get("content-type") || "application/octet-stream")
  headers.set("Cache-Control", "private, no-store")

  const contentDisposition = upstreamResp.headers.get("content-disposition")
  if (contentDisposition) {
    headers.set("Content-Disposition", contentDisposition)
  } else if (filename) {
    headers.set("Content-Disposition", `inline; filename=\"${filename}\"`)
  }

  const buffer = await upstreamResp.arrayBuffer()
  return new NextResponse(buffer, {
    status: 200,
    headers,
  })
}
