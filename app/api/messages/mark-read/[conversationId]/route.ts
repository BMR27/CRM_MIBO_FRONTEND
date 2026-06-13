import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { isDemoMode, sql } from "@/lib/db"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { conversationId } = await params
    if (!conversationId) return NextResponse.json({ error: "conversationId is required" }, { status: 400 })

    if (isDemoMode) {
      return NextResponse.json({ success: true, updated: 0, demo: true })
    }

    const updated = await sql!`
      UPDATE messages
      SET read_at = COALESCE(read_at, NOW())
      WHERE conversation_id::text = ${conversationId}
        AND read_at IS NULL
        AND sender_type IN ('contact', 'customer')
      RETURNING id
    `

    return NextResponse.json({ success: true, updated: updated?.length || 0 })
  } catch (error) {
    console.error("[Messages mark-read] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
