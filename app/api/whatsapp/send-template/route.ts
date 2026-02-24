import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json(
        { error: "WhatsApp credentials missing" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const phoneNumberRaw = body.phone_number
    const templateName = body.template_name
    const parameters = Array.isArray(body.parameters) ? body.parameters : []

    if (!phoneNumberRaw || !templateName) {
      return NextResponse.json(
        { error: "phone_number y template_name son requeridos" },
        { status: 400 }
      )
    }

    // WhatsApp Cloud API espera el objeto template
    const payload = {
      messaging_product: "whatsapp",
      to: phoneNumberRaw,
      type: "template",
      template: {
        name: templateName,
        language: { code: "es_MX" },
        ...(parameters.length > 0
          ? {
              components: [
                {
                  type: "body",
                  parameters: parameters.map((text: string) => ({ type: "text", text })),
                },
              ],
            }
          : {}),
      },
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "Error enviando plantilla" }, { status: 500 })
    }

    return NextResponse.json({ success: true, whatsapp_message_id: data?.messages?.[0]?.id })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Error interno" }, { status: 500 })
  }
}
