"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Upload } from "lucide-react"
import { api } from "@/lib/api"

const DEFAULT_ACCENT_COLOR = "#2563EB"
const MAX_LOGO_BYTES = 2 * 1024 * 1024

export function BrandingSection() {
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
      .catch(() => setError("No se pudo cargar el branding del espacio"))
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
      setError("El logo no puede pesar más de 2MB")
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
      setError(err?.response?.data?.message || "No se pudo subir el logo")
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
        <Label>Logo</Label>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo actual" className="h-12 w-12 rounded-md border object-contain" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md border text-xs text-muted-foreground">
              Sin logo
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
            {uploadingLogo ? "Subiendo..." : "Subir logo"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP o SVG, máx. 2MB. Se muestra en el menú lateral y el encabezado.</p>
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
