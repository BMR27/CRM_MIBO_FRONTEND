"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api, frontendApi } from "@/lib/api"

const HOME_TENANT_KEY = "platform_admin_home_tenant_id"

interface TenantOption {
  id: string
  name: string
}

export function PlatformAdminSwitcher() {
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false)
  const [currentTenantId, setCurrentTenantId] = useState<string>("")
  const [currentTenantName, setCurrentTenantName] = useState<string>("")
  const [tenants, setTenants] = useState<TenantOption[]>([])
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    let active = true
    frontendApi
      .get("/api/auth/me")
      .then(({ data }) => {
        if (!active || !data?.user) return
        setIsPlatformAdmin(data.user.is_platform_admin === true)
        setCurrentTenantId(data.user.tenant_id || "")
        if (data.user.is_platform_admin === true && !localStorage.getItem(HOME_TENANT_KEY)) {
          localStorage.setItem(HOME_TENANT_KEY, data.user.tenant_id || "")
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isPlatformAdmin) return
    let active = true
    api
      .get("/api/tenants")
      .then(({ data }) => {
        if (!active) return
        const list = Array.isArray(data) ? data : []
        setTenants(list)
        const current = list.find((t: TenantOption) => t.id === currentTenantId)
        if (current) setCurrentTenantName(current.name)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [isPlatformAdmin, currentTenantId])

  const switchToTenant = async (tenantId: string) => {
    if (!tenantId || tenantId === currentTenantId) return
    setSwitching(true)
    try {
      const accessToken = localStorage.getItem("access_token")
      const { data } = await frontendApi.post("/api/auth/impersonate", { tenantId, accessToken })
      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token)
        window.location.href = "/inbox"
      }
    } catch {
      setSwitching(false)
    }
  }

  if (!isPlatformAdmin) return null

  const homeTenantId = typeof window !== "undefined" ? localStorage.getItem(HOME_TENANT_KEY) : null
  const isImpersonating = homeTenantId && homeTenantId !== currentTenantId

  return (
    <div className="flex flex-col gap-1.5 px-1">
      <div className="flex flex-wrap items-center gap-1">
        <Badge variant="secondary" className="text-[10px]">Super-admin</Badge>
        {isImpersonating && (
          <Badge variant="outline" className="text-[10px]">Viendo: {currentTenantName || "..."}</Badge>
        )}
      </div>
      <Select value={currentTenantId} onValueChange={switchToTenant} disabled={switching}>
        <SelectTrigger className="h-8 w-full text-xs">
          <SelectValue placeholder="Cambiar de espacio" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isImpersonating && homeTenantId && (
        <Button type="button" size="sm" variant="outline" className="h-7 w-full text-xs" onClick={() => switchToTenant(homeTenantId)} disabled={switching}>
          Volver a mi espacio
        </Button>
      )}
    </div>
  )
}
