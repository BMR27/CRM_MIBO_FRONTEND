"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { api } from "@/lib/api"

export function WorkspaceNameSection() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/tenants/me")
        setName(data?.name || "")
      } catch (err) {
        setError("No se pudo cargar el nombre del espacio de trabajo")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      await api.patch("/api/tenants/me", { name: name.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError("No se pudo guardar el nombre")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="empresa">Nombre de la Empresa</Label>
      <div className="flex gap-2">
        <Input
          id="empresa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading || saving}
          placeholder="Mi Empresa"
        />
        <Button variant="outline" className="gap-2 shrink-0" onClick={handleSave} disabled={loading || saving || !name.trim()}>
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
      {saved && <p className="text-xs text-green-600">Nombre actualizado.</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
