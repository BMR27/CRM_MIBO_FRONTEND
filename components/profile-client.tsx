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

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  administrador: "Administrador",
  supervisor: "Supervisor",
  agent: "Agente",
  agente: "Agente",
}

const tenantStatusConfig: Record<TenantInfo["status"], { label: string; className: string }> = {
  trial: { label: "Prueba", className: "bg-blue-50 text-blue-700 border-blue-200" },
  active: { label: "Activo", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  suspended: { label: "Suspendido", className: "bg-amber-50 text-amber-700 border-amber-200" },
  cancelled: { label: "Cancelado", className: "bg-slate-100 text-slate-600 border-slate-200" },
}

export function ProfileClient({ user }: ProfileClientProps) {
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
      toast({ title: "Perfil actualizado", description: "Tu nombre se guardó correctamente." })
    } catch (err: any) {
      toast({
        title: "No se pudo guardar",
        description:
          err?.response?.status === 403
            ? "Solo un administrador o supervisor puede editar el perfil."
            : "Ocurrió un error al guardar los cambios.",
        variant: "destructive",
      })
    } finally {
      setSavingName(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Contraseña muy corta", description: "Debe tener al menos 6 caracteres.", variant: "destructive" })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" })
      return
    }
    setSavingPassword(true)
    try {
      await api.put(`/api/users/${user.id}/password`, { newPassword })
      toast({ title: "Contraseña actualizada", description: "Úsala la próxima vez que inicies sesión." })
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      toast({ title: "No se pudo cambiar la contraseña", variant: "destructive" })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-background">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mi perfil</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu información personal y la seguridad de tu cuenta</p>
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
                    {roleLabels[normalizedRole] || user.role || "Usuario"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {user.status === "available" ? "Conectado" : user.status === "busy" ? "Ocupado" : "Desconectado"}
                  </Badge>
                  {userDetail?.created_at && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Miembro desde {new Date(userDetail.created_at).toLocaleDateString()}
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
              <CardTitle className="text-base">Información personal</CardTitle>
            </div>
            <CardDescription>
              {isAdmin || normalizedRole.startsWith("super")
                ? "Actualiza tu nombre visible en la plataforma."
                : "Solo un administrador o supervisor puede editar esta información."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="profile-name">Nombre completo</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="profile-email">Correo electrónico</Label>
              <Input id="profile-email" value={user.email} disabled />
            </div>
            <Button className="gap-2" onClick={handleSaveName} disabled={savingName || !name.trim() || name.trim() === user.name}>
              <Save className="h-4 w-4" />
              {savingName ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardContent>
        </Card>

        {/* Espacio de trabajo */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-4.5 w-4.5" />
              <CardTitle className="text-base">Espacio de trabajo</CardTitle>
            </div>
            <CardDescription>La empresa a la que pertenece tu cuenta.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInfo ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
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
                    <p className="text-xs text-muted-foreground">Tipo de registro</p>
                    <p className="font-medium capitalize">{tenant.legal_type === "moral" ? "Persona moral" : "Persona física"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="font-medium capitalize">{tenant.plan}</p>
                  </div>
                </div>
                {isAdmin && (
                  <p className="text-xs text-muted-foreground pt-1">
                    ¿Necesitas renombrar tu espacio de trabajo? Ve a{" "}
                    <a href="/inbox/configuracion" className="text-primary hover:underline">
                      Configuración
                    </a>
                    .
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No se pudo cargar la información del espacio de trabajo.</p>
            )}
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4.5 w-4.5" />
              <CardTitle className="text-base">Seguridad</CardTitle>
            </div>
            <CardDescription>Cambia la contraseña de tu cuenta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 max-w-sm">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
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
              {savingPassword ? "Guardando..." : "Actualizar contraseña"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
