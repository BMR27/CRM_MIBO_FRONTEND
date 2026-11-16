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
  Send,
  MessageCircleReply,
  Eye,
  DollarSign,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

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
  bulk_messaging_enabled: boolean
  wa_templates_enabled: boolean
}

const localeMap: Record<string, string> = { es: "es-MX", en: "en-US", pl: "pl-PL", ru: "ru-RU" }

export function WorkspaceOverview({ conversations, agents }: WorkspaceOverviewProps) {
  const { t, language } = useLanguage()
  const locale = localeMap[language] || "es-MX"
  const router = useRouter()
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [leadsCount, setLeadsCount] = useState<number | null>(null)
  const [messagingStats, setMessagingStats] = useState<{
    messagesSent: number
    messagesRead: number
    repliesReceived: number
    totalValue: number
  } | null>(null)

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
    api
      .get("/api/workspace/stats")
      .then(({ data }) => active && setMessagingStats(data))
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
      label: t("overview.openConversations"),
      value: open,
      icon: MessageSquare,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: t("overview.resolved"),
      value: resolved,
      icon: CheckCircle2,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: t("overview.agentsConnected"),
      value: `${agentsOnline}/${agents.length}`,
      icon: Users,
      accent: "bg-violet-50 text-violet-600",
    },
    {
      label: t("overview.unattendedLeads"),
      value: leadsCount ?? "—",
      icon: Inbox,
      accent: "bg-amber-50 text-amber-600",
    },
    {
      label: t("overview.messagesSent"),
      value: messagingStats ? messagingStats.messagesSent.toLocaleString(locale) : "—",
      icon: Send,
      accent: "bg-sky-50 text-sky-600",
    },
    {
      label: t("overview.repliesReceived"),
      value: messagingStats ? messagingStats.repliesReceived.toLocaleString(locale) : "—",
      icon: MessageCircleReply,
      accent: "bg-teal-50 text-teal-600",
    },
    {
      label: t("overview.messagesRead"),
      value: messagingStats ? messagingStats.messagesRead.toLocaleString(locale) : "—",
      icon: Eye,
      accent: "bg-indigo-50 text-indigo-600",
    },
    {
      label: t("overview.valueData"),
      value: messagingStats
        ? messagingStats.totalValue.toLocaleString(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
        : "—",
      icon: DollarSign,
      accent: "bg-rose-50 text-rose-600",
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-background">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {tenant?.name || t("overview.yourWorkspace")}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">{t("overview.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("overview.subtitle")}
            </p>
          </div>
          {tenant && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {t("overview.plan")} {tenant.plan}
              </Badge>
              <Badge variant={tenant.bulk_messaging_enabled ? "default" : "secondary"}>
                {t("overview.bulkMessaging")} {tenant.bulk_messaging_enabled ? t("overview.enabled") : t("overview.disabled")}
              </Badge>
              <Badge variant={tenant.wa_templates_enabled ? "default" : "secondary"}>
                {t("overview.templates")} {tenant.wa_templates_enabled ? t("overview.templatesEnabled") : t("overview.templatesDisabled")}
              </Badge>
            </div>
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
                {t("overview.recentActivity")}
              </CardTitle>
              <CardDescription>{conversations.length} {t("overview.totalConversations")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push("/inbox/agentes")}>
                {t("overview.viewAgentPerformance")}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                {t("overview.leads")}
              </CardTitle>
              <CardDescription>{t("overview.leadsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push("/inbox/leads")}>
                {t("overview.goToLeads")}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
