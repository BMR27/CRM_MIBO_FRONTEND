import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

/**
 * Public endpoint to serve uploaded media files stored in the media_uploads table.
 * No authentication required — Twilio needs to fetch these URLs to send them via WhatsApp.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!sql) {
      return new NextResponse("Database not configured", { status: 503 })
    }

    const { id } = await params

    // Basic UUID validation to avoid SQL injection / unexpected queries
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return new NextResponse("Not found", { status: 404 })
    }

    const rows = await sql`
      SELECT data, mime_type, filename
      FROM media_uploads
      WHERE id = ${id}::uuid
      LIMIT 1
    `

    const row = rows?.[0]
    if (!row) {
      return new NextResponse("Not found", { status: 404 })
    }

    const buffer = Buffer.from(String(row.data), "base64")

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": row.mime_type || "application/octet-stream",
        "Content-Disposition": row.filename
          ? `inline; filename="${String(row.filename).replace(/"/g, "'")}"`
          : "inline",
        "Cache-Control": "public, max-age=3600",
        "Content-Length": String(buffer.length),
      },
    })
  } catch (error) {
    console.error("[media serve] Error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
