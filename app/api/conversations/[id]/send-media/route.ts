import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql, isDemoMode } from "@/lib/db"

export const runtime = "nodejs"

let _hasConversationChannelCols: boolean | null = null
let _hasMessagesExtendedCols: boolean | null = null
let _messagesConversationIdType: "uuid" | "number" | "unknown" | null = null

type Db = NonNullable<typeof sql>

async function hasConversationChannelCols(db: Db): Promise<boolean> {
  if (_hasConversationChannelCols !== null) return _hasConversationChannelCols
  try {
    const rows = await db`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'conversations'
        AND column_name IN ('channel', 'external_user_id')
      ORDER BY column_name
    `
    _hasConversationChannelCols = Array.isArray(rows) && rows.length === 2
  } catch {
    _hasConversationChannelCols = false
  }
  return _hasConversationChannelCols
}

async function hasMessagesExtendedCols(db: Db): Promise<boolean> {
  if (_hasMessagesExtendedCols !== null) return _hasMessagesExtendedCols
  try {
    const rows = await db`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name IN ('channel', 'external_message_id', 'direction')
      ORDER BY column_name
    `
    _hasMessagesExtendedCols = Array.isArray(rows) && rows.length === 3
  } catch {
    _hasMessagesExtendedCols = false
  }
  return _hasMessagesExtendedCols
}

async function getMessagesConversationIdType(db: Db): Promise<"uuid" | "number" | "unknown"> {
  if (_messagesConversationIdType) return _messagesConversationIdType
  try {
    const rows = await db`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'messages'
        AND column_name = 'conversation_id'
      LIMIT 1
    `
    const row = rows?.[0]
    const dataType = String(row?.data_type || "").toLowerCase()
    const udtName = String(row?.udt_name || "").toLowerCase()
    if (dataType === "uuid" || udtName === "uuid") {
      _messagesConversationIdType = "uuid"
    } else if (dataType.includes("integer") || dataType.includes("bigint") || ["int2", "int4", "int8"].includes(udtName)) {
      _messagesConversationIdType = "number"
    } else {
      _messagesConversationIdType = "unknown"
    }
  } catch {
    _messagesConversationIdType = "unknown"
  }
  return _messagesConversationIdType
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""))
}

function normalizeToDigits(value: string) {
  return String(value || "").replace("whatsapp:", "").replace(/\D/g, "")
}

function inferWhatsappMediaType(mimeType: string, filename: string): "image" | "video" | "audio" | "document" | "sticker" {
  const mime = String(mimeType || "").toLowerCase()
  const name = String(filename || "").toLowerCase()

  if (mime === "image/webp" || name.endsWith(".webp")) return "sticker"
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  if (mime.startsWith("audio/")) return "audio"

  return "document"
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const tenantId = user.tenant_id
    if (!tenantId) return NextResponse.json({ error: "Missing tenant" }, { status: 401 })

    const { id } = await params

    if (isDemoMode) {
      return NextResponse.json(
        { error: "Media sending is not available in demo mode" },
        { status: 400 },
      )
    }

    if (!sql) {
      return NextResponse.json(
        {
          error: "DATABASE_URL missing",
          hint: "Configura DATABASE_URL en Railway. Este endpoint requiere acceso a Postgres para buscar el destinatario y guardar el mensaje.",
        },
        { status: 500 },
      )
    }

    const db = sql

    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
    const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"
    const backendUrlRaw = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "")
    const backendUrl = backendUrlRaw.replace(/\/api$/i, "")
    const canSendDirectlyWithFrontendTwilio = Boolean(twilioAccountSid && twilioAuthToken)

    if (!canSendDirectlyWithFrontendTwilio && !backendUrl) {
      return NextResponse.json(
        {
          error: "Twilio credentials missing in frontend and BACKEND_URL/NEXT_PUBLIC_BACKEND_URL not configured",
          hint: "Configura TWILIO_* en frontend o define BACKEND_URL para delegar el envio al backend (que ya tiene TWILIO_*).",
        },
        { status: 500 },
      )
    }

    const form = await request.formData()
    const file = form.get("file")

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "file is required" }, { status: 400 })
    }

    const caption = String(form.get("caption") || "").trim()
    const requestedType = String(form.get("type") || "").trim()
    const explicitToRaw = String(form.get("to") || "").trim()

    const fileObj = file as File
    const filename = fileObj.name || "archivo"
    const mimeType = fileObj.type || "application/octet-stream"

    const type = ((): "image" | "video" | "audio" | "document" | "sticker" => {
      const allowed = ["image", "video", "audio", "document", "sticker"]
      if (allowed.includes(requestedType)) return requestedType as any
      return inferWhatsappMediaType(mimeType, filename)
    })()

    // Resolve recipient (WhatsApp "to"): prefer explicit `to` from frontend, then DB conversation lookup.
    let recipientDigits = normalizeToDigits(explicitToRaw)
    if (!recipientDigits) {
      const includeConvChannel = await hasConversationChannelCols(db)
      const convRows = includeConvChannel
        ? await db`
            SELECT
              conv.channel,
              conv.external_user_id,
              c.phone_number
            FROM conversations conv
            LEFT JOIN contacts c ON conv.contact_id = c.id
            WHERE conv.id::text = ${id} AND conv.tenant_id = ${tenantId}
            LIMIT 1
          `
        : await db`
            SELECT
              c.phone_number
            FROM conversations conv
            LEFT JOIN contacts c ON conv.contact_id = c.id
            WHERE conv.id::text = ${id} AND conv.tenant_id = ${tenantId}
            LIMIT 1
          `

      if (convRows?.[0]) {
        const row: any = convRows[0]
        const channel = includeConvChannel ? String(row.channel || "whatsapp") : "whatsapp"
        if (channel !== "whatsapp") {
          return NextResponse.json(
            { error: `Unsupported channel for media send: ${channel}` },
            { status: 400 },
          )
        }
        recipientDigits = normalizeToDigits((includeConvChannel ? row.external_user_id : "") || row.phone_number || "")
      }
    }

    if (!recipientDigits) {
      return NextResponse.json(
        { error: "Recipient phone not found for conversation" },
        { status: 400 },
      )
    }

    // 1) Ensure media_uploads table exists
    try {
      await db`
        CREATE TABLE IF NOT EXISTS media_uploads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          data TEXT NOT NULL,
          mime_type VARCHAR(255) NOT NULL DEFAULT 'application/octet-stream',
          filename VARCHAR(500),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `
    } catch (tableErr) {
      console.error("[send-media] Could not ensure media_uploads table:", tableErr)
    }

    // 2) Store file in DB as base64
    const fileBuffer = Buffer.from(await fileObj.arrayBuffer())
    const fileBase64 = fileBuffer.toString("base64")

    let uploadId = ""
    try {
      const insertRows = await db`
        INSERT INTO media_uploads (data, mime_type, filename)
        VALUES (${fileBase64}, ${mimeType}, ${filename})
        RETURNING id
      `
      uploadId = String(insertRows?.[0]?.id || "")
    } catch (insertErr) {
      console.error("[send-media] Failed to store media in DB:", insertErr)
      return NextResponse.json(
        { error: "Failed to store media file", details: String(insertErr) },
        { status: 500 },
      )
    }

    if (!uploadId) {
      return NextResponse.json(
        { error: "DB insert did not return an upload id" },
        { status: 500 },
      )
    }

    // 3) Build public media URL (Twilio must fetch this over the internet)
    const appUrl = (process.env.APP_URL || "").replace(/\/$/, "")
    const requestUrl = new URL(request.url)
    const requestOrigin = requestUrl.origin.replace(/\/$/, "")
    const forwardedProto = (request.headers.get("x-forwarded-proto") || "").trim()
    const forwardedHost = (request.headers.get("x-forwarded-host") || "").trim()
    const forwardedOrigin =
      forwardedProto && forwardedHost
        ? `${forwardedProto}://${forwardedHost}`.replace(/\/$/, "")
        : ""

    // Prefer explicit APP_URL, then forwarded origin from proxy, then request origin.
    const effectivePublicBase = appUrl || forwardedOrigin || requestOrigin
    if (/localhost|127\.0\.0\.1/i.test(effectivePublicBase)) {
      return NextResponse.json(
        {
          error: "Public APP_URL is required for media send",
          hint: "Define APP_URL con una URL publica (https://...). Twilio no puede descargar archivos desde localhost/127.0.0.1.",
        },
        { status: 500 },
      )
    }

    const mediaUrl = `${effectivePublicBase}/api/media/${uploadId}`

    console.log("[send-media] Stored upload:", { uploadId, mediaUrl, type, filename })

    // 4) Send via Twilio WhatsApp (directly from frontend env vars, or delegated to backend)
    const twilioTo = recipientDigits.startsWith("whatsapp:") ? recipientDigits : `whatsapp:+${recipientDigits}`
    const twilioFromFmt = twilioFrom.startsWith("whatsapp:") ? twilioFrom : `whatsapp:${twilioFrom}`

    let sendJson: any = null

    if (canSendDirectlyWithFrontendTwilio) {
      const twilioBody = new URLSearchParams()
      twilioBody.append("From", twilioFromFmt)
      twilioBody.append("To", twilioTo)
      twilioBody.append("MediaUrl", mediaUrl)
      if (caption) twilioBody.append("Body", caption)

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
      const credentials = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64")

      const sendResp = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: twilioBody.toString(),
      })

      sendJson = await sendResp.json().catch(() => null)
      if (!sendResp.ok) {
        console.error("[send-media] Twilio send failed:", sendResp.status, sendJson)
        const errorMsg = sendJson?.message || sendJson?.error_message || JSON.stringify(sendJson)
        return NextResponse.json(
          {
            error: "Failed to send media via Twilio",
            details: errorMsg,
            hint: "Verifica TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_WHATSAPP_FROM en Railway.",
          },
          { status: sendResp.status },
        )
      }

      // Twilio can return 201 but still include immediate delivery errors.
      if (sendJson?.error_code || sendJson?.error_message) {
        return NextResponse.json(
          {
            error: "Twilio accepted request but reported an error",
            details: sendJson?.error_message || String(sendJson?.error_code),
            hint: "Revisa que MediaUrl sea publica y accesible por internet, y que el destinatario pueda recibir WhatsApp.",
          },
          { status: 502 },
        )
      }
    } else {
      const authHeader = request.headers.get("authorization") || ""
      const backendResp = await fetch(`${backendUrl}/api/twilio/send-wa-media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          to: twilioTo,
          from: twilioFromFmt,
          mediaUrl,
          body: caption || undefined,
        }),
      })

      sendJson = await backendResp.json().catch(() => null)
      if (!backendResp.ok) {
        console.error("[send-media] Backend Twilio send failed:", backendResp.status, sendJson)
        const errorMsg = sendJson?.message || sendJson?.error || JSON.stringify(sendJson)
        return NextResponse.json(
          {
            error: "Failed to send media via backend Twilio",
            details: errorMsg,
            hint: "Verifica que el backend tenga TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_WHATSAPP_FROM configurados.",
          },
          { status: backendResp.status },
        )
      }

      const backendTwilio = sendJson?.twilio || sendJson
      if (backendTwilio?.errorCode || backendTwilio?.errorMessage || backendTwilio?.error_code || backendTwilio?.error_message) {
        return NextResponse.json(
          {
            error: "Backend Twilio reported an error",
            details:
              backendTwilio?.errorMessage ||
              backendTwilio?.error_message ||
              String(backendTwilio?.errorCode || backendTwilio?.error_code),
            hint: "Revisa que MediaUrl sea publica y accesible por internet.",
          },
          { status: 502 },
        )
      }
    }

    const externalMessageId = String(sendJson?.sid || sendJson?.twilio?.sid || "") || null
    const mediaId = uploadId // use upload id as media reference
    console.log("[send-media] Twilio success:", { sid: externalMessageId, type, filename })

    const storedContent = caption || filename || `[${type}]`
    const metadata = {
      type,
      media_id: mediaId,
      media_url: `/api/media/${uploadId}`,
      mime_type: mimeType,
      filename,
      caption: caption || undefined,
    }

    // 3) Store message in DB (best-effort, compatible with multiple schemas)
    let inserted: any = null
    try {
      const useExtended = await hasMessagesExtendedCols(db)
      const convIdType = await getMessagesConversationIdType(db)

      const idString = String(id)
      const idAsNumber = Number.parseInt(idString, 10)
      const canUseUuid = convIdType === "uuid" && isUuid(idString)
      const canUseNumber = convIdType === "number" && Number.isFinite(idAsNumber)

      if (convIdType === "uuid" && !canUseUuid) {
        // If schema expects uuid but we don't have a uuid, skip DB insert.
        inserted = null
      } else if (convIdType === "number" && !canUseNumber) {
        inserted = null
      } else {
        const conversationIdValue = canUseUuid ? db`${idString}::uuid` : db`${idAsNumber}`

        const rows = useExtended
          ? await db`
              INSERT INTO messages (
                conversation_id,
                sender_type,
                sender_id,
                content,
                channel,
                external_message_id,
                direction,
                message_type,
                metadata,
                tenant_id,
                created_at
              )
              VALUES (
                ${conversationIdValue},
                'agent',
                ${user.id},
                ${storedContent},
                'whatsapp',
                ${externalMessageId},
                'outbound',
                ${type},
                ${JSON.stringify(metadata)}::jsonb,
                ${tenantId},
                NOW()
              )
              RETURNING id, content, sender_type, sender_id, created_at, message_type, metadata
            `
          : await db`
              INSERT INTO messages (
                conversation_id,
                sender_type,
                sender_id,
                content,
                message_type,
                metadata,
                tenant_id,
                created_at
              )
              VALUES (
                ${conversationIdValue},
                'agent',
                ${user.id},
                ${storedContent},
                ${type},
                ${JSON.stringify(metadata)}::jsonb,
                ${tenantId},
                NOW()
              )
              RETURNING id, content, sender_type, sender_id, created_at, message_type, metadata
            `

        inserted = rows?.[0] || null
      }
    } catch {
      // don't fail send if DB insert fails
      inserted = null
    }

    // Update conversation timestamps (best-effort)
    try {
      await db`
        UPDATE conversations
        SET last_message_at = NOW(), updated_at = NOW()
        WHERE id::text = ${id} AND tenant_id = ${tenantId}
      `
    } catch {
      // ignore
    }

    // Normalize metadata if needed
    let normalizedMetadata: any = inserted?.metadata ?? metadata
    if (typeof normalizedMetadata === "string") {
      try {
        normalizedMetadata = JSON.parse(normalizedMetadata)
      } catch {
        // keep
      }
    }

    const media_url = `/api/media/${encodeURIComponent(uploadId)}`

    return NextResponse.json({
      success: true,
      media_id: mediaId,
      external_message_id: externalMessageId,
      message: inserted
        ? {
            ...inserted,
            sender_name: user.name,
            metadata: normalizedMetadata,
            media_url,
          }
        : {
            id: Date.now(),
            content: storedContent,
            sender_type: "agent",
            sender_id: user.id,
            sender_name: user.name,
            created_at: new Date().toISOString(),
            message_type: type,
            metadata,
            media_url,
          },
    })
  } catch (error) {
    console.error("[send-media] Error:", error)
    return NextResponse.json(
      { error: "Failed to send media", details: String(error) },
      { status: 500 },
    )
  }
}
