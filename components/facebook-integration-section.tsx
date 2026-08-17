"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

interface FacebookIntegrationData {
  page_id: string
  verify_token: string
  is_active: boolean
  has_page_access_token: boolean
}

export function FacebookIntegrationSection() {
  const [data, setData] = useState<FacebookIntegrationData | null>(null)
  const [pageId, setPageId] = useState("")
  const [pageAccessToken, setPageAccessToken] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://crmmibobackend-production.up.railway.app"
  const webhookUrl = `${backendUrl}/api/facebook/webhook`

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/facebook/integration")
        if (data) {
          setData(data)
          setPageId(data.page_id || "")
        }
      } catch (err) {
        setError("No se pudo cargar la configuración de Facebook")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!pageId.trim()) return
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const { data: result } = await api.patch("/api/facebook/integration", {
        page_id: pageId.trim(),
        page_access_token: pageAccessToken || undefined,
      })
      setData((prev) => ({ ...(prev as any), ...result }))
      setPageAccessToken("")
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError("No se pudo guardar la configuración de Facebook")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Cargando Facebook...</p>

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Facebook Messenger</h3>

      <div className="space-y-2">
        <Label htmlFor="fb-page-id">Page ID</Label>
        <Input id="fb-page-id" value={pageId} onChange={(e) => setPageId(e.target.value)} placeholder="111222333444" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fb-token">Page Access Token</Label>
        <Input
          id="fb-token"
          type="password"
          placeholder={data?.has_page_access_token ? "•••••••• (ya configurado)" : "EAAxxxxxx..."}
          value={pageAccessToken}
          onChange={(e) => setPageAccessToken(e.target.value)}
        />
      </div>

      {data?.verify_token && (
        <div className="space-y-1 rounded-lg border border-border p-3 text-xs">
          <p className="font-medium text-foreground">Datos para configurar el webhook en Meta</p>
          <p className="text-muted-foreground break-all">URL: <span className="font-mono">{webhookUrl}</span></p>
          <p className="text-muted-foreground break-all">Verify token: <span className="font-mono">{data.verify_token}</span></p>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {saved && <p className="text-xs text-green-600">Configuración guardada.</p>}

      <Button variant="outline" onClick={handleSave} disabled={saving || !pageId.trim()}>
        {saving ? "Guardando..." : "Guardar Facebook"}
      </Button>
    </div>
  )
}
