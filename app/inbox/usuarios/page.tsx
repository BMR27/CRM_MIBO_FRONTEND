"use client"

import { useEffect, useMemo, useState, type ElementType } from "react"
import {
  Building2,
  Download,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Wifi,
  X,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { es, enUS, pl, ru } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

const dateFnsLocales = { es, en: enUS, pl, ru }

type PlatformUser = {
  id: string
  name: string
  email: string
  status: string
  avatarUrl: string | null
  isPlatformAdmin: boolean
  createdAt: string | null
  updatedAt: string | null
  lastLoginAt: string | null
  lastLoginIp: string | null
  hasActiveSession: boolean
  role: {
    id: string | null
    name: string | null
    description: string | null
    permissions: Record<string, any> | null
  }
  tenant: {
    id: string | null
    name: string | null
    slug: string | null
    status: string | null
    plan: string | null
    legalName: string | null
    createdAt: string | null
    features: {
      bulkMessaging: boolean
      waTemplates: boolean
      citas: boolean
      agentes: boolean
      leads: boolean
      docsApi: boolean
    }
  }
  activity: {
    conversationsTotal: number
    conversationsActive: number
    conversationsResolved: number
    messagesSent: number
    lastMessageAt: string | null
  }
}

type Summary = {
  totalUsers: number
  totalTenants: number
  activeSessions: number
  platformAdmins: number
  neverLoggedIn: number
  loggedInLast7Days: number
}

const EMPTY_SUMMARY: Summary = {
  totalUsers: 0,
  totalTenants: 0,
  activeSessions: 0,
  platformAdmins: 0,
  neverLoggedIn: 0,
  loggedInLast7Days: 0,
}

export default function PlatformUsersPage() {
  const { t, language } = useLanguage()
  const dateLocale = dateFnsLocales[language] || es

  const [users, setUsers] = useState<PlatformUser[]>([])
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [tenantFilter, setTenantFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [sessionFilter, setSessionFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/platform/users", { cache: "no-store" })
      const data = await response.json().catch(() => ({}))
      if (response.status === 403) throw new Error(t("pusers.forbidden"))
      if (!response.ok) throw new Error(data?.error || t("pusers.loadFail"))
      setUsers(Array.isArray(data?.users) ? data.users : [])
      setSummary(data?.summary || EMPTY_SUMMARY)
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pusers.loadFail"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tenantOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const user of users) {
      if (user.tenant.id) map.set(user.tenant.id, user.tenant.name || user.tenant.id)
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [users])

  const roleOptions = useMemo(() => {
    const set = new Set<string>()
    for (const user of users) {
      if (user.role.name) set.add(user.role.name)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [users])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((user) => {
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q) ||
        String(user.tenant.name || "").toLowerCase().includes(q)
      const matchesTenant = tenantFilter === "all" || user.tenant.id === tenantFilter
      const matchesRole = roleFilter === "all" || user.role.name === roleFilter
      const matchesSession =
        sessionFilter === "all" ||
        (sessionFilter === "online" && user.hasActiveSession) ||
        (sessionFilter === "offline" && !user.hasActiveSession) ||
        (sessionFilter === "never" && !user.lastLoginAt) ||
        (sessionFilter === "admins" && user.isPlatformAdmin)
      return matchesSearch && matchesTenant && matchesRole && matchesSession
    })
  }, [users, search, tenantFilter, roleFilter, sessionFilter])

  const formatAbsolute = (value: string | null) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return format(date, "dd MMM yyyy · HH:mm", { locale: dateLocale })
  }

  const formatRelative = (value: string | null) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return formatDistanceToNow(date, { locale: dateLocale, addSuffix: true })
  }

  const resetFilters = () => {
    setSearch("")
    setTenantFilter("all")
    setRoleFilter("all")
    setSessionFilter("all")
  }

  const exportCsv = () => {
    const headers = [
      "id",
      "name",
      "email",
      "tenant",
      "tenant_slug",
      "role",
      "platform_admin",
      "status",
      "active_session",
      "last_login_at",
      "last_login_ip",
      "conversations_total",
      "messages_sent",
      "created_at",
    ]
    const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`
    const lines = [
      headers.join(","),
      ...filteredUsers.map((user) =>
        [
          user.id,
          user.name,
          user.email,
          user.tenant.name,
          user.tenant.slug,
          user.role.name,
          user.isPlatformAdmin ? "yes" : "no",
          user.status,
          user.hasActiveSession ? "yes" : "no",
          user.lastLoginAt || "",
          user.lastLoginIp || "",
          user.activity.conversationsTotal,
          user.activity.messagesSent,
          user.createdAt || "",
        ]
          .map(escape)
          .join(","),
      ),
    ]
    const blob = new Blob([`﻿${lines.join("\n")}`], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `usuarios-plataforma-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full overflow-y-auto bg-background p-4 lg:p-6">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <header className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{t("pusers.pageTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("pusers.pageSubtitle")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => void loadUsers()} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {t("pusers.refresh")}
            </Button>
            <Button variant="outline" onClick={exportCsv} disabled={filteredUsers.length === 0} className="gap-2">
              <Download className="h-4 w-4" />
              {t("pusers.exportCsv")}
            </Button>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={Users} label={t("pusers.metricUsers")} value={summary.totalUsers} />
          <MetricCard icon={Building2} label={t("pusers.metricTenants")} value={summary.totalTenants} />
          <MetricCard icon={Wifi} label={t("pusers.metricOnline")} value={summary.activeSessions} tone="good" />
          <MetricCard icon={KeyRound} label={t("pusers.metricRecent")} value={summary.loggedInLast7Days} />
          <MetricCard icon={ShieldCheck} label={t("pusers.metricNever")} value={summary.neverLoggedIn} tone="warn" />
        </section>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-md border border-border bg-card shadow-sm">
          <div className="grid gap-3 border-b border-border p-4 xl:grid-cols-[minmax(240px,1fr)_200px_180px_190px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("pusers.searchPlaceholder")}
                className="pl-9"
              />
            </div>
            <Select value={tenantFilter} onValueChange={setTenantFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("pusers.colWorkspace")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("pusers.allWorkspaces")}</SelectItem>
                {tenantOptions.map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("pusers.colRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("pusers.allRoles")}</SelectItem>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sessionFilter} onValueChange={setSessionFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("pusers.colSession")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("pusers.allSessions")}</SelectItem>
                <SelectItem value="online">{t("pusers.filterOnline")}</SelectItem>
                <SelectItem value="offline">{t("pusers.filterOffline")}</SelectItem>
                <SelectItem value="never">{t("pusers.filterNever")}</SelectItem>
                <SelectItem value="admins">{t("pusers.filterAdmins")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters} className="gap-2">
              <X className="h-4 w-4" />
              {t("pusers.clear")}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("pusers.colUser")}</TableHead>
                  <TableHead>{t("pusers.colWorkspace")}</TableHead>
                  <TableHead>{t("pusers.colRole")}</TableHead>
                  <TableHead>{t("pusers.colSession")}</TableHead>
                  <TableHead>{t("pusers.colLastLogin")}</TableHead>
                  <TableHead className="text-right">{t("pusers.colConversations")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                      {t("pusers.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                      {t("pusers.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 truncate font-medium text-foreground">
                            {user.name || t("pusers.noName")}
                            {user.isPlatformAdmin && (
                              <Badge variant="outline" className="border-violet-200 bg-violet-50 text-[10px] text-violet-700">
                                {t("pusers.superAdmin")}
                              </Badge>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-foreground">{user.tenant.name || t("pusers.noWorkspace")}</p>
                          <p className="truncate font-mono text-xs text-muted-foreground">{user.tenant.slug || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.role.name || t("pusers.noRole")}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full",
                            user.hasActiveSession
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-border bg-muted text-muted-foreground",
                          )}
                        >
                          {user.hasActiveSession ? t("pusers.online") : t("pusers.offline")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? (
                          <div className="min-w-0">
                            <p className="truncate text-sm text-foreground">{formatRelative(user.lastLoginAt)}</p>
                            <p className="truncate text-xs text-muted-foreground">{formatAbsolute(user.lastLoginAt)}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-amber-700">{t("pusers.neverLoggedIn")}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-foreground">
                        {user.activity.conversationsTotal}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                          {t("pusers.viewDetail")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!loading && filteredUsers.length > 0 && (
            <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
              {filteredUsers.length} / {users.length} {t("pusers.resultsSuffix")}
            </div>
          )}
        </section>
      </div>

      <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-h-[85vh] w-[92vw] overflow-y-auto sm:max-w-2xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  {selectedUser.name || t("pusers.noName")}
                  {selectedUser.isPlatformAdmin && (
                    <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">
                      {t("pusers.superAdmin")}
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>{selectedUser.email}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-5">
                <DetailBlock title={t("pusers.blockAccess")}>
                  <DetailRow label={t("pusers.fieldUserId")} value={selectedUser.id} mono />
                  <DetailRow label={t("pusers.fieldRole")} value={selectedUser.role.name || t("pusers.noRole")} />
                  {selectedUser.role.description && (
                    <DetailRow label={t("pusers.fieldRoleDesc")} value={selectedUser.role.description} />
                  )}
                  <DetailRow
                    label={t("pusers.fieldPlatformAdmin")}
                    value={selectedUser.isPlatformAdmin ? t("pusers.yes") : t("pusers.no")}
                  />
                </DetailBlock>

                <DetailBlock title={t("pusers.blockWorkspace")}>
                  <DetailRow label={t("pusers.fieldWorkspace")} value={selectedUser.tenant.name || t("pusers.noWorkspace")} />
                  <DetailRow label={t("pusers.fieldWorkspaceId")} value={selectedUser.tenant.id || "—"} mono />
                  <DetailRow label={t("pusers.fieldSlug")} value={selectedUser.tenant.slug || "—"} mono />
                  {selectedUser.tenant.legalName && (
                    <DetailRow label={t("pusers.fieldLegalName")} value={selectedUser.tenant.legalName} />
                  )}
                  <DetailRow label={t("pusers.fieldPlan")} value={selectedUser.tenant.plan || "—"} />
                  <DetailRow label={t("pusers.fieldWorkspaceStatus")} value={selectedUser.tenant.status || "—"} />
                  <DetailRow
                    label={t("pusers.fieldWorkspaceCreated")}
                    value={formatAbsolute(selectedUser.tenant.createdAt) || "—"}
                  />
                  <div className="pt-1">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("pusers.fieldModules")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <FeatureBadge on={selectedUser.tenant.features.bulkMessaging} label={t("pusers.featureBulk")} />
                      <FeatureBadge on={selectedUser.tenant.features.waTemplates} label={t("pusers.featureTemplates")} />
                      <FeatureBadge on={selectedUser.tenant.features.citas} label={t("pusers.featureCitas")} />
                      <FeatureBadge on={selectedUser.tenant.features.agentes} label={t("pusers.featureAgentes")} />
                      <FeatureBadge on={selectedUser.tenant.features.leads} label={t("pusers.featureLeads")} />
                      <FeatureBadge on={selectedUser.tenant.features.docsApi} label={t("pusers.featureDocsApi")} />
                    </div>
                  </div>
                </DetailBlock>

                <DetailBlock title={t("pusers.blockSession")}>
                  <DetailRow
                    label={t("pusers.fieldLastLogin")}
                    value={
                      selectedUser.lastLoginAt
                        ? `${formatAbsolute(selectedUser.lastLoginAt)} (${formatRelative(selectedUser.lastLoginAt)})`
                        : t("pusers.neverLoggedIn")
                    }
                  />
                  <DetailRow label={t("pusers.fieldLastLoginIp")} value={selectedUser.lastLoginIp || "—"} mono />
                  <DetailRow
                    label={t("pusers.fieldActiveSession")}
                    value={selectedUser.hasActiveSession ? t("pusers.yes") : t("pusers.no")}
                  />
                  <DetailRow label={t("pusers.fieldAvailability")} value={selectedUser.status} />
                </DetailBlock>

                <DetailBlock title={t("pusers.blockActivity")}>
                  <DetailRow
                    label={t("pusers.fieldConversations")}
                    value={`${selectedUser.activity.conversationsTotal} (${selectedUser.activity.conversationsActive} ${t("pusers.activeShort")} · ${selectedUser.activity.conversationsResolved} ${t("pusers.resolvedShort")})`}
                  />
                  <DetailRow label={t("pusers.fieldMessagesSent")} value={String(selectedUser.activity.messagesSent)} />
                  <DetailRow
                    label={t("pusers.fieldLastMessage")}
                    value={formatAbsolute(selectedUser.activity.lastMessageAt) || "—"}
                  />
                  <DetailRow label={t("pusers.fieldCreatedAt")} value={formatAbsolute(selectedUser.createdAt) || "—"} />
                  <DetailRow label={t("pusers.fieldUpdatedAt")} value={formatAbsolute(selectedUser.updatedAt) || "—"} />
                </DetailBlock>

                {selectedUser.role.permissions && (
                  <DetailBlock title={t("pusers.blockPermissions")}>
                    <pre className="max-h-56 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
                      {JSON.stringify(selectedUser.role.permissions, null, 2)}
                    </pre>
                  </DetailBlock>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: ElementType
  label: string
  value: number
  tone?: "default" | "good" | "warn"
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold text-foreground",
              tone === "good" && "text-emerald-600",
              tone === "warn" && "text-amber-600",
            )}
          >
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground",
            tone === "good" && "bg-emerald-50 text-emerald-600",
            tone === "warn" && "bg-amber-50 text-amber-600",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="grid gap-1.5 rounded-md border border-border bg-muted/20 p-3">{children}</div>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-3">
      <span className="text-xs text-muted-foreground sm:pt-0.5">{label}</span>
      <span className={cn("break-words text-sm text-foreground", mono && "font-mono text-xs")}>{value}</span>
    </div>
  )
}

function FeatureBadge({ on, label }: { on: boolean; label: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full text-[11px]",
        on ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-muted text-muted-foreground",
      )}
    >
      {label}
    </Badge>
  )
}
