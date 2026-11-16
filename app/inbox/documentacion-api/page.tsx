"use client"

import {
  BookOpen,
  CheckCircle2,
  Copy,
  KeyRound,
  Lock,
  MessageCircle,
  Package,
  Send,
  ShieldCheck,
  Users,
  Webhook,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { InboxHeader } from "@/components/inbox-header"
import { useUserRole } from "@/hooks/use-user-role"
import { useLanguage } from "@/components/language-provider"

const RAILWAY_BACKEND_URL = "https://crmmibobackend-production.up.railway.app"

function buildEndpointGroups(t: (key: string) => string) {
  return [
    {
      id: "auth",
      title: t("docs.group.auth.title"),
      icon: KeyRound,
      description: t("docs.group.auth.desc"),
      endpoints: [
        {
          method: "POST",
          path: "/api/auth/login",
          summary: t("docs.ep.auth.0.summary"),
          useCase: t("docs.ep.auth.0.useCase"),
          example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "cliente@empresa.com",
    "password": "tu_password"
  }'`,
        },
      ],
    },
    {
      id: "contactos",
      title: t("docs.group.contactos.title"),
      icon: Users,
      description: t("docs.group.contactos.desc"),
      endpoints: [
        {
          method: "GET",
          path: "/api/contacts",
          summary: t("docs.ep.contactos.0.summary"),
          useCase: t("docs.ep.contactos.0.useCase"),
          example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/contacts" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
        },
        {
          method: "POST",
          path: "/api/contacts",
          summary: t("docs.ep.contactos.1.summary"),
          useCase: t("docs.ep.contactos.1.useCase"),
          example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/contacts" \\
  -H "Authorization: Bearer TU_TOKEN_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Ana Martinez",
    "channel": "whatsapp",
    "phone_number": "+5215512345678"
  }'`,
        },
        {
          method: "POST",
          path: "/api/contacts/import",
          summary: t("docs.ep.contactos.2.summary"),
          useCase: t("docs.ep.contactos.2.useCase"),
          example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/contacts/import" \\
  -H "Authorization: Bearer TU_TOKEN_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contacts": [
      { "name": "Ana Martinez", "phone_number": "+5215512345678", "channel": "whatsapp" },
      { "name": "Luis Perez", "phone_number": "+5215598765432", "channel": "whatsapp" }
    ]
  }'`,
        },
      ],
    },
    {
      id: "ordenes",
      title: t("docs.group.ordenes.title"),
      icon: Package,
      description: t("docs.group.ordenes.desc"),
      endpoints: [
        {
          method: "POST",
          path: "/api/orders",
          summary: t("docs.ep.ordenes.0.summary"),
          useCase: t("docs.ep.ordenes.0.useCase"),
          example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/orders" \\
  -H "Authorization: Bearer TU_TOKEN_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_number": "ORD-123456",
    "contact_id": "UUID_DEL_CONTACTO",
    "total_amount": 499.99,
    "items": [{ "sku": "SKU-1", "name": "Producto demo", "quantity": 2 }],
    "shipping_address": "Calle Falsa 123, CDMX"
  }'`,
        },
        {
          method: "GET",
          path: "/api/orders",
          summary: t("docs.ep.ordenes.1.summary"),
          useCase: t("docs.ep.ordenes.1.useCase"),
          example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/orders" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
        },
        {
          method: "GET",
          path: "/api/orders/{id}",
          summary: t("docs.ep.ordenes.2.summary"),
          useCase: t("docs.ep.ordenes.2.useCase"),
          example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/orders/ORDER_ID" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
        },
        {
          method: "GET",
          path: "/api/orders/contact/{contactId}",
          summary: t("docs.ep.ordenes.3.summary"),
          useCase: t("docs.ep.ordenes.3.useCase"),
          example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/orders/contact/CONTACT_ID" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
        },
        {
          method: "PATCH",
          path: "/api/orders/{id}",
          summary: t("docs.ep.ordenes.4.summary"),
          useCase: t("docs.ep.ordenes.4.useCase"),
          example: `curl -X PATCH "${RAILWAY_BACKEND_URL}/api/orders/ORDER_ID" \\
  -H "Authorization: Bearer TU_TOKEN_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "shipped",
    "tracking_number": "TRK123456"
  }'`,
        },
        {
          method: "DELETE",
          path: "/api/orders/{id}",
          summary: t("docs.ep.ordenes.5.summary"),
          useCase: t("docs.ep.ordenes.5.useCase"),
          example: `curl -X DELETE "${RAILWAY_BACKEND_URL}/api/orders/ORDER_ID" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
        },
      ],
    },
    {
      id: "conversaciones",
      title: t("docs.group.conversaciones.title"),
      icon: MessageCircle,
      description: t("docs.group.conversaciones.desc"),
      endpoints: [
        {
          method: "GET",
          path: "/api/conversations",
          summary: t("docs.ep.conversaciones.0.summary"),
          useCase: t("docs.ep.conversaciones.0.useCase"),
          example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/conversations" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
        },
        {
          method: "GET",
          path: "/api/conversations/{id}/messages",
          summary: t("docs.ep.conversaciones.1.summary"),
          useCase: t("docs.ep.conversaciones.1.useCase"),
          example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/conversations/CONVERSATION_ID/messages" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
        },
      ],
    },
    {
      id: "mensajes",
      title: t("docs.group.mensajes.title"),
      icon: Send,
      description: t("docs.group.mensajes.desc"),
      endpoints: [
        {
          method: "POST",
          path: "/api/whatsapp/send",
          summary: t("docs.ep.mensajes.0.summary"),
          useCase: t("docs.ep.mensajes.0.useCase"),
          example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/whatsapp/send" \\
  -H "Authorization: Bearer TU_TOKEN_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "+5215512345678",
    "message": "Hola Ana, tenemos información para ti."
  }'`,
        },
        {
          method: "POST",
          path: "/api/whatsapp/send-template",
          summary: t("docs.ep.mensajes.1.summary"),
          useCase: t("docs.ep.mensajes.1.useCase"),
          example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/whatsapp/send-template" \\
  -H "Authorization: Bearer TU_TOKEN_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "+5215512345678",
    "template_name": "recordatorio_cita",
    "language": "es_MX"
  }'`,
        },
        {
          method: "POST",
          path: "/api/twilio/send-wa-template",
          summary: t("docs.ep.mensajes.2.summary"),
          useCase: t("docs.ep.mensajes.2.useCase"),
          example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/twilio/send-wa-template" \\
  -H "Authorization: Bearer TU_TOKEN_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "whatsapp:+5215512345678",
    "contentSid": "HX36751a5be358338dd5082fa394b515f5",
    "variables": ["Juan Perez", "2000 MXN", "12345"]
  }'`,
          response: `{
  "success": true,
  "twilio": { "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "status": "queued", "..." : "..." }
}`,
        },
      ],
    },
    {
      id: "leads",
      title: t("docs.group.leads.title"),
      icon: Users,
      description: t("docs.group.leads.desc"),
      endpoints: [
        {
          method: "POST",
          path: "/api/public/leads",
          summary: t("docs.ep.leads.0.summary"),
          useCase: t("docs.ep.leads.0.useCase"),
          example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/public/leads" \\
  -H "X-API-Key: TU_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Juan Perez",
    "email": "juan@ejemplo.com",
    "phone_number": "+5215512345678",
    "company": "Acme Inc."
  }'`,
        },
        {
          method: "GET",
          path: "/api/leads",
          summary: t("docs.ep.leads.1.summary"),
          useCase: t("docs.ep.leads.1.useCase"),
          example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/leads" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
        },
        {
          method: "POST",
          path: "/api/leads/{id}/convert",
          summary: t("docs.ep.leads.2.summary"),
          useCase: t("docs.ep.leads.2.useCase"),
          example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/leads/LEAD_ID/convert" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
          response: `{
  "lead": { "id": "...", "status": "converted", "contact_id": "..." },
  "contact": { "id": "...", "name": "...", "phone_number": "..." },
  "alreadyConverted": false
}`,
        },
      ],
    },
    {
      id: "webhooks",
      title: t("docs.group.webhooks.title"),
      icon: Webhook,
      description: t("docs.group.webhooks.desc"),
      endpoints: [
        {
          method: "GET",
          path: "/api/tenants/me/webhook",
          summary: t("docs.ep.webhooks.0.summary"),
          useCase: t("docs.ep.webhooks.0.useCase"),
          example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/tenants/me/webhook" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
          response: `{
  "webhook_url": "https://tuempresa.com/webhooks/mibo",
  "webhook_events_enabled": true,
  "has_secret": true
}`,
        },
        {
          method: "PATCH",
          path: "/api/tenants/me/webhook",
          summary: t("docs.ep.webhooks.1.summary"),
          useCase: t("docs.ep.webhooks.1.useCase"),
          example: `curl -X PATCH "${RAILWAY_BACKEND_URL}/api/tenants/me/webhook" \\
  -H "Authorization: Bearer TU_TOKEN_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "webhook_url": "https://tuempresa.com/webhooks/mibo",
    "enabled": true
  }'`,
          response: `{
  "webhook_url": "https://tuempresa.com/webhooks/mibo",
  "webhook_events_enabled": true,
  "has_secret": true,
  "webhook_secret": "a1b2c3...",
  "warning": "Guarda este secreto ahora: no volverá a mostrarse completo."
}`,
        },
        {
          method: "POST",
          path: "/api/tenants/me/webhook/rotate-secret",
          summary: t("docs.ep.webhooks.2.summary"),
          useCase: t("docs.ep.webhooks.2.useCase"),
          example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/tenants/me/webhook/rotate-secret" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
          response: `{
  "webhook_secret": "a1b2c3...",
  "warning": "Guarda este secreto ahora: no volverá a mostrarse completo."
}`,
        },
        {
          method: "EVENT",
          path: "message.received",
          summary: t("docs.ep.webhooks.3.summary"),
          useCase: t("docs.ep.webhooks.3.useCase"),
          example: `POST https://tuempresa.com/webhooks/mibo
Content-Type: application/json
X-Mibo-Event: message.received
X-Mibo-Signature: sha256=...

{
  "event": "message.received",
  "timestamp": "2026-10-08T02:19:58.000Z",
  "tenant_id": "...",
  "data": {
    "message_id": "...",
    "conversation_id": "...",
    "contact_id": "...",
    "whatsapp_message_id": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "from": "whatsapp:+5215512345678",
    "content": "Sí, confirmo mi pedido",
    "message_type": "text"
  }
}`,
        },
        {
          method: "EVENT",
          path: "message.status_updated",
          summary: t("docs.ep.webhooks.4.summary"),
          useCase: t("docs.ep.webhooks.4.useCase"),
          example: `POST https://tuempresa.com/webhooks/mibo
Content-Type: application/json
X-Mibo-Event: message.status_updated
X-Mibo-Signature: sha256=...

{
  "event": "message.status_updated",
  "timestamp": "2026-10-08T02:19:58.000Z",
  "tenant_id": "...",
  "data": {
    "message_id": "...",
    "conversation_id": "...",
    "whatsapp_message_id": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "delivered",
    "to": "whatsapp:+5215512345678",
    "from": "whatsapp:+12602649030",
    "error_code": null
  }
}`,
        },
        {
          method: "INFO",
          path: t("docs.ep.webhooks.5.summary"),
          summary: t("docs.ep.webhooks.5.summary"),
          useCase: t("docs.ep.webhooks.5.useCase"),
          example: `// Node.js
const crypto = require("crypto")

function isValid(rawBody, signatureHeader, secret) {
  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")
  return signatureHeader === expected
}`,
        },
      ],
    },
  ]
}

function buildOrderStates(t: (key: string) => string) {
  return [
    { value: "pending", label: t("docs.orderState.pending.label"), description: t("docs.orderState.pending.desc") },
    { value: "confirmed", label: t("docs.orderState.confirmed.label"), description: t("docs.orderState.confirmed.desc") },
    { value: "processing", label: t("docs.orderState.processing.label"), description: t("docs.orderState.processing.desc") },
    { value: "shipped", label: t("docs.orderState.shipped.label"), description: t("docs.orderState.shipped.desc") },
    { value: "delivered", label: t("docs.orderState.delivered.label"), description: t("docs.orderState.delivered.desc") },
    { value: "cancelled", label: t("docs.orderState.cancelled.label"), description: t("docs.orderState.cancelled.desc") },
  ]
}

function methodClassName(method: string) {
  const map: Record<string, string> = {
    GET: "bg-blue-50 text-blue-700 border-blue-200",
    POST: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PUT: "bg-amber-50 text-amber-700 border-amber-200",
    PATCH: "bg-violet-50 text-violet-700 border-violet-200",
    DELETE: "bg-red-50 text-red-700 border-red-200",
  }
  return map[method] || "bg-muted text-muted-foreground border-border"
}

function CodeBlock({ code, copyLabel, copiedLabel }: { code: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="relative rounded-lg border border-border bg-slate-950">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium text-slate-200 hover:bg-white/20 transition-colors"
      >
        <Copy className="h-3 w-3" />
        {copied ? copiedLabel : copyLabel}
      </button>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words p-4 pr-20 text-xs leading-5 text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function DocumentacionApiPage() {
  const { t } = useLanguage()
  const { user } = useUserRole()
  const isAdmin = String(user?.role || "").toLowerCase().startsWith("admin")
  const apiBaseUrl = `${RAILWAY_BACKEND_URL}/api`

  const clientEndpointGroups = buildEndpointGroups(t)
  const orderStates = buildOrderStates(t)
  const hiddenInternalAreas = [
    t("docs.hidden.0"),
    t("docs.hidden.1"),
    t("docs.hidden.2"),
    t("docs.hidden.3"),
    t("docs.hidden.4"),
  ]
  const flowItems = [t("docs.flow.0"), t("docs.flow.1"), t("docs.flow.2"), t("docs.flow.3")]

  return (
    <>
      <InboxHeader />
      <div className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("docs.title")}</h1>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {t("docs.badge")}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                  {t("docs.subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-start gap-3 pt-6">
                <ShieldCheck className="h-4.5 w-4.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t("docs.accessPolicyTitle")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("docs.accessPolicyDesc")}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-foreground">{t("docs.baseUrlLabel")}</p>
                <code className="mt-1.5 block break-all rounded-md bg-muted px-2.5 py-1.5 text-xs text-foreground">
                  {apiBaseUrl}
                </code>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("docs.responseFormatTitle")}</CardTitle>
              <CardDescription>{t("docs.responseFormatDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold text-foreground mb-1">{t("docs.listings")}</p>
                <p className="text-xs text-muted-foreground mb-2">{t("docs.listingsDesc")}</p>
                <CodeBlock
                  code={`[\n  { "id": "...", "name": "..." },\n  { "id": "...", "name": "..." }\n]`}
                  copyLabel={t("docs.copy")}
                  copiedLabel={t("docs.copied")}
                />
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold text-foreground mb-1">{t("docs.creation")}</p>
                <p className="text-xs text-muted-foreground mb-2">{t("docs.creationDesc")}</p>
                <CodeBlock
                  code={`{\n  "id": "...",\n  "status": "new",\n  "created_at": "..."\n}`}
                  copyLabel={t("docs.copy")}
                  copiedLabel={t("docs.copied")}
                />
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold text-foreground mb-1">{t("docs.authFormat")}</p>
                <p className="text-xs text-muted-foreground mb-2">{t("docs.authFormatDesc")}</p>
                <CodeBlock
                  code={`{\n  "access_token": "...",\n  "token_type": "Bearer",\n  "expires_in": "7d",\n  "user": { "id": "...", "email": "...", "role": "..." }\n}`}
                  copyLabel={t("docs.copy")}
                  copiedLabel={t("docs.copied")}
                />
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold text-foreground mb-1">{t("docs.errors")}</p>
                <p className="text-xs text-muted-foreground mb-2">{t("docs.errorsDesc")}</p>
                <CodeBlock
                  code={`{\n  "statusCode": 404,\n  "error": "Not Found",\n  "message": "Cannot GET /api/xyz"\n}`}
                  copyLabel={t("docs.copy")}
                  copiedLabel={t("docs.copied")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("docs.endpointsByCategory")}</CardTitle>
              <CardDescription>{t("docs.endpointsByCategoryDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="auth" className="w-full">
                {clientEndpointGroups.map((group) => {
                  const Icon = group.icon
                  return (
                    <AccordionItem key={group.id} value={group.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-foreground">{group.title}</p>
                            <p className="text-xs text-muted-foreground font-normal">{group.description}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pl-11">
                          {group.id === "ordenes" && (
                            <div className="rounded-lg border border-border overflow-hidden">
                              <table className="w-full text-xs">
                                <thead className="bg-muted/60">
                                  <tr>
                                    <th className="text-left font-medium text-foreground px-3 py-2">{t("docs.stateCol")}</th>
                                    <th className="text-left font-medium text-foreground px-3 py-2">{t("docs.descCol")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderStates.map((s, i) => (
                                    <tr key={s.value} className={i % 2 === 1 ? "bg-muted/30" : undefined}>
                                      <td className="px-3 py-2 align-top">
                                        <code className="text-[11px] font-semibold text-foreground">{s.value}</code>
                                        <span className="block text-muted-foreground">{s.label}</span>
                                      </td>
                                      <td className="px-3 py-2 align-top text-muted-foreground">{s.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {group.id === "leads" && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                              <span className="font-semibold">{t("docs.leadsImportantPrefix")}</span> {t("docs.leadsImportantMid1")}{" "}
                              <span className="font-semibold">{t("docs.leadsImportantContact")}</span>
                              {t("docs.leadsImportantMid2")} <code>POST /api/orders</code> {t("docs.leadsImportantMid3")}{" "}
                              <code>contact_id</code> {t("docs.leadsImportantMid4")}
                            </div>
                          )}
                          {group.endpoints.map((endpoint) => (
                            <div key={`${endpoint.method}-${endpoint.path}`} className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${methodClassName(endpoint.method)}`}
                                >
                                  {endpoint.method}
                                </span>
                                <code className="text-xs text-foreground">{endpoint.path}</code>
                              </div>
                              <p className="text-sm text-foreground">{endpoint.summary}</p>
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/80">{t("docs.usageLabel")}</span> {endpoint.useCase}
                              </p>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{t("docs.request")}</p>
                              <CodeBlock code={endpoint.example} copyLabel={t("docs.copy")} copiedLabel={t("docs.copied")} />
                              {(endpoint as any).response && (
                                <>
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{t("docs.response")}</p>
                                  <CodeBlock code={(endpoint as any).response} copyLabel={t("docs.copy")} copiedLabel={t("docs.copied")} />
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </CardContent>
          </Card>

          <div className={`grid gap-4 ${isAdmin ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("docs.recommendedFlowTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {flowItems.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {isAdmin && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">{t("docs.notExposedTitle")}</CardTitle>
                  </div>
                  <CardDescription>{t("docs.notExposedDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {hiddenInternalAreas.map((area) => (
                      <Badge key={area} variant="outline" className="border-red-100 bg-red-50 text-red-700">
                        {area}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {t("docs.swaggerNote")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
