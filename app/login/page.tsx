"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Lock, Mail, Shield, MessageSquare, BarChart3, Users2, CheckCircle2 } from "lucide-react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionConflictOpen, setSessionConflictOpen] = useState(false)
  const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get("message")
    if (message === "signup-success") {
      setSuccess("¡Espacio de trabajo creado exitosamente! Ahora puedes iniciar sesión.")
    }
  }, [searchParams])

  const performLogin = async ({ email, password, forceNewSession = false }: { email: string; password: string; forceNewSession?: boolean }) => {
    setError("")
    setLoading(true)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password, forceNewSession }),
      })

      const data = await response.json().catch(() => ({}))

      if (response.status === 409 && data?.requiresSessionTakeover) {
        setPendingCredentials({ email: normalizedEmail, password })
        setSessionConflictOpen(true)
        setLoading(false)
        return
      }

      if (!response.ok) {
        setError(data.message || data.error || "No se pudo iniciar sesión")
        setLoading(false)
        return
      }

      // Guardar el token JWT de forma estándar
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
      // Construir un usuario mínimo para la sesión
      const userPayload = {
        id: data.user?.id ?? 0,
        email: normalizedEmail,
        name: data.user?.name ?? email,
        role: data.user?.role ?? "agent",
        tenant_id: data.user?.tenant_id ?? undefined,
        status: data.user?.status ?? "available",
        session_key: data.user?.session_key ?? null,
      }

      // Guardar usuario en localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userPayload));
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: userPayload }),
        })
        window.location.href = "/inbox"
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("No se pudo conectar con el servidor local. Revisa que el frontend esté corriendo correctamente.")
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await performLogin({ email, password })
  }

  const handleTakeoverSession = async () => {
    if (!pendingCredentials) return
    setSessionConflictOpen(false)
    await performLogin({
      email: pendingCredentials.email,
      password: pendingCredentials.password,
      forceNewSession: true,
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm mb-6 border border-white/15">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-medium tracking-wide uppercase mb-6 border border-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Plataforma empresarial
            </div>
            <h1 className="text-4xl font-bold mb-4 text-balance tracking-tight">Hilo</h1>
            <p className="text-lg text-white/85 leading-relaxed text-pretty max-w-md">
              La suite de atención al cliente y operaciones para equipos que gestionan conversaciones, pedidos y
              logística a escala.
            </p>
          </div>

          <div className="space-y-5 mt-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-semibold mb-0.5 text-white text-sm">Bandeja unificada</h3>
                <p className="text-sm text-white/75">WhatsApp, Facebook y voz en una sola conversación por cliente</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-semibold mb-0.5 text-white text-sm">Órdenes y analítica</h3>
                <p className="text-sm text-white/75">Visibilidad en tiempo real del pedido mientras atiendes al cliente</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                <Users2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-semibold mb-0.5 text-white text-sm">Equipos y roles</h3>
                <p className="text-sm text-white/75">Espacios de trabajo aislados por empresa, con control de acceso por rol</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-2 text-xs text-white/60">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Datos aislados por espacio de trabajo · Cifrado en tránsito
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary text-primary-foreground mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Hilo</h2>
            <p className="text-sm text-muted-foreground">Sistema de Gestión Empresarial</p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-8 space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight">Bienvenido de nuevo</h2>
              <p className="text-sm text-muted-foreground">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Contraseña
                  </Label>
                  <button type="button" className="text-xs text-primary hover:underline font-medium">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {success && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

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
                    Verificando...
                  </div>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿Tu empresa aún no tiene un espacio de trabajo? </span>
            <Link href="/signup-company" className="text-primary hover:underline font-medium">
              Regístrala aquí
            </Link>
          </div>
        </div>
      </div>

      <Dialog open={sessionConflictOpen} onOpenChange={setSessionConflictOpen}>
        <DialogContent
          showCloseButton={true}
          className="w-[min(90vw,560px)] max-w-none border border-[#3b6db8]/55 bg-[#081a3a] text-slate-100 p-5 sm:p-7 rounded-[18px] shadow-2xl"
        >
          <DialogHeader className="space-y-4 text-center">
            <DialogTitle className="flex items-start justify-center gap-3 text-[24px] sm:text-[30px] font-semibold text-[#4f9dff] leading-tight tracking-normal">
              <Shield className="mt-1 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-[#4f9dff]" />
              <span className="flex flex-col items-center gap-1.5 text-center">
                <span className="block">Sesión activa</span>
                <span className="block">detectada</span>
              </span>
            </DialogTitle>
            <DialogDescription className="text-[16px] sm:text-[19px] leading-[1.4] text-slate-200 w-full max-w-none">
              Ya existe una sesión activa para este usuario. ¿Deseas cerrar la anterior y activar esta?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-stretch">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full border-2 border-[#2e75d1] bg-[#0a224f] text-slate-100 hover:bg-[#14366f] hover:text-white text-sm"
              onClick={() => setSessionConflictOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="h-11 w-full px-4 text-sm sm:text-[15px] leading-tight whitespace-normal bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
              onClick={handleTakeoverSession}
              disabled={loading}
            >
              Cerrar sesión anterior y continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
