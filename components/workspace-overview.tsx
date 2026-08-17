"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import {
  MessageSquare,
  Users,
  Inbox,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Building2,
} from "lucide-react"

interface ConversationSummary {
  id: string
  status: string
}

interface AgentSummary {
  id: string
  status?: string
}

interface WorkspaceOverviewProps {
  conversations: ConversationSummary[]
  agents: AgentSummary[]
}

interface TenantInfo {
  name: string
  plan: string
  status: string
}

export function WorkspaceOverview({ conversations, agents }: WorkspaceOverviewProps) {
  const router = useRouter()
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [leadsCount, setLeadsCount] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    api.get("/api/tenants/me").then(({ data }) => active && setTenant(data)).catch(() => {})
    api
      .get("/api/leads")
      .then(({ data }) => {
        if (!active) return
        const list = Array.isArray(data) ? data : []
        setLeadsCount(list.filter((l: any) => l.status === "new").length)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const open = conversations.filter((c) => c.status === "active" || c.status === "open").length
  const resolved = conversations.filter((c) => c.status === "resolved" || c.status === "closed").length
  const agentsOnline = agents.filter((a) => a.status === "available").length

  const stats = [
    {
      label: "Conversaciones abiertas",
      value: open,
      icon: MessageSquare,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: "Resueltas",
      value: resolved,
      icon: CheckCircle2,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Agentes conectados",
      value: `${agentsOnline}/${agents.length}`,
      icon: Users,
      accent: "bg-violet-50 text-violet-600",
    },
    {
      label: "Leads sin atender",
      value: leadsCount ?? "—",
      icon: Inbox,
      accent: "bg-amber-50 text-amber-600",
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-background">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {tenant?.name || "Tu espacio de trabajo"}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">Resumen general</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Vista global de la operación. Elige una conversación de la izquierda para entrar al detalle.
            </p>
          </div>
          {tenant && (
            <Badge variant="outline" className="capitalize">
              Plan {tenant.plan}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.accent}`}>
                  <stat.icon className="h-4.5 w-4.5" />
                </div>
                <p className="text-2xl font-bold mt-3 leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Actividad reciente
              </CardTitle>
              <CardDescription>{conversations.length} conversaciones totales en el espacio.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push("/inbox/agentes")}>
                Ver desempeño por agente
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Leads
              </CardTitle>
              <CardDescription>Prospectos capturados por API o formularios web.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push("/inbox/leads")}>
                Ir a Leads
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
