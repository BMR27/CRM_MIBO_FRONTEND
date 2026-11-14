"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { api } from "@/lib/api"

const DEFAULT_ACCENT_COLOR = "#2563EB"

export function BrandingSection() {
  const [logoUrl, setLogoUrl] = useState("")
  const [accentColor, setAccentColor] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

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
      .catch(() => setError("No se pudo cargar el branding del espacio"))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      await api.patch("/api/tenants/me/branding", {
        branding_logo_url: logoUrl.trim() || null,
        branding_accent_color: accentColor.trim() || null,
        branding_display_name: displayName.trim() || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo guardar el branding")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Branding del espacio</h3>
        <p className="text-sm text-muted-foreground">
          Personaliza el logo, color y nombre que ven tus agentes en este espacio. Si dejas un campo vacío, se usa
          el estilo por defecto del sistema — no afecta a otros espacios.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="branding-logo">URL del logo</Label>
        <Input
          id="branding-logo"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          disabled={loading || saving}
          placeholder="https://miempresa.com/logo.png"
        />
        <p className="text-xs text-muted-foreground">Debe ser una URL https. Se muestra en el menú lateral y el encabezado.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="branding-color">Color de acento</Label>
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
        <Label htmlFor="branding-display-name">Nombre para mostrar</Label>
        <Input
          id="branding-display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading || saving}
          placeholder="Mi Empresa"
        />
        <p className="text-xs text-muted-foreground">
          Si lo dejas vacío, se usa el nombre del espacio de trabajo.
        </p>
      </div>

      <Button variant="outline" className="gap-2" onClick={handleSave} disabled={loading || saving}>
        <Save className="h-4 w-4" />
        {saving ? "Guardando..." : "Guardar branding"}
      </Button>

      {saved && <p className="text-xs text-green-600">Branding actualizado.</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
