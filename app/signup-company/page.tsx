"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Lock, Mail, Building2, UserSquare2, Landmark, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

type LegalType = "fisica" | "moral"

export default function SignupCompanyPage() {
  const [legalType, setLegalType] = useState<LegalType>("fisica")
  const [companyName, setCompanyName] = useState("")
  const [taxId, setTaxId] = useState("")
  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isMoral = legalType === "moral"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app"
      const response = await fetch(`${backendUrl}/api/auth/signup-company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legalType, companyName, taxId, adminName, adminEmail, adminPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || data.error || "No se pudo registrar la compañía")
        setLoading(false)
        return
      }

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token)
      }

      const userPayload = {
        id: data.user?.id,
        email: data.user?.email ?? adminEmail,
        name: data.user?.name ?? adminName,
        role: data.user?.role ?? "admin",
        tenant_id: data.user?.tenant_id ?? data.tenant?.id,
        status: "available",
        session_key: null as string | null,
      }

      localStorage.setItem("user", JSON.stringify(userPayload))
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userPayload }),
      })

      window.location.href = "/inbox"
    } catch (err) {
      setError("Ocurrió un error. Intenta nuevamente.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-medium tracking-wide uppercase mb-6 border border-white/15 w-fit">
            <ShieldCheck className="h-3.5 w-3.5" />
            Espacio aislado por empresa
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6 border border-white/15">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-balance tracking-tight">Crea tu espacio de trabajo</h1>
          <p className="text-lg text-primary-foreground/85 leading-relaxed text-pretty max-w-md">
            Registra tu empresa o tu actividad como persona física y obtén tu propio CRM aislado para gestionar
            conversaciones, contactos y pedidos.
          </p>

          <div className="mt-10 space-y-3 text-sm text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              Facturación y datos fiscales asociados a tu tipo de registro
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              Roles, permisos y bandeja de conversaciones desde el primer minuto
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Hilo</h2>
            <p className="text-sm text-muted-foreground">Sistema de Gestión Empresarial</p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8 space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight">Registra tu cuenta</h2>
              <p className="text-sm text-muted-foreground">Elige el tipo de persona y crea tu espacio de trabajo</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLegalType("fisica")}
                disabled={loading}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                  legalType === "fisica"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <UserSquare2 className={cn("h-5 w-5", legalType === "fisica" ? "text-primary" : "text-muted-foreground")} />
                <div>
                  <p className="text-sm font-semibold leading-none">Persona física</p>
                  <p className="text-xs text-muted-foreground mt-1">Trabajas de forma independiente</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLegalType("moral")}
                disabled={loading}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                  legalType === "moral"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <Landmark className={cn("h-5 w-5", legalType === "moral" ? "text-primary" : "text-muted-foreground")} />
                <div>
                  <p className="text-sm font-semibold leading-none">Persona moral</p>
                  <p className="text-xs text-muted-foreground mt-1">Empresa o razón social</p>
                </div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  {isMoral ? "Razón social" : "Nombre del negocio o actividad"}
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    id="companyName"
                    type="text"
                    placeholder={isMoral ? "Mi Empresa S.A. de C.V." : "Juan Pérez Servicios"}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId" className="text-sm font-medium">
                  RFC {isMoral ? "de la empresa" : "(opcional)"}
                </Label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    id="taxId"
                    type="text"
                    placeholder={isMoral ? "ACM010101AAA" : "PEJJ800101AAA"}
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                    required={isMoral}
                    disabled={loading}
                    className="pl-10 h-11 uppercase"
                    maxLength={13}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminName" className="text-sm font-medium">
                  {isMoral ? "Nombre del representante legal" : "Tu nombre completo"}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    id="adminName"
                    type="text"
                    placeholder="Juan Pérez"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="text-sm font-medium">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="tu@empresa.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11"
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creando espacio de trabajo...
                  </div>
                ) : (
                  "Crear espacio de trabajo"
                )}
              </Button>
            </form>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
