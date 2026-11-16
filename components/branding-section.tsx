"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Upload } from "lucide-react"
import { api } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

const DEFAULT_ACCENT_COLOR = "#2563EB"
const MAX_LOGO_BYTES = 2 * 1024 * 1024

export function BrandingSection() {
  const { t } = useLanguage()
  const [logoUrl, setLogoUrl] = useState("")
  const [accentColor, setAccentColor] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    api
      .get("/api/tenants/me")
      .then(({ data }) => {
        if (!active) return
        setLogoUrl(data?.branding_logo_url || "")
        setAccentColor(data?.branding_accent_color || "")
        setDisplayName(data?.branding_display_name || "")
      })
      .catch(() => setError(t("cfg.brandingLoadFail")))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (file.size > MAX_LOGO_BYTES) {
      setError(t("cfg.logoTooBig"))
      return
    }
    setUploadingLogo(true)
    setError("")
    setSaved(false)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const { data } = await api.post("/api/tenants/me/branding/logo", formData)
      setLogoUrl(data?.branding_logo_url || "")
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError(err?.response?.data?.message || t("cfg.logoUploadFail"))
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      await api.patch("/api/tenants/me/branding", {
        branding_accent_color: accentColor.trim() || null,
        branding_display_name: displayName.trim() || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError(err?.response?.data?.message || t("cfg.brandingSaveFail"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">{t("cfg.brandingTitle")}</h3>
        <p className="text-sm text-muted-foreground">{t("cfg.brandingDesc")}</p>
      </div>

      <div className="space-y-2">
        <Label>{t("cfg.logo")}</Label>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={t("cfg.logo")} className="h-12 w-12 rounded-md border object-contain" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md border text-xs text-muted-foreground">
              {t("cfg.noLogo")}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleLogoFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={loading || uploadingLogo}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {uploadingLogo ? t("cfg.uploading") : t("cfg.uploadLogo")}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t("cfg.logoHint")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="branding-color">{t("cfg.accentColor")}</Label>
        <div className="flex items-center gap-2">
          <Input
            id="branding-color"
            type="color"
            value={accentColor || DEFAULT_ACCENT_COLOR}
            onChange={(e) => setAccentColor(e.target.value)}
            disabled={loading || saving}
            className="h-10 w-16 p-1"
          />
          <Input
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            disabled={loading || saving}
            placeholder="#2563EB"
            className="max-w-[140px]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="branding-display-name">{t("cfg.displayName")}</Label>
        <Input
          id="branding-display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading || saving}
          placeholder={t("cfg.workspaceNamePlaceholder")}
        />
        <p className="text-xs text-muted-foreground">{t("cfg.displayNameHint")}</p>
      </div>

      <Button variant="outline" className="gap-2" onClick={handleSave} disabled={loading || saving}>
        <Save className="h-4 w-4" />
        {saving ? t("cfg.saving") : t("cfg.saveBranding")}
      </Button>

      {saved && <p className="text-xs text-green-600">{t("cfg.brandingSaved")}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
