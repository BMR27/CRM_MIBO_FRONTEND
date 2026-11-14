"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export interface TenantBranding {
  name: string | null
  logoUrl: string | null
  accentColor: string | null
  displayName: string | null
}

const EMPTY_BRANDING: TenantBranding = {
  name: null,
  logoUrl: null,
  accentColor: null,
  displayName: null,
}

/**
 * Branding del tenant actual (logo, color de acento, nombre para mostrar). Todos los
 * campos son opcionales: cuando no están configurados, quien consuma este hook debe
 * seguir usando el branding por defecto del sistema (no asumir que siempre hay valor).
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
          name: data?.name || null,
          logoUrl: data?.branding_logo_url || null,
          accentColor: data?.branding_accent_color || null,
          displayName: data?.branding_display_name || null,
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
