"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Building2, Calendar, KeyRound, Mail, Save, ShieldCheck, User as UserIcon } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface ProfileClientProps {
  user: {
    id: string
    name: string
    email: string
    role?: string
    status: string
  }
}

interface TenantInfo {
  name: string
  legal_type: "fisica" | "moral"
  plan: string
  status: "trial" | "active" | "suspended" | "cancelled"
  created_at: string
}

interface UserDetail {
  created_at: string
  role?: { name: string }
}

const tenantStatusClassName: Record<TenantInfo["status"], string> = {
  trial: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspended: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
}

export function ProfileClient({ user }: ProfileClientProps) {
  const { t } = useLanguage()
  const roleLabels: Record<string, string> = {
    admin: t("agents.role.admin"),
    administrador: t("agents.role.admin"),
    supervisor: t("agents.role.supervisor"),
    agent: t("agents.role.agent"),
    agente: t("agents.role.agent"),
  }
  const tenantStatusConfig: Record<TenantInfo["status"], { label: string; className: string }> = {
    trial: { label: t("profile.tenantStatus.trial"), className: tenantStatusClassName.trial },
    active: { label: t("profile.tenantStatus.active"), className: tenantStatusClassName.active },
    suspended: { label: t("profile.tenantStatus.suspended"), className: tenantStatusClassName.suspended },
    cancelled: { label: t("profile.tenantStatus.cancelled"), className: tenantStatusClassName.cancelled },
  }
  const normalizedRole = String(user.role || "").trim().toLowerCase()
  const isAdmin = normalizedRole.startsWith("admin")

  const [name, setName] = useState(user.name)
  const [savingName, setSavingName] = useState(false)
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(true)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      api.get(`/api/users/${user.id}`).catch(() => null),
      api.get("/api/tenants/me").catch(() => null),
    ]).then(([userRes, tenantRes]) => {
      if (!active) return
      if (userRes?.data) setUserDetail(userRes.data)
      if (tenantRes?.data) setTenant(tenantRes.data)
      setLoadingInfo(false)
    })
    return () => {
      active = false
    }
  }, [user.id])

  const getInitials = (value: string) =>
    value
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const handleSaveName = async () => {
    if (!name.trim() || name.trim() === user.name) return
    setSavingName(true)
    try {
      await api.put(`/api/users/${user.id}`, { full_name: name.trim() })
      toast({ title: t("profile.toast.updatedTitle"), description: t("profile.toast.updatedDesc") })
    } catch (err: any) {
      toast({
        title: t("profile.toast.saveFailTitle"),
        description:
          err?.response?.status === 403
            ? t("profile.toast.saveFailForbidden")
            : t("profile.toast.saveFailGeneric"),
        variant: "destructive",
      })
    } finally {
      setSavingName(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: t("profile.toast.shortPasswordTitle"), description: t("profile.toast.shortPasswordDesc"), variant: "destructive" })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: t("profile.toast.mismatchTitle"), variant: "destructive" })
      return
    }
    setSavingPassword(true)
    try {
      await api.put(`/api/users/${user.id}/password`, { newPassword })
      toast({ title: t("profile.toast.passwordUpdatedTitle"), description: t("profile.toast.passwordUpdatedDesc") })
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      toast({ title: t("profile.toast.passwordFailTitle"), variant: "destructive" })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-background">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("profile.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("profile.subtitle")}</p>
        </div>

        {/* Encabezado de perfil */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <Avatar className="h-20 w-20 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1.5">
                <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    {roleLabels[normalizedRole] || user.role || t("profile.defaultRole")}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {user.status === "available" ? t("profile.statusConnected") : user.status === "busy" ? t("profile.statusBusy") : t("profile.statusOffline")}
                  </Badge>
                  {userDetail?.created_at && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {t("profile.memberSince")} {new Date(userDetail.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información personal */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="h-4.5 w-4.5" />
              <CardTitle className="text-base">{t("profile.personalInfo")}</CardTitle>
            </div>
            <CardDescription>
              {isAdmin || normalizedRole.startsWith("super")
                ? t("profile.personalInfoDescAdmin")
                : t("profile.personalInfoDescLocked")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="profile-name">{t("profile.fullName")}</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="profile-email">{t("profile.email")}</Label>
              <Input id="profile-email" value={user.email} disabled />
            </div>
            <Button className="gap-2" onClick={handleSaveName} disabled={savingName || !name.trim() || name.trim() === user.name}>
              <Save className="h-4 w-4" />
              {savingName ? t("profile.saving") : t("profile.saveChanges")}
            </Button>
          </CardContent>
        </Card>

        {/* Espacio de trabajo */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-4.5 w-4.5" />
              <CardTitle className="text-base">{t("profile.workspace")}</CardTitle>
            </div>
            <CardDescription>{t("profile.workspaceDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInfo ? (
              <p className="text-sm text-muted-foreground">{t("profile.loading")}</p>
            ) : tenant ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{tenant.name}</p>
                  <Badge variant="outline" className={tenantStatusConfig[tenant.status]?.className}>
                    {tenantStatusConfig[tenant.status]?.label || tenant.status}
                  </Badge>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("profile.registrationType")}</p>
                    <p className="font-medium capitalize">{tenant.legal_type === "moral" ? t("profile.legalMoral") : t("profile.legalFisica")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("profile.plan")}</p>
                    <p className="font-medium capitalize">{tenant.plan}</p>
                  </div>
                </div>
                {isAdmin && (
                  <p className="text-xs text-muted-foreground pt-1">
                    {t("profile.renameHintPrefix")}{" "}
                    <a href="/inbox/configuracion" className="text-primary hover:underline">
                      {t("profile.settings")}
                    </a>
                    .
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("profile.workspaceLoadFail")}</p>
            )}
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4.5 w-4.5" />
              <CardTitle className="text-base">{t("profile.security")}</CardTitle>
            </div>
            <CardDescription>{t("profile.securityDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 max-w-sm">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("profile.newPassword")}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("addAgent.passwordHint")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t("profile.confirmNewPassword")}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <Button className="gap-2" onClick={handleChangePassword} disabled={savingPassword || !newPassword}>
              <Save className="h-4 w-4" />
              {savingPassword ? t("profile.saving") : t("profile.updatePassword")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
