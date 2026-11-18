"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api, frontendApi } from "@/lib/api"
import {
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Building2,
  Send,
  MessageCircleReply,
  Eye,
  CheckCheck,
  XCircle,
  Megaphone,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
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

interface MessagingStats {
  messagesSent: number
  messagesDelivered: number
  messagesRead: number
  messagesFailed: number
  repliesReceived: number
  contactsReached: number
  contactsReplied: number
  campaignRecipients: number
  campaignFailed: number
  totalValue: number
  trend: { date: string; sent: number; received: number }[]
}

const localeMap: Record<string, string> = { es: "es-MX", en: "en-US", pl: "pl-PL", ru: "ru-RU" }

function percent(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

// "YYYY-MM-DD" como fecha local; new Date("YYYY-MM-DD") la toma en UTC y puede
// mostrar el día anterior.
function parseDay(value: string) {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function WorkspaceOverview({ conversations, agents }: WorkspaceOverviewProps) {
  const { t, language } = useLanguage()
  const locale = localeMap[language] || "es-MX"
  const router = useRouter()
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [messagingStats, setMessagingStats] = useState<MessagingStats | null>(null)

  useEffect(() => {
    let active = true
    api.get("/api/tenants/me").then(({ data }) => active && setTenant(data)).catch(() => {})
    frontendApi
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
  const fmt = (n: number) => n.toLocaleString(locale)
  const sent = messagingStats?.messagesSent ?? 0

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
      hint: messagingStats && sent > 0 ? `${percent(messagingStats.messagesRead, sent)}% ${t("overview.ofSent")}` : undefined,
      icon: Eye,
      accent: "bg-indigo-50 text-indigo-600",
    },
  ]

  const funnel = messagingStats
    ? [
        { label: t("overview.messagesSent"), value: sent, icon: Send, bar: "bg-blue-600 dark:bg-blue-500" },
        { label: t("overview.messagesDelivered"), value: messagingStats.messagesDelivered, icon: CheckCheck, bar: "bg-blue-600 dark:bg-blue-500" },
        { label: t("overview.messagesRead"), value: messagingStats.messagesRead, icon: Eye, bar: "bg-blue-600 dark:bg-blue-500" },
        { label: t("overview.messagesFailed"), value: messagingStats.messagesFailed, icon: XCircle, bar: "bg-red-600 dark:bg-red-500", critical: true },
      ]
    : []

  const trend = (messagingStats?.trend || []).map((day) => ({
    ...day,
    label: parseDay(day.date).toLocaleDateString(locale, { day: "numeric", month: "short" }),
  }))
  const hasTrend = trend.some((day) => day.sent > 0 || day.received > 0)

  const chartConfig = {
    sent: { label: t("overview.sent"), theme: { light: "#2563eb", dark: "#3b82f6" } },
    received: { label: t("overview.received"), theme: { light: "#d97706", dark: "#d97706" } },
  } satisfies ChartConfig

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-background">
      <div className="mx-auto max-w-6xl space-y-6">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.accent}`}>
                  <stat.icon className="h-4.5 w-4.5" />
                </div>
                <p className="text-2xl font-bold mt-3 leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{stat.label}</p>
                {"hint" in stat && stat.hint && <p className="text-xs text-muted-foreground/80 mt-0.5">{stat.hint}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {messagingStats && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("overview.deliveryFunnel")}</CardTitle>
                <CardDescription>{t("overview.deliveryFunnelDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {funnel.map((step) => {
                  const pct = percent(step.value, sent)
                  return (
                    <div key={step.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className={`flex items-center gap-1.5 ${step.critical ? "text-red-700 dark:text-red-400" : "text-foreground"}`}>
                          <step.icon className="h-3.5 w-3.5" />
                          {step.label}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          <span className="font-semibold text-foreground">{fmt(step.value)}</span>
                          {sent > 0 && ` · ${pct}%`}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-muted">
                        <div className={`h-2 rounded-full ${step.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("overview.engagement")}</CardTitle>
                <CardDescription>{t("overview.engagementDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("overview.contactsReached")}</dt>
                    <dd className="text-2xl font-bold mt-1 tabular-nums">{fmt(messagingStats.contactsReached)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("overview.contactsReplied")}</dt>
                    <dd className="text-2xl font-bold mt-1 tabular-nums">{fmt(messagingStats.contactsReplied)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("overview.replyRate")}</dt>
                    <dd className="text-2xl font-bold mt-1 tabular-nums">
                      {percent(messagingStats.contactsReplied, messagingStats.contactsReached)}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("overview.readRate")}</dt>
                    <dd className="text-2xl font-bold mt-1 tabular-nums">{percent(messagingStats.messagesRead, sent)}%</dd>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 border-t pt-4 text-sm">
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold tabular-nums">{fmt(messagingStats.campaignRecipients)}</span>
                    <span className="text-muted-foreground">{t("overview.campaignRecipients")}</span>
                    {messagingStats.campaignFailed > 0 && (
                      <span className="ml-auto flex items-center gap-1 text-red-700 dark:text-red-400">
                        <XCircle className="h-3.5 w-3.5" />
                        {fmt(messagingStats.campaignFailed)} {t("overview.campaignFailed")}
                      </span>
                    )}
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">{t("overview.activity")}</CardTitle>
                <CardDescription>{t("overview.activityDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {hasTrend ? (
                  <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
                    <BarChart data={trend} barGap={2} margin={{ left: -20, right: 4 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
                      <ChartTooltip cursor={{ fillOpacity: 0.5 }} content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="sent" fill="var(--color-sent)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                      <Bar dataKey="received" fill="var(--color-received)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">{t("overview.noActivity")}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4">
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
        </div>
      </div>
    </div>
  )
}
