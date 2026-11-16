"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export interface TenantBranding {
  tenantId: string | null
  name: string | null
  logoUrl: string | null
  accentColor: string | null
  displayName: string | null
  modules: {
    citas: boolean
    agentes: boolean
    leads: boolean
    docsApi: boolean
  }
}

const EMPTY_BRANDING: TenantBranding = {
  tenantId: null,
  name: null,
  logoUrl: null,
  accentColor: null,
  displayName: null,
  modules: { citas: false, agentes: false, leads: false, docsApi: false },
}

/**
 * Branding y módulos opcionales del tenant actual. Todos los campos de branding son
 * opcionales: cuando no están configurados, quien consuma este hook debe seguir usando
 * el estilo por defecto del sistema (no asumir que siempre hay valor). Los módulos
 * (citas/agentes/leads/docsApi) arrancan apagados para tenants nuevos y solo un
 * super-admin de plataforma puede habilitarlos por tenant.
 */
export function useTenantBranding() {
  const [branding, setBranding] = useState<TenantBranding>(EMPTY_BRANDING)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api
      .get("/api/tenants/me")
      .then(({ data }) => {
        if (!active) return
        setBranding({
          tenantId: data?.id || null,
          name: data?.name || null,
          logoUrl: data?.branding_logo_url || null,
          accentColor: data?.branding_accent_color || null,
          displayName: data?.branding_display_name || null,
          modules: {
            citas: Boolean(data?.module_citas_enabled),
            agentes: Boolean(data?.module_agentes_enabled),
            leads: Boolean(data?.module_leads_enabled),
            docsApi: Boolean(data?.module_docs_api_enabled),
          },
        })
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { ...branding, loading }
}
