"use client"

import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Users,
  Webhook,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useUserRole } from "@/hooks/use-user-role"

const RAILWAY_BACKEND_URL = "https://crmmibobackend-production.up.railway.app"
const BRYAN_ADMIN_EMAIL = "bryan.mejia@logimarket.com.mx"

const clientEndpointGroups = [
  {
    title: "Autenticación",
    icon: KeyRound,
    description: "Permite iniciar sesión y obtener el token necesario para usar la API autorizada.",
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
        useCase: "Importar una base de destinatarios desde un sistema externo antes de enviar campañas.",
        example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/contacts/import" \\
  -H "Authorization: Bearer TU_TOKEN_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contacts": [
      {
        "name": "Ana Martinez",
        "phone_number": "+5215512345678",
        "channel": "whatsapp"
      },
      {
        "name": "Luis Perez",
        "phone_number": "+5215598765432",
        "channel": "whatsapp"
      }
    ]
  }'`,
      },
    ],
  },
  {
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
    title: "Campañas",
    icon: Send,
    description: "Operación de campañas y seguimiento de envíos masivos autorizados.",
    endpoints: [
      {
        method: "GET",
        path: "/api/campaigns",
        summary: "Lista campañas con identificador, estado y métricas.",
        useCase: "Consultar avance y trazabilidad de campañas.",
        example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/campaigns" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
      },
      {
        method: "GET",
        path: "/api/campaigns/stats",
        summary: "Resume enviados, fallidos y campañas activas.",
        useCase: "Construir dashboards externos.",
        example: `curl -X GET "${RAILWAY_BACKEND_URL}/api/campaigns/stats" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
      },
      {
        method: "POST",
        path: "/api/campaigns/send",
        summary: "Crea y envía una campaña autorizada.",
        useCase: "Disparar campañas desde un sistema externo.",
        example: `curl -X POST "${RAILWAY_BACKEND_URL}/api/campaigns/send" \\
  -H "Authorization: Bearer TU_TOKEN_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Campaña recordatorio",
    "message": "Hola {{name}}, tenemos información para ti.",
    "recipients": [
      {
        "name": "Ana Martinez",
        "phone_number": "+5215512345678"
      }
    ]
  }'`,
      },
      {
        method: "DELETE",
        path: "/api/campaigns?id={campaignId}",
        summary: "Elimina una campaña del historial operativo.",
        useCase: "Depurar campañas de prueba sin borrar los mensajes del chat.",
        example: `curl -X DELETE "${RAILWAY_BACKEND_URL}/api/campaigns?id=bulk_123456789" \\
  -H "Authorization: Bearer TU_TOKEN_JWT"`,
      },
    ],
  },
  {
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

const hiddenInternalAreas = [
  "Eliminación masiva de contactos",
  "Administración de usuarios, roles y agentes",
  "Webhooks internos de proveedor",
  "Endpoints de migración, debug o mantenimiento",
  "Operaciones directas sobre media y mensajes sensibles",
]

function methodClass(method: string) {
  const map: Record<string, string> = {
    GET: "border-blue-200 bg-blue-50 text-blue-700",
    POST: "border-emerald-200 bg-emerald-50 text-emerald-700",
    PUT: "border-amber-200 bg-amber-50 text-amber-700",
    PATCH: "border-violet-200 bg-violet-50 text-violet-700",
    DELETE: "border-red-200 bg-red-50 text-red-700",
  }
  return map[method] || "border-slate-200 bg-slate-50 text-slate-700"
}

export default function DocumentacionApiPage() {
  const { user } = useUserRole()
  const showInternalSwagger = process.env.NEXT_PUBLIC_SHOW_INTERNAL_SWAGGER === "true"
  const railwaySwaggerUrl = `${RAILWAY_BACKEND_URL}/api/docs`
  const apiBaseUrl = `${RAILWAY_BACKEND_URL}/api`
  const isBryanAdmin =
    user?.role === "admin" &&
    String(user?.email || "").trim().toLowerCase() === BRYAN_ADMIN_EMAIL

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-950">Documentación API para clientes</h1>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  Producción
                </Badge>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                  Acceso seguro
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Endpoints permitidos para integraciones de clientes. La documentación interna completa queda protegida.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Recargar
            </Button>
            {showInternalSwagger ? (
              <Button onClick={() => window.open(railwaySwaggerUrl, "_blank", "noopener,noreferrer")} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir Swagger interno
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              Política de acceso
            </div>
            <p className="mt-1">
              Esta vista evita exponer endpoints administrativos. Para integraciones externas, entrega solo tokens y permisos necesarios.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-medium text-slate-800">Base URL de producción</p>
            <code className="mt-1 block break-all rounded bg-white px-2 py-1 text-xs text-slate-700">{apiBaseUrl}</code>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-6">
        <section className="grid gap-4 xl:grid-cols-5">
          {clientEndpointGroups.map((group) => {
            const Icon = group.icon
            return (
              <article key={group.title} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-950">{group.title}</h2>
                </div>
                <p className="mt-3 min-h-[42px] text-xs leading-5 text-slate-500">{group.description}</p>
                <div className="mt-4 space-y-2">
                  {group.endpoints.map((endpoint) => (
                    <div key={`${endpoint.method}-${endpoint.path}`} className="rounded-md border border-slate-100 bg-slate-50 p-2">
                      <div className="flex items-center gap-2">
                        <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${methodClass(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <code className="truncate text-xs text-slate-800">{endpoint.path}</code>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{endpoint.summary}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        <span className="font-medium">Uso:</span> {endpoint.useCase}
                      </p>
                      <div className="mt-2 rounded-md border border-slate-200 bg-slate-950 p-2">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Ejemplo curl</p>
                        <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-slate-100">
                          <code>{endpoint.example}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </section>

        <section className={`mt-6 grid gap-4 ${isBryanAdmin ? "lg:grid-cols-[1fr_1fr]" : "lg:grid-cols-1"}`}>
          <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-950">Flujo recomendado para clientes</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {[
                "Solicitar credenciales o token de integración.",
                "Crear o sincronizar contactos autorizados.",
                "Enviar campañas o consultar conversaciones según permisos contratados.",
                "Consultar métricas de campañas y estados de entrega.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>

          {isBryanAdmin && (
            <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-950">No expuesto a clientes</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {hiddenInternalAreas.map((area) => (
                  <Badge key={area} variant="outline" className="border-red-100 bg-red-50 text-red-700">
                    {area}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Swagger completo es documentación interna. En Railway queda deshabilitado por defecto y solo se habilita con variables
                administrativas.
              </p>
            </article>
          )}
        </section>
      </main>
    </div>
  )
}
