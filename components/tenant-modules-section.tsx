"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { api } from "@/lib/api"
import { useTenantBranding } from "@/hooks/use-tenant-branding"

const MODULE_ITEMS = [
  { key: "module_citas_enabled" as const, label: "Citas", description: "Agenda de citas del espacio" },
  { key: "module_agentes_enabled" as const, label: "Agentes", description: "Gestión de agentes y supervisores" },
  { key: "module_leads_enabled" as const, label: "Leads", description: "Captura y seguimiento de leads" },
  { key: "module_docs_api_enabled" as const, label: "Documentación API", description: "Guía de integración para clientes externos" },
]

/**
 * Solo para super-admin de plataforma: habilita/deshabilita los módulos opcionales
 * del sidebar (Citas, Agentes, Leads, Documentación API) del tenant que se esté
 * viendo actualmente. Los tenants nuevos arrancan con todo apagado.
 */
export function TenantModulesSection() {
  const branding = useTenantBranding()
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    api
      .get("/api/tenants/me")
      .then(({ data }) => {
        if (!active) return
        setFlags({
          module_citas_enabled: Boolean(data?.module_citas_enabled),
          module_agentes_enabled: Boolean(data?.module_agentes_enabled),
          module_leads_enabled: Boolean(data?.module_leads_enabled),
          module_docs_api_enabled: Boolean(data?.module_docs_api_enabled),
        })
      })
      .catch(() => setError("No se pudieron cargar los módulos"))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleToggle = async (key: (typeof MODULE_ITEMS)[number]["key"], value: boolean) => {
    if (!branding.tenantId) return
    setFlags((prev) => ({ ...prev, [key]: value }))
    setSavingKey(key)
    setError("")
    try {
      await api.patch(`/api/tenants/${branding.tenantId}/modules`, { [key]: value })
    } catch (err: any) {
      setFlags((prev) => ({ ...prev, [key]: !value }))
      setError(err?.response?.data?.message || "No se pudo actualizar el módulo")
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Módulos del espacio</h3>
        <p className="text-sm text-muted-foreground">
          Solo vos, como super-admin de plataforma, podés habilitar estas secciones para{" "}
          <span className="font-medium">{branding.displayName || branding.name || "este espacio"}</span>.
        </p>
      </div>

      {MODULE_ITEMS.map((item) => (
        <div key={item.key} className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{item.label}</Label>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
          <Switch
            checked={Boolean(flags[item.key])}
            disabled={loading || savingKey === item.key}
            onCheckedChange={(value) => handleToggle(item.key, value)}
          />
        </div>
      ))}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
