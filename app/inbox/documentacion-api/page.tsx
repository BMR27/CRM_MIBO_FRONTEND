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

const RAILWAY_BACKEND_URL = "https://crmmibobackend-production.up.railway.app"

const clientEndpointGroups = [
  {
    id: "auth",
    title: "Autenticación",
    icon: KeyRound,
    description: "Inicia sesión y obtén el token necesario para usar la API.",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/login",
        summary: "Inicia sesión con correo y contraseña.",
        useCase: "Obtener access_token para integraciones.",
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
    title: "Contactos",
    icon: Users,
    description: "Alta y consulta de contactos autorizados para campañas o seguimiento.",
    endpoints: [
      {
        method: "GET",
        path: "/api/contacts",
        summary: "Consulta contactos disponibles para la cuenta.",
        useCase: "Sincronizar una libreta externa o validar destinatarios.",
        example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/contacts" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
      },
      {
        method: "POST",
        path: "/api/contacts",
        summary: "Crea o actualiza un contacto por teléfono.",
        useCase: "Registrar clientes antes de enviar mensajes.",
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
        summary: "Crea o actualiza contactos de manera masiva.",
        useCase: "Importar una base de destinatarios antes de enviar campañas.",
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
    title: "Órdenes",
    icon: Package,
    description: "Cada orden pertenece a un contacto existente (contact_id) y avanza por 6 estados posibles.",
    endpoints: [
      {
        method: "POST",
        path: "/api/orders",
        summary: "Crea una orden asociada a un contacto.",
        useCase: "Registrar un pedido después de crear o localizar al contacto (ver sección Contactos). El estado inicial siempre es \"pending\", no se puede omitir.",
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
        summary: "Lista todas las órdenes del espacio de trabajo.",
        useCase: "Sincronizar el catálogo de pedidos con un sistema externo.",
        example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/orders" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
      },
      {
        method: "GET",
        path: "/api/orders/{id}",
        summary: "Consulta una orden específica (incluye los datos del contacto).",
        useCase: "Mostrar el detalle de un pedido en otro sistema.",
        example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/orders/ORDER_ID" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
      },
      {
        method: "GET",
        path: "/api/orders/contact/{contactId}",
        summary: "Lista todas las órdenes de un contacto.",
        useCase: "Ver el historial de compras de un cliente antes de atenderlo.",
        example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/orders/contact/CONTACT_ID" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
      },
      {
        method: "PATCH",
        path: "/api/orders/{id}",
        summary: "Actualiza el estado u otros datos de una orden (envío parcial, solo mandas los campos que cambian).",
        useCase: "Mover el pedido al siguiente estado del flujo, o agregar el número de guía al despacharlo.",
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
        summary: "Elimina una orden.",
        useCase: "Depurar órdenes de prueba.",
        example: `curl -X DELETE "${RAILWAY_BACKEND_URL}/api/orders/ORDER_ID" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
      },
    ],
  },
  {
    id: "conversaciones",
    title: "Conversaciones",
    icon: MessageCircle,
    description: "Consulta conversaciones y mensajes relacionados con la operación del cliente.",
    endpoints: [
      {
        method: "GET",
        path: "/api/conversations",
        summary: "Lista conversaciones visibles para la cuenta.",
        useCase: "Integrar seguimiento de atención en otro sistema.",
        example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/conversations" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
      },
      {
        method: "GET",
        path: "/api/conversations/{id}/messages",
        summary: "Consulta mensajes de una conversación específica.",
        useCase: "Auditar historial o sincronizar mensajes.",
        example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/conversations/CONVERSATION_ID/messages" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
      },
    ],
  },
  {
    id: "mensajes",
    title: "Mensajes",
    icon: Send,
    description: "Envía un mensaje de WhatsApp directo a un contacto, sin necesidad de crear una campaña.",
    endpoints: [
      {
        method: "POST",
        path: "/api/whatsapp/send",
        summary: "Envía un mensaje de texto a un número de WhatsApp.",
        useCase: "Notificar a un cliente puntual sin pasar por el flujo de campañas masivas.",
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
        summary: "Envía un mensaje usando una plantilla aprobada por WhatsApp.",
        useCase: "Iniciar conversación fuera de la ventana de 24h (requiere plantilla autorizada).",
        example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/whatsapp/send-template" \\
  -H "Authorization: Bearer TU_TOKEN_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "+5215512345678",
    "template_name": "recordatorio_cita",
    "language": "es_MX"
  }'`,
      },
    ],
  },
  {
    id: "leads",
    title: "Leads",
    icon: Users,
    description: "Captura leads desde tu sitio web u otros sistemas, sin necesidad de iniciar sesión.",
    endpoints: [
      {
        method: "POST",
        path: "/api/public/leads",
        summary: "Registra un lead nuevo usando una API key (no requiere JWT).",
        useCase: "Conectar un formulario web o un sistema externo para enviar leads directo al CRM.",
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
        summary: "Lista los leads recibidos (requiere sesión).",
        useCase: "Revisar y dar seguimiento a los leads capturados.",
        example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/leads" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
      },
      {
        method: "POST",
        path: "/api/leads/{id}/convert",
        summary: "Convierte un lead en un contacto del CRM. NO crea una orden.",
        useCase: "Pasar un lead calificado a un contacto real para poder chatear con él o, en un paso aparte, crearle una orden.",
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
    title: "Webhooks",
    icon: Webhook,
    description: "Recepción de eventos externos cuando se habilitan integraciones.",
    endpoints: [
      {
        method: "POST",
        path: "/api/whatsapp/webhook",
        summary: "Recibe eventos entrantes de WhatsApp.",
        useCase: "Procesar respuestas, estados y mensajes entrantes.",
        example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/whatsapp/webhook" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "message.received",
    "from": "+5215512345678",
    "message": "Hola"
  }'`,
      },
    ],
  },
]

const orderStates = [
  { value: "pending", label: "Pendiente", description: "Estado inicial al crear la orden. No se puede omitir en el POST." },
  { value: "confirmed", label: "Confirmada", description: "El negocio confirmó el pedido (stock, pago, etc.)." },
  { value: "processing", label: "En preparación", description: "Se está surtiendo/empacando el pedido." },
  { value: "shipped", label: "Enviada", description: "Salió a reparto. Aquí suele mandarse también tracking_number." },
  { value: "delivered", label: "Entregada", description: "El cliente ya recibió el pedido." },
  { value: "cancelled", label: "Cancelada", description: "El pedido se canceló en cualquier punto del flujo." },
]

const hiddenInternalAreas = [
  "Eliminación masiva de contactos",
  "Administración de usuarios, roles y agentes",
  "Webhooks internos de proveedor",
  "Endpoints de migración, debug o mantenimiento",
  "Operaciones directas sobre media y mensajes sensibles",
]

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

function CodeBlock({ code }: { code: string }) {
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
        {copied ? "Copiado" : "Copiar"}
      </button>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words p-4 pr-20 text-xs leading-5 text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function DocumentacionApiPage() {
  const { user } = useUserRole()
  const isAdmin = String(user?.role || "").toLowerCase().startsWith("admin")
  const apiBaseUrl = `${RAILWAY_BACKEND_URL}/api`

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
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Documentación API</h1>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Producción
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                  Endpoints disponibles para integrar tu sitio web o sistemas externos con el CRM.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-start gap-3 pt-6">
                <ShieldCheck className="h-4.5 w-4.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Política de acceso</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Esta vista muestra únicamente endpoints seguros para integraciones externas.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-foreground">Base URL de producción</p>
                <code className="mt-1.5 block break-all rounded-md bg-muted px-2.5 py-1.5 text-xs text-foreground">
                  {apiBaseUrl}
                </code>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Formato de respuesta</CardTitle>
              <CardDescription>Todas las respuestas son JSON. La forma varía según el tipo de operación.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold text-foreground mb-1">Listados (GET)</p>
                <p className="text-xs text-muted-foreground mb-2">Devuelven un arreglo directo, sin envoltorio.</p>
                <CodeBlock code={`[\n  { "id": "...", "name": "..." },\n  { "id": "...", "name": "..." }\n]`} />
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold text-foreground mb-1">Creación (POST)</p>
                <p className="text-xs text-muted-foreground mb-2">Devuelven el objeto creado con su id.</p>
                <CodeBlock code={`{\n  "id": "...",\n  "status": "new",\n  "created_at": "..."\n}`} />
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold text-foreground mb-1">Autenticación</p>
                <p className="text-xs text-muted-foreground mb-2">Incluye el token y los datos del usuario.</p>
                <CodeBlock code={`{\n  "access_token": "...",\n  "token_type": "Bearer",\n  "expires_in": "7d",\n  "user": { "id": "...", "email": "...", "role": "..." }\n}`} />
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold text-foreground mb-1">Errores</p>
                <p className="text-xs text-muted-foreground mb-2">Formato estándar con código HTTP.</p>
                <CodeBlock code={`{\n  "statusCode": 404,\n  "error": "Not Found",\n  "message": "Cannot GET /api/xyz"\n}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Endpoints por categoría</CardTitle>
              <CardDescription>Expande una categoría para ver los endpoints y un ejemplo listo para copiar.</CardDescription>
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
                                    <th className="text-left font-medium text-foreground px-3 py-2">Estado</th>
                                    <th className="text-left font-medium text-foreground px-3 py-2">Descripción</th>
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
                              <span className="font-semibold">Importante:</span> convertir un lead solo crea un{" "}
                              <span className="font-semibold">Contacto</span>, no una orden. Si necesitas registrar
                              una compra, crea la orden aparte con <code>POST /api/orders</code> usando el{" "}
                              <code>contact_id</code> que devuelve el convert (ver sección "Órdenes").
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
                                <span className="font-medium text-foreground/80">Uso:</span> {endpoint.useCase}
                              </p>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Request</p>
                              <CodeBlock code={endpoint.example} />
                              {(endpoint as any).response && (
                                <>
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Response</p>
                                  <CodeBlock code={(endpoint as any).response} />
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
                <CardTitle className="text-base">Flujo recomendado para integraciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Solicitar credenciales o token de integración.",
                  "Crear o sincronizar contactos autorizados.",
                  "Enviar campañas o consultar conversaciones según permisos contratados.",
                  "Consultar métricas de campañas y estados de entrega.",
                ].map((item) => (
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
                    <CardTitle className="text-base">No expuesto a clientes</CardTitle>
                  </div>
                  <CardDescription>Visible solo para administradores.</CardDescription>
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
                    El Swagger completo es documentación interna y permanece deshabilitado en producción.
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
