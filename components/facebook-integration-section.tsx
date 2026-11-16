"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

interface FacebookIntegrationData {
  page_id: string
  verify_token: string
  is_active: boolean
  has_page_access_token: boolean
}

export function FacebookIntegrationSection() {
  const { t } = useLanguage()
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
        setError(t("cfg.facebookLoadFail"))
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
      setError(t("cfg.facebookSaveFail"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">{t("cfg.loadingFacebook")}</p>

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">{t("cfg.facebookTitle")}</h3>

      <div className="space-y-2">
        <Label htmlFor="fb-page-id">{t("cfg.pageId")}</Label>
        <Input id="fb-page-id" value={pageId} onChange={(e) => setPageId(e.target.value)} placeholder="111222333444" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fb-token">{t("cfg.pageAccessToken")}</Label>
        <Input
          id="fb-token"
          type="password"
          placeholder={data?.has_page_access_token ? t("cfg.alreadyConfigured") : "EAAxxxxxx..."}
          value={pageAccessToken}
          onChange={(e) => setPageAccessToken(e.target.value)}
        />
      </div>

      {data?.verify_token && (
        <div className="space-y-1 rounded-lg border border-border p-3 text-xs">
          <p className="font-medium text-foreground">{t("cfg.webhookDataTitleFb")}</p>
          <p className="text-muted-foreground break-all">URL: <span className="font-mono">{webhookUrl}</span></p>
          <p className="text-muted-foreground break-all">{t("cfg.verifyToken")}: <span className="font-mono">{data.verify_token}</span></p>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {saved && <p className="text-xs text-green-600">{t("cfg.whatsappSaved")}</p>}

      <Button variant="outline" onClick={handleSave} disabled={saving || !pageId.trim()}>
        {saving ? t("cfg.saving") : t("cfg.saveFacebook")}
      </Button>
    </div>
  )
}
