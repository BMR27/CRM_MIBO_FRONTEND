import { InboxHeader } from "@/components/inbox-header"
import { ConfiguracionContent } from "@/components/configuracion-content"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"

function normalizeRole(role: string | undefined | null) {
  const value = String(role || "").trim().toLowerCase()
  const roleMap: Record<string, "admin" | "supervisor" | "agent"> = {
    administrador: "admin",
    admin: "admin",
    supervisor: "supervisor",
    agente: "agent",
    agent: "agent",
  }

  return roleMap[value] || "agent"
}

export default async function ConfiguracionPage() {
  const user = await getSession()

  if (!user || normalizeRole(user.role) !== "admin") {
    redirect("/inbox")
  }

  // Integraciones y Seguridad quedan reservadas al super-admin de plataforma;
  // un admin de tenant normal solo ve General y Notificaciones.
  const isPlatformAdmin = Boolean(user.is_platform_admin)

  return (
    <>
      <InboxHeader />
      <main className="flex-1 overflow-y-auto p-6 bg-background">
        <ConfiguracionContent isPlatformAdmin={isPlatformAdmin} />
      </main>
    </>
  )
}
