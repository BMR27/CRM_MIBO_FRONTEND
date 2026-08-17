"use client"

import { BookOpen, MessageSquare, Users, Settings, LogOut, Menu, X, Calendar, User, Send, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { api } from "@/lib/api"

interface InboxSidebarProps {
  user: {
    name: string
    email: string
    status: string
    role?: string
  }
}

export function InboxSidebar({ user }: InboxSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [workspaceName, setWorkspaceName] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let active = true
    api
      .get("/api/tenants/me")
      .then(({ data }) => {
        if (active) setWorkspaceName(data?.name || null)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])
  const normalizedRole = (() => {
    const value = String(user.role || "").trim().toLowerCase()
    const roleMap: Record<string, "admin" | "supervisor" | "agent"> = {
      administrador: "admin",
      admin: "admin",
      supervisor: "supervisor",
      agente: "agent",
      agent: "agent",
    }

    return roleMap[value] || "agent"
  })()
  const isAdmin = normalizedRole === "admin"
  const isAgent = normalizedRole === "agent"

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "available": "Conectado",
      "busy": "Ocupado",
      "offline": "Desconectado",
    }
    return labels[status] || "Conectado"
  }

  const getRoleLabel = (role?: string) => {
    const labels: Record<string, string> = {
      admin: "Administrador",
      administrador: "Administrador",
      supervisor: "Supervisor",
      agent: "Agente",
      agente: "Agente",
    }
    const key = String(role || "").trim().toLowerCase()
    return labels[key] || role || "Usuario"
  }

  const isInbox = pathname === "/inbox"
  const isContactos = pathname.startsWith("/inbox/contactos")
  const isEnvios = pathname.startsWith("/inbox/envios")
  // const isPlantillasWA = pathname.startsWith("/inbox/plantillas-wa")
  const isCitas = pathname.startsWith("/inbox/citas")
  const isAgentes = pathname.startsWith("/inbox/agentes")
  const isLeads = pathname.startsWith("/inbox/leads")
  const isDocumentacionApi = pathname.startsWith("/inbox/documentacion-api")
  const isConfiguracion = pathname.startsWith("/inbox/configuracion")

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">
                {workspaceName || "Cargando…"}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/50">Hilo</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground shrink-0"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        <Button
          variant="ghost"
          onClick={() => router.push("/inbox")}
          className={cn(
            "w-full justify-start transition-colors",
            collapsed && "justify-center px-2",
            isInbox
              ? "bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              : "text-foreground hover:bg-sidebar-accent hover:text-foreground",
          )}
        >
          <MessageSquare className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Conversaciones</span>}
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push("/inbox/contactos")}
          className={cn(
            "w-full justify-start transition-colors",
            collapsed && "justify-center px-2",
            isContactos
              ? "bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              : "text-foreground hover:bg-sidebar-accent hover:text-foreground",
          )}
        >
          <User className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Contactos</span>}
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push("/inbox/envios")}
          className={cn(
            "w-full justify-start transition-colors",
            collapsed && "justify-center px-2",
            isEnvios
              ? "bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              : "text-foreground hover:bg-sidebar-accent hover:text-foreground",
          )}
        >
          <Send className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Envíos masivos</span>}
        </Button>
        
        {/* Citas: solo visible para administrador */}
        {isAdmin && (
          <Button
            variant="ghost"
            onClick={() => router.push("/inbox/citas")}
            className={cn(
              "w-full justify-start transition-colors",
              collapsed && "justify-center px-2",
              isCitas
                ? "bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                : "text-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <Calendar className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Citas</span>}
          </Button>
        )}
        
        {/* Agentes tab - visible para admin y supervisor */}
        {!isAgent && (
          <Button
            variant="ghost"
            onClick={() => router.push("/inbox/agentes")}
            className={cn(
              "w-full justify-start transition-colors",
              collapsed && "justify-center px-2",
              isAgentes
                ? "bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                : "text-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <Users className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Agentes</span>}
          </Button>
        )}

        {/* Leads: visible para admin y supervisor */}
        {!isAgent && (
          <Button
            variant="ghost"
            onClick={() => router.push("/inbox/leads")}
            className={cn(
              "w-full justify-start transition-colors",
              collapsed && "justify-center px-2",
              isLeads
                ? "bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                : "text-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <Inbox className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Leads</span>}
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={() => router.push("/inbox/documentacion-api")}
          className={cn(
            "w-full justify-start transition-colors",
            collapsed && "justify-center px-2",
            isDocumentacionApi
              ? "bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              : "text-foreground hover:bg-sidebar-accent hover:text-foreground",
          )}
        >
          <BookOpen className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Documentación API</span>}
        </Button>
        
        {isAdmin && (
          <Button
            variant="ghost"
            onClick={() => router.push("/inbox/configuracion")}
            className={cn(
              "w-full justify-start transition-colors",
              collapsed && "justify-center px-2",
              isConfiguracion
                ? "bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                : "text-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Configuración</span>}
          </Button>
        )}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User Profile */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => router.push("/inbox/perfil")}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg p-1.5 -m-1.5 text-left transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center",
          )}
        >
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-medium text-foreground text-sm">{user.name}</p>
              <p className="truncate text-muted-foreground text-xs">
                {getRoleLabel(user.role)} ·{" "}
                <span className="text-emerald-600">{getStatusLabel(user.status || "available")}</span>
              </p>
            </div>
          )}
        </button>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-start text-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        )}
      </div>
    </div>
  )
}
